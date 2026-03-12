Tool 1 — user_flow_builder

Finalidade: Criar e documentar fluxos de usuário com estados, ramificações e edge cases de forma estruturada e vinculada às user stories correspondentes.

json{
  "name": "user_flow_builder",
  "description": "Cria e gerencia fluxos de usuário com estados de interface, caminhos alternativos e edge cases vinculados a user stories.",
  "parameters": {
    "action": "enum: create | update | get | list | link_story",
    "flow_id": "string — identificador do fluxo",
    "title": "string — nome do fluxo",
    "story_id": "string — user story vinculada",
    "persona": "string — persona que executa o fluxo",
    "entry_point": "string — como o usuário chega neste fluxo",
    "steps": "array[object] — passos com estado, ação do usuário e próximo estado",
    "alternative_paths": "array[object] — caminhos alternativos com gatilho e descrição",
    "interface_states": "object — estados: empty, loading, error, success, edge_cases",
    "success_metrics": "array[string] — como medir se o fluxo funciona bem"
  }
}

Tool 2 — usability_session_recorder

Finalidade: Registrar e organizar achados de sessões de teste de usabilidade — por tarefa, participante e severidade — gerando relatório de insights priorizados.

json{
  "name": "usability_session_recorder",
  "description": "Registra achados de testes de usabilidade por sessão e tarefa, com severidade e recomendações — gerando relatório consolidado.",
  "parameters": {
    "action": "enum: create_session | add_finding | get_report | list_sessions",
    "session_id": "string — identificador da sessão de teste",
    "feature_tested": "string — feature ou fluxo sendo testado",
    "participant_profile": "string — perfil do participante",
    "task_id": "string — tarefa sendo executada",
    "finding": "string — achado observado",
    "severity": "enum: critical | high | medium | low | positive",
    "frequency": "enum: all_participants | most | some | one",
    "recommendation": "string — melhoria recomendada com base no achado"
  }
}