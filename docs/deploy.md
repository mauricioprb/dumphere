# Publicação

O Dumphere roda no Appwrite da fábrica (`overmaker.overclk.tech`), em dois projetos: `dumphere-dev` e `dumphere-prod`. São três partes:

| Parte | Onde | Como publica |
| --- | --- | --- |
| Site (`sites/app`) | Appwrite Sites, Nuxt estático | CI ou `appwrite push site` |
| Functions `documents` e `admin` | Appwrite Functions, PHP 8.4 | CI ou `appwrite push function` |
| Colaboração (`yjs-server`) | container no mesmo servidor, atrás do Traefik do Appwrite | à mão, como root no servidor |

O motivo do container fora do console está no [ADR 0001](decisions/0001-colaboracao-em-container-ao-lado.md).

## Primeira vez em cada ambiente

Exemplo com o `-dev`. Para o `-prod`, troque o sufixo, o domínio `dumphere-yjs-dev` por `dumphere-yjs` e o site pelo domínio de produção.

1. Crie o projeto `dumphere-dev` no console, como no guia [Criar o projeto](https://docs.overclk.tech/guia/criar-projeto), e libere o `localhost` como plataforma web.
2. Gere o segredo do WebSocket, que é o mesmo nas Functions e no container: `openssl rand -hex 32`.
3. Publique esquema e Functions: `appwrite push table --all --force` e `appwrite push function --all --activate --force`.
4. Nas duas Functions (`documents` e `admin`), crie as variáveis:
   - `YJS_WS_SECRET`: o segredo do passo 2;
   - `YJS_NOTIFY_URL`: `https://dumphere-yjs-dev.overclk.tech/notify`.

   Na `documents`, `RESERVED_PREFIX_MAX_DOCUMENTS` é opcional (padrão 50). Depois de criar variáveis, publique as Functions de novo.
5. Crie uma chave de API no projeto, chamada `yjs-server`, só com `rows.read` e `rows.write`.
6. No servidor, como root:

   ```bash
   git clone https://github.com/mauricioprb/dumphere.git /opt/dumphere
   cd /opt/dumphere/yjs-server
   cp .env.example .env.dev
   chmod 600 .env.dev
   ```

   No `.env.dev`, preencha `APPWRITE_API_KEY` (passo 5) e `YJS_WS_SECRET` (passo 2), e confira `YJS_ALLOWED_ORIGINS` com o endereço do site. Depois:

   ```bash
   docker compose up -d --build dev
   curl -s https://dumphere-yjs-dev.overclk.tech/health
   ```

   O `*.overclk.tech` já aponta para o servidor e tem certificado curinga, então não há DNS a criar.
7. Publique o site: `appwrite push site --all --activate --with-variables --force`, com o `sites/app/.env` copiado do `.env.example`.

## No dia a dia

O CI publica site, esquema e Functions: **Run workflow** manda qualquer branch para o `-dev`, e o merge na `main` manda para o `-prod`. Além dos segredos e variáveis do modelo da fábrica (`APPWRITE_API_KEY_DEV`, `APPWRITE_API_KEY_PROD`, `SITE_URL`, `DEPLOY_ENABLED`), o repositório precisa das variáveis `YJS_URL_DEV` (`wss://dumphere-yjs-dev.overclk.tech`), `YJS_URL_PROD` (`wss://dumphere-yjs.overclk.tech`) e, se quiser, `CONTACT_EMAIL`.

O `yjs-server` não entra no CI. Quando ele mudar, como root no servidor:

```bash
cd /opt/dumphere && git pull
cd yjs-server && docker compose up -d --build dev prod
```

O mesmo `compose.yml` põe os cabeçalhos de segurança (CSP, HSTS, `X-Frame-Options`) no domínio do site de cada ambiente ([ADR 0003](decisions/0003-cabecalhos-de-seguranca.md)). Domínio de produção novo: troque `SITE_HOST_PROD` num `.env` ao lado do `compose.yml` e recrie o container. Para conferir: `curl -sI https://dumphere-dev.app.overclk.tech | grep -i content-security`.

Rode um só container por ambiente: o Yjs guarda o documento em memória, e dois processos divergem. O `stop_grace_period` de 60 segundos dá tempo de gravar os documentos abertos antes de parar.

## Reservar um endereço

No console, Function `admin`, **Execute**, método `POST`, caminho `/grant`, corpo:

```json
{ "address": "acme", "password": "senha-do-dono", "readonly": false, "visitorPassword": "", "hue": null, "saturation": null, "years": 100 }
```

A resposta traz a `recoveryKey`. Ela aparece só nessa vez: entregue ao dono, que usa em `/recover` se esquecer a senha.

## Limpeza

A Function `admin` roda todo dia às 3h UTC e apaga as páginas sem acesso há mais de 30 dias, menos as de endereços reservados, e as tentativas com mais de um dia. Não há lixeira: o que foi apagado só volta pelo backup do servidor. Para rodar na hora, execute `POST /purge`.
