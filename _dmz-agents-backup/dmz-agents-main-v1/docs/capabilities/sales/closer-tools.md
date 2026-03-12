Tool 1 -- objection_handler_dispatcher

Finalidade: Acionar o Objection Handler para classificar uma objecao ativa
e gerar a resposta estruturada mais adequada para neutraliza-la.

json{
  "name": "objection_handler_dispatcher",
  "description": "Aciona o Objection Handler para classificar e preparar resposta estruturada para uma objecao ativa no deal.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "objection_text": "string -- a objecao exata como foi expressa pelo prospect",
    "objection_context": "string -- em que momento e por quem a objecao foi levantada",
    "objection_type": "enum: price | timing | competitor | technical | internal | trust | unknown",
    "previous_responses_tried": "array[string] -- respostas ja tentadas para esta objecao",
    "decision_maker_profile": "string -- perfil do decisor que levantou a objecao",
    "deal_stage": "enum: post_pitch | negotiation | pre_close | contract_review"
  }
}


Tool 2 -- negotiation_strategy_builder

Finalidade: Acionar o Negotiation Tactician para montar a estrategia completa
de negociacao antes de uma conversa critica de fechamento.

json{
  "name": "negotiation_strategy_builder",
  "description": "Aciona o Negotiation Tactician para construir a estrategia de negociacao com ancora, concessoes planejadas, BATNA e linha de corte.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "current_proposal_value": "string -- valor da proposta atual em discussao",
    "desired_outcome": "string -- resultado ideal para nos neste fechamento",
    "known_constraints_prospect": "string -- restricoes conhecidas do prospect (budget, prazo, escopo)",
    "competitor_presence": "boolean -- ha concorrente ativo neste deal?",
    "deal_urgency_for_us": "enum: low | medium | high | critical",
    "concessions_available": "array[string] -- concessoes que podemos oferecer",
    "non_negotiables": "array[string] -- pontos que nao podem ser cedidos"
  }
}


Tool 3 -- closing_action_planner

Finalidade: Gerar o plano tatico de fechamento com proximos passos concretos,
responsaveis e prazos para cada acao necessaria ate a assinatura.

json{
  "name": "closing_action_planner",
  "description": "Gera o plano de fechamento com acoes concretas, responsaveis e datas definidas ate a assinatura do contrato.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "current_blockers": "array[string] -- o que esta impedindo o fechamento agora",
    "identified_urgency_triggers": "array[string] -- gatilhos de urgencia legitimamente identificados",
    "champion_identified": "boolean -- ha um Champion interno mapeado?",
    "champion_name": "string -- nome do Champion interno (se identificado)",
    "estimated_close_date": "string -- data estimada de fechamento (ISO 8601)",
    "close_technique": "enum: assumptive | summary | urgency | concession | champion | to_be_defined"
  }
}


Tool 4 -- deal_risk_alert

Finalidade: Registrar e escalar para o CRA um alerta de risco de perda de deal
com diagnostico claro e opcoes de recuperacao.

json{
  "name": "deal_risk_alert",
  "description": "Registra alerta de risco de perda de deal e escala para o CRA com diagnostico e opcoes de recuperacao.",
  "parameters": {
    "deal_id": "string -- ID do deal em risco",
    "risk_level": "enum: low | medium | high | critical",
    "risk_signals": "array[string] -- sinais que indicam o risco (ex: prospect sem resposta ha 10 dias)",
    "probable_cause": "string -- hipotese mais provavel sobre o motivo do risco",
    "recovery_options": "array[string] -- opcoes de recuperacao identificadas",
    "recommended_action": "string -- acao recomendada imediata",
    "notify_agents": "array[string] -- handles dos agentes a notificar (ex: cra, intel_chief)"
  }
}


Tool 5 -- deal_close_logger

Finalidade: Registrar o fechamento de um deal com os termos finais acordados,
o historico de objecoes enfrentadas e o debrief para o Revenue Ops Agent.

json{
  "name": "deal_close_logger",
  "description": "Registra o fechamento do deal com termos finais, historico de negociacao e debrief completo para aprendizado do squad.",
  "parameters": {
    "deal_id": "string -- ID do deal",
    "outcome": "enum: won | lost | no_decision",
    "final_terms": "object -- termos finais acordados: { value, scope, payment_terms, start_date }",
    "objections_faced": "array[object] -- lista de objecoes enfrentadas: { objection, type, response_used, outcome }",
    "negotiation_summary": "string -- resumo das concessoes feitas e recebidas",
    "win_loss_reason": "string -- motivo principal do fechamento positivo ou negativo",
    "lessons_learned": "string -- aprendizados para os proximos deals",
    "handoff_to": "enum: revenue_ops | ir_chief | none -- agente que recebe o debrief"
  }
}
