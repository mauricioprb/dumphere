# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O Dumphere atende pessoas e pequenos grupos que precisam abrir rapidamente um espaço compartilhado para rascunhos, notas, revisões, decisões, trechos de código ou texto em Markdown. O contexto principal é transitório e colaborativo. Alguém escolhe um endereço, compartilha o link e todos começam a escrever sem cadastro, convite, configuração de permissões ou preparação prévia.

O produto pressupõe que essas pessoas entendam o documento como uma página pública e descartável. Ele não é adequado para conteúdo sensível, registros que precisem de autoria verificável ou informação que não possa ser perdida.

## Product Purpose

O Dumphere transforma um caminho de URL em uma página Markdown compartilhada, editável em tempo real por qualquer pessoa que tenha ou descubra o endereço. Ele existe para reduzir ao mínimo a distância entre querer escrever junto e estar efetivamente escrevendo.

O produto é bem-sucedido quando alguém consegue criar ou abrir uma página, compreender imediatamente suas condições de acesso e permanência, compartilhar o endereço e colaborar sem precisar aprender uma estrutura de contas, espaços ou permissões.

## Positioning

Uma página compartilhada começa no próprio endereço. Escolha o caminho e ela existe. Essa combinação de criação por URL, colaboração em tempo real, ausência de cadastro e expiração automática distingue o Dumphere de editores organizados em contas, arquivos privados, workspaces ou convites.

## Operating Context

O fluxo principal começa na página inicial, onde a pessoa informa um caminho com até quatro segmentos. O primeiro acesso cria o documento automaticamente. A partir daí, o endereço completo é o mecanismo de descoberta e compartilhamento.

No editor, participantes escrevem simultaneamente em modo visual ou na fonte Markdown. Cursores, presença, estado da conexão e estado de salvamento tornam a colaboração observável. O conteúdo permanece disponível localmente durante interrupções por meio do cache do navegador, enquanto o servidor sincroniza o estado colaborativo e mantém uma representação HTML sanitizada.

O documento pode ser exportado como Markdown ou HTML. Depois de 30 dias sem visitas, ele é removido automática e permanentemente, sem lixeira, histórico recuperável ou backup oferecido pelo produto.

## Capabilities and Constraints

- A página é pública e editável por qualquer pessoa que conheça ou adivinhe o endereço. Não existe autenticação, proprietário, permissão de leitura ou permissão de escrita.
- O primeiro acesso a um caminho válido cria o documento. O caminho aceita até 100 caracteres e quatro segmentos, usa letras minúsculas, números e hífens, e não pode começar com um termo reservado.
- A edição oferece colaboração em tempo real com Yjs, presença de participantes, cache local por documento e recuperação após interrupções de rede.
- O editor aceita Markdown em modo visual e em modo fonte, com títulos, listas, tarefas, citações, código, tabelas, links, destaque, imagens por URL e exportação para Markdown e HTML.
- O HTML persistido pelo Laravel é sanitizado e limitado a 512 KB. O snapshot colaborativo tem limite próprio de 2 MB.
- O documento é removido após 30 dias sem acesso. A exclusão é definitiva e o serviço não promete disponibilidade, integridade ou preservação.
- Criação de documentos, requisições e conexões colaborativas são limitadas por IP para conter abuso. O conteúdo do documento e os tokens de conexão nunca devem entrar em logs.
- A interface existe em português do Brasil e inglês, escolhidos pelo idioma do navegador. Português do Brasil é o padrão e o fallback.
- O produto é responsivo para navegadores desktop e móveis. Não há aplicativo nativo, autenticação, cobrança, multi-tenancy, analytics comportamental ou coleta deliberada de PII.

## Brand Commitments

O nome é **Dumphere** e o wordmark é apresentado como `dump/here`, com a barra funcionando como sinal de identidade e colaboração. A voz é direta, honesta e sóbria. A interface explica riscos e limites com linguagem concreta, sem exagero promocional, falsa promessa de privacidade ou tentativa de esconder a natureza pública e temporária do serviço.

A identidade atual deve ser preservada. Novas superfícies devem parecer parte do mesmo produto, mantendo o conteúdo como protagonista, a colaboração como presença perceptível e a tecnologia como infraestrutura discreta. As regras visuais correspondentes estão em `DESIGN.md`.

## Evidence on Hand

- A implementação funcional das superfícies Home, Terms e Document está em `resources/js/Pages/`.
- Os fluxos e a copy bilíngue estão registrados em `resources/js/i18n/locales/pt-BR.ts` e `resources/js/i18n/locales/en.ts`.
- A identidade aplicada está em `resources/css/theme.css`, `resources/css/editor.css`, `resources/css/external.css` e nos componentes de `resources/js/Components/`.
- O wordmark, a marca, a imagem de compartilhamento e a arte de fundo estão em `public/images/`.
- Os termos publicados documentam de forma explícita acesso público, edição aberta, expiração, ausência de backup, uso de dados e limites do serviço.
- Há testes automatizados para o fluxo HTTP, sanitização, colaboração, tema diário, identidade, acessibilidade estrutural e regras visuais importantes.
- Não há pesquisa de usuários, depoimentos, logotipos de clientes, métricas públicas de uso ou alegações comerciais disponíveis. Trabalhos futuros não devem inventar essas evidências.

## Product Principles

1. **O endereço vem primeiro.** Criar, abrir e compartilhar uma página deve continuar sendo uma ação direta, sem conta, pasta ou cerimônia intermediária.
2. **A verdade aparece antes da promessa.** A natureza pública, editável e temporária do documento deve ser comunicada antes que qualquer conveniência possa ser confundida com privacidade ou permanência.
3. **O conteúdo ocupa o centro.** Controles, presença e estados existem para sustentar a escrita e recuam quando não são necessários.
4. **Colaboração deve ser visível e compreensível.** Cursores, participantes, conexão e salvamento precisam comunicar o estado real sem criar ruído.
5. **Coletar menos é uma decisão de produto.** Não adicionar identidade, rastreamento, PII ou complexidade operacional sem uma mudança explícita na proposta do Dumphere.

## Accessibility & Inclusion

A interface deve atender ao WCAG 2.2 nível AA nos temas claro e escuro. Todo fluxo precisa funcionar por teclado, manter foco visível, oferecer alvos de toque adequados, comunicar estados por texto além de cor e respeitar `prefers-reduced-motion`.

Conteúdo animado ou colaborativo não pode esconder informação de tecnologias assistivas. As duas traduções devem manter as mesmas capacidades e chaves, com linguagem clara e equivalente em português do Brasil e inglês. Layouts devem suportar ampliação, textos longos e larguras móveis sem remover funções essenciais.
