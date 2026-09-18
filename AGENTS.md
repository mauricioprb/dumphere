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

# Project AGENTS.md

> Persistent context for coding agents. Read this file in full before any task. It
> reflects decisions that are already made, so respect them, and if something here
> conflicts with a request, name the conflict before acting.
>
> The `<laravel-boost-guidelines>` block above is generated by `boost:install` and
> rewritten on every run. Never edit inside it. Everything that is a decision of this
> project lives from here down. Where the two disagree, this document wins.

---

## 1. How you should work (read first)

These rules take priority over delivery speed.

- Work in small, reviewable increments. Do NOT implement everything at once. One coherent
  slice at a time, then stop and report.
- Before any large change, present a short plan and wait for approval.
- NEVER run `git commit`, `git push` or any write to history. Prepare the changes; the
  commit is always the human's. NEVER commit secrets.
- NEVER use `git checkout --`, `git restore`, `git stash` or `git reset` on files with
  uncommitted changes. The working tree usually holds work in progress and those commands
  erase it without warning. To undo something you wrote yourself, edit the file back.
- Do not invent third-party library contracts (Tiptap, Yjs, y-websocket, Inertia). If you
  are unsure of an API, check the official documentation or Boost's `search-docs`. Without
  access, ask. Do not guess.
- Data integrity and concurrency need a test first. Any code touching HTML sanitization,
  slug validation, WebSocket tokens, Yjs state persistence or document purging ships with a
  Pest test.
- Close every task clean. Run `composer lint:test`, `npm run lint:test`,
  `npm run format:test`, `npm run type-check` and `vendor/bin/pest`. It is only done if all
  of them pass. If you touched `yjs-server/`, also run `npm --prefix yjs-server test`.
- When in doubt, ask. Ambiguity is not permission to assume.

---

## 2. The product

A collaborative, public, sign-up-free text editor. Someone types a path, opens the page and
writes; anyone with the link joins the same room and edits along, in real time. The
document is created on its own at first access and removed after 30 days without visits.

- There is NO authentication, account, login or profile. The `User` model, the `users`
  table and Laravel's queue and mail scaffolding were removed because nothing used them.
  Do not bring them back or build on top of them.
- It is NOT multi-tenant and has no billing. A Stripe integration existed and was removed;
  do not add that complexity back.
- Privacy is the product. Do not collect PII, do not log document content, and do not add
  behavioral analytics.
- Access is by link obscurity, and that is intentional. Anyone with the slug reads and
  writes. Do not promise privacy the architecture does not deliver, in the copy or in the
  terms.
- Interface in Portuguese and English, chosen by browser language (see §7).

---

## 3. Stack

| Layer                | Choice                                                       |
| -------------------- | ------------------------------------------------------------ |
| Framework            | Laravel 13, PHP 8.5                                          |
| View layer           | Inertia 3 with Vue 3, no Blade beyond `app.blade.php`        |
| Editor               | Tiptap 3 (ProseMirror) with `tiptap-markdown` and `lowlight` |
| Collaboration        | Yjs 13, `y-websocket` on the client, `y-indexeddb` offline   |
| Collaboration server | Node 24, `yjs-server/`, a process separate from Laravel      |
| Styling              | Tailwind 4 via `@tailwindcss/vite`, tokens in `@theme`       |
| Client state         | Pinia                                                        |
| Database             | PostgreSQL 18, for both Laravel and the snapshots            |
| Build                | Vite 8, TypeScript 6, `vue-tsc`                              |
| PHP tests            | Pest 4                                                       |
| Frontend tests       | Vitest                                                       |
| yjs-server tests     | `node --test`, no framework                                  |
| PHP code style       | Laravel Pint (`pint.json`)                                   |
| Frontend code style  | ESLint 10 flat config plus Prettier                          |
| Deploy               | Nginx plus PHP-FPM, the Yjs server under a supervisor        |
| AI context           | Laravel Boost                                                |

Constraints that are already decided:

- The client uses `y-websocket` 3; the server stays on `y-websocket` 1.5 because the 3.x
  line removed the built-in server APIs. Do not "upgrade" the server without rewriting the
  connection layer.
