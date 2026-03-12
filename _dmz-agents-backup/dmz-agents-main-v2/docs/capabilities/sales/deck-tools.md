Tool 1 -- deck_outline_builder

Finalidade: Produzir outline completo de um deck com sequencia de slides,
mensagem principal e elemento visual recomendado por slide.

json{ name: deck_outline_builder, parameters: { deal_id: string, deck_type: enum investor_pitch enterprise_deck commercial_proposal, audience_profile: string, total_slides: integer, key_messages: array string, financial_data_available: boolean } }


Tool 2 -- slide_copy_writer

Finalidade: Escrever headline, body copy e gancho de um ou mais slides.

json{ name: slide_copy_writer, parameters: { deal_id: string, slide_number: integer, slide_title: string, slide_message: string, slide_type: enum problem solution product market traction model competitive team financial raise cta, audience_archetype: string, max_words_body: integer padrao 60 } }


Tool 3 -- deck_personalizer

Finalidade: Adaptar deck existente para prospect especifico com nome, logo,
dados do setor e contexto da empresa.

json{ name: deck_personalizer, parameters: { deal_id: string, base_deck_type: string, prospect_name: string, prospect_company: string, prospect_sector: string, prospect_specific_context: string, personalization_depth: enum light standard deep } }


Tool 4 -- leave_behind_converter

Finalidade: Converter deck de apresentacao ao vivo em versao leave-behind
que funciona sem apresentador.

json{ name: leave_behind_converter, parameters: { deal_id: string, source_deck_type: string, slides_to_expand: array integer, add_speaker_notes: boolean, narrative_density: enum light standard rich } }


Tool 5 -- deck_version_controller

Finalidade: Registrar e controlar versoes ativas de um deck por deal.

json{ name: deck_version_controller, parameters: { deal_id: string, action: enum register update list get_latest, version_label: string, deck_type: string, version_notes: string, status: enum draft review approved active archived } }
