---
version: alpha
name: Dumphere
description: Papel vivo para edição Markdown pública e colaborativa.
colors:
  paper: 'var(--workspace-paper)'
  panel: 'var(--workspace-panel)'
  raised: 'var(--workspace-raised)'
  ink: 'var(--workspace-ink)'
  muted: 'var(--workspace-muted)'
  rule: 'var(--workspace-rule)'
  accent: 'var(--workspace-accent)'
  accent-ink: 'var(--workspace-accent-ink)'
  live: 'var(--workspace-live)'
  live-ink: 'var(--workspace-live-ink)'
  danger: 'var(--workspace-danger)'
  warning: 'var(--workspace-warning)'
  code: 'var(--workspace-code)'
  code-ink: 'var(--workspace-code-ink)'
typography:
  hero:
    fontFamily: 'Bricolage Grotesque, Inter, sans-serif'
    fontSize: '3.6rem'
    fontWeight: 560
    lineHeight: 0.92
    letterSpacing: '-0.04em'
  display:
    fontFamily: 'Bricolage Grotesque, Inter, sans-serif'
    fontSize: '2.6rem'
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: '-0.035em'
  editor-heading:
    fontFamily: 'Bricolage Grotesque, Inter, sans-serif'
    fontSize: '2.1rem'
    fontWeight: 560
    lineHeight: 1.05
    letterSpacing: '-0.035em'
  editor-body:
    fontFamily: 'Inter, Instrument Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.72
  body:
    fontFamily: 'Inter, Instrument Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.95rem'
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: 'Inter, Instrument Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.82rem'
    fontWeight: 650
    lineHeight: 1.3
  metadata:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    fontSize: '0.78rem'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  xs: '2px'
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  full: '9999px'
spacing:
  micro: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '32px'
  2xl: '48px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.lg}'
    padding: '12px 19px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.live}'
    textColor: '{colors.live-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.lg}'
    padding: '12px 19px'
    height: '44px'
  toolbar-control:
    backgroundColor: 'transparent'
    textColor: '{colors.muted}'
    rounded: '{rounded.md}'
    size: '36px'
  toolbar-control-active:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.live}'
    rounded: '{rounded.md}'
    size: '36px'
  field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 12px'
    height: '44px'
---

# Design System do Dumphere

## Overview

**Creative North Star: "Papel vivo"**

O Dumphere deve parecer uma folha compartilhada que ganhou presença digital sem perder a calma do papel. A superfície é ampla, silenciosa e legível; a vida aparece em sinais precisos, como cursores, seleção, estado da conexão, foco e uma família cromática que muda diariamente. A experiência não imita papel fisicamente e não transforma colaboração em espetáculo. Ela preserva a sensação de escrever em um lugar imediato, comum e temporário.

O sistema é editorial quando apresenta conteúdo e utilitário quando oferece controles. Bricolage Grotesque dá personalidade a títulos, wordmark e momentos de entrada; Inter sustenta leitura e operação; a família monoespaçada identifica endereços, contagens e dados técnicos. A interface é predominantemente plana, com profundidade criada por superfícies tonais e linhas finas. Movimento deve revelar edição, presença ou mudança de estado, nunca decorar áreas ociosas.

**Key Characteristics:**

- Superfícies calmas, tonais e sem cartões desnecessários.
- Conteúdo editorial com controles compactos e previsíveis.
- Cor diária expressiva, mas disciplinada por papéis semânticos estáveis.
- Colaboração visível por cursores, seleção, presença e estado.
- Paridade intencional entre temas claro e escuro.
- Textura sutil nas páginas externas e canvas limpo no editor.

## Colors

A paleta nasce de um único matiz diário calculado no fuso de São Paulo. A tonalidade muda, mas luminosidade, croma, contraste e função permanecem estáveis. Os tokens no frontmatter são semânticos e resolvem automaticamente os valores dos temas claro e escuro definidos em `resources/css/theme.css`.

### Primary

- **Pulso diário** (`live`). Indica ação, link, foco, conexão ativa, cursor e o corte cromático do wordmark. É o sinal de que a superfície está viva.
- **Pulso legível** (`live-ink`). Fornece texto ou símbolo sobre o pulso diário quando ele ocupa uma superfície.

### Secondary

