# On Going - Ferramentas e Configurações

## Status Geral: `BUILDING & ADAPTING` 🛠

- [ ] **Configuração do Shadcn/UI**:
  Acabamos de injetar as propriedades base do `@shadcn/ui` na plataforma Next.js (`components.json`, utilitários, dependências `clsx` e `tailwind-merge` em `src/lib/utils.ts` e CSS scope em `globals.css`).
  - **Próximos passos**: Substituir modais, caixas de diálogo, switchers, popovers genéricos para a biblioteca padronizada do OS DMZ (criando uma uniformidade massiva e modular em todos os projetos gerados por esses Agentes em prol de nossos usuários).
 
- [ ] **Agente ORCH em Operação**:
  Atualmente, o script no Python backend `orch_kickoff.cjs` inicia o ciclo de trabalho de `router` dos prompts dos usuários. Por vezes, dependendo do input, ele designava a resposta logo de cara ou quebrava no meio de sub-agentes não instanciados perfeitamente (falha de comunicação com "Hasbik" e falhas de Quota). Nosso objetivo contínuo nas próximas iterações é limpar a Queue do redis.