- TypeScript stays on 6 because it is the newest compatible with the current `vue-tsc`.
- `@types/node` tracks the Node 24 runtime, not the Current line.
- Keep Inertia plus Vue. Do not introduce Livewire, Blade with logic, or SSR without
  discussing it.
- Do not add a dependency without approval, on either side (`composer.json` and
  `package.json`).

---

## 4. Architecture

Two processes, one database.

Laravel serves the pages, validates slugs, sanitizes HTML and persists the HTML
representation of the document. `yjs-server` synchronizes edits over WebSocket and persists
the binary CRDT snapshot. Both write to the same `documents` table, in different columns. A
change on one side that alters a column format requires looking at the other side.

On the PHP side, the default Laravel skeleton plus two folders: `Actions/` and `Support/`.
No domain layer, no DTOs, no repositories. The app has one model and a handful of routes;
structure beyond that is ceremony that only gets in the reader's way.

```
app/
├── Actions/                     one use case per class, execute() method
│                                FindOrCreateDocument, ListDocumentChildren,
│                                PersistDocumentContent, PurgeStaleDocuments
├── Console/Commands/            GrantPrefixCommand, PurgeStaleDocumentsCommand
├── Http/
│   ├── Controllers/             DocumentController, PrefixController
│   └── Middleware/              ContentSecurityPolicy, HandleInertiaRequests,
│                                SanitizeSlug, SetLocale
├── Models/                      Document
└── Support/                     DocumentHtmlSanitizer, DocumentSlug, ErrorPage,
                                 PrefixCookie, RecoveryKey, SeoMetadata,
                                 TiptapAttributeSanitizer, WebSocketTokenService

resources/js/
├── Pages/                       Home, Terms, Document/Show (Inertia pages)
├── Components/Editor/           Tiptap, toolbar, menus, modals
├── Components/Layout/           AppLayout, ExternalPageShell
├── Components/UI/               small reusable pieces
├── Composables/                 use* (Yjs, autosave, presence, theme, i18n)
├── Extensions/                  Tiptap extensions (slash commands, emoji, code block)
├── Lib/                         pure, testable functions, no Vue
├── Stores/                      Pinia
├── i18n/locales/                pt-BR.ts, en.ts
└── types/                       shared types

resources/css/
├── app.css                      entry point, imports and @source
├── theme.css                    tokens (@theme) and editor variables
├── editor.css                   appearance of Tiptap content
└── external.css                 institutional pages (Home, Terms)

yjs-server/
├── server.mjs                   HTTP plus WebSocket, orchestration
├── auth.mjs                     origin, IP, token, room
├── persistence.mjs              reading and writing the snapshot in PostgreSQL
├── rate-limit.mjs               message limit per connection
└── test/                        node --test
```

Structural rules:

- Stay inside the Laravel skeleton. Do NOT create `Domain/`, `Repositories/`, `DTOs/`, a
  `Services/` separate from `Support/`, or `Application/Infrastructure`. Eloquent is the
  repository and the container resolves dependencies on its own.
- `Actions/` is for a use case with business logic, with one `execute()` method. If the new
  class has no logic, it is not an Action.
- `Support/` is the single folder for stateless collaborators: validator, sanitizer, token
  generator. Do not split it into subfolders or create a `Services/` beside it.
- Thin controllers. A controller resolves, delegates to the Action and returns a response.
  Assembling the Inertia payload stays in the controller, inline. If a second endpoint ever
  needs the same shape, extract an `Http/Resources/DocumentResource` then, not before.
- Do not create a ServiceProvider to register a concrete class. The container auto-resolves;
  a binding only earns its place when there is an interface or genuinely expensive
  construction.
- In `resources/js/`, whatever can be a pure function goes to `Lib/` and gets a Vitest test.
  `Composables/` is for what depends on reactivity or the Vue lifecycle.
- If you cannot explain in one sentence why a folder exists, it should not exist yet.

---

## 5. Domain model

A single business table. There is no relation to a user because there is no user.

`documents`

- `id` (uuid, PK). The real, immutable identity of the document. The WebSocket room uses the
  UUID, never the slug.
- `slug` (string 200, unique, index). Only the public URL. Its meaning can change for the
  human; do not use it as a key in anything persistent.
