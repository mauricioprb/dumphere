<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.5
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- pestphp/pest (PEST) - v4
- @inertiajs/vue3 (INERTIA_VUE) - v3
- vue (VUE) - v3
- tailwindcss (TAILWINDCSS) - v4

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `vendor/bin/pest --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/Pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-vue-development` when working with Inertia Vue client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, use `php artisan make:test --pest {name}` for feature tests and add `--unit` for unit tests. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This application uses Pest for testing. Write tests with `it()` or `test()` and use Pest expectations where they improve readability.
- Use named datasets for repeated inputs and keep Laravel test configuration centralized in `tests/Pest.php`.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, run the complete Pest suite before finalizing cross-cutting test changes.
- Tests should cover all happy paths, failure paths, and edge cases.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files; these are core to the application.

## Running Tests

- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `vendor/bin/pest --compact`.
- To run all tests in a file: `vendor/bin/pest --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `vendor/bin/pest --compact --filter='test name'`.

=== inertia-vue/core rules ===

# Inertia + Vue

Vue components must have a single root element.

- IMPORTANT: Activate `inertia-vue-development` when working with Inertia Vue client-side patterns.

</laravel-boost-guidelines>

# AGENTS.md do projeto Dumphere

> Contexto persistente para agentes de código. Leia este arquivo por inteiro antes de
> qualquer tarefa. Ele reflete decisões já tomadas, então respeite-as e, se algo aqui
> conflitar com um pedido, aponte o conflito antes de agir.
>
> O bloco `<laravel-boost-guidelines>` acima é gerado pelo `boost:install` e reescrito a
> cada execução. Nunca edite lá dentro. Tudo que é decisão deste projeto mora daqui para
> baixo. Onde as duas partes divergirem, este documento vence.

---

## 1. Como você deve trabalhar (leia primeiro)

Estas regras têm prioridade sobre velocidade de entrega.

- Trabalhe em incrementos pequenos e revisáveis. NÃO implemente tudo de uma vez. Uma
  fatia coesa por vez, depois pare e reporte.
- Antes de qualquer mudança grande, apresente um plano curto e espere aprovação.
- NUNCA execute `git commit`, `git push` ou qualquer escrita no histórico. Prepare as
  mudanças; o commit é sempre do humano. NUNCA comite segredos.
- NUNCA use `git checkout --`, `git restore`, `git stash` ou `git reset` em arquivos com
  alterações não commitadas. O working tree costuma ter trabalho em andamento e esses
  comandos apagam sem aviso. Se precisar desfazer algo que você mesmo escreveu, edite o
  arquivo de volta.
- Não invente contrato de biblioteca de terceiros (Tiptap, Yjs, y-websocket, Inertia).
  Se não tem certeza da API, consulte a documentação oficial ou o `search-docs` do Boost.
  Sem acesso, pergunte. Não chute.
- Integridade de dados e concorrência exigem teste antes. Qualquer código que toque
  sanitização de HTML, validação de slug, token de WebSocket, persistência de estado Yjs
  ou expurgo de documentos vem com teste Pest junto.
- Feche cada tarefa limpa. Rode `composer lint:test`, `npm run lint:test`,
  `npm run format:test`, `npm run type-check` e `vendor/bin/pest`. Só está pronto se todos
  passarem. Se mexeu no `yjs-server/`, rode também `npm --prefix yjs-server test`.
- Na dúvida, pergunte. Ambiguidade não é permissão para assumir.

---

## 2. O produto

Dumphere é um editor de texto colaborativo, público e sem cadastro. A pessoa digita um
caminho, abre a página e escreve; quem tiver o link entra na mesma sala e edita junto, em
tempo real. O documento é criado sozinho no primeiro acesso e removido depois de 30 dias
sem visitas.

- NÃO existe autenticação, conta, login ou perfil. O modelo `User`, a tabela `users` e o
  esqueleto de fila e e-mail do Laravel foram removidos por não terem uso. Não os traga de
  volta nem construa em cima deles.
- NÃO é multi-tenant e não tem cobrança. Não adicione essa complexidade.
- Privacidade é o produto. Não colete PII, não registre conteúdo de documento em log e não
  adicione analytics de comportamento.
- O acesso é por obscuridade do link, e isso é intencional. Qualquer pessoa com o slug lê
  e escreve. Não prometa privacidade que a arquitetura não entrega, nem na copy nem nos
  termos.
- Interface em português e inglês, escolhida pelo idioma do navegador (ver §7).

---

## 3. Stack

| Camada                | Escolha                                                      |
| --------------------- | ------------------------------------------------------------ |
| Framework             | Laravel 13, PHP 8.5                                          |
| Camada de view        | Inertia 3 com Vue 3, sem Blade além de `app.blade.php`       |
| Editor                | Tiptap 3 (ProseMirror) com `tiptap-markdown` e `lowlight`    |
| Colaboração           | Yjs 13, `y-websocket` no cliente, `y-indexeddb` para offline |
| Servidor colaborativo | Node 24, `yjs-server/`, processo separado do Laravel         |
| Estilo                | Tailwind 4 via `@tailwindcss/vite`, tokens em `@theme`       |
| Estado no cliente     | Pinia                                                        |
| Banco                 | PostgreSQL 18, tanto para o Laravel quanto para os snapshots |
| Build                 | Vite 8, TypeScript 6, `vue-tsc`                              |
| Testes PHP            | Pest 4                                                       |
| Testes frontend       | Vitest                                                       |
| Testes do yjs-server  | `node --test`, sem framework                                 |
| Estilo de código PHP  | Laravel Pint (`pint.json`)                                   |
| Estilo do frontend    | ESLint 10 flat config mais Prettier                          |
| Deploy                | Deployer 8 (`deploy.php`), systemd para o Yjs, Nginx         |
| Contexto para IA      | Laravel Boost                                                |

Restrições que já foram decididas:

- O cliente usa `y-websocket` 3; o servidor permanece em `y-websocket` 1.5 porque a linha 3
  removeu as APIs de servidor embutidas. Não "atualize" o servidor sem reescrever a
  camada de conexão.
- TypeScript fica no 6 porque é o mais novo compatível com o `vue-tsc` atual.
- `@types/node` acompanha o runtime Node 24, não a linha Current.
- Mantenha Inertia mais Vue. Não introduza Livewire, Blade com lógica ou SSR sem discutir.
- Não adicione dependência sem aprovação, dos dois lados (`composer.json` e `package.json`).

---

## 4. Arquitetura

Dois processos, um banco.

O Laravel serve as páginas, valida slug, sanitiza HTML e persiste a representação HTML do
documento. O `yjs-server` sincroniza as edições por WebSocket e persiste o snapshot binário
do CRDT. Os dois escrevem na mesma tabela `documents`, em colunas diferentes. Mudança em um
lado que altere o formato de coluna exige olhar o outro lado.

Do lado do PHP, o esqueleto padrão do Laravel mais duas pastas: `Actions/` e `Support/`.
Nada de camada de domínio, DTO ou repositório. O app tem um modelo e duas rotas; estrutura
além disso é cerimônia que só atrapalha quem lê.

```
app/
├── Actions/                     um caso de uso por classe, método execute()
│                                FindOrCreateDocument, ListDocumentChildren,
│                                PersistDocumentContent, PurgeStaleDocuments
├── Console/Commands/            PurgeStaleDocumentsCommand
├── Http/
│   ├── Controllers/             DocumentController
│   └── Middleware/              ContentSecurityPolicy, SanitizeSlug, HandleInertiaRequests
├── Models/                      Document
└── Support/                     DocumentSlug, DocumentHtmlSanitizer, TiptapAttributeSanitizer,
                                 WebSocketTokenService

