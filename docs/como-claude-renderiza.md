# Como o Claude cria e exibe arquivos e interfaces

Guia técnico do pipeline de execução: do prompt ao arquivo renderizado. Útil para treinar modelos ou integrar em ferramentas próprias.

---

## Visão Geral

O Claude não tem UI própria — ele é um modelo de linguagem rodando dentro de uma interface hospedada pela Anthropic (claude.ai) ou por terceiros via API. Tudo que o Claude "mostra" visualmente é resultado de ferramentas (tools) que ele chama durante a resposta.

```
Mensagem do usuário
  → Claude processa
  → Decide qual tool usar
  → Executa tool call
  → Interface renderiza o resultado
```

O claude.ai intercepta as tool calls do modelo e renderiza seus resultados com componentes visuais especiais. Quando o Claude usa `present_files`, o arquivo é exibido inline. Quando usa `bash_tool`, executa num container Linux isolado.

---

## Pipeline de execução

Quando o usuário pede "crie uma landing page", o Claude executa esta sequência antes de mostrar qualquer resultado:

### 01 — Lê as skills disponíveis

Antes de escrever qualquer código, o Claude verifica `/mnt/skills/` para ver se existe um `SKILL.md` relevante. Esses arquivos contêm instruções condensadas de boas práticas — como gerar `.docx`, `.pptx`, `.pdf`, ou design frontend. Ele usa a `view` tool para ler o arquivo antes de começar.

### 02 — Planeja o que criar

Define qual tipo de arquivo é mais adequado: `.html` renderizável, `.jsx` React, `.docx` para download, etc. Essa decisão muda toda a stack usada.

### 03 — Cria o arquivo no container Linux

Usa `create_file` ou `bash_tool` para escrever o arquivo em `/home/claude/`. Para arquivos complexos (`.docx`, `.pptx`), roda scripts Node.js ou Python com bibliotecas instaladas no container.

### 04 — Move para o diretório de outputs

Copia o arquivo final para `/mnt/user-data/outputs/`. Esse é o único diretório acessível pelo usuário — arquivos em `/home/claude/` são invisíveis para quem está na interface.

### 05 — Apresenta via present_files

Chama `present_files` com o caminho do arquivo. O claude.ai recebe esse sinal e renderiza o arquivo inline no chat: HTML como iframe, imagens como preview, outros como link de download.

---

## Ferramentas disponíveis

| Tool | O que faz | Quando usar |
|------|-----------|-------------|
| `bash_tool` | Executa comandos bash num container Ubuntu 24 isolado. Pode instalar pacotes, rodar scripts, compilar código. | Criar arquivos complexos (.docx, .pptx), rodar código, instalar dependências |
| `create_file` | Cria um arquivo com conteúdo diretamente, sem precisar do bash. | Criar arquivos de texto, HTML, CSS, JS quando o conteúdo já está pronto |
| `str_replace` | Substitui uma string única dentro de um arquivo existente. | Editar arquivos grandes sem reescrever tudo |
| `view` | Lê arquivos ou lista diretórios. Suporta imagens, texto, PDFs. | Ler skills, inspecionar uploads, revisar arquivos criados |
| `present_files` | Registra arquivos para exibição na interface do claude.ai. | Sempre ao final, para entregar o output ao usuário |
| `web_search` | Pesquisa na web via motor de busca. | Informações recentes, documentação, verificar APIs |
| `web_fetch` | Faz fetch de uma URL específica e retorna o conteúdo. | Ler documentação, artigos, páginas específicas |

> **Atenção:** O `bash_tool` não tem acesso à internet. Web search e fetch são tools separadas que rodam fora do container.

---

## Tipos de arquivo e renderização

Nem todo arquivo é renderizado igual. O claude.ai tem tratamento especial para alguns formatos — os demais viram links de download.

