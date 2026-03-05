# Bibliotecas via CDN para HTML gerado em iframe

Seu HTML roda isolado — sem acesso ao Next.js, node_modules ou bundler.
A solução é carregar tudo via CDN dentro do próprio arquivo gerado.
Instrua o Claude a incluir esses scripts no `<head>` conforme necessário.

---

## O problema atual (e por que acontece)

Quando o Claude gera HTML puro sem instrução específica, ele tende a:
- Escrever CSS do zero, inconsistente entre gerações
- Usar fontes genéricas (system-ui, Arial)
- Criar animações básicas ou nenhuma
- Inventar componentes simples em vez de usar algo sólido

A solução é dar ao modelo um **design system pré-carregado via CDN**
que ele pode usar em vez de reinventar tudo a cada geração.

---

## Stack recomendada para iframe HTML

### Camada 1 — Tipografia (impacto imediato)

```html
<!-- Google Fonts — carregue no <head>, antes de qualquer CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Opção A: Stack premium dark (elegante, editorial) -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">

<!-- Opção B: Stack moderna geométrica -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">

<!-- Opção C: Stack humanista/orgânica -->
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

**Por que tipografia primeiro:** é o fator de maior impacto visual com menor esforço.
Uma fonte display boa faz 60% do trabalho de design.

---

### Camada 2 — Utilitários CSS (consistência entre gerações)

#### Tailwind CSS via CDN
O modelo conhece Tailwind muito bem — carregá-lo no iframe elimina
inconsistências de spacing, cores e breakpoints entre gerações.

```html
<!-- Tailwind v3 via CDN — funciona sem build step -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Configurar tema customizado logo após -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          // Defina suas cores aqui — o modelo vai usar pelo nome
          brand: {
            50:  '#f0f4ff',
            500: '#4F6AF7',
            900: '#1a1f3a',
          },
          surface: '#111118',
        },
        fontFamily: {
          display: ['Fraunces', 'Georgia', 'serif'],
          sans:    ['DM Sans', 'sans-serif'],
          mono:    ['JetBrains Mono', 'monospace'],
        }
      }
    }
  }
</script>
```

> **Atenção:** Tailwind via CDN não suporta `@apply` nem purging.
> Funciona perfeitamente para geração de UI — só não use em produção direta.

---

### Camada 3 — Animações (o maior gap atual)

#### GSAP (GreenSock) — melhor opção geral
O modelo conhece GSAP muito bem. Produz animações suaves, com física real,
sem problemas de performance.

```html
<!-- GSAP core + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Uso básico que o modelo deve seguir -->
<script>
  gsap.registerPlugin(ScrollTrigger);

  // Scroll reveal em todos os .reveal
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: i * 0.05,
      ease: 'power2.out'
    });
  });
</script>
```

#### Motion One — alternativa leve e moderna
Mais simples que GSAP, baseada na Web Animations API nativa.

```html
<script src="https://cdn.jsdelivr.net/npm/motion@10.16.4/dist/motion.js"></script>

<script>
  const { animate, scroll, inView } = Motion;

  // Reveal ao entrar na viewport
  inView('.reveal', ({ target }) => {
    animate(target,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)'] },
      { duration: 0.6, easing: [0.25, 0.1, 0.25, 1] }
    );
  });
</script>
```

#### AOS (Animate On Scroll) — mais simples, menos controle
Bom se você quer que o modelo use apenas atributos HTML, sem escrever JS.

```html
<link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css">
<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>

<script>AOS.init({ duration: 700, easing: 'ease-out', once: true });</script>

<!-- O modelo adiciona atributos nos elementos -->
<!-- <div data-aos="fade-up" data-aos-delay="100"> -->
```

---

### Camada 4 — Componentes prontos (elimina reinvenção)

#### Alpine.js — interatividade declarativa
Para dropdowns, modais, tabs, accordions — sem React no iframe.
O modelo conhece muito bem, escreve código limpo com Alpine.

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<!-- Exemplo: tab switcher sem nenhum JS customizado -->
<!--
<div x-data="{ tab: 'overview' }">
  <button @click="tab = 'overview'" :class="tab === 'overview' ? 'active' : ''">Overview</button>
  <button @click="tab = 'details'"  :class="tab === 'details'  ? 'active' : ''">Details</button>

  <div x-show="tab === 'overview'">...</div>
  <div x-show="tab === 'details'">...</div>
</div>
-->
```

