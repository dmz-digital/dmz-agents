"""dmz-os tasks — Lista tarefas do projeto"""

import os
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.rule import Rule
from rich.panel import Panel

console = Console()

STATUS_COLORS = {
    "in_progress": "[cyan]in_progress[/]",
    "pending":     "[yellow]pending[/]",
    "completed":   "[green]completed[/]",
    "blocked":     "[red]blocked[/]",
}

TAB_LABELS = {
    "master_plan":    "Master Plan",
    "task_checklist": "Tasks Checklist",
    "on_going":       "On Going",
    "backlog":        "Backlog",
}


def tasks_command(project: str | None, tab: str):
    load_dotenv(".env.dmz")
    slug = project or os.getenv("DMZ_PROJECT_SLUG", "não configurado")
    tab_label = TAB_LABELS.get(tab, tab)

    console.print()
    console.print(Rule(f"[bold cyan]{tab_label}[/] — {slug}", style="cyan"))

    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise ValueError("Supabase não configurado")

        sb = create_client(url, key)
        res = sb.table("dmz_agents_tasks") \
            .select("*") \
            .eq("project_id", slug) \
            .eq("type", tab) \
            .order("created_at", desc=True) \
            .execute()

        tasks = res.data or []

        if not tasks:
            console.print(Panel(
                f"[dim]Nenhuma tarefa em [bold]{tab_label}[/] para o projeto [cyan]{slug}[/].[/]",
                border_style="dim",
            ))
        else:
            table = Table(show_header=True, header_style="bold cyan", box=None, padding=(0, 2))
            table.add_column("Status",   width=14)
            table.add_column("Agente",   style="cyan", width=14)
            table.add_column("Título",   style="bold", width=40)

            for t in tasks:
                status_str = STATUS_COLORS.get(t.get("status", ""), t.get("status", ""))
                agent = f"@{t.get('agent_id', '?')}"
                title = t.get("title", "")[:55]
                table.add_row(status_str, agent, title)

            console.print(table)
            console.print(f"\n[dim]{len(tasks)} tarefa(s) · painel → [cyan]https://agents.dmzdigital.com.br/projects[/cyan][/]")

    except Exception as e:
        console.print(f"[yellow]⚠ Não foi possível conectar ao Supabase: {e}[/]")
        console.print("[dim]Verifique seu .env.dmz ou acesse o painel online.[/]")

    console.print()