- **Marca-texto diário** (`accent`). Cria seleção, estado ativo e destaque de baixa intensidade sem competir com o conteúdo.
- **Tinta de marcação** (`accent-ink`). Preserva leitura sobre a marcação.

### Neutral

- **Papel** (`paper`). Superfície dominante de páginas e canvas.
- **Mesa tonal** (`panel`). Separa toolbars, cabeçalhos de tabela, previews e estados de hover.
- **Folha elevada** (`raised`). Superfície de menus, popovers e diálogos; a diferença tonal substitui sombra.
- **Tinta** (`ink`). Texto principal e ações primárias.
- **Grafite** (`muted`). Texto secundário, metadados, placeholders e ferramentas em repouso.
- **Regra** (`rule`). Bordas, divisores e estrutura editorial.
- **Carvão de código** (`code`) e **papel de código** (`code-ink`). Fundo e conteúdo de blocos de código.

### Status

- **Alerta vermelho** (`danger`). Erro de validação, falha de conexão ou falha ao salvar.
- **Âmbar de atenção** (`warning`). Salvamento em curso, aviso de expiração e estado recuperável.

**The Stable Roles Rule.** O matiz pode mudar diariamente; a hierarquia não. Nunca associe um matiz específico e fixo a uma ação principal, porque o papel semântico pertence a `live`, não a uma cor nominal.

**The Semantic Color Rule.** Componentes usam tokens `--workspace-*`, `--editor-*` ou `--external-*`. Não introduza cor literal em classes ou CSS de componente. Amplie a fonte de tokens quando faltar um papel.

**The Quiet Canvas Rule.** A maior parte da tela deve permanecer em `paper`, `panel`, `raised`, `ink`, `muted` e `rule`. `live` e `accent` aparecem apenas onde comunicam ação, presença, seleção ou estado.

## Typography

**Display Font.** Bricolage Grotesque, com Inter e sans-serif como fallback.

**Body Font.** Inter, com Instrument Sans, fontes de sistema e sans-serif como fallback.

**Label/Mono Font.** Pilha monoespaçada do sistema para endereço, fonte Markdown, contagens, horários e metadados técnicos.

**Character.** Bricolage Grotesque traz uma voz editorial compacta e humana sem tornar a ferramenta ornamental. Inter mantém leitura prolongada, labels e controles neutros. O monoespaçado aparece apenas quando a estrutura do dado importa.

### Hierarchy

- **Hero** (`hero`). Título de entrada fluido, partindo do tamanho normativo e chegando a 6rem em telas amplas. Usa largura curta, entre oito e nove caracteres, e quebra intencional para apresentar a ação principal.
- **Display** (`display`). Títulos de páginas institucionais, fluidos até 4.2rem, com entrelinha apertada e equilíbrio de linhas.
- **Editor heading** (`editor-heading`). Primeiro nível dos títulos escritos, fluido até 3rem. Níveis inferiores reduzem tamanho e aperto sem trocar de família.
- **Editor body** (`editor-body`). Texto principal do documento, limitado a 76ch para leitura contínua.
- **Body** (`body`). Explicações, termos e conteúdo auxiliar, normalmente entre 60ch e 68ch.
- **Label** (`label`). Rótulos de campo, avisos breves e ações compactas. Mantém caixa natural e peso firme; não usa caixa alta como decoração.
- **Metadata** (`metadata`). Slugs, origem da URL, contagens e timestamps. Use números tabulares quando valores mudam em tempo real.

**The Editorial Utility Rule.** Use Bricolage Grotesque para marca, títulos e estrutura de leitura; use Inter para operar. Não aplique a fonte display a barras, campos, estados ou texto corrente.

**The Monospace Meaning Rule.** Monoespaçado comunica endereço, código ou dado técnico. Não o use como atalho para parecer tecnológico.

## Layout

As páginas externas usam um container fluido com limite de 96rem e margens laterais definidas por `clamp()`. A Home organiza a ação principal em uma composição assimétrica de duas colunas no desktop e colapsa para uma coluna abaixo de 760px. Terms usa uma coluna de leitura com limite de 54rem, índice responsivo e linhas editoriais para organizar conteúdo longo.

O editor ocupa toda a viewport e organiza cabeçalho, toolbar, canvas, metadados e aviso de expiração em faixas estáveis. O canvas de escrita permanece centralizado em até 76ch, com respiro vertical fluido e laterais que variam de 1.25rem a 3.5rem. Cabeçalho e toolbar se alinham às bordas da viewport, não a um container central.

