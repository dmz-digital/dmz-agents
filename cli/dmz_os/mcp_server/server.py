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
        agente: O nome ou handle do agente (ex: orch, architect, devops)
        mensagem: A solicitação, demanda ou dúvida detalhada para o agente analisar.
    """
    try:
        agente_id = AGENT_ALIASES.get(agente.lower().replace("@", ""), agente.lower().replace("@", ""))
        project_slug = os.environ.get("DMZ_PROJECT_SLUG")
        
        if not project_slug:
            return "Erro: DMZ_PROJECT_SLUG não encontrado no .env.dmz"
            
        client = get_supabase()
        
        column_type = "to_do" if agente_id != "orchestrator" else "master_plan"
        
        # Cria a task
        res = client.table("dmz_agents_tasks").insert({
            "project_id": project_slug,
            "agent_id": agente_id,
            "type": column_type,
            "title": f"Conversa MCP com @{agente_id}",
            "description": mensagem,
            "metadata": {"source": "mcp_server", "status_message": "Aguardando resposta..."}
        }).execute()
        
        if not res.data:
            return "Erro: Não foi possível criar a demanda no Kanban DMZ OS."
            
        task_id = res.data[0]["id"]
        
        # Poll pela resposta
        timeout_seconds = 180
        start_time = time.time()
        
        while time.time() - start_time < timeout_seconds:
            await asyncio.sleep(2)
            check = client.table("dmz_agents_tasks").select("response, status").eq("id", task_id).execute()
            
            if check.data:
                task = check.data[0]
                if task.get("response"):
                    return str(task["response"])
                if task.get("status") == "completed" and not task.get("response"):
                    return f"A demanda foi processada pelo @{agente_id} (Task {task_id}), mas nenhuma resposta de texto foi retornada."
        
        return f"Timeout ({timeout_seconds}s): O @{agente_id} ainda está processando sua demanda na sua esteira do Kanban (Task {task_id}). Verifique o andamento no painel web."
        
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

if __name__ == "__main__":
    mcp.run()
