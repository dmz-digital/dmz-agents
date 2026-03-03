# DMZ Agents 🤖

> Squad de 18 AI agents especializados que se integra ao seu repositório e trabalha de forma hierárquica e rastreável.

[![Deploy em Netlify](https://img.shields.io/badge/Painel-dmzos.netlify.app-E85D2F?style=flat&logo=netlify)](https://dmzos.netlify.app)
[![Backend no Railway](https://img.shields.io/badge/API-Railway-000?style=flat&logo=railway)](https://dmz-agents-production.up.railway.app)

---

## Links Rápidos

| | |
|---|---|
| 🏠 **Painel** | [dmzos.netlify.app](https://dmzos.netlify.app) |
| ⚡ **Começar agora** | [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) |
| 🔑 **Variáveis (.env.dmz)** | [docs/ENV_REFERENCE.md](./docs/ENV_REFERENCE.md) |
| 🗄️ **Schema Supabase** | [docs/setup_supabase.sql](./docs/setup_supabase.sql) |
| 🧠 **Capacidades dos agentes** | [docs/capabilities/](./docs/capabilities/) |

---

## O Squad

| Handle | Nome | Função | Nível |
|---|---|---|---|
| `@orch` | ORCH | Orchestrator Master | ROOT |
| `@syd` | Syd | Squad Manager | 1 |
| `@jose` | José | Project Manager | 1 |
| `@lucas` | Lucas | Product Owner | 2 → @jose |
| `@david` | David | Scrum Master | 2 → @jose |
| `@ryan` | Ryan | Developer | 1 |
| `@oliver` | Oliver | DevOps Engineer | 2 → @ryan |
| `@alex` | Alex | Tech Architect | 2 → @ryan |
| `@emma` | Emma | QA Engineer | 1 |
| `@constantine` | Constantine | Cyber Chief | 1 |
| `@theron` | Theron | Legal Chief | 2 → @constantine |
| `@aurora` | Aurora | Design Chief | 1 |
| `@victoria` | Victoria | UX Designer | 2 → @aurora |
| `@cassandra` | Cassandra | Copy Chief | 1 |
| `@kanya` | Kanya | Strategy Analyst | 1 |
| `@martin` | Martin | SOP Extractor | 1 |
| `@sofia` | Sofia | DB Sage | 1 |
| `@quantum` | Quantum | Tools Orchestrator | 1 |

---

## Estrutura do Repositório

```
dmz-agents/
├── src/                    # Frontend Next.js (painel de gestão)
│   └── app/
│       ├── agents/         # Página de agentes
│       ├── projects/       # Criar e gerenciar projetos
│       ├── memory/         # Memória de trabalho dos agentes
│       └── tools/          # Registry de tools
├── server/                 # Backend Python (FastAPI) no Railway
│   ├── main.py
│   ├── requirements.txt
│   └── railway.toml
├── docs/
│   ├── GETTING_STARTED.md  # Documentação de instalação
│   ├── ENV_REFERENCE.md    # Referência de variáveis
│   ├── setup_supabase.sql  # Schema do banco
│   └── capabilities/       # Prompts, skills e tools por agente
└── .env.dmz.example        # Template de configuração
```

---

## Instalação Rápida

```bash
# Projeto do Zero
git clone https://github.com/dmz-agents/squad-template.git meu-projeto
cd meu-projeto
pip install -r requirements.txt
cp .env.dmz.example .env.dmz
# edite .env.dmz com suas credenciais
python -m dmz_agents start
```

```bash
# Projeto em Andamento
curl -L https://github.com/dmz-agents/squad-template/archive/refs/heads/main.zip -o dmz.zip
unzip dmz.zip "squad-template-main/.agents/*" -d temp && cp -r temp/squad-template-main/.agents/ ./ && rm -rf temp dmz.zip
pip install -r .agents/requirements.txt
cp .agents/.env.dmz.example .env.dmz
# edite .env.dmz
python -m dmz_agents connect --project meu-projeto
python -m dmz_agents start
```

> Documentação completa → [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)

---

## Stack

| Camada | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Netlify |
| Backend | Python 3.11, FastAPI, Railway |
| Banco | Supabase (PostgreSQL) |
| LLMs | Anthropic Claude, OpenAI GPT-4, Google Gemini |
| UI | Vanilla CSS + Lucide Icons |
