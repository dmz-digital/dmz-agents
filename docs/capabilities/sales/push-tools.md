Tool 1 -- stalled_deal_diagnostics

Finalidade: Diagnosticar por que um deal esta parado, identificar o nivel
de interesse real do prospect e recomendar a acao correta.

json{ name: stalled_deal_diagnostics, parameters: { deal_id: string, days_without_movement: integer, last_contact_date: string, last_prospect_signal: string o que o prospect disse ou fez por ultimo, deal_stage: enum qualification pitch proposal negotiation, decision_maker_archetype: string, previous_urgency_attempts: integer quantas vezes ja foi usado argumento de urgencia } }


Tool 2 -- urgency_builder

Finalidade: Construir o argumento de urgencia correto para o deal, com base
no tipo de urgencia aplicavel e nos dados do prospect.

json{ name: urgency_builder, parameters: { deal_id: string, urgency_type: enum cost availability price competitor relationship, cost_of_delay_monthly: number se tipo cost, real_deadline_date: string se tipo price ou availability, deadline_reason: string a razao real do prazo, market_movement_data: string se tipo competitor, decision_maker_archetype: string, output_format: enum verbal_argument email_message whatsapp_message } }


Tool 3 -- decision_moment_designer

Finalidade: Desenhar a sequencia de acoes que leva o prospect a uma decisao
binaria, eliminando o talvez e criando clareza para ambas as partes.

json{ name: decision_moment_designer, parameters: { deal_id: string, current_deal_status: string, desired_outcome: enum close_deal reactivate pause, sequence_steps: integer quantas acoes na sequencia padrao 3, channels: array enum email phone whatsapp linkedin meeting, cutoff_date: string data limite antes de encerrar o deal } }


Tool 4 -- acceleration_message_writer

Finalidade: Redigir a mensagem de aceleracao para um deal parado, com tom
consultivo, argumento de urgencia e CTA de decisao clara.

json{ name: acceleration_message_writer, parameters: { deal_id: string, message_type: enum urgency_nudge decision_request cutoff_warning breakup, channel: enum email whatsapp linkedin, decision_maker_name: string, urgency_argument: string o argumento de urgencia a usar, desired_response: string o que se quer que o prospect faca, tone: enum consultive direct warm formal } }


Tool 5 -- deal_closure_logger

Finalidade: Registrar o encerramento de um deal com motivo, historico e
data para reativacao, alimentando o aprendizado do squad.

json{ name: deal_closure_logger, parameters: { deal_id: string, closure_reason: enum no_budget no_priority no_authority no_need chose_competitor timing lost_to_silence other, closure_date: string, reactivation_date: string data sugerida para tentar reativar se aplicavel, lessons_learned: string o que o squad pode aprender com esse encerramento, breakup_message_sent: boolean, alert_for_reactivation: boolean } }
