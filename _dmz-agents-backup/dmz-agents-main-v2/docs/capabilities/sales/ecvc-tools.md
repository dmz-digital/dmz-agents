Tool 1 -- term_sheet_reviewer

Finalidade: Revisar um term sheet completo, classificar cada clausula e entregar
relatorio com semaforo geral, impacto e pontos de negociacao.

json{ name: term_sheet_reviewer, parameters: { deal_id: string, investor_name: string, document_version: string, term_sheet_text: string texto completo do term sheet, focus_areas: array enum liquidation_preference anti_dilution pro_rata board_composition drag_along veto_rights information_rights, output_format: enum full_report summary_only negotiation_priorities } }


Tool 2 -- safe_analyzer

Finalidade: Analisar um SAFE ou nota conversivel, mapear todos os gatilhos
e simular o impacto no cap table em diferentes cenarios de conversao.

json{ name: safe_analyzer, parameters: { deal_id: string, document_type: enum safe convertible_note, investor_name: string, valuation_cap: number, discount_rate: number, has_mfn_clause: boolean, maturity_date: string, pro_rata_rights: boolean, current_cap_table: object socios e percentuais, next_round_valuation_scenarios: array number } }


Tool 3 -- cap_table_dilution_modeler

Finalidade: Modelar o impacto de uma nova rodada de captacao no cap table,
calculando a diluicao de cada parte e o percentual pos-closing.

json{ name: cap_table_dilution_modeler, parameters: { deal_id: string, current_cap_table: object socios e percentuais, new_investment_amount: number, pre_money_valuation: number, option_pool_increase: number percentual a criar ou ampliar, existing_safes: array object investidor cap discount, existing_convertible_notes: array object investidor principal taxa } }


Tool 4 -- negotiation_brief_builder

Finalidade: Produzir o briefing de negociacao para o fundador, com cada ponto
a negociar, o argumento e a contraproposta sugerida.

json{ name: negotiation_brief_builder, parameters: { deal_id: string, clauses_to_negotiate: array string clausulas identificadas na revisao, market_context: enum brazil_vc global_vc, deal_stage: enum pre_seed seed series_a series_b, founder_leverage: enum low medium high baseado no perfil do deal, output_format: enum full_brief priority_only } }


Tool 5 -- document_version_tracker

Finalidade: Registrar e comparar versoes de documentos juridicos, identificando
o que mudou entre versoes e sinalizando alteracoes nao acordadas.

json{ name: document_version_tracker, parameters: { deal_id: string, document_type: enum term_sheet safe convertible_note shareholders_agreement, action: enum register compare list, version_label: string, document_text: string, compare_with_version: string para comparacao entre versoes, flag_unauthorized_changes: boolean } }
