---
status: aceito
date: 2026-10-25
---

# Cabeçalhos de segurança pelo Traefik e build sem script inline

## Contexto e problema

A versão Laravel mandava CSP com nonce por requisição, `X-Frame-Options: DENY`, HSTS e `Referrer-Policy`. O site estático do Appwrite não deixa configurar cabeçalhos. O Nuxt em SPA também injeta dois scripts inline (o importmap da entrada e a configuração em `window.__NUXT__`), e o hash deles muda a cada build, o que impede uma CSP fixa sem `'unsafe-inline'`.

## Opções consideradas

- Middleware de cabeçalhos no Traefik, com roteador pelo domínio do site, e build sem script inline.
- CSP por `<meta>` com hash calculado no build.
- Ficar sem, contando só com o sanitizador de HTML e o esquema do Tiptap.

## Decisão

Opção escolhida: Traefik e build sem script inline.

- O `yjs-server/compose.yml` define, para cada ambiente, um roteador com o domínio do site que aponta para o serviço `appwrite_api` com um middleware de cabeçalhos: CSP (`script-src 'self'`, `frame-ancestors 'none'`, `connect-src` só para o Appwrite e o Yjs do ambiente), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e HSTS.
- O `nuxt.config.ts` desliga o importmap (`experimental.entryImportMap: false`) e move a configuração inline para um arquivo em `_nuxt/` no `nuxt generate`.
- `npm run check:csp`, no CI, falha se alguma página gerada tiver script inline executável.
- `style-src` mantém `'unsafe-inline'`, como na versão Laravel: o editor e a prévia de tema mexem no atributo `style`.

A CSP por `<meta>` foi descartada porque não cobre `frame-ancestors`.

Quando revisar: se o Appwrite Sites passar a aceitar cabeçalhos próprios.

### Consequências

- Bom: a mesma proteção da versão Laravel, sem nonce.
- Ruim: os cabeçalhos dependem do container do Yjs estar de pé; se ele parar, o site continua no ar sem os cabeçalhos.
- Ruim: domínio novo do site ou origem nova (fonte, Yjs) exige mudar o `compose.yml` e recriar o container.
