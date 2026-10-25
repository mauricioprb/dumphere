---
status: proposto
date: 2026-10-25
---

# Cabeçalhos de segurança do site

## Contexto e problema

A versão Laravel mandava CSP com nonce por requisição, `X-Frame-Options: DENY`, HSTS e `Referrer-Policy`. O site estático do Appwrite não deixa configurar cabeçalhos, e o Nuxt em SPA injeta um script inline de configuração, então uma CSP por `<meta>` exigiria o hash desse script a cada build.

## Opções consideradas

- Middleware de cabeçalhos no Traefik, com roteador pelo domínio do site.
- CSP por `<meta>` com hash calculado no build.
- Ficar sem, contando com o sanitizador de HTML e o esquema do Tiptap.

## Decisão

Pendente. Hoje o site sai sem esses cabeçalhos. A defesa contra XSS armazenado continua no `DocumentHtmlSanitizer` (servidor) e no esquema do ProseMirror (navegador).

Quando revisar: antes de apontar o domínio de produção para o Appwrite.

### Consequências

- Ruim: sem proteção contra clickjacking (`frame-ancestors`) e sem a segunda barreira da CSP.
