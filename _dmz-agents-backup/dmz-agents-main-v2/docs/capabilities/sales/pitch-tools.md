Tool 1 -- deck_builder_dispatcher

Finalidade: Acionar o Deck Builder para estruturar e produzir um deck completo
com base no briefing do prospect e no tipo de apresentacao necessaria.

json{
  "name": "deck_builder_dispatcher",
  "description": "Aciona o Deck Builder para criar estrutura e conteudo de um deck de pitch, enterprise ou proposta comercial.",
  "parameters": {
    "deal_id": "string -- ID do deal no pipeline",
    "deck_type": "enum: investor_pitch | enterprise_deck | commercial_proposal | teaser",
    "audience_profile": "string -- descricao do publico: cargo, empresa, contexto da reuniao",
    "confirmed_pains": "array[string] -- dores confirmadas no briefing do Hunter",
    "raised_objections": "array[string] -- objecoes ja levantadas pelo prospect",
    "key_differentiators": "array[string] -- diferenciais a enfatizar para este publico",
    "slide_count_target": "integer -- numero alvo de slides",
    "tone": "enum: visionary | consultative | data_driven | challenger",
    "version_label": "string -- identificador da versao (ex: v1, v2_pos_reuniao)",
    "deadline": "string -- prazo para entrega (ISO 8601)"
  }
}


Tool 2 -- financial_model_dispatcher

Finalidade: Acionar o Financial Modeler para construir o modelo financeiro
de suporte ao pitch com projecoes, unit economics e ROI especifico por prospect.

json{
  "name": "financial_model_dispatcher",
  "description": "Aciona o Financial Modeler para construir projecoes, unit economics e ROI especifico para o prospect.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "model_scope": "array[enum: revenue_projection | unit_economics | prospect_roi | scenario_analysis | cap_table]",
    "projection_years": "integer (1-5) -- horizonte de projecao",
    "include_scenarios": "boolean -- gera cenarios conservador/base/otimista",
    "prospect_context": "string -- dados do prospect para ROI personalizado",
    "known_metrics": "object -- metricas conhecidas: { arr, mrr, churn, cac, ltv }",
    "output_format": "enum: slides | spreadsheet | both"
  }
}


Tool 3 -- pitch_guide_builder

Finalidade: Gerar o guia completo do apresentador para uma reuniao especifica,
com roteiro por slide, antecipacao de perguntas e sinais de compra a monitorar.

json{
  "name": "pitch_guide_builder",
  "description": "Gera guia do apresentador com roteiro por slide, respostas para objecoes previstas e instrucoes de conduta na reuniao.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "deck_version": "string -- versao do deck a ser apresentado",
    "meeting_duration_minutes": "integer -- duracao total da reuniao",
    "audience_roles": "array[string] -- cargos dos participantes",
    "anticipated_objections": "array[string] -- objecoes previstas",
    "critical_slides": "array[integer] -- slides que merecem atencao especial",
    "demo_included": "boolean -- se inclui demonstracao do produto"
  }
}


Tool 4 -- deck_version_manager

Finalidade: Registrar, consultar e controlar versoes de decks produzidos,
garantindo rastreabilidade de qual material foi usado em cada reuniao.

json{
  "name": "deck_version_manager",
  "description": "Gerencia versionamento de decks, registrando historico de alteracoes e uso em reunioes.",
  "parameters": {
    "action": "enum: register | update | get_history | set_active | archive",
    "deal_id": "string -- ID do deal",
    "version_label": "string -- identificador da versao",
    "deck_type": "enum: investor_pitch | enterprise_deck | commercial_proposal | teaser",
    "changes_summary": "string -- resumo das alteracoes nesta versao",
    "used_in_meeting": "string -- ID ou descricao da reuniao onde foi apresentado",
    "feedback_received": "string -- feedback recebido apos o uso"
  }
}


Tool 5 -- pitch_debrief_logger

Finalidade: Registrar os aprendizados de cada pitch realizado para alimentar
a iteracao do deck e o aprendizado continuo do squad.

json{
  "name": "pitch_debrief_logger",
  "description": "Registra debrief pos-pitch com aprendizados, ajustes necessarios e insumos para iteracao.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "deck_version": "string -- versao apresentada",
    "meeting_outcome": "enum: positive | neutral | negative | deal_advanced | deal_lost",
    "slides_that_resonated": "array[integer] -- slides com engajamento positivo",
    "slides_that_confused": "array[integer] -- slides que geraram duvidas ou resistencia",
    "objections_raised": "array[string] -- objecoes nao previstas levantadas",
    "questions_asked": "array[string] -- perguntas feitas pelo publico",
    "recommended_changes": "string -- ajustes recomendados para proxima versao",
    "priority": "enum: low | medium | high"
  }
}