#### Flowbite — componentes Tailwind prontos
Biblioteca de componentes que funciona em cima do Tailwind CDN.
Dropdowns, modais, tooltips, navbars — todos com JS já embutido.

```html
<!-- Requer Tailwind CDN carregado antes -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
```

---

### Camada 5 — Ícones

#### Lucide (via CDN) — melhor opção
O modelo usa Lucide no React — carregue a versão vanilla para manter
consistência entre os outputs HTML e os componentes Next.js.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script>lucide.createIcons();</script>

<!-- O modelo usa assim nos elementos HTML -->
<!-- <i data-lucide="search"></i> -->
<!-- <i data-lucide="arrow-right" class="w-4 h-4"></i> -->
```

#### Phosphor Icons — alternativa com mais estilos
Suporta 6 pesos (thin, light, regular, bold, fill, duotone).

```html
<script src="https://unpkg.com/@phosphor-icons/web"></script>
<!-- <i class="ph ph-magnifying-glass"></i> -->
<!-- <i class="ph-bold ph-arrow-right"></i> -->
<!-- <i class="ph-duotone ph-shield-check"></i> -->
```

---

### Camada 6 — Efeitos visuais avançados

#### Particles.js — backgrounds animados
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js"></script>
```

#### Three.js — backgrounds 3D
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

#### Typed.js — efeito de digitação
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.16/typed.umd.js"></script>
```

---

## Template de <head> completo para injetar no system prompt

Cole isso no system prompt. O modelo vai incluir no HTML gerado
somente o que for relevante para o contexto.

```html
<!--
DESIGN SYSTEM DISPONÍVEL VIA CDN
Inclua no <head> do HTML gerado conforme necessário:

TIPOGRAFIA (sempre incluir):
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">

CSS UTILITÁRIOS (sempre incluir):
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: { extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }}
  }
</script>

ANIMAÇÕES (incluir quando houver scroll ou transições):
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

ÍCONES (incluir quando houver ícones):
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

INTERATIVIDADE (incluir para tabs, modais, dropdowns):
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
-->
```

---

## Como instruir o modelo a usar tudo isso

Adicione no seu system prompt:

```
## Design system disponível

O HTML gerado tem acesso às seguintes libs via CDN.
Use-as em vez de reinventar do zero:

SEMPRE carregar:
- Google Fonts: Syne (títulos), DM Sans (corpo), JetBrains Mono (código)
- Tailwind CSS via CDN com a configuração de tema abaixo

CARREGAR quando necessário:
- GSAP + ScrollTrigger: para qualquer animação de scroll ou timeline
- Lucide via CDN: para todos os ícones (nunca use emojis como ícones funcionais)
- Alpine.js: para interatividade (tabs, modais, toggles) sem escrever JS manual

NÃO usar:
- CSS animations manuais quando GSAP está disponível
- SVG paths manuais quando Lucide tem o ícone
- JavaScript imperativo para UI quando Alpine.js resolve

Configuração Tailwind obrigatória:
[cole aqui o tailwind.config do seu projeto]
```

---

## Prioridade de implementação

Se você vai adicionar aos poucos, nesta ordem:

1. **Google Fonts** — impacto visual imediato, zero complexidade
2. **Tailwind CDN + config** — elimina inconsistência de spacing e cores
3. **Lucide CDN** — ícones consistentes, o modelo já sabe usar
4. **GSAP + ScrollTrigger** — transforma a qualidade das animações
5. **Alpine.js** — adiciona interatividade real sem peso de framework

Itens 1 a 3 já resolvem tipografia fraca, cores inconsistentes
e componentes sem polimento. GSAP resolve animações. Alpine resolve
interatividade. Juntos cobrem todos os 4 problemas que você identificou.