resources/js/
├── Pages/                       Home, Terms, Document/Show (páginas Inertia)
├── Components/Editor/           Tiptap, toolbar, menus, modais
├── Components/Layout/           AppLayout, ExternalPageShell
├── Components/UI/               peças pequenas e reutilizáveis
├── Composables/                 use* (Yjs, autosave, presença, tema, i18n)
├── Extensions/                  extensões do Tiptap (slash commands, emoji, code block)
├── Lib/                         funções puras e testáveis, sem Vue
├── Stores/                      Pinia
├── i18n/locales/                pt-BR.ts, en.ts
└── types/                       tipos compartilhados

resources/css/
├── app.css                      entrada, imports e @source
├── theme.css                    tokens (@theme) e variáveis do editor
├── editor.css                   aparência do conteúdo do Tiptap
└── external.css                 páginas institucionais (Home, Terms)

yjs-server/
├── server.mjs                   HTTP mais WebSocket, orquestração
├── auth.mjs                     origem, IP, token, sala
├── persistence.mjs              leitura e escrita do snapshot no PostgreSQL
├── rate-limit.mjs               limite de mensagens por conexão
└── test/                        node --test
```

Regras de estrutura:

- Fique no esqueleto do Laravel. NÃO crie `Domain/`, `Repositories/`, `DTOs/`,
  `Services/` separado de `Support/`, nem `Application/Infrastructure`. O Eloquent é o
  repositório e o container resolve as dependências sozinho.
- `Actions/` é para caso de uso com regra de negócio, com um método `execute()`. Se a nova
  classe não tem regra, ela não é uma Action.
- `Support/` é a pasta única para colaborador sem estado: validador, sanitizador, gerador
  de token. Não a divida em subpastas nem crie `Services/` ao lado.
- Controller magro. Ele resolve, delega para a Action e devolve resposta. A montagem do
  payload do Inertia fica no controller mesmo, inline. Se um dia um segundo endpoint
  precisar do mesmo formato, aí sim extraia um `Http/Resources/DocumentResource`, e não
  antes.
- Não crie ServiceProvider para registrar classe concreta. O container autoresolve;
  binding só entra quando existe interface ou construção cara de verdade.
- Em `resources/js/`, o que puder ser função pura vai para `Lib/` e ganha teste Vitest.
  `Composables/` é para o que depende de reatividade ou ciclo de vida do Vue.
- Se você não explica por que uma pasta existe em uma frase, ela não deveria existir ainda.

---

## 5. Modelo de domínio

Uma única tabela de negócio. Não há relação com usuário porque não há usuário.

`documents`

- `id` (uuid, PK). É a identidade real e imutável do documento. A sala do WebSocket usa o
  UUID, nunca o slug.
- `slug` (string 200, unique, index). Apenas a URL pública. Pode mudar de significado para
  o humano; não use como chave em nada persistente.
- `title` (string 255, nulável).
- `content_html` (longtext, nulável). Representação HTML sanitizada, escrita pelo Laravel.
  O editor só a lê quando o CRDT está vazio, ou seja, em documento que nunca sincronizou.
  Depois do primeiro snapshot ela vira só leitura para humano e para backup; não a trate
  como caminho de recuperação da edição, porque ela não é lida de volta.
- `yjs_state_base64` (longtext, nulável). Snapshot do CRDT, escrito pelo `yjs-server`.
- `last_accessed_at` (timestamp, nulável, index). Base do expurgo.
- `created_at`, `updated_at`. Índice composto `(last_accessed_at, created_at)`.

Regras que importam:

- Slug é validado por `DocumentSlug`, não por regex espalhada. Máximo de 100 caracteres e
  4 segmentos, minúsculo, `[a-z0-9-]` por segmento, sem `//`, e a primeira parte não pode
  ser um termo reservado (`admin`, `api`, `health`, `terms` e os demais da lista). Ao
  adicionar rota de primeiro nível, acrescente o termo em `RESERVED_FIRST_SEGMENTS` na
  mesma mudança, senão a rota vira um documento.
