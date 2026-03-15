import os
import re
import sys
import time
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from supabase import create_client, Client, ClientOptions

# Inicializa o servidor MCP
mcp = FastMCP("DMZ OS - Squad Local")

# Aliases comuns → IDs reais na tabela
AGENT_ALIASES = {
    "orch": "orchestrator", "orq": "orchestrator",
    "arch": "architect", "alex": "architect",
    "dev": "developer", "frontend": "developer",
    "qa": "qa_engineer", "tester": "qa_engineer",
    "design": "ux_designer", "ux": "ux_designer",
    "ops": "devops", "infra": "devops",
    "sec": "security", "seguranca": "security",
    "doc": "tech_writer", "docs": "tech_writer",
    "data": "data_engineer", "dados": "data_engineer",
    "copy": "copywriter", "redator": "copywriter",
}

def get_supabase() -> Client:
    """Configura e retorna o cliente Supabase."""
    env_path = Path.cwd() / ".env.dmz"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    
    url = os.environ.get("SUPABASE_URL")
    api_key = os.environ.get("DMZ_API_KEY") # Chave da DMZ
    
    if not url or not api_key:
        raise ValueError("Credenciais do Supabase não encontradas no .env.dmz. O DMZ OS está instalado?")
    
    opts = ClientOptions(headers={"x-dmz-api-key": api_key})
    # Como não temos o ANON_KEY nas vars, o CLI extrai do core ou usa o service role, ou usa uma fallback
    # Para ler publicamos com anon ou com service, mas o que importa é o header x-dmz-api-key
    # Vamos usar uma fallback dummy para url já que temos a API KEY? Não, precisamos supabase key.
    # Vou pegar SUPABASE_ANON_KEY do .env.dmz se existir, senao usar uma genérica e confiar no x-dmz.
    anon_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWl5eXhjb3V0Ym11c3p3ZWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwOTI1NzcsImV4cCI6MjAyNjc2ODU3N30.x8oM4T91p5D884Wc3zQYjD3vWvw_fW8Hn6r7sB-G0Yg" 
    
    return create_client(url, anon_key, options=opts)


@mcp.tool()
async def ask_agent(agente: str, mensagem: str) -> str:
    """
    Delega uma demanda ou dúvida para um agente de IA do Squad DMZ no Kanban.
    Aguarde a resposta do agente, pois ele processará sua task e responderá diretamente para você.
    
    Args:
        agente: O nome ou handle do agente (ex: orch, architect, devops, ryan, emma, lucas, aurora)
        mensagem: A solicitação, demanda ou dúvida detalhada para o agente analisar.
    """
    try:
        agente_id = AGENT_ALIASES.get(agente.lower().replace("@", ""), agente.lower().replace("@", ""))
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
            
        client = get_supabase()
        
        column_type = "to_do" if agente_id != "orchestrator" else "master_plan"
        
        # Gera título inteligente (primeiras palavras da mensagem)
        title_preview = mensagem[:80].replace("\n", " ").strip()
        if len(mensagem) > 80:
            title_preview += "…"
        
        # Cria a task
        res = client.table("dmz_agents_tasks").insert({
            "project_id": project_slug,
            "agent_id": agente_id,
            "type": column_type,
            "title": f"[MCP] @{agente_id}: {title_preview}",
            "description": mensagem,
            "status": "pending",
            "metadata": {"source": "mcp_server", "status_message": "Aguardando resposta..."}
        }).execute()
        
        if not res.data:
            return "Erro: Não foi possível criar a demanda no Kanban DMZ OS."
            
        task_id = res.data[0]["id"]
        
        # Polling inteligente com backoff: 1s → 2s → 3s → 5s (máx)
        timeout_seconds = 180
        start_time = time.time()
        poll_interval = 1.0
        last_progress = start_time
        
        while time.time() - start_time < timeout_seconds:
            await asyncio.sleep(poll_interval)
            
            check = client.table("dmz_agents_tasks").select("response, status, feedback").eq("id", task_id).execute()
            
            if check.data:
                task = check.data[0]
                # Resposta disponível — retorna ao IDE
                if task.get("response"):
                    elapsed = int(time.time() - start_time)
                    return f"{task['response']}\n\n---\n_Processado por @{agente_id} em {elapsed}s (Task {task_id[:8]}…)_"
                
                # Task completada mas sem response (fallback para feedback)
                if task.get("status") == "completed" and not task.get("response"):
                    fb = task.get("feedback") or ""
                    if fb:
                        return f"{fb}\n\n---\n_@{agente_id} processou a demanda (Task {task_id[:8]}…)_"
                    return f"A demanda foi processada pelo @{agente_id} (Task {task_id[:8]}…), mas nenhuma resposta de texto foi retornada."
                
                # Task bloqueada
                if task.get("status") == "blocked":
                    return f"⚠️ @{agente_id} bloqueou a task: {task.get('feedback', 'Sem detalhes')}"
            
            # Backoff progressivo: 1 → 2 → 3 → 5 max
            if poll_interval < 5.0:
                poll_interval = min(poll_interval + 1.0, 5.0)
        
        return f"⏱️ Timeout ({timeout_seconds}s): O @{agente_id} ainda está processando sua demanda (Task {task_id[:8]}…). O backend está ativo e continuará processando. Verifique o andamento com o tool get_task ou no painel web."
        
    except Exception as e:
        return f"Erro ao acessar DMZ OS: {str(e)}"

