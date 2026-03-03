Tool 1 — pipeline_manager

Finalidade: Disparar, monitorar e inspecionar execuções de pipeline de CI/CD — com status de cada etapa, logs de falha e histórico de deploys.

json{
  "name": "pipeline_manager",
  "description": "Gerencia pipelines de CI/CD: disparo de execuções, monitoramento de status, inspeção de logs e histórico de deploys.",
  "parameters": {
    "action": "enum: trigger | get_status | get_logs | list_runs | rollback",
    "pipeline_id": "string — identificador do pipeline",
    "environment": "enum: development | staging | production",
    "branch": "string — branch a ser deployada",
    "run_id": "string — ID da execução (para status/logs/rollback)",
    "rollback_to": "string — versão ou run_id para rollback",
    "notify_team": "boolean — se deve notificar o squad ao concluir"
  }
}

Tool 2 — infrastructure_monitor

Finalidade: Consultar métricas de infraestrutura em tempo real — CPU, memória, latência, taxa de erros e status de serviços — para detecção precoce de anomalias.

json{
  "name": "infrastructure_monitor",
  "description": "Consulta métricas e status de infraestrutura em tempo real para monitoramento de saúde do sistema e detecção de anomalias.",
  "parameters": {
    "action": "enum: get_metrics | get_alerts | get_service_status | get_error_rate | get_latency",
    "service": "string — nome do serviço ou componente",
    "environment": "enum: staging | production",
    "time_range": "enum: last_5min | last_1h | last_24h | last_7d",
    "metric_type": "enum: cpu | memory | latency | error_rate | throughput | availability",
    "threshold_alert": "number — valor de referência para comparação"
  }
}