A escala de espaçamento do frontmatter cobre o ritmo recorrente de 4px a 48px. Distâncias estruturais podem usar `clamp()` quando conectam viewport, legibilidade e ritmo. O breakpoint de 760px reorganiza superfícies externas; o breakpoint `sm` do Tailwind alterna a toolbar e os indicadores de presença do editor. No móvel, funções são agrupadas em uma segunda faixa expansível, não removidas.

**The Writing Width Rule.** Texto longo e fonte Markdown permanecem limitados a 76ch. Controles podem ocupar a largura da viewport; o conteúdo não.

**The No Card Grid Rule.** Não converta conteúdo, princípios ou funções em grades genéricas de cartões. Use fluxo editorial, linhas, tipografia, agrupamento e espaço antes de adicionar contenção.

## Elevation & Depth

O sistema é plano por padrão. Hierarquia nasce da alternância entre `paper`, `panel` e `raised`, de bordas de um pixel e de proximidade espacial. Menus, popovers e diálogos usam uma superfície tonal mais clara ou mais escura com borda, mas nenhuma sombra. O overlay de modal pode escurecer o plano de fundo para estabelecer modalidade.

Sombras são reservadas a feedback funcional. O campo de endereço usa uma linha inferior mais espessa no foco, o canvas recebe uma linha interna superior ao ganhar foco e o link de pular conteúdo usa sombra apenas para assegurar separação e foco. A ação primária pode subir 2px no hover. Nenhum desses recursos autoriza glow, vidro, sombra ambiente ou elevação decorativa.

**The Flat by Default Rule.** Superfícies em repouso não têm sombra. Diferencie camadas por tom, borda e espaço.

**The Functional Depth Rule.** Uma mudança de profundidade precisa comunicar foco, hover, modalidade ou sobreposição temporária. Se não houver mudança de estado, mantenha a superfície plana.

## Shapes

A linguagem de forma é suavemente funcional. Controles compactos usam cantos pequenos ou médios; botões principais e containers recebem suavidade suficiente para indicar interação sem parecer cápsulas. Diálogos podem usar o maior raio da escala para separação, enquanto o canvas, toolbars e estruturas editoriais permanecem retilíneos.

O raio totalmente arredondado é reservado a avatares, indicadores circulares e ao trilho do seletor de tema. Linhas de leitura, cursores e divisores são retos. Destaques de texto acompanham o conteúdo com raio mínimo, preservando a sensação de marca-texto.

**The Purposeful Radius Rule.** Escolha o raio pelo papel do elemento. Não misture raios arbitrários nem transforme toda ação em cápsula.

**The Editorial Edge Rule.** Estruturas de conteúdo usam linhas e cantos discretos. Formas orgânicas, blobs e recortes decorativos não pertencem ao sistema atual.

## Components

### Buttons

- **Shape.** Ações principais usam o raio `lg`; controles compactos usam `md`; alvos móveis preservam altura mínima de 44px.
- **Primary.** `ink` sobre `paper`, com tipografia `label`. No hover, muda para `live` sobre `live-ink` e sobe 2px.
- **Secondary / Ghost.** Fundo transparente, texto `muted`; o hover usa `panel` e `ink`.
- **Focus.** Contorno sólido em `live`, com afastamento suficiente para não se confundir com a borda. Nas páginas externas, o foco recebe uma segunda separação em `paper`.
- **Disabled.** Opacidade reduzida, cursor de indisponibilidade e nenhuma resposta de hover.

### Entry Field

- **Style.** O campo de endereço é uma linha editorial contínua, sem caixa fechada. Origem e caminho usam monoespaçado e compartilham uma borda inferior de 2px.
- **Focus.** A borda passa a `live` e ganha uma linha inferior adicional de 4px.
- **Error.** A mesma estrutura muda para `danger`; mensagem textual ocupa altura reservada para evitar salto de layout.
- **Mobile.** A origem ocupa a primeira linha, enquanto input e botão permanecem juntos abaixo.

### Editor Toolbar