@mcp.tool()
def get_status() -> str:
    """Retorna o status atual da conexão com o Squad e do projeto no DMZ OS."""
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        if not project_slug:
            return "DMZ OS não está configurado nesta pasta (arquivo .env.dmz não encontrado)."
        
        client = get_supabase()
        
        # Pega as últimas 5 tasks
        tasks = client.table("dmz_agents_tasks").select("title, agent_id, status").eq("project_id", project_slug).order("created_at", desc=True).limit(5).execute()
        
        msg = f"DMZ OS Conectado! Projeto: {project_slug}\n"
        msg += f"URL do Kanban: https://agents.dmzdigital.com.br/projects/{project_slug}\n\n"
        msg += "Últimas atividades:\n"
        if tasks.data:
            for t in tasks.data:
                status_emoji = "⏳" if t["status"] == "pending" else "✅"
                msg += f"- {status_emoji} [@{t['agent_id']}] {t['title']}\n"
        else:
            msg += "- Nenhuma tarefa recente."
            
        return msg
    except Exception as e:
        return f"Falha na comunicação: {str(e)}"


@mcp.tool()
def list_tasks(status: str = "", coluna: str = "") -> str:
    """
    Lista as tarefas do projeto no Kanban do DMZ OS.
    
    Args:
        status: Filtro opcional por status (pending, in_progress, completed, blocked).
        coluna: Filtro opcional por coluna do Kanban (master_plan, to_do, on_going, rework, done, approved).
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
        
        client = get_supabase()
        query = client.table("dmz_agents_tasks").select("id, title, agent_id, type, status, priority, feedback, created_at, updated_at").eq("project_id", project_slug)
        
        if status:
            query = query.eq("status", status)
        if coluna:
            query = query.eq("type", coluna)
        
        res = query.order("priority", desc=True).order("created_at", desc=True).limit(30).execute()
        
        if not res.data:
            filtro = f" (filtro: status={status}, coluna={coluna})" if status or coluna else ""
            return f"Nenhuma tarefa encontrada{filtro}."
        
        COLUMN_LABELS = {"master_plan": "📋 Master Plan", "to_do": "📝 To Do", "on_going": "🔄 On Going", "rework": "🔁 Rework", "done": "✅ Done", "approved": "🏆 Approved"}
        STATUS_EMOJI = {"pending": "⏳", "in_progress": "🔄", "completed": "✅", "blocked": "🚫", "cancelled": "❌"}
        
        msg = f"📊 Kanban — {project_slug} ({len(res.data)} tasks)\n\n"
        
        # Agrupa por coluna
        by_col: dict = {}
        for t in res.data:
            col = t["type"]
            if col not in by_col:
                by_col[col] = []
            by_col[col].append(t)
        
        for col_id in ["master_plan", "to_do", "on_going", "rework", "done", "approved"]:
            if col_id not in by_col:
                continue
            tasks = by_col[col_id]
            msg += f"{COLUMN_LABELS.get(col_id, col_id)} ({len(tasks)})\n"
            for t in tasks:
                emoji = STATUS_EMOJI.get(t["status"], "❓")
                agent = f"@{t['agent_id']}" if t["agent_id"] else "sem agente"
                msg += f"  {emoji} [{agent}] {t['title']}\n"
                msg += f"     ID: {t['id'][:8]}…  Prioridade: {t['priority']}\n"
            msg += "\n"
        
        return msg
    except Exception as e:
        return f"Erro ao listar tasks: {str(e)}"


@mcp.tool()
def get_task(task_id: str) -> str:
    """
    Retorna os detalhes completos de uma tarefa específica do Kanban.
    
    Args:
        task_id: O ID (UUID) da tarefa. Aceita IDs parciais (mínimo 8 caracteres).
    """
    try:
        client = get_supabase()
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        
        # Suporta ID parcial
        if len(task_id) < 36:
            res = client.table("dmz_agents_tasks").select("*").eq("project_id", project_slug).like("id", f"{task_id}%").limit(1).execute()
        else:
            res = client.table("dmz_agents_tasks").select("*").eq("id", task_id).execute()
        
        if not res.data:
            return f"Tarefa não encontrada: {task_id}"
        
        t = res.data[0]
        
        # Busca assignees
        assignees = client.table("dmz_agents_task_assignees").select("agent_id, role").eq("task_id", t["id"]).execute()
        
        msg = f"📋 Detalhes da Tarefa\n\n"
        msg += f"Título: {t['title']}\n"
        msg += f"ID: {t['id']}\n"
        msg += f"Coluna: {t['type']}\n"
        msg += f"Status: {t['status']}\n"
        msg += f"Agente Principal: @{t['agent_id'] or 'nenhum'}\n"
        msg += f"Prioridade: {t['priority']}\n"
        msg += f"Criada em: {t['created_at']}\n"
        msg += f"Atualizada em: {t['updated_at']}\n"
        
        if t.get("description"):
            msg += f"\n📝 Descrição:\n{t['description']}\n"
        
        if t.get("feedback"):
            msg += f"\n💬 Feedback:\n{t['feedback']}\n"
        
        if t.get("response"):
            msg += f"\n🤖 Resposta do Agente:\n{t['response']}\n"
        
        if assignees.data:
            msg += f"\n👥 Responsáveis:\n"
            for a in assignees.data:
                msg += f"  - @{a['agent_id']} ({a['role']})\n"
        
        return msg
    except Exception as e:
        return f"Erro ao buscar tarefa: {str(e)}"


@mcp.tool()
def create_task(titulo: str, descricao: str = "", agente: str = "", coluna: str = "to_do") -> str:
    """
    Cria uma nova tarefa no Kanban do DMZ OS.
    
    Args:
        titulo: Título da tarefa.
        descricao: Descrição detalhada (opcional).
        agente: Handle do agente responsável (ex: orch, architect, devops). Opcional.
        coluna: Coluna do Kanban onde criar (master_plan, to_do, on_going). Padrão: to_do.
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
        
        VALID_TYPES = ["master_plan", "to_do", "on_going", "rework", "done", "approved"]
        STATUS_MAP = {"master_plan": "pending", "to_do": "pending", "on_going": "in_progress", "done": "completed", "rework": "in_progress", "approved": "completed"}
        
        if coluna not in VALID_TYPES:
            return f"Coluna inválida: '{coluna}'. Use: {', '.join(VALID_TYPES)}"
        
        agent_id = None
        if agente:
            agent_id = AGENT_ALIASES.get(agente.lower().replace("@", ""), agente.lower().replace("@", ""))
        
        client = get_supabase()
        
        res = client.table("dmz_agents_tasks").insert({
            "project_id": project_slug,
            "agent_id": agent_id,
            "type": coluna,
            "title": titulo,
            "description": descricao or None,
            "status": STATUS_MAP[coluna],
            "priority": 0,
            "assigned_by": "mcp_server",
            "metadata": {"source": "mcp_server"}
        }).select().single().execute()
        
        if not res.data:
            return "Erro ao criar tarefa."
        
        t = res.data
        agent_str = f"@{agent_id}" if agent_id else "sem agente"
        return f"✅ Tarefa criada com sucesso!\n\nTítulo: {t['title']}\nColuna: {coluna}\nAgente: {agent_str}\nID: {t['id']}\n\nVisualize no Kanban: https://agents.dmzdigital.com.br/app/projects?id={project_slug}"
    except Exception as e:
        return f"Erro ao criar tarefa: {str(e)}"


