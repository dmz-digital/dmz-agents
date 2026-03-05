# Master Plan - DMZ OS Agents

## Objetivo
Criar uma plataforma operacional de inteligência artificial (DMZ OS) centrada em uma arquitetura multi-agentes (Squad de Agentes), capaz de atuar em design, desenvolvimento, orquestração e análises de dados, substituindo tarefas rotineiras de times de produto, operações e engenharia.

## Arquitetura e Stack
- **Frontend / Client:** Next.js, Tailwind CSS V4, Shadcn/UI, Lucide React, Framer Motion. Hospedado na Vercel.
- **Backend / Core Engine:** Python FastAPI ou Flask para receber prompts, arquivos e orquestrar as passagens LLM. Hospedado na Railway.
- **Banco de Dados & Auth:** Supabase (PostgreSQL, Vector Store para memory, Storage e Autenticação).

## Agentes Principais (O "Squad")
1. **ORCH (Orchestrator):** Responsável por analisar a intenção macro do usuário e rotear os fluxos para os agentes especialistas, consolidando os retornos e entregando na UI do chat de maneira inteligível e organizada.
2. **RYAN (Developer):** Focado em engenharia de software complexa (Next.js, Tailwind, APIs).
3. **AURORA (Design Chief):** Mestre de UI/UX, foca em layouts visuais com coerência e paletas fiéis à marca.
4. **THERON (Legal Chief):** Especialista em leis, propostas, contratos.
5. Outros agentes: Cassandra (Copy), Victoria (UX), Lucas (PO), Sofia (DB), etc.

## Diretrizes de Desenvolvimento
1. Manter a interface de usuário imaculada e moderna. Sem margens excessivas ou componentes genéricos. Todo balão ou box tem cantos e transições pensadas.
2. O sistema de chat não é apenas texto: ele suporta áudios, preview nativo de arquivos HTML, processamento de mídia (vídeos/áudios gigantes cortados) via queues.
3. Centralizar gerenciamento de tokens e LLMs (Gemini, Claude, GPT) nativamente no painel admin para evitar hardcodes no sistema de agentes.
