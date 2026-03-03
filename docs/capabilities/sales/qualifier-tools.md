Tool 1 -- bant_qualifier

Finalidade: Conduzir ou documentar a qualificacao estruturada de um lead
usando o framework BANT, atribuindo nota e avaliacao por dimensao.

json{
  name: bant_qualifier,
  description: Qualifica um lead pelo framework BANT com nota e avaliacao por dimensao,
  parameters: {
    deal_id: string,
    lead_name: string,
    lead_role: string,
    company_name: string,
    known_answers: object dimensoes ja cobertas budget authority need timeline,
    missing_dimensions: array enum budget authority need timeline,
    conversation_transcript: string resumo ou transcricao da conversa ate agora,
    suggest_questions: boolean gerar perguntas para gaps nao cobertos
  }
}


Tool 2 -- meddic_qualifier

Finalidade: Conduzir ou documentar a qualificacao estruturada de um deal
enterprise usando o framework MEDDIC completo.

json{
  name: meddic_qualifier,
  description: Qualifica um deal enterprise pelo framework MEDDIC com nota por dimensao,
  parameters: {
    deal_id: string,
    lead_name: string,
    lead_role: string,
    company_name: string,
    known_answers: object dimensoes ja cobertas metrics economic_buyer decision_criteria decision_process pain champion,
    missing_dimensions: array enum metrics economic_buyer decision_criteria decision_process identify_pain champion,
    conversation_transcript: string,
    suggest_questions: boolean
  }
}


Tool 3 -- lead_score_calculator

Finalidade: Calcular o score final do lead com base nas notas por dimensao
do framework usado, gerando classificacao e veredito documentado.

json{
  name: lead_score_calculator,
  description: Calcula score final do lead com classificacao e veredito justificado,
  parameters: {
    deal_id: string,
    framework: enum bant meddic,
    dimension_scores: object notas por dimensao de 1 a 10,
    dimension_weights: object peso de cada dimensao opcional padrao igual,
    override_notes: string observacoes do Hunter Agent que afetam a classificacao
  }
}


Tool 4 -- gap_question_generator

Finalidade: Gerar as perguntas especificas para preencher os gaps de
qualificacao identificados, calibradas para o perfil do lead.

json{
  name: gap_question_generator,
  description: Gera perguntas de qualificacao para gaps nao cobertos, calibradas ao perfil do lead,
  parameters: {
    deal_id: string,
    framework: enum bant meddic,
    missing_dimensions: array string dimensoes a cobrir,
    lead_profile: string descricao do cargo e perfil do interlocutor,
    conversation_tone: enum formal consultive direct,
    questions_per_dimension: integer padrao 2
  }
}


Tool 5 -- qualification_handoff_builder

Finalidade: Gerar o briefing completo de handoff com resultado da qualificacao,
dores confirmadas, objecoes levantadas e recomendacao de proximo passo.

json{
  name: qualification_handoff_builder,
  description: Gera briefing de handoff com score, veredito, dores confirmadas e recomendacao de acao,
  parameters: {
    deal_id: string,
    framework_used: enum bant meddic,
    final_score: number,
    classification: enum qualified qualified_with_caveats not_ready_now discard,
    confirmed_pains: array string,
    raised_objections: array string,
    identified_gaps: array string,
    recommended_action: enum schedule_meeting nurturing discard escalate_to_cra,
    next_step_detail: string descricao especifica da proxima acao,
    recipient_agent: string handle do agente receptor padrao hunter_chief
  }
}