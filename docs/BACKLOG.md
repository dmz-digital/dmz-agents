# Backlog - DMZ Agentes (Pipeline & Projetos)

## Demandas Futuras (Backlog de Alta Prioridade)
- Implementar a listagem dos chats segmentada pelas `tasks` correspondentes (atualmente está ausente da aba "memory" segundo relatado pelo usuário). Modificar select UI padrão do sistema mobile para o componente de biblioteca CustomSelect com ícones.
- Expandir e documentar o fluxo detalhado de uploads de base64 e "chunked files" (Arquivos com mais de 30MB) em filas Rabbit/Redis para não droppar serviços Edge Functions devido ao hard-limit da Vercel.
- Polimento no Layout de landing pages, painéis e "Home" dos Agentes DMZ conforme sugestão constante do usuário nos wireframes (`Wis Legal` model, containers com CSS `code`).

## Backlog de Baixa Prioridade (Melhorias Contínuas de Arquitetura)
- Suporte a geração de múltiplos conteúdos (e.g. "Crie 3 imagens", etc).
- Padronização em todos os projetos frontend gerados por IA para inicializar via `npx shadcn@latest`.
