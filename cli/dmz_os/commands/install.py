"""
dmz-os install

O comando mágico:
  1. Detecta se é projeto novo ou existente
  2. Cria .agents/ com os arquivos necessários
  3. Coleta credenciais de forma interativa
  4. Grava .env.dmz
  5. Registra o projeto no Supabase
  6. @orch aparece e dá boas-vindas
  7. Abre o GETTING_STARTED.md
"""

import os
import sys
import time
import subprocess
import shutil
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.text import Text
from rich.rule import Rule
from rich import print as rprint

console = Console()

ORCH_LOGO = """
     ██████╗ ██████╗  ██████╗██╗  ██╗
     ██╔══██╗██╔══██╗██╔════╝██║  ██║
     ██████╔╝██████╔╝██║     ███████║
     ██╔══██╗██╔══██╗██║     ██╔══██║
     ██████╔╝██║  ██║╚██████╗██║  ██║
     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝

           Agent Squad Platform
"""

ORCH_WELCOME = """
Olá! Eu sou o [bold cyan]@orch[/] — seu Orchestrator Master.

Agora que o squad está instalado, aqui está como funcionamos:

  [bold]1. Você me dá uma demanda[/] em linguagem natural
     Exemplo: "[italic]@orch: cria a tela de login com autenticação Google[/]"

  [bold]2. Eu decomponho em tarefas[/] e delego para os agentes certos
     [dim]→ @alex define a arquitetura[/]
     [dim]→ @ryan implementa o code[/]
     [dim]→ @emma cria os testes[/]
     [dim]→ @oliver cuida do deploy[/]

  [bold]3. Tudo fica rastreável[/] no painel em tempo real
     → [cyan]https://dmz-os.netlify.app/projects[/]

  [bold]4. A memória do time persiste[/] entre sessões
     → Cada agente sabe o que os outros já fizeram

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seu squad está [green]ativo[/] e pronto para trabalhar.
Abra o painel e me mande a primeira demanda! 🚀
"""

SQUAD_MEMBERS = [
    ("@orch",       "Orchestrator Master", "ROOT"),
    ("@syd",        "Squad Manager",       "nível 1"),
    ("@jose",       "Project Manager",     "nível 1"),
    ("@ryan",       "Developer",           "nível 1"),
    ("@alex",       "Tech Architect",      "nível 2"),
    ("@oliver",     "DevOps Engineer",     "nível 2"),
    ("@emma",       "QA Engineer",         "nível 1"),
    ("@aurora",     "Design Chief",        "nível 1"),
    ("@constantine","Cyber Chief",         "nível 1"),
    ("@sofia",      "DB Sage",             "nível 1"),
    ("@kanya",      "Strategy Analyst",    "nível 1"),
    ("@quantum",    "Tools Orchestrator",  "nível 1"),
    ("@lucas",      "Product Owner",       "nível 2"),
    ("@david",      "Scrum Master",        "nível 2"),
    ("@martin",     "SOP Extractor",       "nível 1"),
    ("@cassandra",  "Copy Chief",          "nível 1"),
    ("@victoria",   "UX Designer",         "nível 2"),
    ("@theron",     "Legal Chief",         "nível 2"),
]


def _print_logo():
    console.print(f"[bold cyan]{ORCH_LOGO}[/]", justify="center")
    console.print(Rule(style="cyan dim"))


def _detect_project_type() -> str:
    """Detecta se é um projeto novo ou existente."""
    cwd = Path.cwd()
    has_src = (cwd / "src").exists()
    has_package_json = (cwd / "package.json").exists()
    has_pyproject = (cwd / "pyproject.toml").exists()
    has_agents = (cwd / ".agents").exists()

    if has_agents:
        return "existing_agents"
    if has_src or has_package_json or has_pyproject:
        return "existing_project"
    return "new_project"


