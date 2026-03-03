Tool 1 — market_intelligence_search

Finalidade: Buscar dados de mercado, notícias de concorrentes, tendências e sinais de indústria em tempo real para embasar análises estratégicas.

json{
  "name": "market_intelligence_search",
  "description": "Realiza buscas estruturadas por inteligência de mercado: concorrentes, tendências, dados de indústria e notícias relevantes.",
  "parameters": {
    "query": "string — termos de busca",
    "focus": "enum: competitor | market_trend | regulation | technology | user_behavior",
    "industry": "string — segmento de mercado (ex: SaaS B2B, fintech, edtech)",
    "time_range": "enum: last_week | last_month | last_quarter | last_year",
    "output_format": "enum: summary | detailed | bullet_points"
  }
}

Tool 2 — scenario_modeler

Finalidade: Construir e comparar cenários estratégicos com premissas, variáveis e projeções estruturadas.

json{
  "name": "scenario_modeler",
  "description": "Cria e compara cenários estratégicos (otimista, base, pessimista) com premissas explícitas e variáveis-chave.",
  "parameters": {
    "action": "enum: create | update | compare | export",
    "scenario_id": "string — identificador do cenário",
    "initiative": "string — iniciativa ou decisão sendo analisada",
    "assumptions": "array[string] — premissas do cenário",
    "key_variables": "array[object] — variáveis com nome, valor e sensibilidade",
    "scenario_type": "enum: optimistic | base | pessimistic",
    "projected_outcome": "string — resultado projetado com justificativa"
  }
}