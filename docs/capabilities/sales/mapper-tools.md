Tool 1 -- investor_universe_mapper

Finalidade: Mapear o universo de investidores relevantes para uma rodada
especifica, filtrando por tese, estagio, ticket e cobertura geografica.

json{ name: investor_universe_mapper, parameters: { company_profile: string descricao do negocio setor e modelo, round_stage: enum pre_seed seed series_a series_b, round_target_amount: number valor alvo da rodada, geographies: array enum brazil latam global, investor_types: array enum vc_early vc_growth cvc angel family_office, exclude_conflicts: boolean excluir fundos com portfolio concorrente, max_results: integer padrao 30 } }


Tool 2 -- investor_qualifier

Finalidade: Qualificar um investidor especifico por fit real com a empresa,
analisando tese, portfolio, ticket e contato ideal.

json{ name: investor_qualifier, parameters: { investor_name: string, company_profile: string, round_stage: string, round_amount: number, check_portfolio_conflicts: boolean, check_portfolio_synergies: boolean, identify_ideal_contact: boolean, output_template: boolean gerar perfil no template padrao } }


Tool 3 -- investor_list_ranker

Finalidade: Rankear uma lista de investidores mapeados por probabilidade
de conversao, aplicando os criterios de priorizacao ponderados.

json{ name: investor_list_ranker, parameters: { deal_id: string, investors: array object nome tipo tese estagio ticket network_connection portfolio_fit, prioritization_criteria: object pesos para tese estagio ticket network portfolio follow_on, output_tiers: boolean separar top_targets de segunda_linha, top_target_count: integer padrao 10 } }


Tool 4 -- network_connection_finder

Finalidade: Identificar conexoes existentes entre o network do fundador e
os contatos ideais nos fundos priorizados.

json{ name: network_connection_finder, parameters: { deal_id: string, founder_network: array string linkedin ou nomes de conexoes do fundador, target_investors: array object fundo contato_ideal, connection_depth: enum direct one_degree two_degrees, output_intro_path: boolean mapear o caminho para a intro } }


Tool 5 -- investor_briefing_builder

Finalidade: Produzir o briefing completo de um investidor antes do primeiro
contato, com tese, portfolio, contato, o que os faz dizer nao e narrativa recomendada.

json{ name: investor_briefing_builder, parameters: { deal_id: string, investor_name: string, investor_type: string, company_pitch_summary: string, include_narrative_adaptation: boolean como adaptar o pitch para esse investidor, include_no_triggers: boolean o que evitar na conversa, output_format: enum full_briefing quick_reference } }
