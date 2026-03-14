# Guia de Arquitetura DMZ OS: Cloud x Local (BaaS AI)

Este documento detalha o paradigma de **Backend as a Service para Agentes (BaaS AI)** utilizado pelo DMZ OS. O foco principal é esclarecer fronteiras: o que o DMZ opera na Nuvem (Cloud) e o que se instala na máquina/repositório local do desenvolvedor/cliente.

## 🌟 O Conceito Principal
O DMZ OS funciona como um grande "Escritório em Nuvem" para sua agência de desenvolvimento movida a IA. Os agentes da DMZ "moram" nos servidores da DMZ e só enviam seus resultados para a máquina local do desenvolvedor através de uma ponte API.

Nós **nunca** empacotamos o sistema do Kanban, Autenticação, Painel de Controle e Motor de IA no projeto do cliente. O projeto do cliente fica limpo! 

---

## ☁️ O que fica na Plataforma Web (Cloud DMZ)

A plataforma centralizada (ex: `agents.dmzdigital.com.br`) opera todo o cérebro e estado da gestão do projeto:

1. **Painel do Usuário:** Onde o cliente ou gestor visualiza seu Kanban em tempo real.
2. **Setup de Agentes:** Toda a base de dados (`dmz_agents_definitions`), contendo todos os prompts de segurança, personas (ex: @orch, @alex, @cassandra) e hierarquias (Senior, Pleno).
3. **Database Principal:** 
   - `dmz_agents_projects` (Cadastro dos projetos, suas configurações e chaves de acesso).
   - `dmz_agents_tasks` (O Kanban! A origem da verdade sobre o que está Planejado, Fazendo ou Feito).
   - `dmz_agents_memory` (Contexto de discussões anteriores, logs das intenções de cada agente para criar uma cronologia perfeita).
4. **Segurança (RLS & Rework):** Controle estrito sobre a quais projetos cada chave de API local tem acesso e gestão automatizada de refações de QA.

---

## 💻 O que fica na Máquina (IDE Local) / Repositório do Cliente

Na IDE do cliente (VS Code, Cursor, etc), ou seja, na pasta do projeto real (ex: `yvoo-studio`), a interferência do DMZ OS é mínima. Instalamos apenas um **Agent Client (A ponte CLI)**.

### A Estrutura Local (Apenas 2 arquivos que o cliente nota)

1. **A Pasta Oculta `.agents/`**  **(Local Only - Não sobe pro Git)**
   - Criada automaticamente no comando `dmz-os install`.
   - Contém puramente as dependências Python transitórias para que os agentes possam interagir com a internet e a leitura do projeto (ex: `requirements.txt`).
   - Esta pasta é instantaneamente interceptada e adicionada ao `.gitignore` oficial do projeto.

2. **O Arquivo `.env.dmz`** **(Local Only - Não sobe pro Git)**
   - O crachá de identificação. Contém a Chave Única de Segurança (`DMZ_API_KEY`) ligada especificamente a este projeto no Cloud, mais o `DMZ_PROJECT_SLUG`.
   - Pode possuir chaves primárias do OpenAI/Anthropic que o cliente deseja embutir.
   - Isso garante que a máquina inteja sem fricção com o banco Cloud do DMZ OS de onde os agentes estão baixando as demandas.

### E O Repositório Git do Cliente? 
A beleza do nosso sistema se encontra aqui. O desenvolvedor/gestor irá empurrar (Push/Deploy) para o GitHub/Vercel dele **APENAS OS RESULTADOS**: 
   - Apenas o código do site ou aplicação (ex: Next.js).
   - As imagens que o agente de UI criou.
   - O Tailwind configurado pelo squad.

Nada do "Motor DMZ" sobe para o Github final das agências ou projetos criados. O DMZ é um "funcionário Invisível" que ajudou a construir a fundação via terminal.

---

## 🛠️ Passo a Passo Prático no Uso do DIA a DIA

**Passo 1: Cliente Cria o Projeto**
- O cliente acessa [agents.dmzdigital.com.br](https://agents.dmzdigital.com.br).
- Cria o projeto `yvoo-studio`, define o nome no painel Web DMZ e clica em **"Gerar Key de Instalação"**.
- Atribui ao projeto os Agentes da "Agência DMZ" que quer trabalhar (ex: O time de Copy, o Dev e o Tech Lead).

**Passo 2: Cliente Instala o Squad no Computador dele**
- Ele navega para a pasta local em branco `~/Documentos/yvoo-studio` (seu IDE via Cursor/VSCode).
- Roda o comando no terminal (baixando nossa lib via pip): `dmz-os install`.
- O CLI interativamente pede a chave DMZ dele.
- Magicamente um `.env.dmz` aparece localmente, porém o CLI já **atualiza o `.gitignore` na hora** impedindo essas credenciais de subirem pro Github dele.

**Passo 3: Iniciando o Robô / Comunicação Bilateral**
- O cliente digita `dmz-os start`. O Orquestrador acorda e estabelece o link contínuo com a nuvem DMZ.
- **Dois Caminhos de Ação (A Ponte Bilateral):**
   - **Caminho A (Web → IDE):** O cliente cria um Card no painel web ("Crie uma página de Login bonita"). No mesmo segundo, como um webhook, o Agente local percebe o card, pega o código e começa a trabalhar escrevendo na máquina em tempo real. Quando terminar, move sozinho a Task no Kanban Web para Done.
   - **Caminho B (IDE → Web):** O cliente já está codando mas bateu a frustração. Pelo terminal do IDE ele roda: `dmz-os ask "Refatora o auth, quebrou meu token!"`. Essa intenção é fisgada pela CLI Local, que, sem o usuário ter que logar na internet, aciona nossa API REST Cloud. Um Card "PRIORIDADE" nasce instantaneamente no Kanban DMZ para o `@orch` resolver.

**Passo 4: O Deploy Final do Cliente**
- Quando tudo estiver pronto, ele apenas diz `git status`. Ele rodará `git add .` e verá apenas seus maravilhosos novos componentes em React codados pelos Especialistas (nenhum rastro da mecânica dos Agentes, tudo invisível).
- Ele faz deploy na Vercel e o projeto brilha!

**Passo 5: Invocação Direta de Agentes pela IDE**
- O cliente pode e **deve** interagir com agentes específicos diretamente de sua IDE através do nosso CLI.
- Por padrão, rodar apenas `dmz-os ask "Cria uma landing page"` envia a demanda genérica para o painel Master Plan, acionando o nosso orquestrador-chefe (`@orch`), que então decide quem vai trabalhar.
- Porém, caso o cliente já saiba quem ele quer acionar (por exemplo, pedir um texto direto para a Copy Chief), ele pode mencionar (taguear) o agente diretamente na linha de comando:
   - `dmz-os ask "@cassandra escreve um e-mail persuasivo para vender meu curso"`
   - `dmz-os ask "@syd como está o andamento da sprint? Faz um resumo"`
   - `dmz-os ask "@alex analisa a arquitetura atual do meu banco Supabase"`
- Nossa ponte local detecta a tag (`@nome`) e despacha o card **diretamente para a fila pessoal daquele agente** no Kanban, acelerando fluxos e isolando discussões extremamente técnicas da visão geral do Master Plan.

---

Essa arquitetura assíncrona, de altíssima segurança (chaves em `.env` imutáveis que não são "commitadas") e que divide a "Nuvem de Inteligência/Painel UI" contra a "IDE Tática Operacional de Trabalho" confere credibilidade de nível Enterprise ao nosso Pack de Agentes!