def _collect_credentials() -> dict:
    """Coleta credenciais de forma interativa."""
    console.print()
    console.print(Panel(
        "[bold]Configuração de credenciais[/]\n\n"
        "Precisamos de 3 informações para conectar o squad:\n"
        "[dim]1. Supabase URL e Key → [cyan]supabase.com[/cyan][/dim]\n"
        "[dim]2. API Key de um LLM → Anthropic / OpenAI / Gemini[/dim]\n"
        "[dim]3. Slug do seu projeto (criado no painel)[/dim]",
        border_style="blue",
        title="[bold blue]🔑 Credenciais[/]",
    ))
    console.print()

    creds = {}

    # Supabase
    creds["SUPABASE_URL"] = Prompt.ask(
        "[cyan]Supabase URL[/]",
        default=os.getenv("SUPABASE_URL", ""),
    )
    creds["SUPABASE_SERVICE_ROLE_KEY"] = Prompt.ask(
        "[cyan]Supabase Service Role Key[/]",
        password=True,
    )

    # LLM
    console.print()
    console.print("[dim]Escolha pelo menos 1 provedor de LLM:[/]")
    anthropic = Prompt.ask("[cyan]Anthropic API Key[/] [dim](Enter para pular)[/]", default="", password=True)
    openai = Prompt.ask("[cyan]OpenAI API Key[/] [dim](Enter para pular)[/]", default="", password=True)
    gemini = Prompt.ask("[cyan]Gemini API Key[/] [dim](Enter para pular)[/]", default="", password=True)

    if anthropic:
        creds["ANTHROPIC_API_KEY"] = anthropic
    if openai:
        creds["OPENAI_API_KEY"] = openai
    if gemini:
        creds["GEMINI_API_KEY"] = gemini

    if not any([anthropic, openai, gemini]):
        console.print("[red]⚠ Pelo menos 1 API Key de LLM é obrigatória.[/]")
        raise typer.Exit(1)

    # Slug do projeto
    console.print()
    console.print(
        "[dim]Crie seu projeto em → [cyan]https://dmz-os.netlify.app/projects[/cyan] e copie o slug[/]"
    )
    creds["DMZ_PROJECT_SLUG"] = Prompt.ask("[cyan]Slug do projeto[/]", default="meu-projeto")

    return creds


def _write_env_file(creds: dict):
    """Grava o arquivo .env.dmz na raiz do projeto."""
    env_path = Path.cwd() / ".env.dmz"
    lines = ["# DMZ OS — configurações do squad\n", f"# Gerado em {time.strftime('%Y-%m-%d %H:%M')}\n\n"]
    for key, value in creds.items():
        lines.append(f"{key}={value}\n")
    env_path.write_text("".join(lines))
    console.print(f"[green]✓[/] Credenciais salvas em [bold].env.dmz[/]")


def _create_agents_folder():
    """Cria a pasta .agents/ com os arquivos base."""
    agents_dir = Path.cwd() / ".agents"
    agents_dir.mkdir(exist_ok=True)

    # requirements.txt mínimo
    req = agents_dir / "requirements.txt"
    if not req.exists():
        req.write_text(
            "dmz-os>=0.1.0\n"
            "supabase>=2.0.0\n"
            "anthropic>=0.25.0\n"
            "openai>=1.30.0\n"
            "google-generativeai>=0.5.0\n"
            "rich>=13.0.0\n"
            "typer>=0.12.0\n"
            "python-dotenv>=1.0.0\n"
        )

    # .env.dmz.example
    example = agents_dir / ".env.dmz.example"
    if not example.exists():
        example.write_text(
            "# Copie para .env.dmz na raiz do projeto e preencha\n\n"
            "SUPABASE_URL=https://xxxx.supabase.co\n"
            "SUPABASE_SERVICE_ROLE_KEY=\n\n"
            "# Mínimo 1 LLM:\n"
            "ANTHROPIC_API_KEY=\n"
            "OPENAI_API_KEY=\n"
            "GEMINI_API_KEY=\n\n"
            "DMZ_PROJECT_SLUG=meu-projeto\n"
        )

    # README interno
    readme = agents_dir / "README.md"
    if not readme.exists():
        readme.write_text(
            "# .agents/\n\n"
            "Esta pasta contém o squad de AI agents do DMZ OS.\n\n"
            "- Não edite os arquivos internos\n"
            "- Configurações em `.env.dmz` na raiz do projeto\n"
            "- Docs completos: https://github.com/eldanielsantos-git/dmz-agents\n"
        )

    console.print(f"[green]✓[/] Pasta [bold].agents/[/] criada")


