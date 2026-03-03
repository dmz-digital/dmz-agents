Tool 1 -- contract_drafter

Finalidade: Produzir o rascunho completo de um contrato comercial com base
nos termos acordados, adaptado ao tipo de documento e ao porte do deal.

json{ name: contract_drafter, parameters: { deal_id: string, document_type: enum services_agreement order_of_service addendum nda, client_name: string, client_cnpj_or_cpf: string, agreed_scope: string descricao do servico acordado, agreed_value: number, payment_terms: string condicoes de pagamento, contract_duration_months: integer, sla_terms: string niveis de servico acordados se aplicavel, special_clauses: array string clausulas fora do padrao solicitadas pelo cliente, review_level: enum green yellow red } }


Tool 2 -- template_customizer

Finalidade: Personalizar um template existente inserindo os termos especificos
do deal e removendo clausulas que nao se aplicam.

json{ name: template_customizer, parameters: { deal_id: string, base_template: enum standard_services enterprise_services saas_subscription professional_services, customizations: object clausulas a inserir ou alterar, clauses_to_remove: array string clausulas a remover, personalization_data: object nome cliente valor escopo prazo pagamento } }


Tool 3 -- risk_clause_detector

Finalidade: Analisar um rascunho de contrato e identificar clausulas que
podem criar conflito, ambiguidade ou risco juridico, com nivel de severidade.

json{ name: risk_clause_detector, parameters: { deal_id: string, contract_text: string texto do rascunho, check_areas: array enum liability indemnification ip_ownership termination payment sla confidentiality, output_semaphore: boolean gerar semaforo verde amarelo vermelho, recommend_ecvc_review: boolean } }


Tool 4 -- contract_version_tracker

Finalidade: Registrar e comparar versoes de um contrato, identificando o
que mudou entre versoes e quem solicitou cada alteracao.

json{ name: contract_version_tracker, parameters: { deal_id: string, action: enum register compare list get_latest, version_label: string ex v1_draft v2_client_review v3_ecvc_approved v4_final, contract_text: string, change_requested_by: enum client squad ecvc internal, change_description: string o que mudou nessa versao } }


Tool 5 -- signature_prep

Finalidade: Preparar o contrato para envio e assinatura digital, organizando
a estrutura final, as partes signatarias e o canal de assinatura.

json{ name: signature_prep, parameters: { deal_id: string, contract_version: string versao final aprovada, signatories: array object nome cargo email papel, signature_platform: enum docusign clicksign autentique manual, send_to_client_immediately: boolean, cover_note: string mensagem de contexto ao enviar o documento } }
