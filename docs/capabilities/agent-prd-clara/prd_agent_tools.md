Tool 1 — prd_manager

Finalidade: Criar, versionar, revisar e gerenciar o ciclo de vida completo de PRDs — desde o rascunho inicial até o arquivamento pós-entrega, com controle de status, versionamento e sign-off.

json{
  "name": "prd_manager",
  "description": "Gerencia o ciclo de vida completo de PRDs: criação, versionamento, revisão, sign-off, acompanhamento de desenvolvimento e arquivamento — com rastreabilidade total.",
  "parameters": {
    "action": "enum: create | update_section | get | list | change_status | add_sign_off | get_pending_sign_offs | add_changelog | archive | get_full_prd | search | list_by_status",
    "prd_id": "string — identificador único do PRD (ex: PRD-042)",
    "title": "string — título descritivo da feature",
    "version": "string — versão semver do PRD (ex: 1.0, 1.1, 2.0)",
    "status": "enum: draft | in_review | approved | in_development | delivered | archived | cancelled",
    "executive_summary": "string — resumo executivo de 1 parágrafo",
    "problem_statement": "string — declaração precisa do problema",
    "problem_evidence": "array[object] — { type, source, description, relevance }",
    "hypothesis": "string — hipótese central da solução",
    "affected_personas": "array[object] — { name, role, frequency, impact_level }",
    "section_name": "string — nome da seção a atualizar (para update_section)",
    "section_content": "string — conteúdo da seção atualizada",
    "sign_off_role": "string — papel que está aprovando",
    "sign_off_person": "string — handle da pessoa",
    "sign_off_status": "enum: approved | pending | rejected",
    "sign_off_notes": "string — observações do aprovador",
    "changelog_entry": "string — descrição da mudança",
    "changelog_author": "string — quem fez a mudança",
    "related_sprint": "string — sprint ou ciclo associado",
    "figma_link": "string — link do Figma associado",
    "implementation_link": "string — link da implementação (para archive)"
  }
}

---

Tool 2 — requirements_builder

Finalidade: Criar, organizar e validar requisitos funcionais e não funcionais com critérios de aceite em Gherkin — garantindo rastreabilidade entre requisito, user story e critério de aceite.

json{
  "name": "requirements_builder",
  "description": "Gerencia requisitos funcionais e não funcionais: criação com critérios de aceite Gherkin, priorização MoSCoW, rastreabilidade e validação de completude.",
  "parameters": {
    "action": "enum: add_functional | add_non_functional | update | get | list_by_prd | list_by_priority | validate_coverage | export_for_qa | link_to_story | mark_implemented | mark_validated",
    "requirement_id": "string — identificador (ex: RF-042-01 ou RNF-042-01)",
    "prd_id": "string — PRD ao qual pertence",
    "req_type": "enum: functional | non_functional",
    "description": "string — descrição clara do requisito",
    "priority": "enum: must | should | could | wont",
    "acceptance_criteria": "array[object] — cenários Given/When/Then com { scenario_name, given, when, then, and }",
    "non_functional_category": "enum: performance | security | accessibility | scalability | availability | compatibility | maintainability | privacy",
    "nfr_metric": "string — valor mensurável (ex: p95 < 300ms, WCAG 2.1 AA)",
    "nfr_validation_method": "string — como será validado",
    "dependencies": "array[string] — IDs de requisitos dependentes",
    "linked_stories": "array[string] — IDs de user stories vinculadas",
    "implementation_notes": "string — notas técnicas para o desenvolvedor",
    "status": "enum: draft | reviewed | approved | implemented | validated | rejected"
  }
}

---

Tool 3 — user_story_manager

Finalidade: Criar, priorizar, estimar e rastrear user stories com critérios de aceite completos — incluindo cenários de happy path, borda e erro — mantendo rastreabilidade com requisitos e PRD.

