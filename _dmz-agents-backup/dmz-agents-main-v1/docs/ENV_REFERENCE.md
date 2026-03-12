# 🔑 DMZ Agents — ENV Reference

Todas as variáveis suportadas pelo `.env.dmz`. As marcadas como **required** são obrigatórias para o funcionamento básico.

---

## Obrigatórias

| Variável | Descrição | Onde obter |
|---|---|---|
| `SUPABASE_URL` | URL do seu projeto Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (acesso total ao banco) | Mesmo local acima |
| `DMZ_PROJECT_SLUG` | Slug do projeto criado no painel DMZ | [dmzos.netlify.app/projects](https://dmzos.netlify.app/projects) |

---

## LLM Providers (mínimo 1 obrigatório)

| Variável | Provider | Onde obter |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude (Anthropic) | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `OPENAI_API_KEY` | GPT-4 (OpenAI) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `GEMINI_API_KEY` | Gemini (Google) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GROQ_API_KEY` | Groq (ultra-rápido) | [console.groq.com/keys](https://console.groq.com/keys) |
| `DEEPSEEK_API_KEY` | DeepSeek | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |

---

## Database & Backend

| Variável | Descrição | Onde obter |
|---|---|---|
| `SUPABASE_ANON_KEY` | Anon Key (leitura pública) | Supabase → Settings → API |
| `REDIS_URL` | Cache e filas (opcional) | [app.redislabs.com](https://app.redislabs.com) |

---

## Cloud & Infraestrutura

| Variável | Descrição | Onde obter |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | AWS para S3, Lambda etc | [console.aws.amazon.com/iam](https://console.aws.amazon.com/iam) |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret | Mesmo local |
| `AWS_REGION` | Região AWS (ex: `us-east-1`) | — |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Worker, R2 | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `RAILWAY_TOKEN` | Deploy no Railway | [railway.app/account/tokens](https://railway.app/account/tokens) |
| `NETLIFY_AUTH_TOKEN` | Deploy no Netlify | [app.netlify.com/user/applications](https://app.netlify.com/user/applications#personal-access-tokens) |
| `VERCEL_TOKEN` | Deploy no Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

---

## Version Control

| Variável | Descrição | Onde obter |
|---|---|---|
| `GITHUB_PAT` | GitHub Personal Access Token | [github.com/settings/tokens](https://github.com/settings/tokens) |

---

## MCP Integrations

| Variável | Descrição | Onde obter |
|---|---|---|
| `FIGMA_ACCESS_TOKEN` | Figma MCP — leitura de arquivos | [figma.com/developers/api](https://www.figma.com/developers/api) |
| `NOTION_TOKEN` | Notion MCP — docs e databases | [notion.so/my-integrations](https://www.notion.so/my-integrations) |
| `TRELLO_API_KEY` | Trello MCP | [trello.com/power-ups/admin](https://trello.com/power-ups/admin) |
| `TRELLO_API_TOKEN` | Trello Token | Mesmo local |
| `CLICKUP_API_TOKEN` | ClickUp tasks | [app.clickup.com/settings/apps](https://app.clickup.com/settings/apps) |
| `LINEAR_API_KEY` | Linear issues | [linear.app/settings/api](https://linear.app/settings/api) |
| `JIRA_API_TOKEN` | Jira MCP | [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `JIRA_EMAIL` | Email da conta Jira | — |
| `JIRA_BASE_URL` | URL do Jira (ex: `empresa.atlassian.net`) | — |
| `AIRTABLE_API_KEY` | Airtable | [airtable.com/account](https://airtable.com/account) |

---

## Automação

| Variável | Descrição | Onde obter |
|---|---|---|
| `N8N_API_KEY` | N8N automações | [docs.n8n.io/api/authentication](https://docs.n8n.io/api/authentication) |
| `N8N_BASE_URL` | URL da sua instância N8N | — |

---

## Web Scraping & Research

| Variável | Descrição | Onde obter |
|---|---|---|
| `FIRECRAWL_API_KEY` | Firecrawl — scraping e crawling | [firecrawl.dev/account](https://firecrawl.dev/account) |

---

## Pagamentos

| Variável | Descrição | Onde obter |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe backend | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe frontend | Mesmo local |

---

## Comunicação

| Variável | Descrição | Onde obter |
|---|---|---|
| `SLACK_BOT_TOKEN` | Notificações e comandos Slack | [api.slack.com/apps](https://api.slack.com/apps) |
| `DISCORD_BOT_TOKEN` | Discord bot | [discord.com/developers/applications](https://discord.com/developers/applications) |
| `TWILIO_ACCOUNT_SID` | SMS via Twilio | [console.twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio auth | Mesmo local |

---

## CRM & Marketing

| Variável | Descrição | Onde obter |
|---|---|---|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot CRM | [app.hubspot.com/private-apps](https://app.hubspot.com/private-apps) |

---

## Databases Alternativos

| Variável | Descrição | Onde obter |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas | [cloud.mongodb.com](https://cloud.mongodb.com) |
| `PINECONE_API_KEY` | Pinecone (vector DB) | [app.pinecone.io](https://app.pinecone.io) |
| `PINECONE_ENVIRONMENT` | Ambiente Pinecone | — |

---

## Monitoramento

| Variável | Descrição | Onde obter |
|---|---|---|
| `SENTRY_AUTH_TOKEN` | Sentry error tracking | [sentry.io/settings/account/api/auth-tokens](https://sentry.io/settings/account/api/auth-tokens) |

---

## Template completo (.env.dmz.example)

```env
# ═══════════════════════════════════════════════════
# DMZ AGENTS — Environment Configuration
# Docs: https://github.com/dmz-agents/squad-template
# ═══════════════════════════════════════════════════

# ── REQUIRED ───────────────────────────────────────
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DMZ_PROJECT_SLUG=

# ── LLM PROVIDERS (min 1) ──────────────────────────
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
DEEPSEEK_API_KEY=

# ── DATABASE ───────────────────────────────────────
SUPABASE_ANON_KEY=
REDIS_URL=

# ── CLOUD ──────────────────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
CLOUDFLARE_API_TOKEN=
RAILWAY_TOKEN=
NETLIFY_AUTH_TOKEN=
VERCEL_TOKEN=

# ── GIT ────────────────────────────────────────────
GITHUB_PAT=

# ── MCP INTEGRATIONS ───────────────────────────────
FIGMA_ACCESS_TOKEN=
NOTION_TOKEN=
TRELLO_API_KEY=
TRELLO_API_TOKEN=
CLICKUP_API_TOKEN=
LINEAR_API_KEY=
JIRA_API_TOKEN=
JIRA_EMAIL=
JIRA_BASE_URL=
AIRTABLE_API_KEY=

# ── AUTOMATION ─────────────────────────────────────
N8N_API_KEY=
N8N_BASE_URL=

# ── WEB SCRAPING ───────────────────────────────────
FIRECRAWL_API_KEY=

# ── PAYMENTS ───────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# ── COMMUNICATION ──────────────────────────────────
SLACK_BOT_TOKEN=
DISCORD_BOT_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# ── CRM ────────────────────────────────────────────
HUBSPOT_ACCESS_TOKEN=

# ── ALT DATABASES ──────────────────────────────────
MONGODB_URI=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

# ── MONITORING ─────────────────────────────────────
SENTRY_AUTH_TOKEN=
```
