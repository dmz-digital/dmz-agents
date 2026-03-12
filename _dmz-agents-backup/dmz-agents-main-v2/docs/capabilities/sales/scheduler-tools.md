Tool 1 -- meeting_proposer

Finalidade: Propor opcoes de horario por canal preferido do prospect com uso de link de agendamento quando disponivel.

json{ name: meeting_proposer, parameters: { deal_id: string, decision_maker_name: string, meeting_type: enum discovery pitch negotiation followup, duration_minutes: integer padrao 30, preferred_channel: enum email linkedin whatsapp, available_slots: array string, use_scheduling_link: boolean }

Tool 2 -- confirmation_sender

Finalidade: Enviar confirmacao com dados logisticos completos e pauta estruturada em ate 3 topicos.

json{ name: confirmation_sender, parameters: { deal_id: string, decision_maker_name: string, meeting_datetime: string, duration_minutes: integer, meeting_format: enum video phone in_person, meeting_link: string, agenda_topics: array string max 3, send_channel: enum email linkedin whatsapp }

Tool 3 -- reminder_scheduler

Finalidade: Programar lembretes automaticos 24h e 1h antes da reuniao pelo canal preferido.

json{ name: reminder_scheduler, parameters: { deal_id: string, decision_maker_name: string, meeting_datetime: string, meeting_link: string, agenda_topics: array string, reminder_24h: boolean, reminder_1h: boolean, send_channel: enum email linkedin whatsapp }

Tool 4 -- pre_meeting_briefing_builder

Finalidade: Compilar o briefing pre-reuniao com dossie do prospect, persona, historico de interacoes, objetivo e perguntas prioritarias.

json{ name: pre_meeting_briefing_builder, parameters: { deal_id: string, meeting_type: enum discovery pitch negotiation followup, meeting_objective: string, priority_questions: array string, include_persona: boolean, include_interaction_history: boolean, include_objection_prep: boolean }

Tool 5 -- post_meeting_followup_sender

Finalidade: Enviar follow-up pos-reuniao em ate 2h com resumo, proximos passos e acionamento do agente correto conforme o resultado.

json{ name: post_meeting_followup_sender, parameters: { deal_id: string, decision_maker_name: string, meeting_summary: string, next_steps: array object acao responsavel prazo, squad_next_action: enum pitch_deck proposal negotiation nurturing discard, send_channel: enum email linkedin whatsapp }
