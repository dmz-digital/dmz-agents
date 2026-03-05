# Como instruir os agentes para gerar UIs de qualidade

Guia prático para usar no system prompt da sua plataforma no Claude Code.

---

## Por que o modelo gera UIs mediocres por padrão

Sem instrução específica, o Claude otimiza para **correto e seguro** — não para **bonito e memorável**. Ele tende a:

- Usar fontes genéricas (Inter, Roboto, system-ui)
- Aplicar paletas neutras sem personalidade
- Gerar layouts previsíveis (header → hero → cards → footer)
- Evitar animações para não "arriscar"
- Usar `#ffffff` ou `#000000` em vez de tons ricos

A solução é injetar contexto estético no system prompt. O modelo tem o conhecimento técnico — ele só precisa de permissão e direção para aplicá-lo.

---

## Estrutura do system prompt para UI de qualidade

Um bom system prompt de design tem 4 camadas:

```
1. Direção estética (qual é o tom?)
2. Sistema de design (cores, tipografia, espaçamento)
3. Regras de animação (o que animar e como)
4. Anti-padrões proibidos (o que nunca fazer)
```

---

## 1. Direção estética

Diga ao modelo qual "sabor" de design você quer. Seja específico — quanto mais extremo e claro, melhor o resultado.

**Exemplos de direções que funcionam bem:**

```
# Tom: luxury dark
Crie interfaces com estética luxury/refinada. Dark backgrounds (#0A0A0F a #1C1D1E),
tipografia serif para títulos, detalhes dourados sutis, muito espaço negativo.
Inspire-se em marcas como Rolls-Royce, Cartier, escritórios de advocacia premium.

# Tom: brutalist/editorial  
Crie interfaces brutalistas. Tipografia pesada e oversized, grids quebrados,
cores primárias fortes com alto contraste, sem border-radius, sem sombras suaves.
Inspire-se em revistas de design europeu dos anos 90.

# Tom: soft/organic
Crie interfaces com estética orgânica e suave. Backgrounds off-white (#FAFAF7),
curvas generosas, sombras com cor (não cinza), tipografia humanista,
microinterações delicadas. Inspire-se em apps de bem-estar e lifestyle premium.

# Tom: tech/terminal
Crie interfaces com estética de terminal/código. Monospace fonts, verde/âmbar
em fundo escuro, borders com caracteres ASCII, animações de "typing", sem gradientes.
```

**O modelo vai inferir centenas de decisões a partir dessa direção** — não precisa especificar cada detalhe.

---

## 2. Sistema de design

Defina variáveis CSS obrigatórias que o modelo deve usar. Isso garante consistência mesmo em arquivos longos.

```
## Sistema de cores obrigatório

Sempre declare estas CSS variables no :root e use-as em todo o código.
Nunca use valores hexadecimais hardcoded fora das declarações de variáveis.

:root {
  --bg-primary: [sua cor];
  --bg-secondary: [sua cor];
  --text-primary: [sua cor];
  --text-muted: [sua cor];
  --accent: [sua cor];
  --border: rgba(..., 0.1);
}
```

```
## Tipografia obrigatória

Títulos (h1, h2, h3): font-family '[Sua fonte display]', sempre carregada via Google Fonts
Subtítulos: font-family '[Sua fonte sans]', font-weight: 200-300
Corpo: font-family '[Sua fonte sans]', font-weight: 400
Código: font-family 'JetBrains Mono', monospace

Nunca use: Inter, Roboto, Arial, system-ui como fonte principal.
```

---

## 3. Regras de animação

Especifique uma filosofia de animação. O modelo vai seguir.

```
## Filosofia de animação

PRINCÍPIO: Um reveal bem orquestrado na entrada da página vale mais
que dezenas de micro-interações espalhadas.

OBRIGATÓRIO em toda UI:
- Scroll reveal com IntersectionObserver (opacity 0→1 + translateY 20-30px)
- Transições de hover em todos os elementos interativos (0.2-0.3s ease)
- Delay escalonado entre elementos do mesmo grupo (0.1s entre cada)

OPCIONAL (usar com julgamento):
- Animação de entrada do hero (linha/elemento decorativo que "cresce")
- Parallax sutil em backgrounds (máximo 20% da velocidade do scroll)

PROIBIDO:
- Animações em loop infinito que não param (distrai)
- Efeitos que causam reflow (animar width, height, top, left)
- JavaScript para animações que o CSS consegue fazer
- Mais de 3 tipos diferentes de animação no mesmo arquivo

PERFORMANCE: Animar apenas transform e opacity.
Nunca animar: width, height, margin, padding, top, left, right, bottom.
```

---

## 4. Anti-padrões proibidos

Liste explicitamente o que o modelo não deve fazer. Isso é tão importante quanto o que ele deve fazer.

```
## Proibido em qualquer UI gerada

FONTES:
- Nunca usar: Inter, Roboto, Arial, Helvetica, system-ui como fonte principal
- Nunca usar font-weight: 400 para títulos (use 600, 700, 800 ou 300 para elegância)

CORES:
- Nunca usar #000000 ou #ffffff puros como background principal
- Nunca usar gradientes roxos em fundo branco (clichê de "AI app")
- Nunca distribuir cores igualmente — sempre ter uma cor dominante e acentos

LAYOUT:
- Nunca criar layouts completamente simétricos e centrados em tudo
- Nunca usar mais de 3 níveis de cards aninhados
- Nunca usar tabelas para layout (só para dados tabulares)

CÓDIGO:
- Nunca usar localStorage ou sessionStorage em Artifacts
- Nunca animar propriedades que causam reflow
- Nunca usar !important
- Sempre usar CSS variables, nunca valores hardcoded espalhados pelo CSS
```

