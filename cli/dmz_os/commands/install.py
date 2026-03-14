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
import re
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.text import Text
from rich.rule import Rule
from rich import print as rprint
from supabase import create_client, ClientOptions

console = Console()

ORCH_LOGO = """
    ██████╗ ███╗   ███╗███████╗     ██████╗ ███████╗
    ██╔══██╗████╗ ████║╚══███╔╝    ██╔═══██╗██╔════╝
    ██║  ██║██╔████╔██║  ███╔╝     ██║   ██║███████╗
    ██║  ██║██║╚██╔╝██║ ███╔╝      ██║   ██║╚════██║
    ██████╔╝██║ ╚═╝ ██║███████╗    ╚██████╔╝███████║
    ╚═════╝ ╚═╝     ╚═╝╚══════╝     ╚═════╝ ╚══════╝

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
     → [cyan]https://agents.dmzdigital.com.br/projects[/]

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


def _get_local_git_remote() -> str | None:
    """Detecta a URL do repositório git local."""
    try:
        res = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, check=False
        )
        if res.returncode == 0:
            url = res.stdout.strip()
            # Normalizar: remover .git no final e transformar em minúsculo
            return re.sub(r"\.git$", "", url).lower()
    except Exception:
        pass
    return None


def _collect_credentials() -> dict:
    """Coleta credenciais de forma interativa e valida contra o Supabase."""
    console.print()
    console.print(Panel(
        "[bold]Conexão com a Plataforma DMZ OS[/]\n\n"
        "Configurando o link seguro entre seu ambiente local e a nuvem.\n"
        "[dim]Siga as orientações para ativar seu squad de 85 agentes.[/]",
        border_style="blue",
        title="[bold blue]🔗 Onboarding Local[/]",
    ))
    console.print()

    creds = {}

    # Supabase (URL Padrão da Plataforma DMZ)
    # Não perguntamos mais ao usuário para evitar confusão técnica.
    # O cliente só precisa do Slug e da DMZ_API_KEY.
    creds["SUPABASE_URL"] = "https://mqqiyyxcoutbmuszwejz.supabase.co"
    creds["SUPABASE_ANON_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWl5eXhjb3V0Ym11c3p3ZWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTIwNzcsImV4cCI6MjA1Njg0MDA3N30.C_shC-v_f_9zYV8k2zP9bXm9zYVYvU_zQ1e0-O5_Rkk"

    creds["DMZ_PROJECT_SLUG"] = Prompt.ask("[cyan]Slug do projeto (ex: yvoo-studio)[/]")
    
    # DMZ Security Key
    creds["DMZ_API_KEY"] = Prompt.ask(
        "[cyan]DMZ Security Key (obtida no Painel Web)[/]",
        password=True,
    )

    # --- VALIDAÇÃO EM TEMPO REAL ---
    with console.status("[bold yellow]Validando credenciais e projeto...[/]"):
        try:
            # Setup temporário do client para validação
            url = creds["SUPABASE_URL"]
            api_key = creds["DMZ_API_KEY"]
            opts = ClientOptions(headers={"x-dmz-api-key": api_key})
            anon_key = creds["SUPABASE_ANON_KEY"]
            
            client = create_client(url, anon_key, options=opts)
            
            # Tenta buscar o projeto
            res = client.table("dmz_agents_projects").select("*").eq("slug", creds["DMZ_PROJECT_SLUG"]).single().execute()
            
            if not res.data:
                console.print(f"\n[red]⚠ Erro: Projeto '[bold]{creds['DMZ_PROJECT_SLUG']}[/]' não encontrado ou Security Key inválida.[/]")
                raise typer.Exit(1)
            
            project_data = res.data
            console.print(f"\n[green]✓ Projeto '[bold]{project_data['name']}[/]' identificado com sucesso![/]")
            
            # --- VALIDAÇÃO DE GIT (SEGURANÇA CONTRA INJEÇÃO) ---
            db_repo = project_data.get("repo_url")
            local_repo = _get_local_git_remote()

            if db_repo:
                db_repo_norm = re.sub(r"\.git$", "", db_repo).lower()
                if local_repo and local_repo != db_repo_norm:
                    console.print(Panel(
                        f"[bold red]ALERTA DE SEGURANÇA: REPOSITÓRIO DIVERGENTE[/]\n\n"
                        f"Este projeto está configurado para o repositório:\n"
                        f"[cyan]{db_repo}[/]\n\n"
                        f"Mas este diretório local está conectado a:\n"
                        f"[yellow]{local_repo}[/]\n\n"
                        "Executar agentes em um repositório diferente pode causar injeção de código indesejada.",
                        border_style="red"
                    ))
                    if not Confirm.ask("[bold red]Deseja continuar mesmo assim?[/]", default=False):
                        raise typer.Exit(1)
                elif not local_repo:
                    console.print("[yellow]⚠ Aviso: Este diretório não é um repositório Git. Os agentes podem ter dificuldade em versionar alterações.[/]")
            else:
                console.print("[dim]ℹ Nenhuma URL de repositório configurada no painel para este projeto.[/]")

        except Exception as e:
            if isinstance(e, typer.Exit): raise e
            console.print(f"\n[red]⚠ Falha na conexão/validação:[/] {e}")
            raise typer.Exit(1)

    # LLM
    console.print()
    console.print(Panel(
        "Agora, forneça as chaves das IAs que o squad irá utilizar.\n"
        "[dim]Estas chaves ficam apenas no seu .env.dmz local.[/]",
        title="[bold]🤖 Modelos de IA[/]"
    ))
    anthropic = Prompt.ask("[cyan]Anthropic API Key[/] [dim](Enter para pular)[/]", default="", password=True)
    openai = Prompt.ask("[cyan]OpenAI API Key[/] [dim](Enter para pular)[/]", default="", password=True)
    gemini = Prompt.ask("[cyan]Gemini API Key[/] [dim](Enter para pular)[/]", default="", password=True)

    if anthropic: creds["ANTHROPIC_API_KEY"] = anthropic
    if openai: creds["OPENAI_API_KEY"] = openai
    if gemini: creds["GEMINI_API_KEY"] = gemini

    if not any([anthropic, openai, gemini]):
        console.print("[red]⚠ Pelo menos 1 API Key de LLM é necessária.[/]")
        raise typer.Exit(1)

    creds["PROJECT_ID"] = project_data["id"]
    return creds


def _secure_gitignore():
    """Garante que .env.dmz e .agents/ não sejam commitados no repositório do cliente."""
    gitignore_path = Path.cwd() / ".gitignore"
    
    entries_to_add = [".env.dmz", ".agents/"]
    
    if gitignore_path.exists():
        content = gitignore_path.read_text()
        missing = [entry for entry in entries_to_add if entry not in content]
        if missing:
            with open(gitignore_path, "a") as f:
                f.write("\n\n# DMZ OS Security\n")
                f.write("\n".join(missing) + "\n")
            console.print("[green]✓[/] [bold].gitignore[/] atualizado para proteger credenciais DMZ")
    else:
        with open(gitignore_path, "w") as f:
            f.write("# DMZ OS Security\n")
            f.write("\n".join(entries_to_add) + "\n")
        console.print("[green]✓[/] [bold].gitignore[/] criado para proteger credenciais DMZ")


def _write_env_file(creds: dict):
    """Grava o arquivo .env.dmz na raiz do projeto."""
    env_path = Path.cwd() / ".env.dmz"
    lines = ["# DMZ OS — configurações do squad\n", f"# Gerado em {time.strftime('%Y-%m-%d %H:%M')}\n\n"]
    for key, value in creds.items():
        lines.append(f"{key}={value}\n")
    env_path.write_text("".join(lines))
    console.print(f"[green]✓[/] Credenciais salvas em [bold].env.dmz[/]")
    
    _secure_gitignore()


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
            "DMZ_API_KEY=dmz_pk_xxx\n"
            "SUPABASE_ANON_KEY=eyJ... (se necessário)\n\n"
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
            "- **Canal Prioritário:** Use o Chat da sua IDE mencionando @agente (ex: @orch)\n"
            "- Configurações em `.env.dmz` na raiz do projeto\n"
            "- Docs completos: https://github.com/eldanielsantos-git/dmz-agents\n"
        )

    # Regras para IAs da IDE (Cursor, Windsurf, etc.)
    rules_content = (
        "# DMZ OS — Integração de Squad\n\n"
        "Você está operando em um ambiente com DMZ OS instalado.\n"
        "Sempre que o usuário mencionar um agente usando @ (ex: @orch, @cassandra, @syd),\n"
        "você deve tratar isso como uma delegacia de tarefa oficial.\n\n"
        "**Instrução Crítica:**\n"
        "Ao detectar uma @menção, você deve usar sua ferramenta de terminal/shell e rodar:\n"
        "`dmz-os ask \"@agente [mensagem original]\"`.\n\n"
        "Não tente realizar a tarefa você mesmo se houver uma @menção específica para outro agente.\n"
        "Após rodar o comando, confirme ao usuário que a demanda foi enviada para o Kanban do DMZ OS.\n"
    )

    for filename in [".cursorrules", ".windsurfrules"]:
        path = Path.cwd() / filename
        if not path.exists():
            path.write_text(rules_content)
            console.print(f"[green]✓[/] [bold]{filename}[/] criado para integrar o Chat da IDE")

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
        "→ Painel:  [cyan]https://agents.dmzdigital.com.br/projects[/]\n"
        "→ Agentes: [cyan]https://agents.dmzdigital.com.br/agents[/]\n"
        "→ Docs:    [cyan]https://bit.ly/dmz-os-docs[/]",
        border_style="green",
        title="[bold green]✓ Squad pronto[/]",
        padding=(1, 3),
    ))


def _create_onboarding_task(creds: dict):
    """Cria a primeira task de verificação no Kanban do cliente."""
    try:
        url = creds["SUPABASE_URL"]
        anon_key = creds["SUPABASE_ANON_KEY"]
        api_key = creds["DMZ_API_KEY"]
        
        opts = ClientOptions(headers={"x-dmz-api-key": api_key})
        client = create_client(url, anon_key, options=opts)

        # Verifica se já existe uma task de boas-vindas para não duplicar
        check = client.table("dmz_agents_tasks")\
            .select("id")\
            .eq("project_id", creds["PROJECT_ID"])\
            .eq("title", "🚩 Verificação de Instalação: Squad DMZ Pronto!")\
            .execute()

        if not check.data:
            client.table("dmz_agents_tasks").insert({
                "project_id": creds["PROJECT_ID"],
                "agent_id": "orchestrator",
                "type": "to_do",
                "title": "🚩 Verificação de Instalação: Squad DMZ Pronto!",
                "description": "### Parabéns! 🚀\nSe você está lendo esta tarefa, o link entre seu ambiente local e a Nuvem DMZ foi estabelecido com sucesso.\n\n**O que isso significa?**\n- Seus comandos via terminal (CLI) estão chegando até nós.\n- Seus agentes agora podem ler e escrever códigos no seu repositório local.\n- O Kanban Web está em sincronia total com sua IDE.\n\n**Próximo Passo:**\nRode `dmz-os start` no seu terminal e veja o **@orch** assumir esta tarefa!",
                "status": "pending",
                "priority": 100,
                "metadata": {"onboarding": True}
            }).execute()
            console.print("[dim]  → Task de verificação criada no Kanban[/]")
    except Exception as e:
        # Silencioso para não quebrar o install se falhar apenas a task
        console.print(f"[dim]  [yellow]⚠[/] Nota: Não foi possível criar a task automática ({e})[/]")


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

    # 7. Criar Task de Verificação
    _create_onboarding_task(creds)

    # 8. Abrir documentação
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
