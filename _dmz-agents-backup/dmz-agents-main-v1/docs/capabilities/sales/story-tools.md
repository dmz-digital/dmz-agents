Tool 1 -- narrative_arc_builder

Finalidade: Construir o arco narrativo completo do pitch com fases, tom emocional
e gatilho por fase, adaptado ao tipo de audiencia.

json{ name: narrative_arc_builder, parameters: { deal_id: string, pitch_type: enum investor_pitch enterprise_deck commercial_proposal, audience_archetype: enum analytical visionary pragmatic political guardian, deal_context: string resumo do contexto do deal e do prospect, financial_data_summary: string resumo dos numeros do Financial Modeler, desired_emotional_journey: string de onde o decisor parte e onde deve chegar } }


Tool 2 -- opening_script_writer

Finalidade: Escrever o script dos primeiros 60 segundos do pitch com o gancho
correto para o perfil do decisor.

json{ name: opening_script_writer, parameters: { deal_id: string, formula: enum discomfort_question surprising_data short_client_story contrarian_statement, decision_maker_name: string, audience_archetype: string, context_anchor: string o dado ou historia que ancora o gancho, max_words: integer padrao 120 } }


Tool 3 -- closing_script_writer

Finalidade: Escrever o script de fechamento que cria o momento de decisao
e ancora o proximo passo com clareza.

json{ name: closing_script_writer, parameters: { deal_id: string, key_transformation_promised: string o que muda para o decisor com a solucao, next_step_action: string o que acontece depois dessa reuniao, urgency_anchor: string por que agir agora sem criar urgencia artificial, audience_archetype: string, max_words: integer padrao 150 } }


Tool 4 -- client_story_builder

Finalidade: Transformar um resultado de cliente em historia narrativa com
personagem, problema e resolucao, calibrada ao prospect atual.

json{ name: client_story_builder, parameters: { deal_id: string, reference_client_profile: string descricao do cliente de referencia, problem_before: string qual era a situacao antes, solution_adopted: string o que foi implementado, result_after: string qual foi o resultado com dados, prospect_analogy: string por que esse case e relevante para o prospect atual, format: enum slide_version email_version live_pitch_version } }


Tool 5 -- deck_narrative_mapper

Finalidade: Produzir o mapa narrativo para o Deck Designer com tom emocional,
gatilho e fase narrativa de cada secao do deck.

json{ name: deck_narrative_mapper, parameters: { deal_id: string, deck_type: enum investor_pitch enterprise_deck commercial_proposal, narrative_arc: string output do narrative_arc_builder, slides_count: integer, flag_transition_slides: boolean sinalizar slides de transicao de fase, output_format: enum section_map slide_by_slide } }
