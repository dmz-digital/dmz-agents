Tool 1 — vulnerability_scanner

Finalidade: Executar scans de vulnerabilidade na codebase, dependências e infraestrutura — retornando achados classificados por severidade com recomendações de remediação.

json{
  "name": "vulnerability_scanner",
  "description": "Executa análise de vulnerabilidades em código, dependências e configurações de infraestrutura com classificação por severidade e recomendações.",
  "parameters": {
    "scan_type": "enum: sast | dast | sca | secrets | infrastructure | full",
    "target": "string — repositório, URL ou componente a ser escaneado",
    "environment": "enum: development | staging | production",
    "severity_filter": "enum: critical | high | medium | low | all",
    "output_format": "enum: summary | detailed | remediation_plan",
    "block_on_severity": "enum: critical | high | none — severidade que bloqueia pipeline"
  }
}

Tool 2 — security_incident_tracker

Finalidade: Registrar, coordenar e auditar incidentes de segurança — com linha do tempo, impacto, ações de contenção e conformidade com obrigações de notificação regulatória.

json{
  "name": "security_incident_tracker",
  "description": "Gerencia o ciclo completo de incidentes de segurança: abertura, contenção, investigação, comunicação e fechamento com lições aprendidas.",
  "parameters": {
    "action": "enum: open | update | add_timeline_event | close | get | list",
    "incident_id": "string — identificador do incidente",
    "severity": "enum: critical | high | medium | low",
    "incident_type": "enum: data_breach | unauthorized_access | vulnerability_exploited | ddos | insider_threat | other",
    "affected_systems": "array[string] — sistemas ou componentes comprometidos",
    "affected_users": "integer — número estimado de usuários impactados",
    "containment_actions": "array[string] — ações de contenção executadas",
    "regulatory_notification_required": "boolean — se exige notificação à ANPD",
    "status": "enum: detected | containing | investigating | resolved | closed",
    "lessons_learned": "string — aprendizados e controles preventivos"
  }
}