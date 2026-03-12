Tool 1 -- prospect_profiler

Finalidade: Solicitar ao subagente Company Scout a construcao de um perfil
estruturado de uma empresa-alvo com base em fontes publicas.

json{
  "name": "prospect_profiler",
  "description": "Aciona o Company Scout para construir o perfil completo de uma empresa-alvo com dados publicos verificaveis.",
  "parameters": {
    "company_name": "string -- nome da empresa-alvo",
    "company_website": "string -- URL do site institucional (opcional)",
    "linkedin_url": "string -- URL do perfil LinkedIn da empresa (opcional)",
    "research_scope": "array[enum: business_model | revenue_estimate | headcount | recent_news | funding_history | tech_stack | geographic_presence | strategic_moment] -- dimensoes a pesquisar",
    "deal_id": "string -- ID do deal associado no pipeline_tracker",
    "urgency": "enum: low | medium | high | critical",
    "additional_context": "string -- contexto extra que direcione a pesquisa"
  }
}


Tool 2 -- decision_maker_mapper

Finalidade: Solicitar ao subagente Contact Mapper o mapeamento do organograma
de decisao de um prospect, identificando decisores, influenciadores e bloqueadores.

json{
  "name": "decision_maker_mapper",
  "description": "Aciona o Contact Mapper para mapear o organograma de decisao de um prospect: Economic Buyer, Champion, influenciadores e bloqueadores.",
  "parameters": {
    "company_name": "string -- nome da empresa-alvo",
    "target_roles": "array[string] -- cargos-alvo a mapear (ex: CFO, Head of Legal, CTO)",
    "known_contacts": "array[string] -- contatos ja identificados (nomes ou LinkedIn URLs)",
    "deal_id": "string -- ID do deal associado",
    "depth": "enum: surface | standard | deep -- nivel de profundidade da pesquisa",
    "urgency": "enum: low | medium | high | critical"
  }
}


Tool 3 -- icp_scorer

Finalidade: Avaliar o alinhamento de um prospect com o ICP definido e
retornar um score justificado com recomendacao de priorizacao.

json{
  "name": "icp_scorer",
  "description": "Avalia o fit de um prospect com o Ideal Customer Profile, atribui score 1-10 e retorna justificativa com recomendacao de priorizacao.",
  "parameters": {
    "deal_id": "string -- ID do deal a ser avaliado",
    "company_profile_summary": "string -- resumo do perfil da empresa (pode vir do prospect_profiler)",
    "icp_criteria": "object -- criterios do ICP a avaliar: { sector, size, revenue_range, geography, pain_points, budget_signal, decision_maker_access }",
    "override_notes": "string -- observacoes do CRA que devem influenciar a avaliacao"
  }
}


Tool 4 -- market_signal_monitor

Finalidade: Configurar monitoramento continuo de sinais relevantes para
prospects prioritarios, ativando alertas quando gatilhos de compra sao detectados.

json{
  "name": "market_signal_monitor",
  "description": "Configura ou consulta o monitoramento de sinais de mercado para um conjunto de prospects, retornando alertas de gatilhos de compra identificados.",
  "parameters": {
    "action": "enum: setup | check | update | disable",
    "deal_ids": "array[string] -- IDs dos deals a monitorar",
    "signal_types": "array[enum: funding_round | executive_hire | product_launch | expansion_news | public_pain_statement | rfp_published | competitor_movement | financial_report] -- tipos de sinal a monitorar",
    "alert_threshold": "enum: any | medium | high -- sensibilidade do alerta",
    "notify_agents": "array[string] -- handles dos agentes a notificar quando sinal for detectado (ex: cra, reach_chief)"
  }
}


Tool 5 -- dossier_builder

Finalidade: Compilar toda a inteligencia coletada sobre um prospect em um
dossie estruturado, formatado e pronto para ser consumido pelos demais agentes.

json{
  "name": "dossier_builder",
  "description": "Compila inteligencia de multiplas fontes (perfil da empresa, decisores, ICP score, sinais de mercado, competitivo) em um dossie padronizado e acionavel.",
  "parameters": {
    "deal_id": "string -- ID do deal para o qual o dossie sera gerado",
    "include_sections": "array[enum: company_profile | decision_makers | icp_score | buy_triggers | competitive_intel | approach_recommendation] -- secoes a incluir",
    "format": "enum: full | executive_summary | pitch_brief -- nivel de detalhe",
    "recipient_agent": "string -- handle do agente que vai receber e usar o dossie"
  }
}