- `Document::MAX_SIZE_BYTES` (512 KB) limita o HTML e alimenta o
  `withMaxInputLength` do sanitizador. O `yjs-server` tem seu próprio teto
  (`YJS_MAX_DOCUMENT_BYTES`, 2 MB). São limites distintos e propositais; não unifique sem
  pensar nos dois formatos. O editor tem um terceiro teto, `MAX_DOCUMENT_CHARACTERS` em
  `editorExtensions.ts`, cuja função é impedir que o documento chegue ao teto do servidor:
  o autosave não re-tenta rejeição permanente, então um documento acima de 512 KB pararia
  de salvar de vez.
- Todo HTML que entra passa por `DocumentHtmlSanitizer` antes de tocar o banco. Nunca
  persista HTML vindo do cliente sem sanitizar, nem confie em sanitização feita no
  frontend.
- O documento é criado sozinho no primeiro `GET /{slug}`. Criação é limitada por IP e
  responde 429 quando o limite estoura.
- Expurgo diário às 03:00 (`documents:purge`) remove o que está sem acesso há mais de 30
  dias. É destrutivo e sem lixeira; qualquer mudança nessa regra precisa de teste.
- Migração que renomeia coluna usada pelos dois processos precisa de janela compatível:
  o `yjs-server` em produção continua rodando o código antigo durante o deploy.

