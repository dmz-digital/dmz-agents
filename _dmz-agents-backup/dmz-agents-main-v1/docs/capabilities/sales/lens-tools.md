Tool 1 -- funnel_health_analyzer

Finalidade: Calcular as taxas de conversao por estagio, a velocidade do
pipeline e a cobertura da meta, com comparativo vs periodo anterior.

json{ name: funnel_health_analyzer, parameters: { period: enum current_week current_month last_30_days, pipeline_data: object deals por estagio com valor e tempo no estagio, revenue_target: number meta do periodo, benchmark_conversion_rates: object taxas de conversao historicas por estagio, segment_breakdown: boolean quebrar por segmento canal e ICP } }


Tool 2 -- bottleneck_diagnostics

Finalidade: Identificar o estagio com maior acumulo de deals, diagnosticar
a causa provavel e recomendar a acao correta.

json{ name: bottleneck_diagnostics, parameters: { pipeline_data: object, time_in_stage_benchmarks: object tempo padrao por estagio, lost_reasons_distribution: object motivos de perda com frequencia, alert_threshold_days: integer tempo acima do benchmark que aciona alerta, output_impact_revenue: boolean calcular o impacto em receita do gargalo } }


Tool 3 -- pipeline_weighted_calculator

Finalidade: Calcular o pipeline ponderado aplicando probabilidade de
fechamento por estagio ao valor de cada deal.

json{ name: pipeline_weighted_calculator, parameters: { pipeline_data: object deals com estagio e valor, close_probability_by_stage: object probabilidade por estagio, include_deal_detail: boolean listar cada deal com valor ponderado, output_for_forecast: boolean formatar para uso pelo Forecast Agent } }


Tool 4 -- at_risk_deal_detector

Finalidade: Identificar deals em risco de perda iminente combinando tempo
no estagio, ultima atividade e sinais de desengajamento.

json{ name: at_risk_deal_detector, parameters: { pipeline_data: object, days_without_activity_threshold: integer padrao 14, time_in_stage_multiplier: number quantas vezes o benchmark acima ativa o alerta padrao 2, check_dataroom_activity: boolean cruzar com atividade no data room, notify_agent: string handle do agente a alertar padrao closer_chief } }


Tool 5 -- weekly_funnel_report_builder

Finalidade: Produzir o diagnostico semanal completo no formato padrao
com semaforo, conversao, gargalo, alertas e tendencia de 4 semanas.

json{ name: weekly_funnel_report_builder, parameters: { current_week_data: object, previous_weeks_data: array object ultimas 4 semanas, revenue_target: number, include_recommendations: boolean, include_agent_alerts: boolean disparar alertas para agentes relevantes baseado nos criterios de alerta, output_format: enum executive_summary full_report data_only } }
