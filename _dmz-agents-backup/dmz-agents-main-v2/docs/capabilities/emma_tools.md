Tool 1 — test_case_manager

Finalidade: Criar, organizar e rastrear casos de teste vinculados a user stories, com resultado de execução e histórico de validações.

json{
  "name": "test_case_manager",
  "description": "Gerencia casos de teste: criação, vinculação a stories, execução, resultado e histórico de validações.",
  "parameters": {
    "action": "enum: create | update | execute | get | list | link_story",
    "test_id": "string — identificador do caso de teste",
    "title": "string — título do caso de teste",
    "story_id": "string — user story vinculada",
    "preconditions": "string — pré-condições necessárias",
    "steps": "array[string] — passos de execução",
    "expected_result": "string — comportamento esperado",
    "priority": "enum: critical | high | medium | low",
    "execution_result": "enum: passed | failed | blocked | skipped",
    "evidence": "string — link ou descrição da evidência de execução"
  }
}

Tool 2 — bug_tracker

Finalidade: Registrar, atualizar e consultar bugs reportados com severidade, reprodução, status e rastreabilidade ao longo do ciclo de correção.

json{
  "name": "bug_tracker",
  "description": "Gerencia o ciclo completo de bugs: reporte, classificação, acompanhamento de correção e fechamento com evidência.",
  "parameters": {
    "action": "enum: report | update | get | list | close",
    "bug_id": "string — identificador do bug",
    "title": "string — título descritivo do bug",
    "severity": "enum: critical | high | medium | low",
    "priority": "enum: urgent | high | medium | low",
    "steps_to_reproduce": "array[string] — passos para reproduzir",
    "actual_behavior": "string — o que acontece atualmente",
    "expected_behavior": "string — o que deveria acontecer",
    "environment": "string — ambiente onde foi encontrado",
    "assigned_to": "string — handle do agente responsável pela correção",
    "status": "enum: open | in_progress | fixed | retest | closed | wont_fix"
  }
}