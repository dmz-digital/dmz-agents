Tool 1 -- forecast_calculator

Finalidade: Calcular o forecast de receita do periodo nos tres cenarios
com base no pipeline ponderado e nas probabilidades por estagio.

json{ name: forecast_calculator, parameters: { period: string mes ou trimestre, pipeline_data: object deals com estagio e valor, close_probability_by_stage: object probabilidades por estagio, revenue_target: number, scenario_adjustments: object desconto_conservador adicional_otimista, exclude_deals: array string ids de deals a excluir do forecast, compare_with_previous_forecast: boolean } }


Tool 2 -- gap_analyzer

Finalidade: Calcular o gap entre o forecast base e a meta, classificar o
risco e identificar as opcoes para fechar o gap.

json{ name: gap_analyzer, parameters: { forecast_base: number, revenue_target: number, pipeline_data: object, days_remaining_in_period: integer, gap_close_options: array enum accelerate_existing_deals new_business_required expand_current_accounts, alert_on_risk_level: enum low medium high critical, notify_agents: array string handles dos agentes a alertar por nivel de risco } }


Tool 3 -- forecast_accuracy_tracker

Finalidade: Comparar o forecast historico com o realizado para calcular a
accuracy do squad e identificar desvios sistematicos.

json{ name: forecast_accuracy_tracker, parameters: { periods_to_analyze: integer numero de meses padrao 6, forecast_history: array object periodo forecast_base realizado, accuracy_benchmark_min: number padrao 85, accuracy_benchmark_max: number padrao 115, identify_systematic_bias: boolean identificar se o squad e sistematicamente otimista ou pessimista, recommend_probability_adjustments: boolean } }


Tool 4 -- probability_calibrator

Finalidade: Recalibrar as probabilidades de fechamento por estagio com base
no historico real de conversao do squad.

json{ name: probability_calibrator, parameters: { historical_deals: array object deal_id estagio_quando_entrou resultado valor data_fechamento, current_probabilities: object probabilidades atuais por estagio, minimum_sample_size: integer numero minimo de deals para ajustar padrao 20, output_calibrated_probabilities: boolean, show_confidence_interval: boolean } }


Tool 5 -- weekly_forecast_report_builder

Finalidade: Produzir o forecast semanal completo no formato padrao com
os tres cenarios, gap, risco, opcoes de fechamento e accuracy historica.

json{ name: weekly_forecast_report_builder, parameters: { current_pipeline: object, revenue_target: number, period_end_date: string, close_probability_by_stage: object, previous_forecasts: array object ultimos periodos, include_gap_close_options: boolean, include_accuracy_history: boolean, output_format: enum executive_summary full_report board_ready, alert_revops_and_cra: boolean disparar alerta se risco for alto ou critico } }
