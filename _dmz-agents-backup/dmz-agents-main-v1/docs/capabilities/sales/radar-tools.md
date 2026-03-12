Tool 1 -- external_signal_monitor

Finalidade: Monitorar sinais externos de prospect e de mercado, classificar
a urgencia e preparar o acionamento do agente correto.

json{ name: external_signal_monitor, parameters: { monitoring_scope: array enum prospect_job_change prospect_funding prospect_post prospect_media competitor_move market_regulation fund_close sector_event, prospects_to_monitor: array string nomes ou ids dos prospects em acompanhamento, deal_context: object historico e estagio de cada deal, alert_window_hours: object imediata curta planejada em horas } }


Tool 2 -- internal_signal_monitor

Finalidade: Monitorar sinais internos de pipeline e de investidores, com
thresholds configurados por estagio e por tipo de deal.

json{ name: internal_signal_monitor, parameters: { pipeline_data: object deals com estagio atividade e tempo, investor_activity_data: object atividade de cada investidor no data room e nos updates, thresholds: object tempo_sem_movimento cobertura_minima win_rate_queda dataroom_reativacao, check_frequency: enum realtime hourly daily } }


Tool 3 -- alert_dispatcher

Finalidade: Acionar o agente correto com o briefing completo no formato
padrao, registrando o acionamento para aprendizado futuro.

json{ name: alert_dispatcher, parameters: { signal_type: string, signal_description: string o que aconteceu com fonte e data, urgency_level: enum immediate short planned, deal_or_prospect_id: string, deal_context: object estagio ultimo_contato proximo_passo_planejado, target_agent: string handle do agente a acionar, recommended_action: string o que o agente deve fazer, log_alert: boolean registrar no historico de acionamentos } }


Tool 4 -- alert_history_analyzer

Finalidade: Analisar o historico de acionamentos para identificar quais sinais
geram oportunidade real e quais sao ruido, e ajustar os thresholds.

json{ name: alert_history_analyzer, parameters: { analysis_period_days: integer padrao 90, group_by: enum signal_type agent_triggered urgency_level, outcome_filter: enum opportunity_generated no_action_taken deal_advanced deal_lost all, recommend_threshold_adjustments: boolean, signal_noise_threshold: number percentual minimo de conversao para um sinal ser considerado valido } }


Tool 5 -- threshold_configurator

Finalidade: Configurar e atualizar os parametros de acionamento do RADAR,
ajustando o que monitora, quando aciona e quem recebe o alerta.

json{ name: threshold_configurator, parameters: { action: enum view update reset, signal_type: string, current_threshold: object parametros atuais do sinal, new_threshold: object novos parametros propostos, change_reason: string por que o ajuste foi feito, notify_revops_on_change: boolean } }
