# 🤖 DMZ Agents — Getting Started

> O squad de AI agents que trabalha **no seu projeto**, não em paralelo a ele.

---

## O que é o DMZ Agents?

DMZ Agents é um squad de 18 agentes de AI especializados que se integra diretamente ao seu repositório. Os agentes **comunicam entre si em hierarquia**, registram memória de trabalho, executam tools e mantêm todo o histórico rastreável no painel em [dmzos.netlify.app](https://dmzos.netlify.app).

Cada agente tem um papel fixo — de `@orch` (Orchestrator Master) até `@victoria` (UX Designer) — e você escolhe quais ativar no seu projeto.

---

## Escolha seu cenário

| Cenário | Quem é você |
|---|---|
| [🆕 Projeto do Zero](#projeto-do-zero) | Começando um novo projeto agora |
| [⚡ Projeto em Andamento](#projeto-em-andamento) | Já tem código, quer adicionar os agentes |

---

## Pré-requisitos

Antes de qualquer cenário, garanta que você tem:

- **Python 3.10+** instalado (`python --version`)
- **pip** atualizado (`pip install --upgrade pip`)
- **Git** instalado (`git --version`)
- Conta no **[Supabase](https://supabase.com)** (para memória + histórico)
- **API Key** de pelo menos um LLM (Anthropic, OpenAI ou Gemini)

---

## 🆕 Projeto do Zero

### Passo 1 — Clone o template base

```bash
git clone https://github.com/dmz-agents/squad-template.git meu-projeto
cd meu-projeto
```

O template já inclui:
- Pasta `.agents/` com prompts, tools e configuração de cada agente
- `requirements.txt` com dependências do motor Python
- `.env.dmz.example` com todas as variáveis suportadas

### Passo 2 — Crie seu projeto no painel

1. Acesse [dmzos.netlify.app/projects](https://dmzos.netlify.app/projects)
2. Clique em **"Selecionar Agentes"**
3. Dê um nome e slug para seu projeto (ex: `meu-saas-app`)
4. Selecione os agentes que quer ativar
5. Clique em **"Criar Projeto"**

Guarde o **slug do projeto** — você vai usar na configuração do `.env.dmz`.

### Passo 3 — Configure o .env.dmz

```bash
cp .env.dmz.example .env.dmz
```

Edite `.env.dmz` e preencha no mínimo:

```env
# OBRIGATÓRIAS
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_aqui
DMZ_PROJECT_SLUG=meu-saas-app

# UM DOS PROVIDERS (mínimo 1)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AIza...
```

> Veja a lista completa de variáveis suportadas em [docs/ENV_REFERENCE.md](./ENV_REFERENCE.md)

### Passo 4 — Instale as dependências

```bash
pip install -r requirements.txt
```

### Passo 5 — Inicialize os agentes

```bash
python -m dmz_agents connect --project meu-saas-app
```

Isso irá:
- Registrar seu projeto nos agentes
- Sincronizar os agentes selecionados no painel
- Verificar conectividade com Supabase e LLM provider

### Passo 6 — Inicie o squad

```bash
python -m dmz_agents start
```

Você verá no terminal cada agente se registrando e ficando em modo de espera. O `@orch` assume o controle e aguarda a primeira demanda.

---

## ⚡ Projeto em Andamento

Você já tem um projeto com código e quer adicionar o squad DMZ sem mexer na estrutura existente.

### Passo 1 — Crie seu projeto no painel

1. Acesse [dmzos.netlify.app/projects](https://dmzos.netlify.app/projects)
2. Clique em **"Selecionar Agentes"**
3. Preencha nome e slug (sugestão: slug = nome do seu repo)
4. Selecione os agentes que deseja
5. Clique em **"Criar Projeto"**

### Passo 2 — Adicione a pasta .agents/ ao seu projeto

**Opção A — Download direto:**

```bash
curl -L https://github.com/dmz-agents/squad-template/archive/refs/heads/main.zip -o dmz-agents.zip
unzip dmz-agents.zip "squad-template-main/.agents/*" -d temp
cp -r temp/squad-template-main/.agents/ ./
rm -rf temp dmz-agents.zip
```

**Opção B — Git subtree (recomendado para manter atualizado):**

```bash
git remote add dmz-template https://github.com/dmz-agents/squad-template.git
git fetch dmz-template
git read-tree --prefix=.agents/ -u dmz-template/main:.agents/
git commit -m "feat: add DMZ Agents squad"
```

### Passo 3 — Instale as dependências

O DMZ Agents usa um arquivo separado para não interferir no seu `requirements.txt`:

```bash
pip install -r .agents/requirements.txt
```

Ou se preferir isolar em um venv:

```bash
python -m venv .agents/.venv
source .agents/.venv/bin/activate  # macOS/Linux
# .agents\.venv\Scripts\activate   # Windows
pip install -r .agents/requirements.txt
```

### Passo 4 — Configure o .env.dmz

```bash
cp .agents/.env.dmz.example .env.dmz
```

Edite `.env.dmz`:

```env
# OBRIGATÓRIAS
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_aqui
DMZ_PROJECT_SLUG=slug-do-seu-projeto

# UM DOS PROVIDERS
ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ Adicione `.env.dmz` ao seu `.gitignore` — ele contém credenciais sensíveis.

### Passo 5 — Inicialize e sincronize

```bash
python -m dmz_agents connect --project slug-do-seu-projeto
python -m dmz_agents sync  # sincroniza estado atual das tarefas
```

### Passo 6 — Inicie o squad

```bash
python -m dmz_agents start
```

---

## Usando os agentes

### Enviar uma demanda para o @orch

Depois de iniciar o squad, use qualquer assistente de código (VS Code Copilot, Cursor, Antigravity, Claude) configurado com o contexto DMZ:

```
@orch analise o repositório e crie o plano de execução para implementar autenticação com Supabase Auth
```

O `@orch` irá:
1. Analisar a demanda
2. Criar o plano de execução
3. Delegar tarefas para os agentes corretos
4. Registrar tudo no Supabase (memória + tasks)
5. Retornar o resultado integrado

### Acompanhar o progresso

Tudo fica registrado no painel em tempo real:

- **[/agents](https://dmzos.netlify.app/agents)** — Estado de cada agente
- **[/projects](https://dmzos.netlify.app/projects) → Histórico** — Tasks, Master Plan, On Going, Backlog
- **[/memory](https://dmzos.netlify.app/memory)** — Memória de trabalho dos agentes

### Comandos úteis

```bash
# Ver status do squad
python -m dmz_agents status

# Ver tarefas em andamento
python -m dmz_agents tasks --project meu-projeto

# Forçar sync do histórico
python -m dmz_agents sync

# Parar o squad
python -m dmz_agents stop
```

---

## Estrutura da pasta .agents/

```
.agents/
├── agents/               # Configurações individuais por agente
│   ├── orch/
│   │   ├── prompt.md     # Prompt do @orch
│   │   ├── skills.yaml   # Skills declaradas
│   │   └── tools.yaml    # Tools disponíveis
│   ├── ryan/
│   ├── alex/
│   └── ...
├── config/
│   ├── hierarchy.yaml    # Estrutura de reports entre agentes
│   ├── tools_registry.yaml
│   └── dmz_agents.yaml   # Configuração global do squad
├── .env.dmz.example      # Template de variáveis
└── requirements.txt      # Dependências Python do motor
```

---

## Hierarquia do Squad

```
@orch — Orchestrator Master (ROOT)
 ├── @syd    — Squad Manager
 ├── @jose   — Project Manager
 │    ├── @lucas — Product Owner
 │    └── @david — Scrum Master
 ├── @ryan   — Developer
 │    ├── @oliver — DevOps Engineer
 │    └── @alex   — Tech Architect
 ├── @emma        — QA Engineer
 ├── @constantine — Cyber Chief
 │    └── @theron — Legal Chief
 ├── @aurora — Design Chief
 │    └── @victoria — UX Designer
 ├── @cassandra — Copy Chief
 ├── @kanya     — Strategy Analyst
 ├── @martin    — SOP Extractor
 ├── @sofia     — DB Sage
 └── @quantum   — Tools Orchestrator
```

Você ativa apenas os agentes que precisa para seu projeto.

---

## Problemas comuns

### "Cannot connect to Supabase"
- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretos no `.env.dmz`
- Certifique-se que as tabelas do DMZ foram criadas no seu Supabase — execute o script em `docs/setup_supabase.sql`

### "No LLM provider configured"
- Configure pelo menos um: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` ou `GEMINI_API_KEY`

### "Project not found"
- Verifique se o `DMZ_PROJECT_SLUG` no `.env.dmz` corresponde exatamente ao slug criado no painel

### Agente não responde
- Verifique se o squad está rodando: `python -m dmz_agents status`
- Verifique os logs: `python -m dmz_agents logs --agent orch`

---

## Referências

- [Referência de Variáveis (.env.dmz)](./ENV_REFERENCE.md)
- [Schema do Banco (Supabase)](./setup_supabase.sql)
- [Capacidades dos Agentes](./capabilities/)
- [Painel DMZ OS](https://dmzos.netlify.app)
- [Repositório GitHub](https://github.com/dmz-agents/squad-template)
