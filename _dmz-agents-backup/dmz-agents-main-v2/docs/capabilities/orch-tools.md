Tool 1 — task_dispatcher

Finalidade: Enviar tarefas formatadas para agentes específicos do squad com contexto estruturado.

json{
  "name": "task_dispatcher",
  "description": "Despacha uma tarefa para um agente do squad com contexto, instrução e formato de output esperado.",
  "parameters": {
    "agent_handle": "string — handle do agente (ex: ryan, emma, kanya)",
    "task_title": "string — título curto da tarefa",
    "context": "string — contexto necessário para o agente executar",
    "instruction": "string — o que exatamente deve ser feito",
    "expected_output": "string — formato e conteúdo esperado de retorno",
    "priority": "enum: low | medium | high | critical",
    "depends_on": "array[string] — IDs de tarefas que precisam ser concluídas antes"
  }
}

Tool 2 — execution_tracker

Finalidade: Registrar e consultar o estado de cada tarefa em um plano de orquestração ativo.

json{
  "name": "execution_tracker",
  "description": "Registra, atualiza e consulta o status de tarefas em execução dentro de um plano de orquestração.",
  "parameters": {
    "action": "enum: create_plan | update_task | get_status | close_plan",
    "plan_id": "string — identificador do plano de execução",
    "task_id": "string — identificador da tarefa (para update/status)",
    "status": "enum: pending | in_progress | blocked | done | cancelled",
    "output_summary": "string — resumo do output entregue pelo agente (em updates)",
    "blocker_description": "string — descrição do bloqueio, se houver"
  }
}