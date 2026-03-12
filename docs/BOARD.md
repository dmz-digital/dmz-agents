# 🎯 DMZ Agents — Development Board
> Última atualização: 2026-03-12 13:25 (GMT-3)

---

## 📋 Master Plan
> O que precisa ser feito

### Fase 4 — CLI Integration
- [ ] Autenticação via slug + API key no CLI
- [ ] Engine local reporta tasks para Supabase
- [ ] Engine local salva memórias scoped por projeto
- [ ] Sync de prompts/skills da plataforma

### Fase 5 — Polish
- [ ] Limpeza de arquivos órfãos
- [ ] Atualização de docs
- [ ] SuperAdmin: visualização cross-client
- [ ] Notificações de updates de agentes
- [ ] Refatorar navegação (floating nav pill) para novas rotas

---

## 🔥 On Going
> Em execução agora

### Fase 4 — CLI Integration
- [ ] Autenticação via slug + API key no CLI
- [ ] Engine local reporta tasks para Supabase
- [ ] Engine local salva memórias scoped por projeto
- [ ] Sync de prompts/skills da plataforma

---

## ✅ Done
> Concluído

### Fase 3 — Kanban + Wizard Refatorado ✅
- [x] Testar fluxo completo no browser (criar projeto + board + memory)
- [x] Validar drag-and-drop horizontal e vertical e realtime do Kanban
- [x] Wizard: criar projeto → gerar slug + API Key (client-side)
- [x] Wizard: selecionar agentes para o projeto (por categoria)
- [x] Wizard: tela de sucesso com credenciais
- [x] Wizard: snippet .env.dmz configurado

### Fase 1 — Fundação (Banco + RLS) ✅
- [x] Criar function `is_superadmin()`
- [x] Adicionar `api_key` + tornar `owner_id` NOT NULL em `dmz_agents_projects`
- [x] Gerar API keys para projetos existentes (`dmz_pk_xxx`)
- [x] Alterar CHECK constraint de `dmz_agents_tasks.type` → master_plan, on_going, done, rework
- [x] Migrar dados de task_checklist/backlog para novos tipos
- [x] Adicionar campos `assigned_by`, `completed_by`, `completed_at` em tasks
- [x] Habilitar RLS em todas as tabelas `dmz_agents_*` + `admin_system_models`
- [x] Consolidar `dmz_agents_squad` → `dmz_agents_project_agents`

### Fase 2 — Frontend: Rotas + Board Kanban ✅
- [x] Lista de projetos em `/app/projects` (cards com stats, API key reveal, agents avatars)
- [x] Rota dinâmica `/app/projects/[slug]` com Kanban Board (catch-all `[[...slug]]`)
- [x] Kanban Board com colunas: Master Plan | On Going | Done | Rework
- [x] Drag & drop entre colunas com atualização automática de status
- [x] Realtime via Supabase para tasks
- [x] Modal de criação de tasks com assignment a agentes do squad
- [x] Sub-rota `/app/projects/[slug]/memory` com memória scoped por projeto
- [x] Painel de Config com slug, API key, snippet .env.dmz



### Análise & Setup ✅
- [x] Varredura completa do projeto
- [x] Análise arquitetural documentada (`dmz_architecture_analysis.md`)
- [x] Board de desenvolvimento criado
- [x] Fix do tsconfig (excluir _dmz-agents-backup, cli, server do TypeScript)
- [x] Fix do Netlify redirects para rotas dinâmicas
- [x] Build produção compilando ✅

---

## 🔄 Rework
> Precisa ser refeito

_(vazio por enquanto)_

---

### 🤖 Governança de Agentes no Kanban
| Papel | Agente | Responsabilidade |
|-------|--------|-----------------|
| **Planejador** | `@orch` (Orchestrator) | Cria itens no Master Plan, define estratégia, delega tasks aos especialistas |
| **Gestor de Fluxo** | `@syd` (Squad Manager) | Move tasks entre colunas, acompanha status, identifica bloqueios, sugere rework |
| **Executor** | _Agente designado_ | Atualiza status da própria task, registra progresso e completude |

---

> **Responsável:** @antigravity + @santos  
> **Projeto:** DMZ Agents Platform  
> **Repo:** dmz-agents