- `title` (string 255, nullable).
- `content_html` (longtext, nullable). Sanitized HTML representation, written by Laravel.
  The editor only reads it when the CRDT is empty, meaning a document that never synced.
  After the first snapshot it becomes read-only, for humans and for backup; do not treat it
  as a recovery path for editing, because it is not read back.
- `yjs_state_base64` (longtext, nullable). CRDT snapshot, written by `yjs-server`.
- `last_accessed_at` (timestamp, nullable, index). The basis of the purge.
- `created_at`, `updated_at`. Composite index `(last_accessed_at, created_at)`.

Reserved-prefix columns, all nullable and only meaningful on a root slug:

- `reserved_until` (timestamp, index). A root whose reservation is in the future is exempt
  from the purge, together with its children.
- `readonly` (boolean). Leaves the address read-only for visitors.
- `visitor_password_hash`, `owner_password_hash`, `owner_recovery_key_hash`,
  `owner_session_id`. Access control for the reserved address. All hidden on the model.
- `theme_hue`, `theme_chroma`, `theme_hue_dark`, `theme_chroma_dark`. A pinned palette,
  written to the page before first paint.

Rules that matter:

- Slugs are validated by `DocumentSlug`, not by a regex scattered around. At most 100
  characters and 4 segments, lowercase, `[a-z0-9-]` per segment, no `//`, and the first
  part cannot be a reserved term (`admin`, `api`, `health`, `terms` and the rest of the
  list). The list exists twice: `RESERVED_FIRST_SEGMENTS` in `DocumentSlug` decides, and the
  copy in `resources/js/Lib/documentPath.ts` only spares the browser a round trip. When
  adding a first-level route, add the term to both in the same change, or the route becomes
  a document. `DocumentSlugTest` fails if the two lists disagree.
- `Document::MAX_SIZE_BYTES` (512 KB) limits the HTML and feeds the sanitizer's
  `withMaxInputLength`. `yjs-server` has its own ceiling (`YJS_MAX_DOCUMENT_BYTES`, 2 MB).
  They are distinct and deliberate limits; do not unify them without thinking about both
  formats. The editor has a third ceiling, `MAX_DOCUMENT_CHARACTERS` in
  `editorExtensions.ts`, whose job is to keep the document from reaching the server
  ceiling: autosave does not retry a permanent rejection, so a document above 512 KB would
  stop saving for good.
- All incoming HTML passes through `DocumentHtmlSanitizer` before touching the database.
  Never persist HTML from the client without sanitizing, and never trust sanitization done
  in the frontend.
- The document is created on its own at the first `GET /{slug}`. Creation is rate-limited by
  IP and answers 429 when the limit is exceeded.
- Daily purge at 03:00 (`documents:purge`) removes what has been untouched for more than 30
  days. It is destructive and has no trash; any change to that rule needs a test.
- A migration renaming a column used by both processes needs a compatible window: the
  `yjs-server` in production keeps running the old code during the deploy.

---

## 6. Real-time collaboration

The product's critical path. Handle with care.

1. `DocumentController@show` resolves the document and generates a token scoped to that
   UUID via `WebSocketTokenService`, delivered as an Inertia prop.
2. The client opens the WebSocket at `/{uuid}` passing the token through the subprotocol.
   `yjs-server` validates origin, token and room before accepting.
3. `y-indexeddb` keeps a local cache per UUID, so editing survives a network drop.
4. `yjs-server` applies a per-IP connection limit and a messages-per-second limit, and
   persists the snapshot to PostgreSQL.
5. In parallel, the client autosaves the HTML to `POST /{slug}/save`, which sanitizes and
   writes `content_html`. It is the readable representation of the document, not the source
   of truth for concurrent editing.
6. When reconnection fails twice in a row, the client reloads only the `wsToken` prop and
   swaps the provider's `protocols`. Without that, a tab open for more than an hour loses
   collaboration silently, because the token expires and every reconnection starts getting 403.

Rules:

- The token is per document and scoped. Do not generate a generic token or reuse one across
  rooms.
- `auth.mjs` knows nothing about the database or the model. Keep validation, persistence and
  rate limiting separate; each file has its own test in `yjs-server/test/`.
- `yjs-server` runs plain `.mjs`, with no TypeScript and no framework. Do not introduce a
  build step there.
