Tool 1 -- deal_dispatcher

Finalidade: Acionar um agente Nível 1 com o contexto completo de uma oportunidade
para execução de uma etapa específica do funil de vendas.

json{
  "name": "deal_dispatcher",
  "description": "Despacha uma oportunidade para um agente Nível 1 do squad de vendas com contexto estruturado do prospect e instrução clara de execução.",
  "parameters": {
    "agent_handle": "string -- handle do agente Nível 1 (ex: intel_chief, pitch_chief, close_chief)",
    "deal_id": "string -- identificador único do deal",
    "prospect_name": "string -- nome da empresa ou do prospect individual",
    "decision_maker": "string -- nome e cargo do decisor identificado",
    "funnel_stage": "enum: intel | qualificacao | outreach | reuniao | pitch | objecoes | contrato",
    "task_title": "string -- título curto da tarefa a executar",
    "context": "string -- histórico do deal, dores identificadas, interações anteriores",
    "instruction": "string -- o que exatamente deve ser feito nesta etapa",
    "expected_output": "string -- formato e conteúdo esperado de retorno",
    "deal_size_estimate": "string -- valor estimado do deal em BRL ou USD",
    "priority": "enum: low | medium | high | critical",
    "deadline": "string -- prazo esperado para conclusão da etapa (ISO 8601)",
    "depends_on": "array[string] -- IDs de tarefas que precisam ser concluídas antes"
  }
}


Tool 2 -- pipeline_tracker

Finalidade: Registrar, atualizar e consultar o estado de todos os deals ativos
no pipeline, permitindo visão consolidada do funil em tempo real.

json{
  "name": "pipeline_tracker",
  "description": "Gerencia o estado de cada deal ativo no pipeline de vendas - criação, atualização de etapa, registro de bloqueios e fechamento.",
  "parameters": {
    "action": "enum: create_deal | advance_stage | update_status | add_note | close_deal | get_pipeline",
    "deal_id": "string -- identificador único do deal",
    "prospect_name": "string -- nome do prospect (obrigatório em create_deal)",
    "current_stage": "enum: intel | qualificacao | outreach | reuniao | pitch | objecoes | contrato | fechado | perdido",
    "status": "enum: on_track | at_risk | blocked | won | lost",
    "icp_score": "integer (1-10) -- score de fit com o ICP",
    "deal_size_estimate": "string -- valor estimado atualizado",
    "close_probability": "integer (0-100) -- probabilidade estimada de fechamento (%)",
    "note": "string -- observação, aprendizado ou atualização relevante",
    "blocker_description": "string -- descrição do bloqueio, se houver",
    "next_action": "string -- próxima ação concreta definida para o deal",
    "next_action_owner": "string -- handle do agente responsável pela próxima ação",
    "next_action_deadline": "string -- prazo para a próxima ação (ISO 8601)"
  }
}


Tool 3 -- squad_briefing

Finalidade: Gerar e distribuir um briefing consolidado do pipeline para todos os
agentes Nível 1 ao início de cada ciclo de trabalho (diário ou semanal).

json{
  "name": "squad_briefing",
  "description": "Gera um briefing executivo do estado atual do pipeline e distribui prioridades e foco para cada agente Nível 1 do squad.",
  "parameters": {
    "briefing_type": "enum: daily | weekly | deal_specific | sprint_kickoff",
    "deals_in_scope": "array[string] -- IDs dos deals a incluir no briefing (vazio = todos os ativos)",
    "focus_agents": "array[string] -- handles dos agentes que devem receber o briefing (vazio = todos)",
    "highlights": "string -- observações críticas do CRA para o squad neste ciclo",
    "kpi_snapshot": "boolean -- se true, inclui snapshot dos KPIs do funil no briefing"
  }
}


Tool 4 -- deal_intelligence_request

Finalidade: Solicitar ao Intel Chief pesquisa aprofundada sobre um prospect,
mercado-alvo ou decisor antes de iniciar o ciclo de vendas.

json{
  "name": "deal_intelligence_request",
  "description": "Aciona o Intel Chief para coletar e estruturar inteligência sobre um prospect específico, setor ou decisor antes de iniciar abordagem.",
  "parameters": {
    "target_company": "string -- nome da empresa-alvo",
    "target_contact": "string -- nome do contato ou cargo a mapear (opcional)",
    "intel_scope": "array[enum: company_profile | decision_makers | pain_points | competitors | recent_news | financial_signals | icp_fit] -- escopo da pesquisa",
    "urgency": "enum: low | medium | high | critical",
    "deal_id": "string -- ID do deal associado (se já criado no pipeline)",
    "additional_context": "string -- contexto extra que possa direcionar a pesquisa"
  }
}


Tool 5 -- performance_dashboard

Finalidade: Gerar o dashboard de performance do squad com metricas consolidadas
de pipeline, forecast, win rate e velocidade de ciclo para o CRA e o board.

json{ name: performance_dashboard, parameters: { period: enum current_week current_month current_quarter ytd, metrics_to_include: array enum pipeline_value pipeline_coverage win_rate sales_cycle_avg forecast_accuracy revenue_vs_target deals_by_stage, breakdown_by: enum agent cluster channel segment, compare_with_previous: boolean, output_format: enum executive_summary board_ready full_detail } }
