Tool 1 -- cold_email_writer

Finalidade: Escrever e-mail de primeiro contato personalizado.

json{ name: cold_email_writer, parameters: { deal_id: string, decision_maker_name: string, persona_archetype: enum analytical visionary pragmatic political guardian, opening_context: string, value_proposition: string, proof_point: string, cta_type: enum curiosity_question meeting_request content_offer, max_words: integer padrao 150 } }

Tool 2 -- sequence_builder

Finalidade: Construir sequencia de e-mails com progressao de argumento.

json{ name: sequence_builder, parameters: { deal_id: string, decision_maker_name: string, persona_archetype: string, touchpoints: integer 3 a 6, cadence_days: array integer, value_proposition: string, proof_points: array string, include_breakup: boolean } }

Tool 3 -- situational_email_writer

Finalidade: Escrever e-mails de situacoes especificas do funil.

json{ name: situational_email_writer, parameters: { deal_id: string, situation_type: enum post_meeting cold_reactivation material_delivery objection_response breakup, decision_maker_name: string, context: string, persona_archetype: string, desired_outcome: string } }

Tool 4 -- email_diagnostic

Finalidade: Diagnosticar e-mail com baixa resposta e gerar versao melhorada.

json{ name: email_diagnostic, parameters: { deal_id: string, original_subject: string, original_body: string, touchpoint_number: integer, response_rate: enum unknown zero low, generate_ab_variants: boolean } }

Tool 5 -- subject_line_generator

Finalidade: Gerar variantes de assunto com hipoteses de abertura para teste.

json{ name: subject_line_generator, parameters: { deal_id: string, email_context: string, decision_maker_name: string, company_name: string, persona_archetype: string, approaches: array question data_point company_reference pain_trigger, variants_count: integer padrao 5 } }
