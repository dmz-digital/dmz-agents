<div align="center">

![DMZ - OS Hero](./docs/assets/hero-banner.png)

# DMZ - OS Agents
**The AI-Native Operating System for Modern Product Squads**

[![Painel Live](https://img.shields.io/badge/Painel-agents.dmzdigital.com.br-E85D2F?style=for-the-badge&logo=react&logoColor=white)](https://agents.dmzdigital.com.br)
[![API Railway](https://img.shields.io/badge/API-Railway-000000?style=for-the-badge&logo=railway&logoColor=white)](https://dmz-agents-production.up.railway.app)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PyPI](https://img.shields.io/pypi/v/dmz-os?style=for-the-badge&color=blue)](https://pypi.org/project/dmz-os/)

---

### 🔥 Instant Setup (IDE-Native)
O DMZ OS transforma sua IDE em um centro de comando autônomo em segundos.

```bash
curl -fsSL https://raw.githubusercontent.com/dmz-digital/dmz-agents/main/install.sh | bash
```

</div>

---

## 🚀 A Visão: Seu Repositório Ficou Vivo
O **DMZ - OS Agents** não é apenas uma ferramenta; é a materialização de uma organização autônoma que mora no seu código. É uma camada de infraestrutura inteligente que transforma repositórios estáticos em sistemas proativos e cientes de contexto.

Imagine um squad de **86+ especialistas** que operam de forma assíncrona, orquestrados por uma inteligência central (`@orch`) que vive no chat do seu editor (Cursor, Windsurf, VS Code). Eles não apenas escrevem código; eles projetam, testam, auditam, documentam, vendem e planejam o próximo grande salto do seu produto.

### O "Fator Uau" do DMZ OS:
- **IDE-Native (MCP):** O Squad mora no seu editor. Através do Model Context Protocol, os agentes leem e escrevem arquivos locais com segurança.
- **Orquestração via Mentions:** Basta chamar `@orch` no chat para delegar demandas complexas. Ele decomporá em tarefas e acionará os especialistas certos.
- **Memória Sagrada (Sacred Memory):** Conhecimento técnico e de negócio que persiste. Seus agentes nunca esquecem uma decisão arquitetural ou um feedback de UX.
- **Squad de 86 Agentes:** De Arquitetos (@alex) a DevOps (@oliver), passando por Segurança (@constantine) e Estratégia (@kanya).

---

## ✨ Funcionalidades Core (v0.2.x)

| Feature | Descrição |
|---|---|
| **IDE-Native (MCP)** | Plugado no **Cursor, Windsurf ou VS Code**. Ações reais em arquivos locais via protocolo de contexto. |
| **@orch Mentions** | Orquestrador Master que planeja demandas de alto nível e gerencia o grafo de execução. |
| **Realtime Kanban** | Board de projetos interativo que reflete em segundos cada ação tomada pelos agentes na sua IDE. |
| **Context-Aware Chat** | Nova interface multissegmentada com histórico persistente e orquestração em tempo real. |
| **Smart API Keys** | Geração instantânea de chaves de segurança (SHA-256) integradas ao PostgreSQL RLS. |
| **Multimodal Intelligence** | Entendimento nativo de **PDFs, Imagens e Áudios** para briefings complexos. |

---

## 💻 Como Usar: O Fluxo Mágico

O DMZ OS foi desenhado para ser invocado diretamente onde o trabalho acontece.

### 1. Inicie o Motor MCP
Após o setup inicial, levante o servidor de contexto:
```bash
dmz-os mcp
```

### 2. Configure seu Editor
Adicione um novo MCP Server apontando para o seu comando local:
- **Tipo:** `command`
- **Comando:** `dmz-os mcp`

### 3. Fale com o Squad
No chat da IDE (Cursor/Windsurf), dê comandos reais:
> "@orch: crie a estrutura de pastas seguindo Clean Architecture e implemente o repositório de usuários."

---

## 🤖 O Squad Especializado (86 Agentes)
Nossos agentes são organizados em verticais críticas para cobrir 100% do ciclo de vida do produto:

| Verticais | Agentes Exemplo | Missão |
|:---:|---|---|
| **Orchestration** | `@orch`, `@syd` | Governança, Planejamento e Delegação. |
| **Engineering** | `@ryan`, `@alex`, `@oliver`, `@sofia` | Coding, Arquitetura e Infraestrutura. |
| **Quality & Sec** | `@emma`, `@constantine` | Testes automatizados e Cibersegurança. |
| **Product & UX** | `@jose`, `@aurora`, `@victoria` | Roadmap, UI/UX Premium e Pesquisa. |
| **Growth & Sales** | `@cassandra`, `@hunter`, `@revops` | Copywriting e Operações de Receita. |

---

## 🏗️ Ciclo de Vida do Desenvolvimento (Cloud to Local)

```mermaid
graph LR
    User((Usuário)) -- "@orch: demanda" --> IDE[IDE/MCP]
    IDE -- Registra Task --> DB[(Supabase Cloud)]
    DB -- Notifica --> Orch[@orch]
    Orch -- Planeja --> Agents[Especialistas]
    Agents -- Edita Arquivo --> Local[Contexto Local]
    Local -- Sync --> DB
    DB -- Feedback Realtime --> User
```

---

## 💻 Tech Stack de Elite

- **Frontend:** Next.js 15, Tailwind CSS, Framer Motion (UX Amarela).
- **CLI Engine:** Python 3.12, Typer, Rich (Terminal Premium).
- **Inteligência:** Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Flash Payload.
- **Backend:** Supabase (RLS Security), FastAPI (Railway Runtime).

---

## 🗺️ Roadmap v0.3.0

- [x] **v0.2.2:** Notificações de instalação "Wow Factor" e integração CLI-Cloud.
- [ ] **v0.3.0:** Shared Workspace (agentes colaborando em tempo real no mesmo arquivo).
- [ ] **v0.4.0:** Voice-Control (controle seu squad via áudio integrado ao Telegram).

---

## 🤝 Make your code alive.
O DMZ OS é um projeto "Dogfooding". Usamos o squad para construir o squad.

MIT © 2024 DMZ Labs.
**Built by DMZ Agents.**