@mcp.tool()
def get_memory(topico: str = "") -> str:
    """
    Consulta a memória técnica do projeto no DMZ OS.
    
    Args:
        topico: Termo de busca opcional para filtrar memórias por chave ou tags.
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
        
        client = get_supabase()
        query = client.table("dmz_agents_memory").select("*").eq("project_id", project_slug)
        
        if topico:
            query = query.ilike("key", f"%{topico}%")
        
        res = query.order("created_at", desc=True).limit(10).execute()
        
        if not res.data:
            filtro = f" sobre '{topico}'" if topico else ""
            return f"Nenhuma memória encontrada{filtro} para o projeto {project_slug}."
        
        msg = f"🧠 Memória do Projeto — {project_slug}\n\n"
        for m in res.data:
            msg += f"📌 {m['key']}\n"
            msg += f"   Agente: @{m.get('agent_id', 'sistema')}\n"
            msg += f"   Tipo: {m.get('memory_type', 'geral')}\n"
            content = m.get("content", "")
            if isinstance(content, dict):
                import json
                content = json.dumps(content, ensure_ascii=False, indent=2)
            if len(str(content)) > 500:
                content = str(content)[:500] + "…"
            msg += f"   Conteúdo: {content}\n"
            msg += f"   Data: {m.get('created_at', '?')}\n\n"
        
        return msg
    except Exception as e:
        return f"Erro ao consultar memória: {str(e)}"


@mcp.tool()
def update_task(task_id: str, coluna: str = "", agente: str = "", prioridade: int = -1, feedback: str = "") -> str:
    """
    Atualiza uma tarefa existente no Kanban: move entre colunas, altera agente, prioridade ou feedback.
    
    Args:
        task_id: O ID (UUID) da tarefa. Aceita IDs parciais (mínimo 8 caracteres).
        coluna: Nova coluna do Kanban (master_plan, to_do, on_going, rework, done). Opcional.
        agente: Novo agente responsável (ex: orch, architect). Use "none" para remover. Opcional.
        prioridade: Nova prioridade numérica (maior = mais urgente). Use -1 para não alterar.
        feedback: Texto de feedback ou comentário a adicionar. Opcional.
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
        
        client = get_supabase()
        
        # Resolve ID parcial
        if len(task_id) < 36:
            res = client.table("dmz_agents_tasks").select("id, title").eq("project_id", project_slug).like("id", f"{task_id}%").limit(1).execute()
            if not res.data:
                return f"Tarefa não encontrada: {task_id}"
            task_id = res.data[0]["id"]
            task_title = res.data[0]["title"]
        else:
            res = client.table("dmz_agents_tasks").select("title").eq("id", task_id).execute()
            task_title = res.data[0]["title"] if res.data else "?"
        
        VALID_TYPES = ["master_plan", "to_do", "on_going", "rework", "done", "approved"]
        STATUS_MAP = {"master_plan": "pending", "to_do": "pending", "on_going": "in_progress", "done": "completed", "rework": "in_progress", "approved": "completed"}
        
        update_data = {}
        changes = []
        
        if coluna:
            if coluna not in VALID_TYPES:
                return f"Coluna inválida: '{coluna}'. Use: {', '.join(VALID_TYPES)}"
            update_data["type"] = coluna
            update_data["status"] = STATUS_MAP[coluna]
            if coluna in ("done", "approved"):
                from datetime import datetime, timezone
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
            else:
                update_data["completed_at"] = None
            changes.append(f"coluna → {coluna}")
        
        if agente:
            if agente.lower() == "none":
                update_data["agent_id"] = None
                changes.append("agente removido")
            else:
                agent_id = AGENT_ALIASES.get(agente.lower().replace("@", ""), agente.lower().replace("@", ""))
                update_data["agent_id"] = agent_id
                changes.append(f"agente → @{agent_id}")
        
        if prioridade >= 0:
            update_data["priority"] = prioridade
            changes.append(f"prioridade → {prioridade}")
        
        if feedback:
            update_data["feedback"] = feedback
            changes.append("feedback atualizado")
        
        if not update_data:
            return "Nenhuma alteração especificada."
        
        client.table("dmz_agents_tasks").update(update_data).eq("id", task_id).execute()
        
        return f"✅ Tarefa atualizada: {task_title}\nAlterações: {', '.join(changes)}\nID: {task_id}"
    except Exception as e:
        return f"Erro ao atualizar tarefa: {str(e)}"


