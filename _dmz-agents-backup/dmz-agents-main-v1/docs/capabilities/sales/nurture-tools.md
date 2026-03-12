Tool 1 -- investor_update_writer

Finalidade: Redigir o investor update mensal ou trimestral com estrutura
padrao, adaptado ao perfil do investidor e ao estagio do relacionamento.

json{ name: investor_update_writer, parameters: { deal_id: string, investor_name: string, investor_archetype: enum analytical visionary strategic, relationship_temperature: enum cold warm hot, period: string mes ou trimestre coberto, metrics: object mrr arr clientes churn metricas do negocio, milestones_achieved: array string, current_challenge: string o desafio atual e como esta sendo resolvido, next_milestone: string o que esperar no proximo update, include_cta: boolean incluir convite para reuniao se quente } }


Tool 2 -- milestone_flash_sender

Finalidade: Redigir e registrar uma mensagem curta de milestone flash
para comunicar um resultado especifico sem esperar o proximo update.

json{ name: milestone_flash_sender, parameters: { deal_id: string, investor_name: string, milestone_type: enum new_client mrr_record partnership product_launch award media_coverage, milestone_description: string o que aconteceu, metric_anchor: string o numero que valida o marco, channel: enum email whatsapp linkedin, include_forward_hook: boolean incluir gancho para o proximo passo } }


Tool 3 -- market_insight_composer

Finalidade: Produzir uma mensagem de market insight que usa uma noticia
ou dado de mercado como gancho para reativar ou aprofundar o relacionamento.

json{ name: market_insight_composer, parameters: { deal_id: string, investor_name: string, investor_thesis: string a tese de investimento do fundo, market_trigger: string a noticia ou dado de mercado a usar, company_angle: string como a empresa se relaciona com essa noticia, relationship_temperature: string, output_format: enum email linkedin_message whatsapp } }


Tool 4 -- relationship_pipeline_manager

Finalidade: Gerenciar o pipeline de relacionamento com todos os investidores,
registrando interacoes, classificando temperatura e definindo proximas acoes.

json{ name: relationship_pipeline_manager, parameters: { action: enum log_interaction update_temperature set_next_action get_pipeline_status flag_warming_signal, investor_id: string, interaction_type: enum email meeting data_room_access call linkedin, interaction_summary: string, investor_reaction: enum engaged neutral no_response requested_more, new_temperature: enum cold warm hot, next_action: string, next_action_date: string } }


Tool 5 -- warming_signal_detector

Finalidade: Monitorar os sinais de aquecimento de relacionamento com
investidores e alertar o IR Agent quando o momento de reengajamento ativo chegar.

json{ name: warming_signal_detector, parameters: { deal_id: string, monitoring_period_days: integer padrao 30, signals_to_monitor: array enum dataroom_activity update_response social_engagement fund_close portfolio_news partner_change, alert_threshold: enum any_signal two_or_more strong_signal_only, notify_agent: string handle do agente padrao ir_chief, auto_suggest_action: boolean sugerir a proxima acao quando sinal for detectado } }