- Never log document content or the token. Log metadata only (room, size, reason).
- A change to the snapshot format breaks compatibility with tabs that are already open.
  Think about migration before touching it.

---

## 7. UI, theme and language

### Color tokens

Defined in `resources/css/theme.css` inside `@theme`, never hardcoded in views.

- `primary`, olive green (`#657b18` at 500). Actions, editor links, selection, focus.
- `neutral`, cool grays from 50 to 950. Surface, border and body text.
- `success`, `warning`, `danger`, partial scales for state.
- `highlight` (200 and 800), background of highlighted text.
- `--brand-slash`, the orange of the wordmark slash, with its own value in light and dark.

The appearance of editor content is driven by `--editor-*` variables declared on `:root` and
overridden in `.dark`. Institutional pages use the `--external-*` family in `external.css`.
When styling, use the variable for the right role instead of repeating the raw color token.

Typography: `font-sans` (Inter) for body text, `font-display` (Bricolage Grotesque) for
brand moments.

Usage rules:

- NEVER write a literal color in a utility class (`text-[#123456]`, `bg-[hsl(...)]`) or in
  component CSS. Color always comes from a token or a semantic variable. If a scale step is
  missing, create it in `theme.css` and use it by name.
- Tailwind arbitrary values are allowed, and used, for fluid dimensions (`clamp(...)`),
  explicit grids and variable references (`text-[var(--external-ink)]`). They are not
  allowed for literal colors.
- Dark theme is mandatory in everything new. The variant is `dark`, declared by
  `@custom-variant` in `app.css` and triggered by the `.dark` class on the root.
- Respect `motion-reduce`. The project already does; keep it.
- Accessible contrast per WCAG 2.2 level AA: 4.5:1 for text, 3:1 for large text, components
  and focus indicators, in both themes.

### Interface language

Unlike the rest of the code, the interface is bilingual. There is a translation layer and it
is mandatory.

- Every user-visible string lives in `resources/js/i18n/locales/pt-BR.ts` and `en.ts`,
  accessed through `useI18n()`. NEVER write interface text directly in a view.
- Both locales have exactly the same keys. Added one to one, add it to the other in the same
  change. `pt-BR` is the type reference (`TranslationKey`), so a key that exists only in
  `en` does not even compile properly.
- Keys as `domain.whatItIs` (`home.openButton`, `editor.placeholder`), camelCase after the
  dot.
- `pt-BR` is the default and the fallback when the browser is not recognized.
- Laravel's `lang/` only serves framework messages. It is not where the copy lives.

---

## 8. Limits, cost and lifecycle

Since there is no account and no billing, every limit is per IP or per document. They are
the service's defense, not a configuration detail.

- Laravel's `throttle:60,1` protects the document routes.
- Document creation has its own per-IP limit in `FindOrCreateDocument`.
- `YJS_MAX_CONNECTIONS_PER_IP`, `YJS_MAX_MESSAGES_PER_SECOND`, `YJS_MAX_MESSAGE_BURST`,
  `YJS_MAX_PAYLOAD_BYTES` and `YJS_MAX_DOCUMENT_BYTES` control the collaboration server.
- When touching any of those values, update `.env.example` and `docs/deploy.md` in the same
  change, and say in your report what the behavior under abuse becomes.
- A document untouched for 30 days is deleted. The expiration notice in the interface
  (`ExpirationNotice`) has to stay consistent with the scheduler's rule.

---

## 9. Security

- Secrets only in `.env`. `.env.example` and the examples in `docs/` are always up to date,
  with empty or example values.
- `APP_KEY` and `YJS_WS_SECRET` are independent and must differ between environments. Never
  reuse a production value in dev.
- Document HTML is hostile by definition. `DocumentHtmlSanitizer` plus
  `TiptapAttributeSanitizer` are the boundary. Widening the list of allowed elements,
  attributes or schemes is a security change: justify it and cover it with a test.
- CSP with a per-request nonce in `ContentSecurityPolicy`. Never add `'unsafe-eval'` or
  loosen `script-src` to fix a build error. A new origin (font, image, WebSocket) is added
  explicitly to the right directive.