| Extensão | Renderizado como | Notas |
|----------|-----------------|-------|
| `.html` | iframe inline | Renderizado diretamente no chat. CSS, JS e fontes externas via CDN funcionam. |
| `.jsx` / `.tsx` | React renderizado | O claude.ai compila e renderiza componentes React com Tailwind + libs disponíveis. |
| `.md` | Markdown formatado | Renderizado com tipografia, headers, listas, código. |
| `.svg` | Imagem inline | Exibido diretamente. |
| `.mermaid` | Diagrama | Compilado e exibido como diagrama visual. |
| `.pdf` | Preview + download | Preview inline na maioria dos browsers. |
| `.docx` / `.pptx` / `.xlsx` | Download | Não renderizado inline. O usuário baixa e abre no Office / Google Docs. |
| `.png` / `.jpg` | Imagem inline | Exibida diretamente no chat. |

---

## Como o HTML é renderizado

Quando um arquivo `.html` vai para `/mnt/user-data/outputs/` e o Claude chama `present_files`, o claude.ai carrega esse arquivo num **iframe sandboxado**.

**O que funciona:**
- CSS puro, JavaScript vanilla
- Fontes via Google Fonts CDN
- Animações CSS, Intersection Observer, scroll behavior
- SVGs inline, imagens base64
- Scripts carregados de `cdnjs.cloudflare.com` e outros CDNs públicos

**O que não funciona:**
- `localStorage` / `sessionStorage` — bloqueados no ambiente do claude.ai. Para persistência em Artifacts React, o Claude usa a `window.storage` API proprietária
- Fetch para APIs externas — pode falhar dependendo da política CORS do destino dentro do iframe sandboxado

**Estrutura típica de um arquivo HTML gerado:**

```html
<!-- O arquivo é completamente auto-contido -->
<!DOCTYPE html>
<html>
<head>
  <!-- Fontes via CDN externo -->
  <link href="https://fonts.googleapis.com/css2?family=..." />

  <style>
    /* Todo CSS inline, sem arquivos externos */
    :root { --color: #1C1D1E; }
  </style>
</head>
<body>
  <!-- Conteúdo... -->

  <script>
    // JS vanilla inline, sem imports externos
    const observer = new IntersectionObserver(...);
  </script>
</body>
</html>
```

---

## Esquema de ícones

A escolha do sistema de ícones depende do tipo de output sendo gerado.

### SVG inline manual
Ícones desenhados diretamente no HTML com `<svg>`, `path`, `circle` etc. Leves, sem dependências, totalmente customizáveis. Usado em HTML puro para manter o arquivo autocontido.

- **Contexto:** HTML puro

### lucide-react
Biblioteca de ícones mais usada nos Artifacts React. Ícones limpos, traço fino, estilo moderno.

- **Contexto:** React / JSX
- **Import:** `import { Search, Bell, FileText } from 'lucide-react'`
- **Versão disponível:** 0.263.1

```jsx
import { Search, Bell, Settings, User, ChevronRight,
         FileText, BarChart2, Shield, Zap, ArrowUpRight,
         Check, X, Plus, Minus, Menu, ExternalLink } from 'lucide-react'

// Uso básico
<Search size={18} strokeWidth={1.5} className="text-gray-400" />
```

### shadcn/ui
Biblioteca de componentes completa (botões, modais, inputs, cards). Usa Lucide internamente para ícones.

- **Contexto:** React / JSX
- **Import:** `import { Button, Card } from '@/components/ui/button'`

---

## Stack por contexto

| Output | Linguagem / Lib | Ícones | Onde roda |
|--------|----------------|--------|-----------|
| `.html` (landing, doc) | HTML + CSS + JS vanilla | SVG inline | iframe no claude.ai |
| `.jsx` (componente, app) | React + Tailwind + lucide-react | lucide-react | Renderer React do claude.ai |
| `.docx` | Node.js + lib `docx` | N/A | Container Linux → download |
| `.pptx` | Python + `python-pptx` | N/A | Container Linux → download |
| `.xlsx` | Python + `openpyxl` | N/A | Container Linux → download |
| `.pdf` | Python + `reportlab` ou `weasyprint` | N/A | Container Linux → preview/download |
| `.svg` | SVG puro ou gerado via Python | Paths inline | Imagem inline no chat |

