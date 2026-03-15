# 🤖 DMZ Agents — Getting Started

> O squad de AI agents que mora na sua IDE, orquestrando seu produto em tempo real.

---

## 🚀 O que é o DMZ OS?

DMZ OS é um sistema operacional nativo para IA que transforma seu repositório em uma organização autônoma. Através do **Model Context Protocol (MCP)**, ele conecta um squad de **86 especialistas** diretamente ao seu editor de código (Cursor, Windsurf, VS Code).

Os agentes se comunicam, planejam missões complexas e agem nos seus arquivos locais sob sua supervisão.

---

## ⚡ Instalação em 10 Segundos

A forma recomendada de começar é através do **Universal Installer**, que configura o CLI, as dependências e o ambiente automaticamente.

### Passo 1 — Rode o Installer
No terminal da pasta do seu projeto, execute:
```bash
curl -fsSL https://raw.githubusercontent.com/dmz-digital/dmz-agents/main/install.sh | bash
```

### Passo 2 — Wizard Interativo
O instalador solicitará suas chaves:
1. **Supabase URL & Key**: Onde reside a memória do squad.
2. **LLM Keys**: (Anthropic, OpenAI ou Gemini).
3. **Project Slug**: O identificador do seu projeto criado em [agents.dmzdigital.com.br](https://agents.dmzdigital.com.br).

---

## 💻 Configurando sua IDE (MCP)

O DMZ OS brilha quando integrado ao chat da sua IDE.

### No Cursor / Windsurf
1. Vá em **Settings** -> **Models** -> **MCP Servers**.
2. Clique em **+ Add New MCP Server**.
3. Configure como:
   - **Name:** `DMZ-OS`
   - **Type:** `command`
   - **Command:** `dmz-os mcp`
4. Reinicie o chat da IDE.

A partir de agora, você pode usar `@orch` nas suas perguntas para delegar tarefas complexas ao squad.

---

## 🏗️ Usando o Squad

### O Comando Maestro (@orch)
O `@orch` é o ponto de entrada único. Em vez de pedir tarefas genéricas, peça planos de ação:

> "@orch analise meu package.json e crie um plano para migrar de Jest para Vitest"

O orquestrador irá:
1. Gerar um **Master Plan** no seu Kanban.
2. Delegar subtarefas para os agentes especialistas (ex: `@ryan` para código, `@emma` para testes).
3. Executar as mudanças e reportar o progresso em tempo real.

### Comandos de Terminal Úteis
```bash
# Inicia o motor em modo daemon (opcional se usar MCP)
dmz-os start

# Verifica a saúde da conexão e chaves
dmz-os health

# Lista todas as tasks do projeto atual
dmz-os tasks

# Abre o painel web diretamente
dmz-os open
```

---

## 🤖 Hierarquia do Squad (86 Agentes)

O squad é organizado para escala. Os líderes orquestram, os especialistas executam.

- **@orch (Orchestrator)**: O General. Planejamento e Visão.
- **@ryan (Development)**: O Mago do Código. Fullstack e Performance.
- **@alex (Architecture)**: O Estrategista de Infra.
- **@emma (QA)**: A Caçadora de Bugs.
- **@constantine (Security)**: O Guardião dos Dados.
- **@aurora (Design)**: A Esteta do Produto.
- **@victoria (UX)**: A Voz do Usuário.

---

## ❓ Problemas Comuns

### "MCP Connection Refused"
- Certifique-se que o motor está configurado corretamente rodando `dmz-os health`.
- Verifique se o caminho do binário `dmz-os` está no seu PATH global.

### "Project not found"
- O `DMZ_PROJECT_SLUG` no seu `.env` deve ser idêntico ao criado no dashboard web.

---

## 🔗 Links Úteis
- **Dashboard Web:** [agents.dmzdigital.com.br](https://agents.dmzdigital.com.br)
- **API Status:** [Railway Monitoring](https://dmz-agents-production.up.railway.app)
- **Issues:** [GitHub Repo](https://github.com/dmz-digital/dmz-agents)

---
MIT © 2024 DMZ Labs. **Make your code alive.**

## Referências

- [Referência de Variáveis (.env.dmz)](./ENV_REFERENCE.md)
- [Schema do Banco (Supabase)](./setup_supabase.sql)
- [Capacidades dos Agentes](./capabilities/)
- [Painel DMZ OS](https://dmzos.netlify.app)
- [Repositório GitHub](https://github.com/dmz-agents/squad-template)
