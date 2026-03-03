Tool 1 -- dataroom_completeness_auditor

Finalidade: Auditar a completude do data room comparando o inventario atual
com o checklist de documentos criticos, importantes e complementares.

json{ name: dataroom_completeness_auditor, parameters: { deal_id: string, current_documents: array object categoria nome_arquivo data_upload versao, audit_level: enum teaser exploracao due_diligence confidencial, output_gaps: boolean listar documentos ausentes, output_outdated: boolean listar documentos desatualizados acima de X dias, outdated_threshold_days: integer padrao 90 } }


Tool 2 -- access_link_manager

Finalidade: Criar, gerenciar e revogar links de acesso ao data room por
nivel e por investidor, com rastreamento de cada acesso.

json{ name: access_link_manager, parameters: { deal_id: string, action: enum create revoke upgrade downgrade list, investor_id: string, investor_name: string, access_level: enum teaser exploracao due_diligence confidencial, expiry_days: integer dias ate o link expirar automaticamente, notify_ir_on_access: boolean notificar IR Agent quando o link for acessado } }


Tool 3 -- document_updater

Finalidade: Atualizar um documento no data room mantendo a estrutura de
acesso intacta e registrando a atualizacao no historico de auditoria.

json{ name: document_updater, parameters: { deal_id: string, category: enum company_overview product_tech market_competitive traction_metrics financial legal team use_of_resources, document_name: string, new_version_label: string, change_summary: string o que mudou nessa versao, updated_by: string, maintain_existing_access_links: boolean } }


Tool 4 -- investor_activity_tracker

Finalidade: Rastrear e relatar a atividade de cada investidor no data room,
identificando sinais de interesse crescente ou queda de engajamento.

json{ name: investor_activity_tracker, parameters: { deal_id: string, investor_id: string, report_period_days: integer padrao 30, include_document_detail: boolean quais documentos foram acessados, alert_on_spike: boolean alertar quando atividade aumenta significativamente, alert_on_drop: boolean alertar quando atividade cai apos periodo ativo, notify_agent: string handle do agente a notificar padrao ir_chief } }


Tool 5 -- dataroom_activity_report

Finalidade: Gerar o relatorio consolidado de atividade do data room para
o IR Agent, com engajamento por investidor e sinais de interesse.

json{ name: dataroom_activity_report, parameters: { deal_id: string, report_period_days: integer padrao 7, investors_to_include: array string ids dos investidores ou all para todos, metrics_to_include: array enum total_views unique_documents_opened time_spent_minutes last_access_date access_level, highlight_signals: boolean destacar investidores com mudancas significativas de comportamento } }
