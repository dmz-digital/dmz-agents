Tool 1 — project_planner

Finalidade: Criar e gerenciar planos de projeto com marcos, entregas, responsáveis e datas.

json{
  "name": "project_planner",
  "description": "Cria, atualiza e consulta planos de projeto com marcos, entregáveis e cronograma.",
  "parameters": {
    "action": "enum: create | update | get | list | close",
    "project_id": "string — identificador único do projeto",
    "project_name": "string — nome do projeto",
    "objective": "string — objetivo principal",
    "start_date": "string — data de início (ISO 8601)",
    "deadline": "string — data limite (ISO 8601)",
    "milestones": "array[object] — lista de marcos com título, responsável e data",
    "status": "enum: planning | active | at_risk | delayed | done"
  }
}

Tool 2 — risk_register

Finalidade: Registrar, monitorar e atualizar riscos identificados em projetos ativos.

json{
  "name": "risk_register",
  "description": "Gerencia o registro de riscos de um projeto: criação, atualização de probabilidade/impacto e status de mitigação.",
  "parameters": {
    "action": "enum: add | update | list | close",
    "project_id": "string — projeto ao qual o risco pertence",
    "risk_id": "string — identificador do risco",
    "description": "string — descrição clara do risco",
    "probability": "enum: low | medium | high",
    "impact": "enum: low | medium | high | critical",
    "mitigation": "string — ação de mitigação proposta",
    "status": "enum: open | mitigated | accepted | occurred"
  }
}
