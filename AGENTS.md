# AGENTS.md

Editor de Markdown colaborativo, público e sem cadastro: o caminho da URL é o documento. Roda no Appwrite 2.6 da fábrica: site Nuxt 4 em modo SPA em `sites/app`, Functions PHP 8.4 em `functions/<nome>` e o servidor de colaboração Yjs em `yjs-server`, num container ao lado do Appwrite. A fonte de verdade do projeto Appwrite é o `appwrite.config.json`.

## Produto

- Não há conta, login nem perfil. Quem tem o endereço lê e edita; isso é intencional. Não prometa na interface uma privacidade que a arquitetura não entrega.
- Página sem visita há 30 dias é apagada, menos as de endereço reservado. O aviso `ExpirationNotice` segue essa regra.
- Privacidade é o produto: nada de dado pessoal, conteúdo de documento em log nem análise de comportamento. O IP só entra como hash na tabela `attempts`.
- Interface em português e inglês. Todo texto visível fica em `sites/app/app/i18n/locales/pt-BR.ts` e `en.ts`, com as mesmas chaves, lido por `useI18n()`.
- O design é próprio do Dumphere e não usa o Fuse UI. Cores só por tokens e variáveis de `sites/app/app/assets/css/theme.css` (`--workspace-*`, `--editor-*`, `--external-*`), nunca valor literal. Tema escuro e `motion-reduce` em tudo; contraste WCAG 2.2 AA.

## Regras

- Regra de negócio e autorização vivem na Function `documents`. O site cuida da tela e pode repetir validações só para ajudar quem usa.
- A Function `documents` é pública (`execute: ["any"]`): o dono de um endereço é reconhecido pelo `ownerToken` e o visitante de endereço com senha pelo `wsToken` assinado ([ADR 0002](docs/decisions/0002-functions-publicas-sem-conta.md)). A `admin` tem `execute: []`.
- O HTML do documento é hostil por definição. `DocumentHtmlSanitizer` e `TiptapAttributeSanitizer` são a barreira; ampliar o que passa é mudança de segurança, com teste.
- `DocumentSlug.php` e `RecoveryKey.php` existem nas duas Functions e precisam ser iguais (o CI confere). A lista de segmentos reservados também existe em `sites/app/app/Lib/documentPath.ts`, e um teste confere.
- O `yjs-server` valida origem e token em toda conexão. Mudou um limite (`YJS_MAX_*`, limites da tabela `attempts`)? Atualize `.env.example`, `docs/deploy.md` e `docs/dados.md` na mesma mudança.
- Toda mudança de banco, function ou site entra pelo `appwrite.config.json`, que aponta para o `dumphere-dev`; o merge na `main` publica no `dumphere-prod`. Mudou tabela ou coluna: atualize `docs/dados.md`.
- O código fica sem comentários. Decisões deste projeto viram ADR em `docs/decisions/`, copiando `modelo.md`.
- Segredos ficam nos arquivos `.env` e nas variáveis das Functions, fora do Git.

## Contornos herdados do modelo

- SDK PHP `appwrite/appwrite` fixo na 28.0.0, com `config.platform.php` 8.4.27: o runtime das Functions é PHP 8.4.
- Functions respondem JSON com `$context->res->text(json_encode(...))` e leem o corpo com `json_decode($context->req->bodyText, true)`.
- TypeScript 6.0.3 no site, por causa do `vue-tsc`.
- `noUncheckedIndexedAccess` desligado no site: o código do editor veio do projeto Vite, que não usava essa opção.
- O servidor usa `y-websocket` 1.5, porque a linha 3 tirou as APIs de servidor; o navegador já usa a 3.

## Pronto

Uma mudança está pronta quando estas verificações passam e o comportamento novo tem um teste que falha sem ela:

- `functions/documents`: `composer lint` e `composer test`.
- `functions/admin`: `composer lint`.
- `sites/app`: `npm run lint`, `npm run format:check`, `npm run typecheck` e `npm test`.
- `yjs-server`: `npm test`.