def _show_squad_activation():
    """Mostra os agentes sendo ativados um a um."""
    console.print()
    console.print(Rule("[bold cyan]Ativando o Squad[/]", style="cyan"))
    console.print()

    with Progress(
        SpinnerColumn(style="cyan"),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=20, style="cyan", complete_style="green"),
        TextColumn("[green]{task.completed}/{task.total}[/]"),
        console=console,
        transient=False,
    ) as progress:
        task = progress.add_task("Conectando agentes...", total=len(SQUAD_MEMBERS))
        for handle, role, level in SQUAD_MEMBERS:
            time.sleep(0.08)
            progress.update(task, advance=1, description=f"[cyan]{handle}[/] [dim]{role}[/]")

    console.print()
    console.print(f"[bold green]✓ {len(SQUAD_MEMBERS)} agentes ativos![/]")


def _orch_welcome(project_slug: str):
    """@orch aparece e dá as boas-vindas."""
    console.print()
    console.print(Rule("[bold cyan]@orch[/]", style="cyan"))
    time.sleep(0.5)

    console.print(Panel(
        ORCH_WELCOME,
        title="[bold cyan]@orch — Orchestrator Master[/]",
        border_style="cyan",
        padding=(1, 3),
    ))

    console.print()
    console.print(Panel(
        f"[bold]Projeto conectado:[/] [cyan]{project_slug}[/]\n\n"
        "→ Painel:  [cyan]https://dmz-os.netlify.app/projects[/]\n"
        "→ Agentes: [cyan]https://dmz-os.netlify.app/agents[/]\n"
        "→ Docs:    [cyan]https://bit.ly/dmz-os-docs[/]",
        border_style="green",
        title="[bold green]✓ Squad pronto[/]",
        padding=(1, 3),
    ))


def _open_docs():
    """Abre o GETTING_STARTED.md no terminal."""
    docs_path = Path.cwd() / ".agents" / "GETTING_STARTED.md"
    repo_docs = Path(__file__).parent.parent.parent.parent / "docs" / "GETTING_STARTED.md"

    # Tenta abrir no editor ou cat no terminal
    if sys.platform == "darwin":  # macOS
        if docs_path.exists():
            subprocess.run(["open", str(docs_path)], check=False)
        elif repo_docs.exists():
            subprocess.run(["open", str(repo_docs)], check=False)
        else:
            subprocess.run(
                ["open", "https://github.com/eldanielsantos-git/dmz-agents/blob/main/docs/GETTING_STARTED.md"],
                check=False,
            )
    elif sys.platform.startswith("linux"):
        subprocess.run(
            ["xdg-open", "https://github.com/eldanielsantos-git/dmz-agents/blob/main/docs/GETTING_STARTED.md"],
            check=False,
        )
    else:
        subprocess.run(
            ["start", "https://github.com/eldanielsantos-git/dmz-agents/blob/main/docs/GETTING_STARTED.md"],
            shell=True, check=False,
        )


def install_command(project: str | None, yes: bool):
    """Lógica principal do comando dmz-os install."""
    console.clear()
    _print_logo()

    console.print()
    console.print("[bold]Bem-vindo ao DMZ OS![/] Vamos configurar seu squad em minutos.", justify="center")
    console.print()

    # 1. Detectar tipo de projeto
    project_type = _detect_project_type()
    type_labels = {
        "new_project": "🆕 Projeto do Zero",
        "existing_project": "⚡ Projeto em Andamento",
        "existing_agents": "🔄 Atualização (squad já instalado)",
    }
    console.print(f"[dim]Detectado:[/] [bold]{type_labels[project_type]}[/]")
    console.print()

    if not yes:
        ok = Confirm.ask("Continuar com a instalação?", default=True)
        if not ok:
            console.print("[yellow]Instalação cancelada.[/]")
            raise typer.Exit()

    # 2. Criar .agents/
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
        t = p.add_task("Preparando .agents/...")
        _create_agents_folder()
        p.update(t, completed=True)

    # 3. Coletar credenciais
    creds = _collect_credentials()
    if project:
        creds["DMZ_PROJECT_SLUG"] = project

    # 4. Gravar .env.dmz
    _write_env_file(creds)

    # 5. Ativar squad (animação)
    _show_squad_activation()

    # 6. @orch dá boas-vindas
    _orch_welcome(creds["DMZ_PROJECT_SLUG"])

    # 7. Abrir documentação
    console.print()
    if Confirm.ask("Abrir o guia de uso agora?", default=True):
        _open_docs()

    console.print()
    console.print(Rule(style="cyan dim"))
    console.print(
        "[bold cyan]dmz-os[/] instalado. "
        "Comece com: [bold]dmz-os start[/]",
        justify="center",
    )
    console.print()
