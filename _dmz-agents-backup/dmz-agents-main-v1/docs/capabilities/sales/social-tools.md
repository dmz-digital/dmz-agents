Tool 1 -- engagement_planner

Finalidade: Planejar a sequencia de aquecimento social para um decisor,
definindo acoes, timing e criterios por semana.

json{
  name: engagement_planner,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    persona_archetype: string,
    publication_frequency: enum daily weekly occasional,
    main_topics: array string,
    warm_up_weeks: integer padrao 3,
    platform: enum linkedin instagram twitter other
  }
}


Tool 2 -- connection_note_writer

Finalidade: Redigir a nota personalizada para o pedido de conexao no LinkedIn,
contextualizada com base na persona e no historico de engajamento.

json{
  name: connection_note_writer,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    company_name: string,
    persona_archetype: string,
    engagement_history: string interacoes anteriores se existirem,
    reference_anchor: enum recent_post shared_event mutual_connection content_topic,
    max_chars: integer padrao 280
  }
}


Tool 3 -- inmail_writer

Finalidade: Redigir InMail de abertura que inicia conversa sem parecer pitch,
com assunto especifico e CTA de baixo atrito.

json{
  name: inmail_writer,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    persona_archetype: string,
    opening_reason: string por que voce esta escrevendo para esta pessoa agora,
    value_angle: string ideia perspectiva ou pergunta a oferecer,
    cta_type: enum perspective_share question meeting_curiosity,
    max_words: integer padrao 120
  }
}


Tool 4 -- signal_monitor

Finalidade: Monitorar atividade publica do decisor e alertar o Hunter quando
sinais de janela de entrada ou reativacao forem detectados.

json{
  name: signal_monitor,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    company_name: string,
    monitor_signals: array enum new_post role_change competitor_engagement connection_accepted comment_replied,
    alert_threshold: enum any_signal strong_signal only_critical,
    notify_agent: string handle do agente a notificar padrao hunter_chief
  }
}


Tool 5 -- social_interaction_logger

Finalidade: Registrar cada interacao social no historico do deal com tipo,
data, outcome e proximo passo recomendado.

json{
  name: social_interaction_logger,
  parameters: {
    deal_id: string,
    interaction_type: enum like comment share connection_request inmail_sent dm_sent dm_received connection_accepted,
    decision_maker_name: string,
    interaction_date: string,
    outcome: enum no_response viewed_only engaged replied accepted declined,
    next_action: string proxima acao recomendada,
    next_action_date: string data sugerida para proxima acao
  }
}
