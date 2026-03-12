Tool 1 — design_system_manager

Finalidade: Consultar, atualizar e versionar tokens e componentes do design system — mantendo a fonte única de verdade visual do produto.

json{
  "name": "design_system_manager",
  "description": "Gerencia o design system do produto: tokens de design, componentes, versões e changelog.",
  "parameters": {
    "action": "enum: get_token | update_token | add_component | deprecate | get_changelog | list_components",
    "token_type": "enum: color | typography | spacing | shadow | border | motion",
    "token_name": "string — nome do token (ex: color.primary.500)",
    "token_value": "string — valor do token",
    "component_name": "string — nome do componente",
    "component_spec": "object — especificação do componente com variantes e estados",
    "version": "string — versão do design system (semver)",
    "changelog_entry": "string — descrição da mudança para o changelog"
  }
}

Tool 2 — figma_connector

Finalidade: Interagir com arquivos Figma do produto — consultar componentes, extrair tokens, verificar especificações de handoff e comentar em revisões.

json{
  "name": "figma_connector",
  "description": "Conecta ao Figma para consultar componentes, extrair especificações, verificar tokens e registrar feedback em revisões de design.",
  "parameters": {
    "action": "enum: get_file | get_component | extract_tokens | get_styles | add_comment | list_frames",
    "file_id": "string — ID do arquivo Figma",
    "node_id": "string — ID do nó/componente específico",
    "comment": "string — comentário de feedback (para add_comment)",
    "token_format": "enum: css_variables | json | style_dictionary",
    "frame_name": "string — nome do frame a ser consultado"
  }
}