Tool 1 — adr_manager

Finalidade: Criar, consultar e atualizar Architecture Decision Records — mantendo o histórico vivo de decisões técnicas estruturais do produto.

json{
  "name": "adr_manager",
  "description": "Gerencia Architecture Decision Records: criação, atualização de status, consulta e histórico de decisões técnicas.",
  "parameters": {
    "action": "enum: create | update | get | list | deprecate",
    "adr_id": "string — identificador do ADR (ex: ADR-012)",
    "title": "string — título da decisão",
    "context": "string — problema ou necessidade que motivou a decisão",
    "decision": "string — o que foi decidido",
    "alternatives": "array[object] — alternativas com prós e contras",
    "consequences": "object — consequências positivas, trade-offs e riscos",
    "status": "enum: proposed | accepted | deprecated | superseded",
    "superseded_by": "string — ID do ADR substituto (quando depreciado)"
  }
}

Tool 2 — architecture_diagram_generator

Finalidade: Gerar diagramas arquiteturais em formato textual estruturado (Mermaid/C4) para visualizar componentes, fluxos e dependências do sistema.

json{
  "name": "architecture_diagram_generator",
  "description": "Gera diagramas arquiteturais em Mermaid ou C4 Model a partir de descrições de componentes e suas relações.",
  "parameters": {
    "diagram_type": "enum: c4_context | c4_container | c4_component | sequence | flowchart | er_diagram",
    "format": "enum: mermaid | plantuml",
    "components": "array[object] — componentes com nome, tipo e descrição",
    "relationships": "array[object] — relações entre componentes com direção e descrição",
    "title": "string — título do diagrama",
    "scope": "string — o que está sendo representado"
  }
}