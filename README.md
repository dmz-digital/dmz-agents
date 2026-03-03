<div align="center">

![DMZ - OS Hero](./docs/assets/hero-banner.png)

# DMZ - OS Agents
**The AI-Native Operating System for Modern Product Squads**

[![Painel Live](https://img.shields.io/badge/Painel-dmz--os.netlify.app-E85D2F?style=for-the-badge&logo=netlify&logoColor=white)](https://dmz-os.netlify.app)
[![API Railway](https://img.shields.io/badge/API-Railway-000000?style=for-the-badge&logo=railway&logoColor=white)](https://dmz-agents-production.up.railway.app)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PyPI Version](https://img.shields.io/pypi/v/dmz-os?style=for-the-badge&color=blue)](https://pypi.org/project/dmz-os/)
[![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

---

### 🔥 Instalação Instantânea & Wizard Inteligente
O DMZ OS agora conta com um setup interativo que configura tudo para você em segundos.

```bash
curl -fsSL https://raw.githubusercontent.com/eldanielsantos-git/dmz-agents/main/install.sh | bash
```

</div>

---

### 🌐 Visite o Site Oficial
Para mais informações, cases e documentação completa, acesse nosso site oficial:
[**https://agents.dmzdigital.com.br/**](https://agents.dmzdigital.com.br/)

---

## 🚀 A Visão: AI-Native Organization
O **DMZ - OS Agents** não é apenas uma ferramenta; é a materialização de uma organização autônoma. É uma camada de infraestrutura viva que transforma repositórios estáticos em sistemas inteligentes e proativos.

Imagine um squad de **18 especialistas** que operam de forma assíncrona, orquestrados por uma inteligência central (`@orch`) que entende o contexto total do seu projeto. Eles não apenas escrevem código; eles projetam, testam, auditam, documentam e planejam o próximo grande salto do seu produto.

### O Potencial do DMZ OS:
- **Escalabilidade Infinita:** Adicione especialistas ao seu squad conforme a necessidade cresce.
- **Conhecimento Eterno:** Cada decisão técnica, mudança de design ou insight de mercado é persistido em uma memória de longo prazo.
- **Orquestração de Elite:** O `@orch` (Orchestrator) elimina o ruído da delegação, garantindo que cada tarefa chegue ao agente mais capaz.
- **Segurança Nativa:** Do Cyber Chief (`@constantine`) ao Legal Chief (`@theron`), seu produto nasce protegido e em conformidade.

---

## ✨ Funcionalidades Core

| Feature | Descrição |
|---|---|
| **Intelligent Orchestration** | O `@orch` master planeja demandas de alto nível e gerencia o grafo de execução entre os agentes. |
| **Specialized Skills** | Cada agente possui um conjunto de competências (skills) refinadas e mapeadas no banco de dados. |
| **MCP Toolset** | Integração nativa com Model Context Protocol para controle de GitHub, Notion, Vercel e mais. |
| **Persistent Memory** | Memória vetorial e relacional que permite aos agentes "lembrarem" de conversas e decisões passadas. |
| **Interactive CLI Wizard** | Setup interativo via terminal que valida chaves, conexões e prepara o ambiente de trabalho. |

---

## 🛠️ Guia de Início Rápido

### 1. Inicie o Wizard de Instalação
A forma mais rápida de injetar o squad em qualquer projeto é usar o comando de instalação:

```bash
# Se você já tem o pacote instalado:
dmz-os install
```

O Wizard irá guiar você pela configuração do **Supabase**, escolha das **LLMs** (Claude, GPT, Gemini) e conexão com seu **Slug de Projeto**.

### 2. O Loop de Trabalho (Modo Operação)
Para ativar seus agentes e deixar o squad em "modo de espera" para novas demandas:

```bash
# Inicia os motores e o loop dos agentes
dmz-os start
```

Se o seu projeto ainda não estiver configurado, o comando `start` iniciará automaticamente o **Wizard de Instalação**.

---

## 🤖 O Squad Especializado (18 Agentes)
O squad é organizado em categorias estratégicas para cobrir 100% do ciclo de vida de um produto digital:

| Categoria | Agentes Principais | Papel Fundamental |
|:---:|---|---|
| **Core** | `@orch`, `@syd` | Orquestração, Liderança Operacional e Gestão de Saúde do Squad. |
| **Product** | `@lucas`, `@jose`, `@emma` | Visão de Produto, Gestão de Prazos e Barreira de Qualidade (QA). |
| **Dev** | `@ryan`, `@alex`, `@oliver` | Coding Full-Stack, Arquitetura Estrutural e Automação DevOps. |
| **Security** | `@constantine`, `@theron` | Fortaleza de Segurança, Privacidade e Conformidade Legal. |
| **Design** | `@aurora`, `@victoria` | Estética Premium, Design Systems e Experiência do Usuário (UX). |
| **Strategy** | `@kanya`, `@cassandra` | Inteligência de Mercado, Análise de Cenários e Narrativa de Marca. |
| **Auxiliary** | `@martin`, `@sofia`, `@quantum` | Extração de SOPs, Gestão de Dados e Orquestração de Ferramentas. |

---

## 🏗️ Fluxo de Inteligência

```mermaid
graph TD
    User((Usuário)) -- Demanda --> UI[Dashboard/CLI]
    UI -- Registra Task --> DB[(Supabase)]
    DB -- Notifica --> Orch[@orch]
    Orch -- Planeja --> Plan[Master Plan]
    Plan -- Delega --> Agents[Agentes Especialistas]
    Agents -- Executa --> Memory[(Memória Sagrada)]
    Memory -- Feedback --> User
```

---

## 💻 Tech Stack de Elite

- **Frontend:** Next.js 15, Tailwind CSS, Framer Motion (para micro-animações).
- **CLI Engine:** Python 3.12, Typer, Rich (UI de Terminal Premium).
- **Inteligência:** Claude 3.7 Sonnet (Reasoning), GPT-4o, Gemini 2.0 Flash.
- **Backend:** Supabase (Real-time DB, Auth, Vector Storage), Railway.

---

## 🗺️ Roadmap v0.3.0

- [x] **v0.2.0:** Publicação no PyPI e Sincronização de Capabilities via DB.
- [ ] **v0.3.0:** Sistema de 'Shared Workspace' onde agentes colaboram no mesmo arquivo simultaneamente.
- [ ] **v0.4.0:** Integração com Slack e Discord para controle do squad via chat.

---

## 🤝 Make your code alive.
O DMZ OS é um projeto "Dogfooding". Nós usamos os agentes para construir os próprios agentes. Se você encontrar bugs ou tiver sugestões de prompts de especialistas, abra uma Issue!

MIT © 2024 DMZ Labs.
**Built by DMZ Agents.**
