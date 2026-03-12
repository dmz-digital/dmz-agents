Tool 1 -- behavioral_signal_collector

Finalidade: Coletar sinais comportamentais publicos de um decisor
em multiplas fontes para construir o perfil psicografico.

json{
  name: behavioral_signal_collector,
  parameters: {
    decision_maker_name: string,
    linkedin_url: string opcional,
    company_name: string,
    signal_sources: array linkedin_posts interviews podcasts events career_history,
    lookback_days: integer padrao 180,
    deal_id: string
  }
}

Tool 2 -- decision_style_profiler

Finalidade: Classificar o decisor em arquetipo de decisao com justificativa
baseada em evidencia comportamental.

json{
  name: decision_style_profiler,
  parameters: {
    deal_id: string,
    behavioral_signals: string resumo dos sinais coletados,
    archetypes_to_evaluate: array analytical visionary pragmatic political guardian,
    confidence_threshold: enum low medium high
  }
}

Tool 3 -- language_analyzer

Finalidade: Analisar vocabulario e estilo de comunicacao do decisor
para gerar guia de linguagem para o squad.

json{
  name: language_analyzer,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    content_samples: string amostras de publicacoes e falas publicas,
    analysis_dimensions: array vocabulary_type communication_style formality_level preferred_format
  }
}

Tool 4 -- persona_profile_builder

Finalidade: Compilar todas as dimensoes analisadas em perfil de persona
completo, pronto para ser consumido pelo squad.

json{
  name: persona_profile_builder,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    decision_style: string arquetipo identificado,
    primary_motivations: array string,
    perceived_fears: array string,
    credibility_references: array string,
    buying_profile: enum early_adopter pragmatic skeptic conservative,
    include_squad_recommendations: boolean,
    recipient_agents: array string
  }
}

Tool 5 -- persona_updater

Finalidade: Atualizar persona existente com novos sinais comportamentais
coletados durante interacoes reais do squad com o decisor.

json{
  name: persona_updater,
  parameters: {
    deal_id: string,
    decision_maker_name: string,
    new_signals: array string,
    signal_source: enum hunter_interaction closer_negotiation meeting_observation email_response,
    dimensions_to_update: array enum decision_style motivations fears language buying_profile all,
    reported_by: string handle do agente que reportou
  }
}
