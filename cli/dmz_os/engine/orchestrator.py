"""
O cérebro do DMZ OS — Orchestrator Loop
Aqui o @orch lê demandas, planeja e delega ou resolve tarefas em loop no Supabase.
"""

import os
import time
from rich.console import Console
from rich.panel import Panel
from supabase import create_client, Client, ClientOptions

from dmz_os.engine.llm import get_llm_response
from dmz_os.engine.agent import AgentContext

console = Console()

class OrchestratorEngine:
    def __init__(self, project_id: str):
        self.project_id = project_id
        
        # Conecta no Supabase localizando as credenciais corretas
        url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        # Usa anon key e injeta a API Key do projeto no header para o RLS
        anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        api_key = os.getenv("DMZ_API_KEY")
        
        if not url or not (anon_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")):
            raise ValueError("Credenciais base do Supabase (URL e KEY) ausentes. Verifique seu arquivo env.")
        
        if not api_key:
            console.print("[yellow]Aviso: DMZ_API_KEY não localizada. O acesso ao projeto pode falhar dependendo do RLS.[/]")

        # Supabase config com options pra injetar header customizado do dmz-os
        opts = ClientOptions(headers={"x-dmz-api-key": api_key}) if api_key else ClientOptions()
        
        # Constrói o client
        self.db: Client = create_client(url, anon_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY"), options=opts)
        
        # O @orch como Agente com carregamento do prompt dele do DMZ OS Online
        self.orch_agent = AgentContext(self.db, project_id, "orchestrator")
        console.print(f"[dim]Inicializando engine para projeto:[/] {project_id}")

    def run_loop(self):
        """O Loop eterno do orchestrator. Procura demanda, delega, verifica status, dorme."""
        console.print("[bold cyan]@orch despertou![/] Vigiando a esteira Master Plan...")
        
        while True:
            try:
                self._check_for_new_demands()
                time.sleep(3) # Polling de alta responsividade (3 segundos)
            except KeyboardInterrupt:
                console.print("\n[yellow]Encerrando o loop do Orchestrator...[/]")
                break
            except Exception as e:
                console.print(f"[bold red]Erro de conexão no loop:[/] {e}")
                time.sleep(10) # Se der erro (ex: internet cair) cai pra 10 segs de backoff

    def _check_for_new_demands(self):
        """Busca tasks 'pending' vinculadas ao projeto."""
        res = self.db.table("dmz_agents_tasks")\
            .select("*")\
            .eq("project_id", self.project_id)\
            .eq("status", "pending")\
            .order("priority", desc=True)\
            .order("created_at")\
            .limit(1)\
            .execute()
        
        if not res.data:
            return # Nada para fazer agora
        
        task = res.data[0]
        # Se a task for do @orch ou se não houver agente específico (fallback pro @orch)
        agent_handle = task.get("agent_id") or "orchestrator"
        self._process_demand(task, agent_handle)

    def _process_demand(self, task: dict, agent_id: str):
        """Executa a demanda usando o contexto do agente responsável."""
        agent_context = AgentContext(self.db, self.project_id, agent_id)
        
        console.print(Panel(
            f"Lendo demanda: [bold]{task['title']}[/]\n"
            f"[dim]Agente Designado:[/] [bold cyan]@{agent_id}[/]", 
            title=f"[cyan]@{agent_id}[/]",
            border_style="cyan"
        ))
        
        # Marca a tarefa como in_progress
        self.db.table("dmz_agents_tasks")\
            .update({"status": "in_progress"})\
            .eq("id", task["id"])\
            .execute()

        # Build do cérebro do agente
        system_prompt = agent_context.build_system_prompt()
        user_prompt = f"### DEMANDA TÉCNICA\n\nTÍTULO: {task['title']}\nDESCRIÇÃO: {task.get('description', 'Sem descrição adicional.')}\n\nExecute esta tarefa. Se precisar de mais informações, responda detalhando o que falta. Se concluir, escreva um log técnico da execução."

        console.print(f"  [dim]@{agent_id} está processando no LLM...[/]")
        
        try:
            # Wake up LLM
            start_time = time.time()
            response_text = get_llm_response(system_prompt, user_prompt)
            duration = time.time() - start_time
            
            console.print(f"  [green]✓[/] Executor: [bold]@{agent_id}[/] concluiu em {duration:.1f}s")
            
            # Salva na memória técnica do projeto
            agent_context.save_memory(
                content=response_text,
                task_context=f"Task Concluída: {task['title']} (ID: {task['id']})"
            )
            
            # Conclui a task
            self.db.table("dmz_agents_tasks")\
                .update({
                    "status": "completed",
                    "completed_at": "now()",
                    "feedback": f"Executado via CLI Local por @{agent_id}"
                })\
                .eq("id", task["id"])\
                .execute()

        except Exception as e:
            console.print(f"  [red]✖[/] Erro executando via @{agent_id}: {e}")
            self.db.table("dmz_agents_tasks")\
                .update({
                    "status": "blocked",
                    "feedback": f"Erro CLI: {str(e)}"
                })\
                .eq("id", task["id"])\
                .execute()