- **Style.** Controles quadrados e compactos ficam sobre `panel`, com ícones lineares e divisores em `rule`.
- **Idle / Hover.** `muted` em repouso; `paper` e `ink` no hover.
- **Active.** Mistura tonal de `live` e `paper`, com ícone em `live`. O estado também é exposto por `aria-pressed`.
- **Responsive.** Desktop apresenta a sequência completa; móvel conserva as ações principais e revela as demais em grade de seis colunas.
- **Keyboard.** Segue o padrão de toolbar com setas, Home e End, mantendo um único controle na ordem de tabulação.

### Writing Canvas

- **Surface.** `paper` contínuo, sem cartão, sombra ou moldura lateral.
- **Focus.** Uma linha interna superior em `live` confirma o foco sem envolver toda a página.
- **Content.** Títulos em display, corpo em sans, código em mono, seleção e caret em `live`, destaque em `accent`.
- **Structure.** Citações usam uma regra fina, tabelas usam bordas tonais, blocos de código usam `code` e listas mantêm marcadores discretos.

### Dialogs, Menus and Popovers

- **Surface.** `raised` com borda `rule` e sem sombra.
- **Dialog.** Raio `xl`, largura contida, cabeçalho e rodapé separados por regras.
- **Menu.** Raio `lg`, itens com altura mínima de 44px e seleção em `accent` sobre `accent-ink`.
- **Motion.** Entrada curta por opacidade, escala e deslocamento; remova transformação quando `prefers-reduced-motion` estiver ativo.

### Presence and Status

- **Presence.** Avatares e etiquetas de cursor podem usar cores individuais calculadas, sempre com tinta de contraste. Cursores são linhas finas, não avatares flutuantes grandes.
- **Connection.** Um ponto pequeno acompanha texto monoespaçado. `live` significa conectado, `warning` significa salvando e `danger` significa erro ou desconexão.
- **Announcements.** Mudanças relevantes usam regiões `aria-live`; cor nunca é o único portador da informação.

### Theme Toggle

- **Shape.** Trilho e indicador totalmente arredondados dentro de um alvo de 44px.
- **Color.** O trilho permanece tonal; o indicador usa `live` no tema claro e mantém contraste equivalente no escuro.
- **Motion.** O indicador percorre 1.5rem com easing rápido e suave. A transição de tema usa um flash cromático de 350ms e desaparece por completo com movimento reduzido.

### Wordmark and Selection Motif

- **Wordmark.** `dump/here` usa Bricolage Grotesque em peso 700, entrelinha 1 e tracking apertado. A barra usa `live` e acompanha o matiz diário.
- **Selection motif.** Home, Terms e loader usam preenchimento de marca-texto e sinais de cursor para conectar entrada, leitura e colaboração.
- **Artwork.** Páginas externas compartilham a arte abstrata de fundo com opacidade baixa, tratamento monocromático orientado pelo matiz diário e ruído sutil. O editor não recebe essa textura.

## Do's and Don'ts

### Do

- **Do** preservar a direção “Papel vivo”, com superfície calma, conteúdo primeiro e colaboração expressa em sinais precisos.
- **Do** usar os tokens semânticos existentes e verificar qualquer nova cor nos temas claro e escuro.
- **Do** manter textos longos entre 60ch e 76ch e controles periféricos alinhados à viewport.
- **Do** conservar todas as funções essenciais no móvel, agrupando ou revelando progressivamente quando necessário.
- **Do** traduzir toda string visível em português do Brasil e inglês e testar textos mais longos.
- **Do** oferecer foco visível, alvos de 44px, estados textuais e uma alternativa sem movimento.
- **Do** tratar presença, conexão, salvamento, erro e expiração como estados honestos do produto.

### Don't

- **Don't** substituir o padrão atual por estética SaaS genérica, gradiente promocional, glassmorphism, glow ou excesso de cartões.
- **Don't** fixar uma cor de marca em um componente. O matiz diário deve fluir pelos papéis semânticos.
- **Don't** usar sombra para decorar superfícies ou sugerir profundidade permanente.
- **Don't** espalhar Bricolage Grotesque por labels e controles, nem monoespaçado por texto que não seja estrutural ou técnico.
- **Don't** esconder a natureza pública, editável e temporária do produto atrás de copy ambígua ou reconfortante.
- **Don't** adicionar animação sem função, especialmente em áreas de escrita ou leitura prolongada.
- **Don't** remover ações, status ou conteúdo para fazer uma tela móvel parecer mais limpa.
- **Don't** introduzir cor literal em views ou CSS de componente quando um token semântico deve ocupar esse papel.
