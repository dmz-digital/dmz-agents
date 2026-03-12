"""dmz-os status — Status do squad"""

import os
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.rule import Rule

console = Console()

AGENTS = [
    ("@orch",        "Orchestrator Master", "active"),
    ("@syd",         "Squad Manager",       "active"),
    ("@jose",        "Project Manager",     "active"),
    ("@ryan",        "Developer",           "active"),
    ("@alex",        "Tech Architect",      "active"),
    ("@oliver",      "DevOps Engineer",     "active"),
    ("@emma",        "QA Engineer",         "active"),
    ("@sofia",       "DB Sage",             "active"),
    ("@kanya",       "Strategy Analyst",    "active"),
    ("@quantum",     "Tools Orchestrator",  "active"),
    ("@lucas",       "Product Owner",       "active"),
    ("@david",       "Scrum Master",        "active"),
    ("@martin",      "SOP Extractor",       "active"),
    ("@aurora",      "Design Chief",        "standby"),
    ("@victoria",    "UX Designer",         "standby"),
    ("@cassandra",   "Copy Chief",          "standby"),
    ("@constantine", "Cyber Chief",         "standby"),
    ("@theron",      "Legal Chief",         "standby"),
]


def status_command():
    load_dotenv(".env.dmz")
    slug = os.getenv("DMZ_PROJECT_SLUG", "não configurado")

    console.print()
    console.print(Rule("[bold cyan]Squad Status[/]", style="cyan"))
    console.print(f"[dim]Projeto:[/] [bold cyan]{slug}[/]\n")

    table = Table(show_header=True, header_style="bold cyan", box=None, padding=(0, 2))
    table.add_column("Handle",    style="cyan",    width=14)
    table.add_column("Função",    style="white",   width=22)
    table.add_column("Status",    justify="center", width=10)

    for handle, role, status in AGENTS:
        icon = "[green]● active[/]" if status == "active" else "[yellow]○ standby[/]"
        table.add_row(handle, role, icon)

    console.print(table)
    console.print()
    active = sum(1 for _, _, s in AGENTS if s == "active")
    console.print(f"[dim]{active} ativos · {len(AGENTS) - active} standby · painel → [cyan]https://agents.dmzdigital.com.br[/cyan][/]")
    console.print()