json{
  "name": "user_story_manager",
  "description": "Gerencia user stories do produto: criação com critérios de aceite Gherkin, priorização, estimativa de esforço, dependências e rastreabilidade com PRD e requisitos.",
  "parameters": {
    "action": "enum: create | update | get | list_by_prd | list_by_sprint | add_scenario | update_scenario | link_requirement | set_priority | set_estimate | move_to_sprint | get_dependency_map | export_for_sprint",
    "story_id": "string — identificador (ex: US-042-01)",
    "prd_id": "string — PRD ao qual pertence",
    "as_a": "string — persona (quem)",
    "i_want": "string — ação ou capacidade desejada",
    "so_that": "string — benefício ou objetivo",
    "scenarios": "array[object] — { scenario_name, scenario_type: happy_path|edge_case|error|alternative, given, when, then, and_conditions }",
    "priority": "enum: must | should | could | wont",
    "effort_estimate": "enum: xs | s | m | l | xl | unknown",
    "story_points": "integer — pontos de história (se usar Fibonacci: 1,2,3,5,8,13,21)",
    "dependencies": "array[string] — IDs de stories que precisam estar prontas antes",
    "blocks": "array[string] — IDs de stories que esta bloqueia",
    "linked_requirements": "array[string] — IDs de requisitos funcionais vinculados",
    "sprint": "string — sprint de implementação planejada",
    "assigned_to": "string — desenvolvedor responsável",
    "status": "enum: backlog | refined | sprint_ready | in_progress | done | accepted | rejected"
  }
}

---

Tool 4 — discovery_session_manager

Finalidade: Estruturar, registrar e documentar sessões de discovery — capturando insights, evidências de problema, hipóteses e decisões sobre o que construir ou não construir.

json{
  "name": "discovery_session_manager",
  "description": "Gerencia sessões de discovery: perguntas estruturadas, registro de insights, evidências de problema, hipóteses validadas ou invalidadas e recomendação de próximos passos.",
  "parameters": {
    "action": "enum: create_session | add_insight | add_evidence | record_hypothesis | validate_hypothesis | invalidate_hypothesis | add_decision | close_session | get_session | list_sessions | export_to_prd",
    "session_id": "string — identificador da sessão",
    "feature_hypothesis": "string — hipótese ou tema da sessão",
    "participants": "array[string] — participantes da sessão",
    "session_date": "string — data YYYY-MM-DD",
    "problem_statement_draft": "string — rascunho do problem statement emergindo da sessão",
    "insight_description": "string — insight capturado",
    "insight_source": "string — origem do insight (entrevista, dado, observação)",
    "evidence_type": "enum: quantitative | qualitative | competitive | technical | user_research",
    "evidence_content": "string — conteúdo da evidência",
    "hypothesis_text": "string — hipótese formulada",
    "validation_result": "enum: validated | invalidated | needs_more_data",
    "validation_rationale": "string — justificativa da validação ou invalidação",
    "decision_text": "string — decisão tomada",
    "decision_rationale": "string — motivo da decisão",
    "recommendation": "enum: proceed_full_prd | proceed_simplified | do_not_build | needs_more_research",
    "recommendation_rationale": "string — justificativa da recomendação"
  }
}

---

Tool 5 — risk_register

Finalidade: Registrar, avaliar, priorizar e acompanhar riscos de produto — por categoria (técnico, negócio, UX, dados, privacidade) — com mitigações e responsáveis definidos.

json{
  "name": "risk_register",
  "description": "Gerencia o registro de riscos de produto: identificação, avaliação de probabilidade e impacto, mitigações, responsáveis e acompanhamento de status por PRD.",
  "parameters": {
    "action": "enum: add_risk | update_risk | get | list_by_prd | list_by_category | list_critical | mark_mitigated | mark_occurred | get_risk_summary",
    "risk_id": "string — identificador do risco",
    "prd_id": "string — PRD ao qual pertence",
    "title": "string — título conciso do risco",
    "description": "string — descrição detalhada do risco e cenário de ocorrência",
    "category": "enum: technical | business | ux_adoption | data | privacy_lgpd | security | performance | dependency | regulatory",
    "probability": "enum: high | medium | low",
    "impact": "enum: critical | high | medium | low",
    "risk_score": "integer — score calculado probabilidade × impacto (1-9)",
    "mitigation_strategy": "string — ação para reduzir probabilidade ou impacto",
    "contingency_plan": "string — o que fazer se o risco se materializar",
    "owner": "string — responsável pelo monitoramento e mitigação",
    "review_date": "string — data de revisão do risco YYYY-MM-DD",
    "status": "enum: identified | mitigating | mitigated | occurred | accepted | closed"
  }
}

---

Tool 6 — metrics_planner

Finalidade: Definir, documentar e acompanhar métricas de sucesso de features — métrica primária, guardrails, baseline, metas e instrumentação — em coordenação com Gaia (GA4) e Nova (BI).

