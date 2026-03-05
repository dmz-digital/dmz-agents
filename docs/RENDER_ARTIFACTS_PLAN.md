# Plano de Implementação: Renderização Avançada de Arquivos (Estilo Artifacts do Claude)

Este plano detalha como expandir a capacidade atual do DMZ OS Chat (que já suporta Iframe HTML básico) para um sistema completo de renderização e download de múltiplos formatos de arquivo, operado pelo Squad de Agentes.

## Fases de Implementação

### Fase 1: Padronização da Saída dos Agentes (Backend Python)
O orquestrador e os agentes (especialmente Ryan, Aurora e Theron) precisam de um formato padrão para retornar "Arquivos/Artefatos" em vez de apenas blocos Markdown.

1. **Definição de Tags de Arquivo:**
   Instruir os LLMs nos Prompts de Sistema para encapsular conteúdos completos complexos dentro de tags XML-like ou JSON estruturado na resposta.
   *Exemplo:*
   ```xml
   <dmz_artifact type="html" filename="landing-page.html" title="Landing Page Wis Legal">
     <!-- código html completo -->
   </dmz_artifact>
   ```

2. **Geração de Arquivos Binários via Backend:**
   Se o agente for instruído a criar um `.docx` ou `.pdf` (ex: Theron gerando um contrato legislativo), o backend em Python (FastAPI/Flask) irá processar essa requisição.
   - O LLM gera o conteúdo estruturado (ex: markdown).
   - O Python usa bibliotecas como `python-docx` ou `WeasyPrint` (para PDF) para compilar o arquivo.
   - O backend faz o upload do arquivo gerado para o bucket do Supabase Storage.
   - O backend retorna a URL pública gerada no chat com metadata indicando que o arquivo está pronto.

### Fase 2: O Pipeline de Ferramentas (Functions/Tools no LangChain/Supabase)
Injetar funções reais (`Tools`/`Function Calling`) nos modelos Gemini/Claude rodando pelo Backend DMZ:
- `create_ui_component`: Para geração de JSX/React e HTML estático.
- `generate_contract_pdf`: Específico para o Theron gerar um documento formatado em PDF e injetar a URL no Supabase Bucket.
- `generate_presentation_pptx`: Para outputs corporativos baseados em tópicos.

### Fase 3: Evolução do Frontend React (O "Visualizador Universal")
Nós já criamos o Iframe isolado para HTML. Precisamos transformá-lo em um leitor de múltiplos formatos (O Preview Panel do DMZ OS).

1. **Parser de Artefatos:**
   Atualizar o `formatMessageBlocks` no `page.tsx` para identificar a tag `<dmz_artifact>` e extrair seu conteúdo, tipo e título.

2. **O Painel de Visualização (Preview Panel):**
   Ampliar nosso painel lateral recém-criado para suportar diferentes "Visualizadores" (Viewers) baseados na extensão do arquivo devolvido:
   * **HTML/CSS/JS Sandbox:** Manter o `iframe` usando `srcDoc` (já em andamento, só falta refinamento mobile).
   * **React/JSX Sandbox:** Integrar uma solução leve in-browser (como Sandpack da CodeSandbox) para renderizar componentes interativos gerados sob demanda (se necessário no futuro, ou manter apenas HTML por estabilidade inicial).
   * **Visualizador de PDF:** Usar a tag `<object>` ou `iframe` nativa do HTML apontando para o arquivo no Supabase para visualizar o PDF inline;
   * **Mídia Nativa:** Visualização de SVG, gráficos (Recharts embeddados) inline ou grandes imagens tratadas na resposta.
   * **Card de Arquivos para Download:** Para `.docx`, `.pptx`, `.xlsx`, que não são renderizáveis de forma segura via browser puro, criar um Componente React "FileCard" bonitão na UI (usando as cores e estética Shadcn que adotamos) com botão claro para Download.

### Fase 4: Integração de Libs Externas Autocontidas HTML
Assim como o Claude faz de usar CDNs públicos:
- Vamos definir no system prompt (do Agente Ryan/Aurora) que todo HTML fornecido deva usar as versões via CDN do Tailwind CSS (via script), Lucide Icons, e Google Fonts de forma que o Iframe os carregue fluidamente. Isso garante que as Landing Pages geradas ficarão absurdamente profissionais imediatamente da caixa.

---

## Próximos Passos Imediatos para Execução:
- [ ] Atualizar o System Prompt da API Python no `server/main.py` para introduzir o ensinamento sobre as tags `<dmz_artifact>`.
- [ ] No `page.tsx`, melhorar a regex do parser de mensagens para "sequestrar" o conteúdo dessa tag e disparar a janela lateral.
- [ ] Testar simulando o agente devolvendo um "Contrato" e visualizar se um "FileDownload Card" fica perfeitamente posicionado.
