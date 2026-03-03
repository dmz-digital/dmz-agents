"""
DMZ OS — Entry point do CLI
Comando: dmz-os
"""

import typer
from rich.console import Console

from dmz_os.commands.install import install_command
from dmz_os.commands.start import start_command
from dmz_os.commands.status import status_command
from dmz_os.commands.tasks import tasks_command

console = Console()
app = typer.Typer(
    name="dmz-os",
    help="🤖 DMZ OS — Squad de 18 AI agents para o seu projeto",
    rich_markup_mode="rich",
    no_args_is_help=True,
    pretty_exceptions_show_locals=False,
)


@app.command("install", help="✨ Instala o squad e inicia o @orch")
def install(
    project: str = typer.Option(None, "--project", "-p", help="Slug do projeto existente"),
    yes: bool = typer.Option(False, "--yes", "-y", help="Aceitar padrões sem confirmação"),
):
    install_command(project=project, yes=yes)


@app.command("start", help="🚀 Inicia os agentes do projeto")
def start(
    project: str = typer.Option(None, "--project", "-p", help="Slug do projeto"),
):
    start_command(project=project)


@app.command("status", help="📊 Status dos agentes em execução")
def status():
    status_command()


@app.command("tasks", help="📋 Lista tarefas do projeto no painel")
def tasks(
    project: str = typer.Option(None, "--project", "-p"),
    tab: str = typer.Option("on_going", "--tab", "-t", help="master_plan | task_checklist | on_going | backlog"),
):
    tasks_command(project=project, tab=tab)


@app.callback(invoke_without_command=True)
def main(ctx: typer.Context, version: bool = typer.Option(False, "--version", "-v")):
    if version:
        from dmz_os import __version__
        console.print(f"[bold cyan]dmz-os[/] v{__version__}")
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        console.print("[bold red]Nenhum comando especificado.[/] Use [cyan]dmz-os --help[/]")


if __name__ == "__main__":
    app()