@mcp.tool()
def add_comment(task_id: str, comentario: str, autor: str = "mcp") -> str:
    """
    Adiciona um comentário com timestamp ao feedback de uma tarefa.
    
    Args:
        task_id: O ID (UUID) da tarefa. Aceita IDs parciais.
        comentario: O texto do comentário a adicionar.
        autor: Nome de quem está comentando (padrão: mcp).
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        client = get_supabase()
        
        # Resolve ID parcial
        if len(task_id) < 36:
            res = client.table("dmz_agents_tasks").select("id, title, feedback").eq("project_id", project_slug).like("id", f"{task_id}%").limit(1).execute()
        else:
            res = client.table("dmz_agents_tasks").select("id, title, feedback").eq("id", task_id).execute()
        
        if not res.data:
            return f"Tarefa não encontrada: {task_id}"
        
        task = res.data[0]
        current_feedback = task.get("feedback") or ""
        
        from datetime import datetime, timezone, timedelta
        tz_sp = timezone(timedelta(hours=-3))
        now = datetime.now(tz_sp).strftime("%d/%m %H:%M")
        
        new_feedback = f"{current_feedback}\n[{now}] @{autor}: {comentario}".strip()
        
        client.table("dmz_agents_tasks").update({"feedback": new_feedback}).eq("id", task["id"]).execute()
        
        return f"💬 Comentário adicionado em: {task['title']}\n\n[{now}] @{autor}: {comentario}"
    except Exception as e:
        return f"Erro ao comentar: {str(e)}"


@mcp.tool()
def assign_agent(task_id: str, agente: str, role: str = "executor", remover: bool = False) -> str:
    """
    Marca ou desmarca um agente como responsável (assignee) de uma tarefa.
    
    Args:
        task_id: O ID (UUID) da tarefa. Aceita IDs parciais.
        agente: Handle do agente (ex: orch, architect, emma).
        role: Papel do agente na tarefa (executor, qa, reviewer). Padrão: executor.
        remover: Se True, remove o agente da tarefa em vez de adicionar.
    """
    try:
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        client = get_supabase()
        
        agent_id = AGENT_ALIASES.get(agente.lower().replace("@", ""), agente.lower().replace("@", ""))
        
        # Resolve ID parcial
        if len(task_id) < 36:
            res = client.table("dmz_agents_tasks").select("id, title").eq("project_id", project_slug).like("id", f"{task_id}%").limit(1).execute()
        else:
            res = client.table("dmz_agents_tasks").select("id, title").eq("id", task_id).execute()
        
        if not res.data:
            return f"Tarefa não encontrada: {task_id}"
        
        task = res.data[0]
        
        if remover:
            client.table("dmz_agents_task_assignees").delete().eq("task_id", task["id"]).eq("agent_id", agent_id).execute()
            return f"➖ @{agent_id} removido de: {task['title']}"
        else:
            # Verifica se já existe
            existing = client.table("dmz_agents_task_assignees").select("id").eq("task_id", task["id"]).eq("agent_id", agent_id).execute()
            if existing.data:
                return f"@{agent_id} já está atribuído a: {task['title']}"
            
            client.table("dmz_agents_task_assignees").insert({
                "task_id": task["id"],
                "agent_id": agent_id,
                "role": role
            }).execute()
            return f"➕ @{agent_id} ({role}) atribuído a: {task['title']}"
    except Exception as e:
        return f"Erro ao gerenciar assignee: {str(e)}"


if __name__ == "__main__":
    mcp.run()
