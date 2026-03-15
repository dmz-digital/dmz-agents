"""dmz-os ask — Cria uma tarefa natural via CLI"""

import os
import sys
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel

console = Console()

def ask_command(prompt_text: str, project: str | None = None):
    # Garante que o usuário tem um esqueleto local conectado com o DMZ OS
    if not os.path.exists(".env.dmz"):
        console.print("[yellow]Erro:[/] DMZ_API_KEY ou .env.dmz não encontrado na raiz.")
        console.print("[dim]Solução:[/] Rode [bold cyan]dmz-os install[/] primeiro.")
        return

    load_dotenv(".env.dmz")
    slug = project or os.getenv("DMZ_PROJECT_SLUG")
    if not slug:
        console.print("[yellow]Erro:[/] DMZ_PROJECT_SLUG não definido.")
        return
        
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    api_key = os.getenv("DMZ_API_KEY")
    service_role = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not (anon_key or service_role):
        console.print("[yellow]Erro:[/] Credenciais do banco (URL/KEY) faltantes ou inválidas.")
        return

    try:
        from supabase import create_client, ClientOptions
        
        # Conexão transparente via API rest (Simulando bridge BaaS)
        opts = ClientOptions(headers={"x-dmz-api-key": api_key}) if api_key else ClientOptions()
        db = create_client(url, service_role or anon_key, options=opts)

        # Trunca título longo, guarda original na descrição
        title = prompt_text[:120] + "..." if len(prompt_text) > 120 else prompt_text
        desc = prompt_text if len(prompt_text) > 120 else "Task gerada automaticamente a partir da máquina local do cliente (CLI)."

        # Tenta detectar um @agente na string para delegar direto
        import re
        
        # Aliases comuns → IDs reais na tabela dmz_agents_definitions
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
        
        target_agent = "orchestrator"
        column_type = "master_plan"
        
        match = re.search(r'@([a-zA-Z0-9_-]+)', prompt_text)
        if match:
            raw_agent = match.group(1).lower()
            target_agent = AGENT_ALIASES.get(raw_agent, raw_agent)  # Resolve alias ou usa direto
            column_type = "to_do" if target_agent != "orchestrator" else "master_plan"
            
            # Formata o título para remover a tag do início se ela começou lá
            title = re.sub(r'^@[a-zA-Z0-9_-]+\s+', '', title)

        # Insere a demanda diretamente no Kanban da plataforma remota!
        payload = {
            "project_id": slug,
            "type": column_type,
            "title": title,
            "description": desc,
            "status": "pending",
            "agent_id": target_agent,  # Pode ser @orch, ou o agente especifico detectado
            "assigned_by": "IDE Bridge",
            "priority": 800  # Alta prioridade pra aparecer no topo
        }
        
        res = db.table("dmz_agents_tasks").insert(payload).execute()
        
        if res.data:
            console.print(Panel(
                f"Sua demanda foi enviada com sucesso para o DMZ OS!\n\n"
                f"[dim]Mensagem original:[/]\n[cyan]\"{prompt_text}\"[/]\n\n"
                f"→ [bold green]O Kanban do projeto {slug} já está atualizado.[/]\n"
                f"→ Acompanhe a execução por lá: [cyan]https://agents.dmzdigital.com.br/app/projects?id={slug}[/]",
                title="[bold green]✓ Demanda Criada (Ponte Mágica)[/]",
                border_style="green"
            ))
        else:
            console.print("[yellow]A requisição ocorreu, mas nenhum dado foi retornado...[/]")
            
    except Exception as e:
        console.print(f"[bold red]Falha ao criar task remotamente:[/] {e}")
        console.print("[dim]Sua chave (DMZ_API_KEY) tem permissão de escrita para esse projeto?[/]")
