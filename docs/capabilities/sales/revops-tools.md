Tool 1 -- pipeline_snapshot

Finalidade: Gerar snapshot atualizado do pipeline com volume, valor por etapa,
deals em risco e variacao em relacao ao periodo anterior.

json{
  name: pipeline_snapshot,
  parameters: {
    period: string,
    include_at_risk: boolean,
    compare_to_previous: boolean,
    segment_by: enum stage agent prospect_size sector all
  }
}

Tool 2 -- forecast_generator

Finalidade: Calcular forecast de receita com cenarios conservador, base e otimista,
com base nos deals ativos e historico de conversao.

json{
  name: forecast_generator,
  parameters: {
    forecast_period: string -- ex Marco 2026 ou Q2 2026,
    method: enum stage_weighted historical_conversion hybrid,
    include_scenarios: boolean,
    exclude_deal_ids: array string,
    coverage_ratio_target: number -- ex 3.0
  }
}

Tool 3 -- funnel_diagnostics

Finalidade: Analisar taxas de conversao e tempos medios por etapa do funil
para identificar gargalos e comparar com benchmarks historicos.

json{
  name: funnel_diagnostics,
  parameters: {
    analysis_period: string,
    funnel_stages: array intel qualificacao outreach reuniao pitch objecoes contrato,
    segment_by: enum all agent prospect_size sector,
    flag_stalled_threshold_days: integer,
    compare_to_benchmark: boolean
  }
}

Tool 4 -- win_loss_analyzer

Finalidade: Analisar deals ganhos e perdidos para identificar padroes
acionaveis de perfil, objecao fatal e performance por agente.

json{
  name: win_loss_analyzer,
  parameters: {
    analysis_period: string,
    outcome_filter: enum won lost both,
    dimensions: array prospect_profile loss_stage objection_type agent_performance deal_size,
    min_deals_for_pattern: integer
  }
}

Tool 5 -- alert_config_manager

Finalidade: Configurar alertas automaticos para metricas criticas do pipeline
garantindo monitoramento proativo sem intervencao manual.

json{
  name: alert_config_manager,
  parameters: {
    action: enum create update disable list test,
    metric: enum pipeline_volume conversion_rate stalled_deals win_rate coverage_ratio,
    threshold_value: number,
    threshold_type: enum below above change_pct,
    alert_frequency: enum realtime daily weekly,
    notify_agents: array string -- handles dos agentes a notificar
  }
}

Tool 6 -- playbook_optimizer

Finalidade: Gerar recomendacoes de melhoria do playbook com base em dados
de performance, identificando etapas ineficientes e boas praticas.

json{
  name: playbook_optimizer,
  parameters: {
    analysis_period: string,
    focus_stages: array intel qualificacao outreach reuniao pitch objecoes contrato all,
    optimization_goal: enum conversion_rate cycle_speed deal_size win_rate all,
    evidence_threshold: integer,
    output_format: enum summary detailed_by_stage action_plan
  }
}