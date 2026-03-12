"""
O cérebro do DMZ OS — Orchestrator Loop
Aqui o @orch lê demandas, planeja e delega ou resolve tarefas em loop no Supabase.
"""

import os
import time
from rich.console import Console
from rich.panel import Panel
from supabase import create_client, Client

from dmz_os.engine.llm import get_llm_response
from dmz_os.engine.agent import AgentContext

console = Console()

class OrchestratorEngine:
    def __init__(self, project_id: str):
        self.project_id = project_id
        
        # Conecta no Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente")
        self.db: Client = create_client(url, key)
        
        # O @orch como Agente com carregamento do prompt dele do DMZ OS Online
        self.orch_agent = AgentContext(self.db, project_id, "orchestrator")
        console.print(f"[dim]Inicializando engine para projeto:[/] {project_id}")

    def run_loop(self):
        """O Loop eterno do orchestrator. Procura demanda, delega, verifica status, dorme."""
        console.print("[cyan]@orch despertou e está vigiando as tarefas...[/]")
        
        while True:
            try:
                self._check_for_new_demands()
                time.sleep(5) # loop a cada 5 segundos
            except KeyboardInterrupt:
                console.print("\n[yellow]Encerrando o loop do Orchestrator...[/]")
                break
            except Exception as e:
                console.print(f"[bold red]Erro no loop:[/] {e}")
                time.sleep(30) # Se der erro cai pra 30 segs de backoff

    def _check_for_new_demands(self):
        """Busca tasks 'pending' destinadas ao @orch."""
        res = self.db.table("dmz_agents_tasks")\
            .select("*")\
            .eq("project_id", self.project_id)\
            .eq("status", "pending")\
            .eq("agent_id", "orchestrator")\
            .order("priority", desc=True)\
            .order("created_at")\
            .limit(1)\
            .execute()
        
        if not res.data:
            return # Nada para fazer agora

        task = res.data[0]
        self._process_demand(task)

    def _process_demand(self, task: dict):
        """Um humano submeteu um requerimento para o @orch pelo DMZ OS!"""
        console.print(Panel(f"Recebi demanda: [bold]{task['title']}[/]", title="[cyan]@orch[/]"))
        
        # Marca a tarefa como init process
        self.db.table("dmz_agents_tasks")\
            .update({"status": "in_progress"})\
            .eq("id", task["id"])\
            .execute()

        # O prompt mestre do @orch é gerado juntando o prompt dele com DB Skills e contexto
        system_prompt = self.orch_agent.build_system_prompt()
        user_prompt = f"Por favor planeje e resolva ou delegue a seguinte demanda:\nTÍTULO: {task['title']}\nDESCRIÇÃO: {task.get('description', '')}"

        console.print("[dim]Pensando (conectando no LLM)...[/]")
        
        try:
            # Chama o LLM!
            response_text = get_llm_response(system_prompt, user_prompt)
            
            # TODO: O LLM pode retornar JSON para delegar. Por enquanto salvamos a resposta como completion
            console.print("[green]Plano concluído e memorizado![/]")
            
            # Salva na memória
            self.orch_agent.save_memory(
                content=response_text,
                task_context=f"Resposta à task: {task['title']}"
            )
            
            # Conclui a task master
            self.db.table("dmz_agents_tasks")\
                .update({"status": "completed"})\
                .eq("id", task["id"])\
                .execute()

        except Exception as e:
            console.print(f"[red]Erro executando task {task['id']}:[/] {e}")
            self.db.table("dmz_agents_tasks")\
                .update({"status": "blocked"})\
                .eq("id", task["id"])\
                .execute()
