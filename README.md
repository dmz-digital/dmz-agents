<div align="center">

![DMZ - OS Hero](./docs/assets/hero-banner.png)

# DMZ - OS Agents
**The AI-Native Operating System for Modern Product Squads**

[![Painel Live](https://img.shields.io/badge/Painel-agents.dmzdigital.com.br-E85D2F?style=for-the-badge&logo=react&logoColor=white)](https://agents.dmzdigital.com.br)
[![API Railway](https://img.shields.io/badge/API-Railway-000000?style=for-the-badge&logo=railway&logoColor=white)](https://dmz-agents-production.up.railway.app)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PyPI Version](https://img.shields.io/pypi/v/dmz-os?style=for-the-badge&color=blue)](https://pypi.org/project/dmz-os/)
[![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

---

### 🔥 Instalação Instantânea & Wizard Inteligente
O DMZ OS agora conta com um setup interativo que configura tudo para você em segundos.

```bash
curl -fsSL https://raw.githubusercontent.com/dmz-digital/dmz-agents/main/install.sh | bash
```

</div>

---

### 🌐 Visite o Site Oficial
Para mais informações, cases e documentação completa, acesse nosso site oficial:
[**https://agents.dmzdigital.com.br/**](https://agents.dmzdigital.com.br/)

---

## 🚀 A Visão: AI-Native Organization
O **DMZ - OS Agents** não é apenas uma ferramenta; é a materialização de uma organização autônoma. É uma camada de infraestrutura viva que transforma repositórios estáticos em sistemas inteligentes e proativos.

Imagine um squad de **44 especialistas** que operam de forma assíncrona, orquestrados por uma inteligência central (`@orch`) que entende o contexto total do seu projeto. Eles não apenas escrevem código; eles projetam, testam, auditam, documentam, vendem e planejam o próximo grande salto do seu produto.

### O Potencial do DMZ OS:
- **Escalabilidade Infinita:** Adicione especialistas ao seu squad conforme a necessidade cresce.
- **Conhecimento Eterno:** Cada decisão técnica, mudança de design ou insight de mercado é persistido em uma memória de longo prazo.
- **Orquestração de Elite:** O `@orch` (Orchestrator) elimina o ruído da delegação, garantindo que cada tarefa chegue ao agente mais capaz.
- **Segurança Nativa:** Do Cyber Chief (`@constantine`) ao Legal Chief (`@theron`), seu produto nasce protegido e em conformidade.

---

## ✨ Funcionalidades Core

| Feature | Descrição |
|---|---|
| **Intelligent Chat** | Nova interface multissegmentada (Chat de Projetos) com histórico persistente e orquestração em tempo real. |
| **Multimodal Input** | Suporte nativa para upload e entendimento de **PDFs, Imagens e Áudios** diretamente no chat. |
| **Deep Research** | Pesquisa profunda na internet utilizando **Firecrawl** para extração de dados técnicos e atualizados. |
| **Intelligent Orchestration** | O `@orch` master planeja demandas de alto nível e gerencia o grafo de execução entre os 44 agentes. |
| **Realtime Kanban (New!)** | Board de projetos interativo com renderização fluida de Markdown em cards e feedbacks sonoros realtime via WebSockets. |
| **Dynamic API Keys (New!)** | Geração instantânea e segura de Chaves Locais (CLI) criptografadas em SHA-256 integradas ao PostgreSQL RLS. |
| **Specialized Skills** | Cada agente possui um conjunto de competências (skills) refinadas e mapeadas no banco de dados. |
| **MCP Toolset** | Integração nativa com Model Context Protocol para controle de GitHub, Notion, Vercel e mais. |
| **Persistent Memory** | Memória vetorial e relacional que permite aos agentes "lembrarem" de conversas e decisões passadas. |
| **Interactive CLI Wizard** | Setup interativo via terminal que valida chaves, conexões e prepara o ambiente de trabalho. |

---

## 🛠️ Como Conectar o DMZ-OS (Modelo Híbrido SaaS + Local)

O DMZ OS funciona dividindo tarefas entre a nossa **Plataforma Web** (onde você gerencia o projeto) e a **Sua Máquina** (onde os agentes trabalham no código).
Para plugar o Squad no seu repositório:

### 1. Crie seu Projeto na Nuvem
Acesse [agents.dmzdigital.com.br](https://agents.dmzdigital.com.br/) e crie um novo projeto. 
Anote o seu **Project Slug** e a sua **DMZ Security Key** (na guia de Configuração / Instalação).

### 2. Instale o CLI no seu ambiente
No seu terminal local (onde fica o seu repositório Git ou o seu código atual), instale o pacote globalmente usando:
```bash
pip install dmz-os
```

### 3. Faça o Bind do Projeto e Ative
Dentro da pasta local do seu projeto, rode o inicializador.
Ele pedirá o seu **Slug** e a sua **DMZ Security Key** instanciando a pasta invisível `.agents`.
```bash
dmz-os install
```

Pronto, agora você levanta o motor do Squad:
```bash
dmz-os start
```
A partir de agora o Orchestrator lerá as missões do Kanban da web e os especialistas agirão nos seus arquivos locais.

---

## 🤖 O Squad Especializado (85 Agentes)
O squad é organizado em categorias estratégicas para cobrir 100% do ciclo de vida de um produto digital e operações de negócio. Com 85 especialistas à disposição, o DMZ OS elimina gargalos operacionais:

| Categoria | Família de Agentes | Papel Fundamental |
|:---:|---|---|
| **Orchestration** | `@orch`, `@syd`, `@formatting` | Orquestração de workflows, Liderança Operacional e Governança de IA. |
| **Product & Agile** | `@jose`, `@lucas`, `@david`, `@emma` | Gestão de Roadmap, Visão de Produto, Scrum e Controle de Qualidade (QA). |
| **Development** | `@ryan`, `@alex`, `@oliver`, `@sofia` | Coding Full-Stack, Arquitetura de Software, DevOps e Engenharia de Dados. |
| **Security & Legal** | `@constantine`, `@theron` | CyberSecurity Ativa, Pentesting, Compliance LGPD e Estratégia Jurídica. |
| **Design & UX** | `@aurora`, `@victoria` | Design System, Interfaces Premium (UI) e Jornada do Usuário (UX). |
| **Content & Strategy** | `@cassandra`, `@kanya`, `@martin` | Copywriting de Conversão, Análise de Mercado e Engenharia de SOPs. |
| **Specialized Frameworks**| `@quantum`, `@voice`, `@vision_analyzer` | Integração de Visão Computacional, Análise de Áudio e Pesquisa em Deep Web. |
| **Revenue Operations** | `@revops`, `@closer`, `@hunter` | Máquina massiva de Outbound, Prospecção C-Level e Escala de Vendas. |

---

## 🏗️ Fluxo de Inteligência (Cloud to Local)

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

- **Frontend:** Next.js 15, Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons.
- **CLI Engine:** Python 3.12, Typer, Rich (UI de Terminal Premium).
- **Inteligência:** Claude 3.7 Sonnet (Reasoning), GPT-4o, Gemini 2.5 Pro.
- **Backend:** Supabase (Real-time DB, Auth, Storage), FastAPI (Railway).
- **Integrations:** Firecrawl (Web Search), Whisper (Audio Transcription).

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
