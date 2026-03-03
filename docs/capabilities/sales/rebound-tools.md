Tool 1 -- objection_classifier

Finalidade: Classificar uma objecao recebida por tipo e profundidade,
indicando a estrutura de resposta recomendada e se e real ou cortina.

json{ name: objection_classifier, parameters: { deal_id: string, objection_text: string o que o prospect disse literalmente, channel: enum meeting email whatsapp linkedin, decision_maker_archetype: string, deal_stage: enum prospecting qualification pitch negotiation closing, recurrence_count: integer quantas vezes essa objecao apareceu nesse deal } }


Tool 2 -- objection_response_builder

Finalidade: Construir a resposta completa para uma objecao classificada,
com validacao, argumento central e proximo passo.

json{ name: objection_response_builder, parameters: { deal_id: string, objection_type: enum price timing authority need competitor risk, objection_text: string, decision_maker_archetype: string, response_format: enum verbal_script email_response whatsapp_message, include_proof_point: boolean incluir dado ou case, include_risk_reduction_offer: boolean incluir oferta de piloto garantia ou fracionamento } }


Tool 3 -- pre_meeting_objection_mapper

Finalidade: Mapear as objecoes provaveis para um prospect especifico antes
de uma reuniao, com a resposta preparada para cada uma.

json{ name: pre_meeting_objection_mapper, parameters: { deal_id: string, decision_maker_name: string, persona_archetype: string, meeting_type: enum discovery pitch negotiation, deal_context: string resumo do deal e do historico, top_objections_to_prepare: integer padrao 5, include_responses: boolean } }


Tool 4 -- objection_bank_logger

Finalidade: Registrar uma objecao no banco do squad com contexto, resposta
utilizada e resultado, para aprendizado coletivo e identificacao de padroes.

json{ name: objection_bank_logger, parameters: { deal_id: string, objection_type: string, objection_text: string, response_used: string, outcome: enum deal_advanced deal_stalled deal_lost objection_dissolved, deal_stage: string, prospect_sector: string, repeat_in_other_deals: boolean } }


Tool 5 -- systemic_objection_detector

Finalidade: Analisar o banco de objecoes e identificar padroes sistematicos
que sinalizam gap no pitch, no produto ou na segmentacao.

json{ name: systemic_objection_detector, parameters: { analysis_period_days: integer padrao 90, min_recurrence: integer numero minimo de ocorrencias para considerar sistematico padrao 3, group_by: enum type sector deal_stage, alert_revops: boolean acionar RevOps quando padrao identificado } }
