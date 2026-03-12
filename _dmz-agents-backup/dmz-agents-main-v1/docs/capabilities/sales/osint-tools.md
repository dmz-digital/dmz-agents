Tool 1 -- company_data_collector

Finalidade: Coletar dados corporativos basicos de uma empresa-alvo em fontes
publicas abertas: CNPJ, socios, sede, porte estimado, historico societario.

json{
  name: company_data_collector,
  description: Coleta dados corporativos publicos de uma empresa em fontes abertas,
  parameters: {
    company_name: string -- nome da empresa-alvo,
    company_cnpj: string -- CNPJ se conhecido (opcional),
    country: enum br us other -- pais de registro da empresa,
    data_scope: array enum corporate_registration shareholders founding_date address size_estimate financials,
    deal_id: string -- ID do deal associado
  }
}


Tool 2 -- decision_maker_tracker

Finalidade: Localizar e coletar dados publicos de um decisor especifico:
LinkedIn, historico profissional, publicacoes recentes e atividade online.

json{
  name: decision_maker_tracker,
  description: Coleta dados publicos de um decisor-alvo em LinkedIn e fontes abertas,
  parameters: {
    full_name: string -- nome completo do decisor,
    company_name: string -- empresa atual,
    target_role: string -- cargo a verificar (ex: CFO, Head of Legal),
    linkedin_url: string -- URL do perfil se conhecido (opcional),
    data_scope: array enum current_role career_history recent_posts groups_communities contact_signals,
    deal_id: string -- ID do deal associado
  }
}


Tool 3 -- market_signal_crawler

Finalidade: Rastrear sinais recentes de mercado sobre um prospect ou setor,
identificando gatilhos de compra em fontes publicas.

json{
  name: market_signal_crawler,
  description: Rastreia sinais de mercado e gatilhos de compra em fontes publicas abertas,
  parameters: {
    target_company: string -- empresa a monitorar,
    signal_types: array enum funding_round executive_hire product_launch expansion_news regulatory_change public_pain_statement partnership awards,
    lookback_days: integer -- janela de busca em dias (ex: 90),
    sources: array enum google_news linkedin crunchbase valor_economico infomoney seu_setor all,
    deal_id: string -- ID do deal associado
  }
}


Tool 4 -- competitive_footprint_scanner

Finalidade: Identificar mencoes a concorrentes pelo prospect e rastrear
avaliacoes e percepcoes publicas sobre solucoes concorrentes.

json{
  name: competitive_footprint_scanner,
  description: Escaneia mencoes a concorrentes pelo prospect e coleta avaliacoes publicas sobre solucoes do mercado,
  parameters: {
    competitor_names: array string -- lista de concorrentes a rastrear,
    prospect_company: string -- empresa prospect para cruzar mencoes,
    sources: array enum g2 capterra linkedin_posts google_reviews app_stores press,
    deal_id: string -- ID do deal associado
  }
}


Tool 5 -- osint_report_packager

Finalidade: Compilar toda a inteligencia bruta coletada em um pacote estruturado
no formato padrao do squad, pronto para ser entregue ao Intel Agent.

json{
  name: osint_report_packager,
  description: Empacota toda inteligencia bruta coletada no template padrao do squad para entrega ao Intel Agent,
  parameters: {
    deal_id: string -- ID do deal,
    include_sections: array enum corporate_data decision_makers market_signals competitive_intel digital_presence network_map,
    confidence_scoring: boolean -- incluir nivel de confianca por dado,
    flag_unverified: boolean -- sinalizar explicitamente dados nao verificados,
    recipient: string -- handle do agente receptor (padrao: intel_chief)
  }
}