---

## 6. Colaboração em tempo real

O caminho crítico do produto. Trate com cuidado.

1. O `DocumentController@show` resolve o documento e gera um token com escopo naquele UUID
   via `WebSocketTokenService`, entregue como prop do Inertia.
2. O cliente abre o WebSocket em `/{uuid}` passando o token pelo subprotocolo. O
   `yjs-server` valida origem, token e sala antes de aceitar.
3. O `y-indexeddb` mantém cache local por UUID, então a edição sobrevive a queda de rede.
4. O `yjs-server` aplica limite de conexões por IP e de mensagens por segundo, e persiste o
   snapshot no PostgreSQL.
5. Em paralelo, o cliente faz autosave do HTML em `POST /{slug}/save`, que sanitiza e grava
   `content_html`. É a representação legível do documento, não a fonte da verdade da edição
   concorrente.
6. Quando a reconexão falha duas vezes seguidas, o cliente recarrega apenas a prop `wsToken`
   e troca `protocols` do provider. Sem isso, uma aba aberta por mais de uma hora perde a
   colaboração em silêncio, porque o token expira e toda reconexão passa a levar 403.

Regras:

- O token é por documento e tem escopo. Não gere token genérico nem reaproveite entre salas.
- `auth.mjs` não conhece banco nem modelo. Mantenha a separação entre validação, persistência
  e limite de taxa; cada arquivo tem teste próprio em `yjs-server/test/`.
- O `yjs-server` roda `.mjs` puro, sem TypeScript e sem framework. Não introduza build lá.
- Nunca registre em log o conteúdo do documento nem o token. Log só de metadado (sala,
  tamanho, motivo).
- Mudança em formato de snapshot é quebra de compatibilidade com as abas já abertas. Pense
  em migração antes de mexer.

---

## 7. UI, tema e idioma

### Tokens de cor

Definidos em `resources/css/theme.css` dentro de `@theme`, nunca hardcoded nas views.

- `primary`, verde-oliva (`#657b18` no 500). Ação, link do editor, seleção, foco.
- `neutral`, cinzas frios do 50 ao 950. Superfície, borda e texto corrente.
- `success`, `warning`, `danger`, escalas parciais para estado.
- `highlight` (200 e 800), fundo da marcação de texto.
- `--brand-slash`, laranja da barra do wordmark, com valor próprio no tema claro e escuro.

A aparência do conteúdo do editor é dirigida por variáveis `--editor-*` declaradas em
`:root` e sobrescritas em `.dark`. As páginas institucionais usam a família `--external-*`
em `external.css`. Ao estilizar, use a variável do papel certo em vez de repetir o token de
cor cru.

Tipografia: `font-sans` (Inter) para texto corrente, `font-display` (Bricolage Grotesque)
para momentos de marca.

Regras de uso:

- NUNCA escreva cor literal em classe utilitária (`text-[#123456]`, `bg-[hsl(...)]`) nem em
  CSS de componente. Cor vem sempre de token ou de variável semântica. Se falta um passo de
  escala, crie em `theme.css` e use pelo nome.
- Valor arbitrário do Tailwind é permitido, e usado, para dimensão fluida (`clamp(...)`),
  grid explícito e referência a variável (`text-[var(--external-ink)]`). Não é permitido
  para cor literal.
