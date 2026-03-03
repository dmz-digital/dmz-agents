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
    load_dotenv(".env.dmz")
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
        f"[bold green]Squad ativo![/]\n\n"
        f"Projeto: [cyan]{slug}[/]\n"
        f"Painel:  [cyan]https://dmz-os.netlify.app/projects[/]\n\n"
        "[dim]Envie sua primeira demanda para @orch no painel.[/]",
        border_style="green",
        padding=(1, 3),
    ))
    console.print()