### Bibliotecas disponíveis nos Artifacts React (sem instalação)

```jsx
// UI e ícones
import { Camera, Search } from 'lucide-react'           // v0.263.1
import { Button, Card } from '@/components/ui/button'   // shadcn/ui

// Gráficos e dados
import { LineChart, BarChart } from 'recharts'
import * as d3 from 'd3'
import * as Plotly from 'plotly'
import * as math from 'mathjs'

// 3D e animações
import * as THREE from 'three'       // r128
import * as Tone from 'tone'         // áudio

// Dados e arquivos
import * as XLSX from 'SheetJS'
import * as Papa from 'papaparse'
import * as mammoth from 'mammoth'   // .docx → HTML
import * as tf from 'tensorflow'

// Utilitários
import _ from 'lodash'
import { useState, useEffect, useRef } from 'react'
```

---

## Usar no Claude Code

O Claude Code é a CLI da Anthropic que roda o Claude em modo agêntico no seu próprio ambiente. O pipeline é similar, mas as ferramentas rodam localmente na sua máquina.

### Diferenças principais vs. claude.ai

| Aspecto | claude.ai | Claude Code |
|---------|-----------|-------------|
| Sistema de arquivos | Container isolado (`/mnt/`, `/home/claude/`) | Filesystem local real |
| Rede no bash | Bloqueada | Disponível (npm, pip, curl funcionam) |
| `present_files` | Disponível — renderiza inline | Não existe |
| Renderização HTML | iframe automático no chat | Você abre no browser manualmente |
| React / JSX | Compilado e renderizado pelo claude.ai | Precisa de projeto configurado localmente |

---

## Replicar via API

Para construir uma ferramenta própria que imite o que o claude.ai faz, o fluxo é um loop de tool calls.

### Chamada básica com tools

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    tools: [
      {
        name: "create_file",
        description: "Cria um arquivo com o conteúdo especificado",
        input_schema: {
          type: "object",
          properties: {
            path: { type: "string" },
            content: { type: "string" }
          }
        }
      }
    ],
    messages: [{ role: "user", content: prompt }]
  })
});

const data = await response.json();

// Processar tool calls da resposta
for (const block of data.content) {
  if (block.type === "tool_use") {
    // Claude quer usar uma tool — execute e devolva o resultado
    const result = await executeTool(block.name, block.input);

    // Continue a conversa com o tool_result
    messages.push(
      { role: "assistant", content: data.content },
      { role: "user", content: [{
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result)
      }] }
    );
  }
}
```

### Executar tools e renderizar HTML

```javascript
async function executeTool(name, input) {
  switch (name) {
    case "create_file":
      // Salva no estado da sua app ou filesystem
      files[input.path] = input.content;
      return { success: true, path: input.path };

    case "present_files":
      // Renderiza na sua UI
      input.filepaths.forEach(path => {
        const content = files[path];
        if (path.endsWith('.html')) renderHTML(content);
        else offerDownload(path, content);
      });
      return { success: true };
  }
}

function renderHTML(html) {
  // Cria blob URL e injeta em iframe — replica o que o claude.ai faz
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  document.getElementById('preview').src = url;
}
```

> **Modelo recomendado:** Para tasks com geração de arquivos e múltiplas tool calls, use `claude-sonnet-4-20250514` — balanço ideal entre capacidade e velocidade para loops agênticos.

---

## Resumo do fluxo completo

```
1. Usuário envia mensagem
2. Claude verifica /mnt/skills/ com view tool
3. Claude decide stack e tipo de arquivo
4. Claude cria arquivo em /home/claude/ via create_file ou bash_tool
5. Claude move para /mnt/user-data/outputs/
6. Claude chama present_files com o path
7. claude.ai renderiza inline (HTML → iframe, imagem → preview, outros → download)
```

Para replicar em ferramenta própria:
- Implemente as tools como funções locais
- Execute o loop de tool calls até `stop_reason === "end_turn"`
- Renderize HTML via `<iframe srcdoc>` ou blob URL
- Para outros formatos, ofereça download direto