json{
  "name": "metrics_planner",
  "description": "Gerencia o plano de métricas de cada feature: métrica primária, guardrails, baseline, metas, critério de rollback e status de instrumentação no GA4.",
  "parameters": {
    "action": "enum: create_plan | add_metric | update_metric | get_plan | list_by_prd | mark_instrumented | log_result | check_rollback_criteria",
    "plan_id": "string — identificador do plano de métricas",
    "prd_id": "string — PRD ao qual pertence",
    "primary_metric": "object — { name, definition, baseline, target, target_timeframe, measurement_method }",
    "guardrail_metrics": "array[object] — { name, baseline, max_degradation_allowed, alert_threshold }",
    "secondary_metrics": "array[object] — { name, baseline, target, direction: increase|decrease }",
    "rollback_criteria": "string — condição que dispara o rollback automático ou manual",
    "north_star_impact": "string — como esta feature contribui para a North Star Metric",
    "instrumentation_owner": "string — responsável pela coleta (normalmente @gaia)",
    "dashboard_owner": "string — responsável pelo dashboard (normalmente @nova)",
    "measurement_start_date": "string — data de início da medição YYYY-MM-DD",
    "review_d7_result": "object — { metric_name, value, on_track: boolean }",
    "review_d30_result": "object — { metric_name, value, on_track: boolean }",
    "status": "enum: planned | instrumentation_pending | instrumented | measuring | completed"
  }
}

---

Tool 7 — adr_registry

Finalidade: Registrar, consultar e rastrear Architecture Decision Records — documentando cada decisão relevante de produto ou técnica com contexto, alternativas, motivo e consequências.

json{
  "name": "adr_registry",
  "description": "Gerencia Architecture Decision Records: registro de decisões de produto e técnicas com contexto, alternativas consideradas, motivo da escolha e consequências esperadas.",
  "parameters": {
    "action": "enum: create | update | get | list_by_prd | list_all | supersede | get_superseded_by",
    "adr_id": "string — identificador do ADR (ex: ADR-042-01)",
    "prd_id": "string — PRD ao qual pertence",
    "title": "string — título conciso da decisão",
    "status": "enum: proposed | accepted | deprecated | superseded",
    "context": "string — por que esta decisão precisou ser tomada, incluindo forças em jogo",
    "decision": "string — a decisão tomada, formulada claramente",
    "alternatives_considered": "array[object] — { alternative, reason_discarded }",
    "rationale": "string — por que esta alternativa foi escolhida",
    "consequences_positive": "array[string] — consequências positivas esperadas",
    "consequences_negative": "array[string] — consequências negativas ou trade-offs",
    "decided_by": "array[string] — handles de quem participou da decisão",
    "decision_date": "string — data YYYY-MM-DD",
    "superseded_by": "string — ID do ADR que substituiu este (para supersede)"
  }
}

---

Tool 8 — prd_template_library

Finalidade: Manter biblioteca de templates reutilizáveis de PRD por tipo de feature — acelerando criação de novos PRDs com estrutura pré-validada e reduzindo risco de omissão.

json{
  "name": "prd_template_library",
  "description": "Gerencia biblioteca de templates de PRD por tipo de feature: criação, consulta e aplicação de templates com seções pré-preenchidas e checklists específicos.",
  "parameters": {
    "action": "enum: create_template | update | get | list | apply_template | rate_template | get_most_used",
    "template_id": "string — identificador do template",
    "template_name": "string — nome descritivo",
    "feature_type": "enum: onboarding | integration | reporting | settings | notification | payment | authentication | search | crud | migration | api | data_export | permissions | billing",
    "description": "string — quando usar este template",
    "pre_filled_sections": "object — seções com conteúdo pré-preenchido como ponto de partida",
    "required_sections": "array[string] — seções obrigatórias para este tipo de feature",
    "optional_sections": "array[string] — seções recomendadas mas não obrigatórias",
    "special_considerations": "array[string] — aspectos específicos deste tipo de feature a considerar",
    "checklist": "array[string] — checklist específico de qualidade para este tipo",
    "example_prd_ids": "array[string] — IDs de PRDs reais que usaram este template",
    "target_prd_id": "string — PRD ao qual aplicar o template (para apply_template)",
    "usage_count": "integer — quantas vezes foi usado",
    "average_rating": "number — avaliação média de utilidade (1-5)"
  }
}
