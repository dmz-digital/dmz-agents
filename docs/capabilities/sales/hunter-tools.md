Tool 1 -- outreach_sequence_builder

Finalidade: Acionar o Outreach Writer para criar uma sequencia de contato
personalizada para um decisor especifico, com base no dossie do Intel Agent.

json{
  "name": "outreach_sequence_builder",
  "description": "Gera uma sequencia de outreach multicanal personalizada para um decisor com base no dossie de inteligencia do prospect.",
  "parameters": {
    "deal_id": "string -- ID do deal no pipeline",
    "decision_maker_name": "string -- nome do decisor-alvo",
    "decision_maker_role": "string -- cargo do decisor",
    "primary_channel": "enum: linkedin | email | phone | referral -- canal de entrada prioritario",
    "pain_points": "array[string] -- dores identificadas no dossie a explorar",
    "buy_trigger": "string -- gatilho de compra mais recente identificado",
    "touchpoints": "integer (2-6) -- numero de touchpoints na sequencia",
    "tone": "enum: formal | consultative | direct | challenger -- tom da abordagem",
    "value_proposition": "string -- proposta de valor central a comunicar"
  }
}


Tool 2 -- lead_qualifier_dispatcher

Finalidade: Acionar o Lead Qualifier para conduzir ou documentar a qualificacao
estruturada de um lead respondente, usando BANT ou MEDDIC.

json{
  "name": "lead_qualifier_dispatcher",
  "description": "Aciona o Lead Qualifier para estruturar a qualificacao de um lead com base em BANT ou MEDDIC e gerar lead score justificado.",
  "parameters": {
    "deal_id": "string -- ID do deal no pipeline",
    "framework": "enum: bant | meddic -- framework de qualificacao a usar",
    "interaction_history": "string -- resumo das interacoes ja realizadas com o lead",
    "known_answers": "object -- respostas ja coletadas nas dimensoes do framework",
    "missing_dimensions": "array[string] -- dimensoes ainda nao cobertas que precisam ser investigadas",
    "deal_complexity": "enum: simple | complex | enterprise"
  }
}


Tool 3 -- contact_logger

Finalidade: Registrar cada interacao com um prospect no pipeline_tracker,
mantendo historico completo e rastreavel de todos os touchpoints.

json{
  "name": "contact_logger",
  "description": "Registra uma interacao de outreach ou qualificacao no historico do deal, atualizando status e proxima acao.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "touchpoint_number": "integer -- numero do touchpoint na sequencia",
    "channel": "enum: linkedin | email | phone | meeting | referral | other",
    "direction": "enum: outbound | inbound -- quem iniciou o contato",
    "outcome": "enum: no_response | opened | replied_positive | replied_neutral | replied_negative | meeting_booked | unsubscribed",
    "summary": "string -- resumo do conteudo ou da resposta recebida",
    "next_action": "string -- proxima acao definida com base no outcome",
    "next_action_date": "string -- data prevista para a proxima acao (ISO 8601)"
  }
}


Tool 4 -- handoff_dispatcher

Finalidade: Transferir um lead qualificado para o agente responsavel pela
proxima etapa do funil, com briefing completo e estruturado.

json{
  "name": "handoff_dispatcher",
  "description": "Executa o handoff de um lead qualificado para o proximo agente do funil, entregando briefing completo com historico, qualificacao e recomendacoes.",
  "parameters": {
    "deal_id": "string -- ID do deal sendo transferido",
    "destination_agent": "enum: meet_chief | pitch_chief | ir_chief | close_chief | nurturing -- agente receptor",
    "lead_score": "integer (1-10) -- score final atribuido na qualificacao",
    "qualification_summary": "object -- resultado do BANT ou MEDDIC por dimensao",
    "interaction_history_summary": "string -- resumo cronologico dos touchpoints",
    "confirmed_pains": "array[string] -- dores confirmadas na conversa",
    "raised_objections": "array[string] -- objecoes ja levantadas pelo prospect",
    "approach_recommendation": "string -- recomendacao de como o proximo agente deve abordar",
    "urgency": "enum: low | medium | high | critical"
  }
}


Tool 5 -- nurturing_scheduler

Finalidade: Configurar ciclos de nurturing para leads que nao estao prontos
para avancar agora, definindo cadencia de recontato e gatilhos de reativacao.

json{
  "name": "nurturing_scheduler",
  "description": "Agenda ciclos de nurturing para leads nao prontos, definindo cadencia, mensagens e criterios de reativacao automatica.",
  "parameters": {
    "deal_id": "string -- ID do deal a entrar em nurturing",
    "reason_not_ready": "enum: no_budget_now | wrong_timing | no_urgency | evaluating_competitors | internal_blocker | other",
    "recontact_in_days": "integer -- prazo em dias para o proximo contato",
    "nurturing_tone": "enum: value_sharing | check_in | trigger_based",
    "reactivation_triggers": "array[enum: funding_round | executive_hire | product_launch | quarter_start | competitor_news] -- eventos que devem antecipar o recontato",
    "max_nurturing_cycles": "integer -- numero maximo de ciclos antes de arquivar definitivamente"
  }
}
