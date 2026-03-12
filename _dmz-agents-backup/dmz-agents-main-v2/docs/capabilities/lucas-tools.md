Tool 1 — backlog_manager

Finalidade: Criar, priorizar e gerenciar itens do backlog de produto com score de priorização e critérios de aceite.

json{
  "name": "backlog_manager",
  "description": "Gerencia o backlog de produto: criação de user stories, priorização, refinamento e status de cada item.",
  "parameters": {
    "action": "enum: add | update | prioritize | list | archive",
    "item_id": "string — identificador da user story",
    "title": "string — título da história",
    "user_story": "string — texto no formato Como/Quero/Para que",
    "acceptance_criteria": "array[string] — critérios no formato Dado/Quando/Então",
    "priority_score": "number — score RICE calculado",
    "status": "enum: draft | refined | ready | in_progress | done | rejected",
    "sprint": "string — sprint ou ciclo ao qual pertence"
  }
}

Tool 2 — product_metrics_tracker

Finalidade: Registrar e consultar métricas de produto para validar hipóteses e medir impacto de entregas.

json{
  "name": "product_metrics_tracker",
  "description": "Registra e consulta métricas de produto por feature, ciclo ou período para embasar decisões de priorização.",
  "parameters": {
    "action": "enum: record | get | compare | list",
    "feature_id": "string — identificador da feature ou entrega",
    "metric_name": "string — nome da métrica (ex: conversão, retenção, NPS)",
    "value": "number — valor medido",
    "period": "string — período de referência (ex: 2026-W10)",
    "hypothesis": "string — hipótese que essa métrica valida ou invalida",
    "result": "enum: validated | invalidated | inconclusive"
  }
}