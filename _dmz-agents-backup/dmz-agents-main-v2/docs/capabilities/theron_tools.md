Tool 1 — legal_document_manager

Finalidade: Criar, versionar e manter os documentos jurídicos do produto — Termos de Uso, Política de Privacidade, DPA e outros — com histórico de alterações e status de aprovação.

json{
  "name": "legal_document_manager",
  "description": "Gerencia documentos jurídicos do produto: criação, versionamento, revisão e publicação de Termos, Políticas e Contratos.",
  "parameters": {
    "action": "enum: create | update | get | list | publish | archive",
    "document_id": "string — identificador do documento",
    "document_type": "enum: terms_of_use | privacy_policy | dpa | cookie_policy | contract | nda | other",
    "title": "string — título do documento",
    "content": "string — conteúdo completo do documento",
    "version": "string — versão semântica do documento",
    "effective_date": "string — data de entrada em vigor (ISO 8601)",
    "changelog": "string — resumo das mudanças desta versão",
    "status": "enum: draft | under_review | approved | published | archived",
    "approved_by": "string — quem aprovou esta versão"
  }
}

Tool 2 — compliance_checker

Finalidade: Avaliar a conformidade de features, fluxos ou documentos com a LGPD e regulações aplicáveis — gerando relatório de gaps e recomendações de adequação.

json{
  "name": "compliance_checker",
  "description": "Avalia conformidade com LGPD e regulações aplicáveis: identifica gaps, bases legais ausentes e recomendações de adequação.",
  "parameters": {
    "action": "enum: evaluate | get_report | list_evaluations",
    "target_type": "enum: feature | document | data_flow | integration | product_area",
    "target_id": "string — identificador do item sendo avaliado",
    "description": "string — descrição do que está sendo avaliado",
    "data_categories": "array[string] — categorias de dados pessoais envolvidos",
    "regulations": "array[string] — regulações a verificar (ex: LGPD, Marco Civil, CDC)",
    "findings": "array[object] — gaps encontrados com artigo, descrição e recomendação",
    "compliance_score": "number — percentual de conformidade (0-100)",
    "status": "enum: compliant | partial | non_compliant"
  }
}