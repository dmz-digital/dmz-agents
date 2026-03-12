Tool 1 -- roi_calculator

Finalidade: Calcular ROI que o prospect obtera com a solucao, com custo atual
do problema, investimento, ganho projetado e payback period.

json{ name: roi_calculator, parameters: { deal_id: string, prospect_company: string, current_problem_cost_monthly: number, solution_cost_total: number, expected_gain_monthly: number conservador, indirect_gain_monthly: number, roi_horizon_months: integer padrao 12, output_format: enum summary_for_slide detailed_model } }


Tool 2 -- revenue_projection_builder

Finalidade: Construir modelo de projecao de receita para pitch de investidor
com cenarios e horizonte de 3 a 5 anos.

json{ name: revenue_projection_builder, parameters: { deal_id: string, current_mrr: number, current_clients: integer, monthly_growth_rate_base: number, monthly_churn_rate: number, average_contract_value: number, expansion_revenue_pct: number, projection_years: integer padrao 5, funding_impact: object aporte e efeito no crescimento, scenarios: array enum conservative base optimistic } }


Tool 3 -- unit_economics_calculator

Finalidade: Calcular LTV, CAC, ratio e payback com diagnostico de saude
e analise por segmento quando aplicavel.

json{ name: unit_economics_calculator, parameters: { deal_id: string, arpu_monthly: number, churn_rate_monthly: number, cac_total: number, gross_margin_pct: number, sales_cycle_months: integer, segment_breakdown: array object segmento arpu churn cac } }


Tool 4 -- scenario_sensitivity_modeler

Finalidade: Construir analise de sensibilidade para as premissas mais criticas
do modelo, mostrando impacto de variacoes em cada variavel.

json{ name: scenario_sensitivity_modeler, parameters: { deal_id: string, model_type: enum roi revenue_projection unit_economics, key_variables: array object variavel valor_base variacao_pessimista variacao_otimista, output_scenarios: array enum conservative base optimistic, highlight_critical_variables: boolean } }


Tool 5 -- slide_data_formatter

Finalidade: Formatar dados do modelo financeiro para uso direto em slide
com dado principal, contexto, fonte e recomendacao de visual.

json{ name: slide_data_formatter, parameters: { deal_id: string, data_type: enum roi payback ltv_cac revenue_projection unit_economics runway, raw_numbers: object, slide_context: string o que o slide precisa comunicar, visual_options: array enum line_chart bar_chart comparison_table single_metric waterfall, include_footnote_with_assumptions: boolean } }