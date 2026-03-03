"""dmz-os start — Inicia os agentes"""

import time
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule
from rich.live import Live
from rich.table import Table
from dotenv import load_dotenv
import os

console = Console()


def start_command(project: str | None):
    if not os.path.exists(".env.dmz"):
        console.print("[yellow]Configuração (.env.dmz) não encontrada![/]")
        console.print("[dim]Iniciando o Wizard de instalação automática...[/]\n")
        from dmz_os.commands.install import install_command
        install_command(project_type="new")
        return

    # Se existir, tenta carregar
    load_dotenv(".env.dmz") # Load .env.dmz if it exists
    slug = project or os.getenv("DMZ_PROJECT_SLUG", "meu-projeto")

    console.print()
    console.print(Rule("[bold cyan]dmz-os start[/]", style="cyan"))
    console.print()
    console.print(f"[dim]Iniciando squad para o projeto:[/] [bold cyan]{slug}[/]")
    console.print()

    steps = [
        ("Conectando ao Supabase...",        0.4),
        ("Carregando prompts dos agentes...", 0.5),
        ("Inicializando memória de trabalho...", 0.4),
        ("Preparando @orch como Orchestrator...", 0.6),
        ("Squad em modo de escuta...",        0.3),
    ]

    for label, delay in steps:
        console.print(f"  [cyan]⟳[/] {label}", end="")
        time.sleep(delay)
        console.print(f"\r  [green]✓[/] {label}")

    console.print()
    console.print(Panel(
        f"[bold green]Squad ativo e rodando![/]\n\n"
        f"Projeto: [cyan]{slug}[/]\n"
        f"Painel:  [cyan]https://dmz-os.netlify.app/projects[/]\n\n"
        "[dim]Envie demandas para o @orch via painel (ou via API/Supabase)![/]",
        border_style="green",
        padding=(1, 3),
    ))
    console.print()

    from dmz_os.engine.orchestrator import OrchestratorEngine
    
    try:
        engine = OrchestratorEngine(project_id=slug)
        # Este loop bloqueia o terminal, ele agora é um servidor workers-like:
        engine.run_loop()
    except Exception as e:
        console.print(f"[bold red]Erro fatal rodando o squad:[/] {e}")
        console.print("[dim]Verifique .env.dmz - As credenciais de LLM ou Supabase estão certas?[/]")
