Tool 1 — copy_library

Finalidade: Armazenar, versionar e consultar textos aprovados do produto — por superfície, contexto e estado — garantindo consistência e reutilização de copy validado.

json{
  "name": "copy_library",
  "description": "Gerencia a biblioteca de copy aprovado do produto: armazenamento, consulta, versionamento e busca por superfície ou contexto.",
  "parameters": {
    "action": "enum: add | update | get | search | list | deprecate",
    "copy_id": "string — identificador do texto",
    "surface": "enum: interface | email | landing_page | notification | onboarding | ad | error_message | empty_state | tooltip",
    "context": "string — onde e quando esse copy aparece",
    "text": "string — texto aprovado",
    "tone": "enum: encouraging | empathetic | celebratory | neutral | persuasive | precise",
    "version": "string — versão do copy",
    "story_id": "string — user story vinculada (opcional)",
    "status": "enum: draft | review | approved | deprecated"
  }
}

Tool 2 — ab_test_manager

Finalidade: Criar e acompanhar testes A/B de copy — com hipótese, variações, métrica de sucesso e resultado — para decisões de comunicação baseadas em dados.

json{
  "name": "ab_test_manager",
  "description": "Gerencia testes A/B de copy: criação de experimentos, registro de variações, acompanhamento de métricas e registro de resultado.",
  "parameters": {
    "action": "enum: create | update | get_results | close | list",
    "test_id": "string — identificador do teste",
    "hypothesis": "string — hipótese que o teste valida",
    "surface": "string — onde o teste está rodando",
    "variant_a": "string — copy da variação A (controle)",
    "variant_b": "string — copy da variação B (desafiante)",
    "success_metric": "enum: ctr | conversion | open_rate | click_rate | time_on_page",
    "status": "enum: draft | running | paused | concluded",
    "winner": "enum: a | b | inconclusive",
    "learning": "string — aprendizado extraído do teste"
  }
}