- Tema escuro é obrigatório em tudo que for novo. A variante é `dark`, declarada por
  `@custom-variant` em `app.css` e acionada pela classe `.dark` na raiz.
- Respeite `motion-reduce`. O projeto já usa; mantenha.
- Contraste acessível segundo WCAG 2.2 nível AA: 4.5:1 para texto, 3:1 para texto grande,
  componentes e indicador de foco, nos dois temas.

### Idioma da interface

Diferente do resto do código, a interface é bilíngue. Existe camada de tradução e ela é
obrigatória.

- Toda string visível ao usuário vive em `resources/js/i18n/locales/pt-BR.ts` e `en.ts`,
  acessada por `useI18n()`. NUNCA escreva texto de interface direto na view.
- As duas locales têm exatamente as mesmas chaves. Adicionou em uma, adicione na outra na
  mesma mudança. `pt-BR` é a referência de tipo (`TranslationKey`), então uma chave que só
  existe em `en` nem compila do jeito certo.
- Chave em `dominio.oQueE` (`home.openButton`, `editor.placeholder`), camelCase depois do
  ponto.
- `pt-BR` é o padrão e o fallback quando o navegador não é reconhecido.
- `lang/` do Laravel serve apenas a mensagens do framework. Não é onde a copy mora.

---

## 8. Limites, custo e ciclo de vida

Como não há conta nem cobrança, todo limite é por IP ou por documento. Eles são a defesa do
serviço, não detalhe de configuração.

- O `throttle:60,1` do Laravel protege as rotas de documento.
- Criação de documento tem limite próprio por IP em `FindOrCreateDocument`.
- `YJS_MAX_CONNECTIONS_PER_IP`, `YJS_MAX_MESSAGES_PER_SECOND`, `YJS_MAX_MESSAGE_BURST`,
  `YJS_MAX_PAYLOAD_BYTES` e `YJS_MAX_DOCUMENT_BYTES` controlam o servidor colaborativo.
- Ao mexer em qualquer um desses valores, ajuste `.env.example` e
  `deploy/production.env.example` na mesma mudança, e diga no relato qual passa a ser o
  comportamento sob abuso.
- Documento sem acesso há 30 dias é apagado. O aviso de expiração na interface
  (`ExpirationNotice`) precisa continuar coerente com a regra do agendador.

---

## 9. Segurança

- Segredos só em `.env`. `.env.example` e `deploy/production.env.example` sempre
  atualizados, com valores vazios ou de exemplo.
- `APP_KEY` e `YJS_WS_SECRET` são independentes e devem ser diferentes entre ambientes.
  Nunca reutilize valor de produção em dev.
- HTML de documento é hostil por definição. `DocumentHtmlSanitizer` mais
  `TiptapAttributeSanitizer` são a fronteira. Ampliar a lista de elementos, atributos ou
  esquemas permitidos é mudança de segurança: justifique e cubra com teste.
- CSP com nonce por requisição em `ContentSecurityPolicy`. Nunca adicione
  `'unsafe-eval'` nem afrouxe `script-src` para resolver erro de build. Origem nova
  (fonte, imagem, WebSocket) entra explicitamente na diretiva certa.
- O `yjs-server` valida origem e token em toda conexão. Não aceite conexão sem token nem
  desligue a checagem de origem para facilitar teste local; use `YJS_ALLOWED_ORIGINS`.
- Rate limit nas rotas de documento e no WebSocket, sempre.
- Nada de PII ou conteúdo de documento em log, em erro reportado ou em métrica.
- O agente nunca comita.

---

## 10. Ferramentas de IA e MCP

- Laravel Boost está em `require-dev` e expõe contexto do app (schema, rotas, versões, docs
  com busca semântica). Prefira `search-docs` do Boost a assumir API de Laravel, Inertia ou
  Vue. `database-query` é somente leitura; a tool de Tinker executa PHP no app, use apenas em
  dev, nunca contra produção.