- `yjs-server` validates origin and token on every connection. Do not accept a connection
  without a token or turn off the origin check to make local testing easier; use
  `YJS_ALLOWED_ORIGINS`.
- Rate limits on the document routes and on the WebSocket, always.
- No PII or document content in logs, in reported errors or in metrics.
- Vulnerability reports go through `SECURITY.md`, never a public issue.
- The agent never commits.

---

## 10. AI tooling and MCP

- Laravel Boost is in `require-dev` and exposes app context (schema, routes, versions, docs
  with semantic search). Prefer Boost's `search-docs` over assuming a Laravel, Inertia or
  Vue API. `database-query` is read-only; the Tinker tool executes PHP in the app, use it
  only in dev, never against production.
- The skills in `.agents/skills/` (`laravel-best-practices`, `inertia-vue-development`,
  `tailwindcss-development`) should be activated when you enter their domain, without
  waiting to get stuck.
- `boost.json` and the `<laravel-boost-guidelines>` block are generated. Do not edit them by
  hand; run `php artisan boost:install` if you need to regenerate.
- `.agents/`, `.claude/` and `.codex/` are Git-ignored and deliberately outside ESLint and
  Prettier. Do not treat them as project code.

---

## 11. Code conventions

- Language. All code in English: classes, methods, variables, tables, columns, files, i18n
  keys, component names. User-visible text comes from i18n (see §7). Project documentation
  (`README.md`, `docs/`, this file) in English as well, since the repository is public.
- PHP: `declare(strict_types=1)` in every file, explicit types on parameters and returns,
  constructor property promotion, `final` where inheritance is not intended, native enums
  for state. Pint handles the rest; run `vendor/bin/pint --dirty` before closing.
- Vue: `<script setup lang="ts">`, a single root element, props typed by generic
  (`defineProps<{...}>()`), no `any`. A new component goes in the folder for its role
  (`Editor/`, `Layout/`, `UI/`).
- No comments. The code should explain itself; if you felt the urge to comment, rename,
  extract a function, simplify. The exception is only where a tool requires it (a directive,
  a lint ignore) or where the rule is counterintuitive and the why does not fit in a name.
- Validation in `$request->validate()` or a Form Request, never in the middle of an Action.
- Prefer a named route and `route()` over a literal URL.
- Correct, sober punctuation. Do not use em dashes, middots or colons as a writing device in
  code, docs or messages.
- Tests. Feature for HTTP flows (creation, save, size limit, CSP, purge), Unit for pure
  logic (slug, sanitizer, token), Vitest for `resources/js/Lib/`, `node --test` for
  `yjs-server`. A test that exists is not removed without approval.

---

## 12. Local environment and commands

PHP and Node run natively on the machine; only PostgreSQL 18 comes up in Docker through
`docker-compose.yml`, published on `127.0.0.1:${DB_PORT}` with the credentials from `.env`.
There is no `.env.testing`: Pest uses the same `.env` and isolates database, cache, session
and queue through the options in `phpunit.xml`.

First setup:

```
composer install
cp .env.example .env
php artisan key:generate
composer run setup
```

Set a random `YJS_WS_SECRET` in `.env` before starting.

Day to day:

```
composer run dev            Laravel, Vite and Yjs together, with reload

vendor/bin/pint             fixes PHP style
vendor/bin/pest             PHP suite
npm run lint                fixes ESLint
npm run format              fixes Prettier
npm run check               lint, format, types, tests and build
npm --prefix yjs-server test
```

The pre-commit hook (Husky plus lint-staged) runs Pint on staged PHP files and ESLint plus
Prettier on staged frontend files. CI runs the same checks in read-only mode. VS Code
applies the same fixes on save, through the settings shared in `.vscode/`.

Priority tests: slug validation and reservation, HTML sanitization, document size limit,
WebSocket token generation and verification, the purge rule, the CSP header and the three
`yjs-server` modules.

---

## 13. Out of scope for now (do not build without being asked)

Authentication and accounts, read and write permissions beyond the reserved-prefix controls
that already exist, version history and diff, comments, export to PDF or DOCX, file upload,
search across documents, folders or workspaces, a full offline editor, a mobile app, SSR,
and any form of billing. They come later, if they make sense. Do not anticipate them.
