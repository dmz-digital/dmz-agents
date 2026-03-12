Tool 1 — squad_roster

Finalidade: Consultar e atualizar o estado atual de cada agente do squad — carga, status e disponibilidade.

json{
  "name": "squad_roster",
  "description": "Gerencia o registro vivo dos agentes do squad: status, carga de trabalho e disponibilidade.",
  "parameters": {
    "action": "enum: get_all | get_agent | update_status | update_load",
    "agent_handle": "string — handle do agente (opcional para get_all)",
    "status": "enum: active | overloaded | blocked | inactive | onboarding",
    "current_load": "integer — número de tarefas ativas no momento",
    "notes": "string — observações relevantes sobre o agente"
  }
}

Tool 2 — squad_log

Finalidade: Registrar e consultar decisões, acordos, conflitos resolvidos e aprendizados do squad ao longo do tempo.

json{
  "name": "squad_log",
  "description": "Registra eventos relevantes da vida do squad: decisões, alinhamentos, conflitos resolvidos e aprendizados.",
  "parameters": {
    "action": "enum: add_entry | search | get_recent",
    "entry_type": "enum: decision | alignment | conflict_resolution | learning | role_change",
    "title": "string — título curto do registro",
    "description": "string — detalhamento do evento",
    "agents_involved": "array[string] — handles dos agentes envolvidos",
    "date": "string — data do evento (ISO 8601)"
  }