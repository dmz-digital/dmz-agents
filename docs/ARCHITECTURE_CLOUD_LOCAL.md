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

Na IDE do cliente (Antigravivy, VS Code, Cursor, etc), ou seja, na pasta do projeto real (ex: `yvoo-studio`), a interferência do DMZ OS é mínima. Instalamos apenas um **Agent Client (A ponte CLI)**.

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
- Ele navega para a pasta local do seu projeto (ex: `~/Documentos/meu-app`).
- **Instalação Instantânea (One-liner):** O cliente simplesmente copia e cola o comando oficial do README:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/eldanielsantos-git/dmz-agents/main/install.sh | bash
  ```
  *Nota: Não é necessário alterar nada na URL. Este comando baixa o instalador inteligente que configura o CLI `dmz-os` automaticamente no sistema.*
- Após a instalação do CLI, ele roda: `dmz-os install`.
- O CLI interativamente pede a chave DMZ e valida o repositório Git em tempo real.
  *Nota: A URL de conexão com a infraestrutura DMZ é preenchida automaticamente. O cliente NÃO precisa fornecer seu próprio Supabase; o CLI se conecta à nossa nuvem para buscar as diretrizes do squad.*
- Magicamente um `.env.dmz` aparece localmente, porém o CLI já **atualiza o `.gitignore` na hora** impedindo essas credenciais de subirem pro Github dele.

**Passo 3: Iniciando o Robô / Universal Execution Engine**
- O cliente digita `dmz-os start`. O sistema ativa nosso **Universal Execution Engine**.
- **A Ponte Inteligente:** Diferente de sistemas comuns, o CLI não roda apenas o "Orquestrador". Ele atua como um despachante universal:
   - Se houver um card para a `@cassandra`, o motor local a invoca.
   - Se o card for para o `@dev`, o motor local assume a persona do desenvolvedor.
   - Isso permite que **todo o squad** trabalhe na sua máquina local de forma coordenada, sem que você precise abrir múltiplos terminais.
- **Fluxo Bilateral:**
   - **Caminho A (Web → IDE):** Você cria um card no Kanban Web. O motor local percebe a demanda, assume o agente responsável e começa a codar/escrever na sua pasta real. Ao concluir, ele move o card para **Done**.
   - **Caminho B (IDE → Web):** Pelo terminal você roda `dmz-os ask "@syd refatora o componente X"`. A CLI cria o card "PRIORIDADE" no Kanban Web e o squad já começa a agir.

**Passo 4: Validação e Deploy Final**
- No Kanban Web, quando o squad termina uma tarefa ela entra em **Done**.
- O cliente revisa e clica em **"Aprovar"**. Isso move a task para o status **Approved**, garantindo que o código está validado pelo humano.
- O cliente então faz o `git push` final. Ele verá apenas os maravilhosos novos componentes codados (nenhum rastro da mecânica dos Agentes, tudo invisível).
- Ele faz deploy na Vercel e o projeto brilha!

**Passo 5: Invocação Nativa pelo Chat da IDE (Canal Oficial)**
- O DMZ OS é projetado para que o desenvolvedor **nunca precise sair do chat da IDE** para comandar o squad.
- **Como funciona:** Durante a instalação, o CLI cria um arquivo de regras inteligente (`.cursorrules` ou similar). Isso "ensina" a IA assistente da sua IDE (Antigravity, Cursor, Windsurf) a reconhecer o seu squad.
- **Uso no Chat:** basta digitar normalmente no chat lateral da IDE:
   - *"@orch cria a modelagem desse banco"*
   - *"@cassandra revisa o texto deste arquivo"*
- **A Ponte Automática:** Ao ver o `@`, a IA da IDE não tentará fazer a tarefa sozinha; ela automaticamente invocará o comando `dmz-os ask` em segundo plano para você.
- Isso garante que a demanda vire um card oficial no Kanban Cloud e que o agente especialista correto assuma o trabalho.
- O Terminal continua disponível como alternativa (`dmz-os ask "@agente ..."`), mas o Chat da IDE é agora a interface prioritária e sugerida.

---

Essa arquitetura assíncrona, de altíssima segurança (chaves em `.env` imutáveis que não são "commitadas") e que divide a "Nuvem de Inteligência/Painel UI" contra a "IDE Tática Operacional de Trabalho" confere credibilidade de nível Enterprise ao nosso Pack de Agentes!
