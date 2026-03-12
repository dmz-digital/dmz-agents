Tool 1 -- investor_qualifier_dispatcher

Finalidade: Acionar o Investor Profiler para pesquisar e qualificar um fundo
ou angel, avaliando fit de tese, cheque medio e valor alem do capital.

json{
  "name": "investor_qualifier_dispatcher",
  "description": "Aciona o Investor Profiler para qualificar um investidor-alvo por fit de tese, cheque medio, portfolio e valor estrategico.",
  "parameters": {
    "investor_name": "string -- nome do fundo, angel ou CVC",
    "investor_type": "enum: vc_early | vc_growth | cvc | angel | family_office | other",
    "research_scope": "array[enum: thesis | portfolio | check_size | decision_makers | recent_deals | strategic_value | contact_info]",
    "company_stage": "enum: pre_seed | seed | series_a | series_b_plus",
    "company_sector": "string -- setor da empresa captando",
    "deal_id": "string -- ID do deal associado no pipeline",
    "urgency": "enum: low | medium | high | critical"
  }
}


Tool 2 -- dataroom_manager

Finalidade: Gerenciar o data room: adicionar documentos, controlar versoes,
conceder acesso por investidor e consultar o log de visualizacoes.

json{
  "name": "dataroom_manager",
  "description": "Gerencia o data room da captacao: inclusao de documentos, controle de versoes, concessao de acesso e rastreamento de visualizacoes.",
  "parameters": {
    "action": "enum: add_document | update_document | grant_access | revoke_access | get_access_log | list_documents | check_completeness",
    "deal_id": "string -- ID do processo de captacao",
    "investor_name": "string -- nome do investidor (para acoes de acesso)",
    "document_category": "enum: company_overview | product | market | traction | financial | legal | team | use_of_funds",
    "document_name": "string -- nome do documento",
    "document_version": "string -- versao do documento (ex: v1, v2_updated)",
    "nda_signed": "boolean -- NDA ja assinado pelo investidor?",
    "access_level": "enum: teaser_only | standard | full_dd"
  }
}


Tool 3 -- investor_update_builder

Finalidade: Gerar o rascunho do investor update mensal com base nas metricas
atuais do negocio, para revisao e envio pelo fundador.

json{
  "name": "investor_update_builder",
  "description": "Gera o rascunho do investor update mensal com metricas, highlights, desafios e pedidos de ajuda para revisao do fundador.",
  "parameters": {
    "period": "string -- mes e ano de referencia (ex: Fevereiro 2026)",
    "metrics": "object -- metricas do periodo: { mrr, arr, active_clients, churn_rate, cac, ltv, runway_months }",
    "what_went_well": "array[string] -- conquistas e destaques positivos do mes",
    "what_didnt_go_well": "array[string] -- desafios e resultados abaixo do esperado",
    "focus_next_month": "array[string] -- prioridades para o proximo mes",
    "help_needed": "array[string] -- onde a rede dos investidores pode ajudar",
    "recipients": "array[string] -- nomes ou handles dos investidores destinatarios"
  }
}


Tool 4 -- dd_readiness_checker

Finalidade: Avaliar a completude e a qualidade do data room antes de iniciar
um processo formal de due diligence, identificando lacunas criticas.

json{
  "name": "dd_readiness_checker",
  "description": "Avalia a prontidao do data room para due diligence, identificando documentos ausentes, desatualizados ou insuficientes por categoria.",
  "parameters": {
    "deal_id": "string -- ID do processo de captacao",
    "investor_profile": "enum: vc_early | vc_growth | cvc | angel | family_office",
    "dd_depth": "enum: light | standard | deep",
    "focus_areas": "array[enum: financial | legal | product | market | team | all]"
  }
}


Tool 5 -- term_sheet_analyzer

Finalidade: Analisar os termos principais de um term sheet recebido,
destacando clausulas criticas e seu impacto para o fundador.

json{
  "name": "term_sheet_analyzer",
  "description": "Analisa um term sheet recebido, identificando clausulas criticas, impactos para o fundador e pontos de negociacao prioritarios.",
  "parameters": {
    "deal_id": "string -- ID do deal de investimento",
    "investor_name": "string -- nome do investidor que enviou o term sheet",
    "investment_amount": "string -- valor do investimento proposto",
    "pre_money_valuation": "string -- valuation pre-money proposto",
    "key_terms_raw": "string -- texto ou resumo das principais clausulas do term sheet",
    "flag_clauses": "array[enum: liquidation_preference | anti_dilution | pro_rata | drag_along | board_seats | veto_rights | information_rights]",
    "output_format": "enum: summary | detailed | negotiation_brief"
  }
}