---

## Os truques técnicos que fazem a diferença

Estes são os padrões que mais impactam a percepção de qualidade. Instrua o modelo a usá-los.

### Noise texture overlay

Adiciona profundidade orgânica a qualquer fundo escuro. Custo: zero performance.

```
Em toda UI com fundo escuro, adicione noise texture via SVG filter como
position: fixed, pointer-events: none, opacity: 0.3-0.5, z-index: 0.
Não use imagens externas — gere o SVG inline com feTurbulence.
```

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}
```

### Gradientes radiais para atmosfera

Criam aquele "glow" de luz ambiente sem imagens. Custo: praticamente zero.

```
Use radial-gradient em pseudo-elementos (::before, ::after) para criar
zonas de luz ambiente no background. Nunca em elementos de conteúdo.
Opacidade máxima: 0.15. Tamanho: 40-80% da viewport.
```

```css
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,106,247,0.12) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 20% 80%, rgba(79,172,222,0.06) 0%, transparent 60%);
  pointer-events: none;
}
```

### Scroll reveal escalonado

A ilusão de sistema animado complexo com código mínimo.

```
Implemente scroll reveal em todos os elementos de conteúdo usando
IntersectionObserver. Use classe .reveal com transition, e .visible
para o estado final. Adicione .reveal-delay-1 até .reveal-delay-5
para escalonamento entre elementos do mesmo grupo (0.1s cada).
```

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }
```

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target); // Para depois de revelar
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Bordas com opacidade em vez de sólidas

```
Nunca use border: 1px solid #333 em dark themes.
Use sempre: border: 1px solid rgba(255,255,255,0.08)
Para hover: border-color: rgba(255,255,255,0.16)
Para destaque: border-color: rgba([sua cor accent], 0.4)
Isso cria profundidade e funciona com qualquer background.
```

### CSS variables com semântica

```
Nomeie variáveis por função, não por valor.
Certo:   --border-subtle, --text-muted, --surface-elevated
Errado:  --gray-200, --dark-3, --color-1
O modelo deve inferir o uso correto pelo nome semântico.
```

---

## System prompt completo de exemplo

Este é um template pronto para usar. Substitua os valores entre colchetes.

```
Você é um engenheiro frontend especializado em criar interfaces de alta qualidade visual.

## Direção estética
[Descreva o tom aqui — ver seção 1]

## Sistema de design obrigatório
Sempre declare e use estas CSS variables:
:root {
  --bg: [cor];
  --surface: [cor];
  --text: [cor];
  --text-muted: [cor];
  --accent: [cor];
  --border: rgba(...);
}

Fontes obrigatórias via Google Fonts:
- Títulos: [fonte display]
- Corpo: [fonte sans] weights 300 e 400

## Animações
- Scroll reveal com IntersectionObserver em todo conteúdo de página
- Delays escalonados de 0.1s entre elementos do mesmo grupo
- Transições de hover em todos os elementos interativos (0.2-0.3s)
- Animar apenas opacity e transform — nunca width, height, margin

## Efeitos obrigatórios em dark themes
- Noise texture via SVG feTurbulence no body::before
- Gradientes radiais em pseudo-elementos para atmosfera
- Bordas com rgba, nunca cores sólidas

## Proibido
- Fontes: Inter, Roboto, Arial como fonte principal
- Cores: #000 ou #fff puros como background, gradiente roxo em fundo branco
- Código: localStorage, animações com reflow, valores hardcoded fora do :root
- Layout: simetria total, mais de 3 níveis de aninhamento

## Formato de output
Arquivo único autocontido. Todo CSS no <style>, todo JS no <script>.
Fontes carregadas via Google Fonts CDN. Sem arquivos externos além de fontes.
```

---

## Como adaptar para React / JSX

Para Artifacts React, o sistema é o mesmo mas com Tailwind e lucide-react.

```
## Para componentes React

Use Tailwind para utilitários básicos (padding, margin, flex, grid).
Use CSS-in-JS via style prop ou <style> tag para animações e efeitos
que Tailwind não cobre (keyframes, pseudo-elementos, variáveis CSS).

Ícones: sempre lucide-react. Nunca emojis como ícones funcionais.
Componentes complexos: shadcn/ui como base, customizado via className.

Animações em React: prefira CSS classes com transition ao invés de
bibliotecas de animação. Use useState para toggle de classes.
Motion library disponível para casos que precisam de física real.
```

---

## Resumo: o que mais impacta a qualidade percebida

Em ordem de impacto:

1. **Tipografia com hierarquia clara** — uma fonte display boa faz 60% do trabalho
2. **Sistema de cores coeso** — 3-4 cores com variáveis CSS, nunca valores espalhados
3. **Espaçamento generoso** — padding e margin maiores do que o instinto sugere
4. **Bordas com opacidade** — `rgba` em vez de sólidas em dark themes
5. **Scroll reveal escalonado** — dá ritmo e sensação de sistema vivo
6. **Noise texture** — profundidade orgânica gratuita em dark themes
7. **Gradientes radiais de atmosfera** — luz ambiente sem peso de imagens
8. **Hover states em tudo** — sinaliza interatividade e polimento