- As skills em `.agents/skills/` (`laravel-best-practices`, `inertia-vue-development`,
  `tailwindcss-development`) devem ser ativadas quando você entrar no domínio delas, sem
  esperar travar.
- `boost.json` e o bloco `<laravel-boost-guidelines>` são gerados. Não edite à mão; rode
  `php artisan boost:install` se precisar regerar.
- `.agents/`, `.claude/` e `.codex/` são ignorados pelo Git e ficam fora do ESLint e do
  Prettier de propósito. Não os trate como código do projeto.

---

## 11. Convenções de código

- Idioma. Todo código em inglês: classes, métodos, variáveis, tabelas, colunas, arquivos,
  chaves de i18n, nomes de componente. Texto visível ao usuário vem do i18n (ver §7).
  Documentação de projeto (`README.md`, este arquivo) em português.
- PHP: `declare(strict_types=1)` em todo arquivo, tipo explícito em parâmetro e retorno,
  promoção de propriedade no construtor, `final` onde não há intenção de herança, enum
  nativo para estado. O Pint aplica o resto; rode `vendor/bin/pint --dirty` antes de
  fechar.
- Vue: `<script setup lang="ts">`, um único elemento raiz, props tipadas por generic
  (`defineProps<{...}>()`), sem `any`. Componente novo entra na pasta do papel dele
  (`Editor/`, `Layout/`, `UI/`).
- Sem comentários. O código deve se explicar; se você sentiu vontade de comentar, renomeie,
  extraia função, simplifique. Exceção apenas onde a ferramenta exige (diretiva, ignore de
  lint) ou onde a regra é contraintuitiva e o porquê não cabe no nome.
- Validação em `$request->validate()` ou Form Request, nunca no meio da Action.
- Prefira rota nomeada e `route()` a URL literal.
- Pontuação correta e sóbria. Não use travessão, ponto centralizado nem dois-pontos como
  recurso de escrita em código, docs ou mensagens.
- Testes. Feature para fluxo HTTP (criação, save, limite de tamanho, CSP, expurgo), Unit
  para lógica pura (slug, sanitizador, token), Vitest para `resources/js/Lib/`,
  `node --test` para o `yjs-server`. Teste que existe não é removido sem aprovação.

---

## 12. Ambiente local e comandos

O PHP e o Node rodam nativos na máquina; só o PostgreSQL 18 sobe em Docker pelo
`docker-compose.yml`, publicado em `127.0.0.1:${DB_PORT}` com as credenciais do `.env`. Não
existe `.env.testing`: o Pest usa o mesmo `.env` e isola banco, cache, sessão e fila pelas
opções do `phpunit.xml`.

Primeiro setup:

```
composer install
cp .env.example .env
php artisan key:generate
composer run setup
```

Defina um `YJS_WS_SECRET` aleatório no `.env` antes de subir.

Dia a dia:

```
composer run dev            Laravel, Vite e Yjs juntos, com reload

vendor/bin/pint             corrige estilo PHP
vendor/bin/pest             suíte PHP
npm run lint                corrige ESLint
npm run format              corrige Prettier
npm run check               lint, formato, tipos, testes e build
npm --prefix yjs-server test
```

O hook de `pre-commit` (Husky mais lint-staged) roda Pint nos arquivos PHP e ESLint mais
Prettier nos arquivos do frontend que estão em stage. O CI roda as mesmas verificações em
modo somente leitura. O VS Code aplica as mesmas correções ao salvar, pelas configurações
compartilhadas em `.vscode/`.

Testes prioritários: validação e reserva de slug, sanitização de HTML, limite de tamanho do
documento, geração e verificação do token de WebSocket, regra de expurgo, cabeçalho CSP e
os três módulos do `yjs-server`.

---

## 13. Fora de escopo por enquanto (não construir sem pedir)

Autenticação, documento privado ou com senha, permissão de leitura e escrita, histórico de
versões e diff, comentários, exportação para PDF ou DOCX, upload de arquivo, busca entre
documentos, pasta ou workspace, editor offline completo, aplicativo mobile, SSR. Entram
depois, se fizerem sentido. Não antecipe.
