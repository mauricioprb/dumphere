![Dumphere](public/images/readme/dumphere-header.png)

Editor público e colaborativo construído com Laravel, Inertia, Vue, Tiptap e Yjs.

## Arquitetura

- Laravel entrega a aplicação e persiste a representação HTML dos documentos.
- O servidor Yjs sincroniza as edições e persiste snapshots no PostgreSQL.
- As salas usam o UUID imutável do documento; o slug é apenas a URL pública.
- O IndexedDB oferece cache local/offline por UUID.
- O scheduler remove diariamente documentos sem acesso há mais de 30 dias.

## Desenvolvimento local

Requisitos: PHP 8.5+, Composer 2, Node 24 LTS, npm e Docker Compose.

Instale as dependências uma vez:

```bash
composer install
cp .env.example .env
php artisan key:generate
composer run setup
```

Depois, todo o ambiente de desenvolvimento inicia com um único comando:

```bash
composer run dev
```

Antes de iniciar, defina um `YJS_WS_SECRET` aleatório no `.env`. O comando inicia
o PostgreSQL 18 pelo Compose, aplica migrations e executa Laravel, Vite e o
servidor Yjs diretamente no host, todos com reload automático.

Depois, acesse:

- aplicação: <http://localhost:8000>
- Vite/HMR: `localhost:5173`
- WebSocket Yjs: `localhost:1234`

O Compose usa as configurações `DB_*` do `.env` convencional e publica o
PostgreSQL em `127.0.0.1:${DB_PORT}`. Não há `.env.testing`: Pest carrega o
mesmo `.env`, mantendo apenas banco, cache, sessão e filas isolados durante os
testes pelas opções do `phpunit.xml`.

Comandos úteis:

```bash
# Executar a suíte PHP
composer test

# Verificar frontend (lint + formato + tipos + testes + build)
npm run check

# Estilo de código PHP (Pint)
composer lint       # corrige
composer lint:test  # apenas verifica, igual ao CI

# Estilo e qualidade do frontend (ESLint + Prettier)
npm run lint        # corrige
npm run format      # corrige
npm run lint:test   # apenas verifica, igual ao CI
npm run format:test

# Testar o servidor colaborativo
npm --prefix yjs-server test

# Iniciar ou parar somente o PostgreSQL
composer run services
composer run services:stop
```

O `npm ci` do `composer run setup` instala o hook de `pre-commit` (Husky). A cada
commit, o `lint-staged` roda Pint nos arquivos PHP e ESLint + Prettier nos
arquivos do frontend que estão em stage, corrigindo e re-adicionando o resultado.
As mesmas verificações rodam no CI em modo somente-leitura. O VS Code aplica as
mesmas correções ao salvar, com as configurações compartilhadas em
`.vscode/settings.json` e as extensões recomendadas em `.vscode/extensions.json`.

Ao migrar um volume local existente do PostgreSQL 17 para o 18, faça
dump/restore ou `pg_upgrade`. Se os dados locais forem descartáveis, é possível
recriar o volume com `docker compose down -v`; esse comando apaga
definitivamente o banco local. O volume anterior `md-online-editor_postgres_data`
não é reutilizado automaticamente e permanece preservado para uma eventual
migração.

### Política de versões

O projeto acompanha os majors estáveis atuais de PHP, Laravel, Inertia, Pest,
Vite, Node LTS e PostgreSQL. Duas dependências permanecem deliberadamente abaixo do
maior número publicado:

- TypeScript 6 é a versão mais nova compatível com o `vue-tsc` atual;
- o servidor usa `y-websocket` 1.5 porque a linha 3 removeu as APIs de servidor
  embutidas; o cliente já utiliza `y-websocket` 3.

Os tipos `@types/node` acompanham o runtime Node 24, não a linha Current 26.

## Produção com Laravel Forge

O Forge gerencia Nginx, PHP-FPM, certificados, releases e o processo Node do Yjs.
O PostgreSQL pode ficar no mesmo servidor. O Docker Compose continua sendo usado
apenas no desenvolvimento local.

### Servidor e site

Crie um App Server com PostgreSQL 18 e configure PHP 8.5, Composer 2, Node 24 e
npm 11 ou superior. Confirme `pdo_pgsql`, `mbstring`, `intl`, `bcmath`, `pcntl`
e `zip` no PHP usado pelo site e pelos comandos.

Crie um site Laravel conectado ao repositório e à branch `main`, com
Zero-downtime deployments habilitado e diretório público `/public`. Configure o
domínio e o certificado HTTPS pelo Forge. Adicione `storage` aos caminhos
compartilhados entre releases; o Forge já compartilha `.env` automaticamente.

Mantenha Push to deploy desativado e publique pelo painel depois de o CI passar.
O GitHub Actions continua verificando PHP, frontend, dependências e colaboração.

Preencha Environment no Forge usando `.env.example` como base. Configure as
credenciais reais do PostgreSQL e aplique os valores abaixo, substituindo o
domínio e o e-mail pelos seus.

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://editor.example.com
CONTACT_EMAIL=contato@editor.example.com
LOG_CHANNEL=daily
LOG_LEVEL=warning
SESSION_DRIVER=cookie
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
QUEUE_CONNECTION=sync
HOST=127.0.0.1
PORT=1234
YJS_ALLOWED_ORIGINS=https://editor.example.com
YJS_WS_PUBLIC_URL=wss://editor.example.com/yjs-ws
YJS_TRUST_PROXY=true
VITE_YJS_WS_HOST=
VITE_YJS_WS_PORT=
VITE_YJS_WS_SCHEME=
VITE_YJS_WS_PATH=
```

Gere `APP_KEY` e `YJS_WS_SECRET` diferentes, com pelo menos 32 caracteres e
exclusivos desse ambiente. Para gerar a chave do WebSocket no servidor, use
`openssl rand -hex 32`.

Laravel e Yjs usam o mesmo PostgreSQL e o mesmo `YJS_WS_SECRET`. A porta 1234 fica
restrita a `127.0.0.1`; o navegador se conecta por HTTPS/WSS através do Nginx.
As variáveis `VITE_YJS_WS_*` podem permanecer vazias porque a URL pública é
derivada do domínio HTTPS aberto no navegador, com o caminho `/yjs-ws/`. Não coloque segredos em variáveis `VITE_*`.

### Script de deploy

Use o script abaixo em Deployments > Deploy script no Forge. As macros são
interpretadas pelo painel e não devem ser executadas diretamente por SSH.

```bash
set -e

$CREATE_RELEASE()

cd "$FORGE_RELEASE_DIRECTORY"

"$FORGE_COMPOSER" install --no-dev --no-interaction --prefer-dist --optimize-autoloader
HUSKY=0 npm ci --include=dev --no-audit --no-fund
npm run build
npm --prefix yjs-server ci --omit=dev --omit=optional --no-audit --no-fund

"$FORGE_PHP" artisan migrate --force --no-interaction
"$FORGE_PHP" artisan optimize

$ACTIVATE_RELEASE()
$RESTART_QUEUES()
```

Depois do primeiro deploy, crie o processo Yjs descrito abaixo. Acrescente ao
final do script as duas linhas seguintes, substituindo `12345` pelo ID real do
processo no Forge. Assim, os próximos deploys reiniciam o Yjs com o novo release.

```bash
sudo -n supervisorctl restart 'daemon-12345:*'
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 http://127.0.0.1:1234/health
```

O frontend precisa das dependências de desenvolvimento para compilar. Por isso,
o script usa `npm ci --include=dev`, enquanto o Yjs recebe somente dependências
de produção. As migrations devem continuar compatíveis com o release anterior,
que permanece atendendo durante a preparação do novo release.

O modelo segue as [macros de deploy do Forge](https://laravel.com/forge/docs/sites/deployments).

### Processo colaborativo

Depois do primeiro deploy, crie um processo Custom em Processes no site.
Use os valores abaixo, ajustando o diretório para o domínio e o usuário do site.

| Campo           | Valor                                               |
| --------------- | --------------------------------------------------- |
| Comando         | `node --env-file=../.env server.mjs`                |
| Diretório       | `/home/forge/editor.example.com/current/yjs-server` |
| Usuário         | O usuário do site, normalmente `forge`              |
| Processos       | `1`                                                 |
| Sinal de parada | `SIGTERM`                                           |
| Tempo de parada | `60` segundos                                       |

Use o executável Node 24 do servidor, com caminho absoluto se ele não estiver no
PATH do Supervisor. O sinal e o tempo de parada permitem ao Yjs persistir os
snapshots antes de encerrar. Não aumente o número de processos sem alterar a
arquitetura de sincronização entre instâncias.

Use o ID atribuído pelo Forge no comando de reinício do script de deploy e
confirme que o processo está em execução. Teste no servidor com
`curl --fail http://127.0.0.1:1234/health`.

O Forge usa [Supervisor para manter o processo ativo](https://laravel.com/forge/docs/resources/background-processes).

### Nginx e WebSocket

Adicione o trecho abaixo ao contexto `http` do Nginx no servidor. Ele define os
limites e o formato de log sem IP, URL, query string, referrer ou user-agent.

```nginx
log_format dumphere_privacy escape=json
    '{"timestamp":"$time_iso8601",'
    '"request_id":"$request_id",'
    '"method":"$request_method",'
    '"status":$status,'
    '"bytes":$body_bytes_sent,'
    '"duration_seconds":$request_time}';

limit_req_zone $binary_remote_addr zone=dumphere_pages:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=dumphere_saves:10m rate=1r/s;
limit_conn_zone $binary_remote_addr zone=dumphere_websockets:10m;
```

No editor de configuração Nginx do site no Forge, incorpore o trecho seguinte
ao bloco `server` HTTPS. Substitua as diretivas existentes de mesmo nome,
incluindo `access_log`, headers e `location /`, para não duplicá-las. Preserve os
includes, os caminhos, a configuração PHP e os certificados gerenciados pelo
Forge. No bloco de redirecionamento HTTP, use `access_log off` para não registrar
os endereços dos documentos.

```nginx
client_max_body_size 600k;
access_log /var/log/nginx/dumphere.access.log dumphere_privacy;

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

location /yjs-ws/ {
    limit_conn dumphere_websockets 10;
    rewrite ^/yjs-ws/(.*) /$1 break;
    proxy_pass http://127.0.0.1:1234;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}

location / {
    limit_req zone=dumphere_pages burst=15 nodelay;
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ /save$ {
    limit_req zone=dumphere_saves burst=5 nodelay;
    try_files $uri $uri/ /index.php?$query_string;
}
```

Execute `sudo nginx -t` antes de recarregar o Nginx. O trecho mantém os limites
HTTP e encaminha `/yjs-ws/` ao Yjs, removendo o prefixo antes do UUID da sala.
Não publique a porta 1234 diretamente.

### Agendamento e operação

Ative o scheduler Laravel no Forge para executar `php artisan schedule:run`
a cada minuto no release atual. O comando `documents:purge` já está agendado
para 03h e respeita a proteção dos endereços especiais.

Ative o health check do deploy no Forge e aponte para `/health` do domínio.
Configure backups do PostgreSQL. Confira os logs da aplicação no storage
compartilhado e os logs do processo Yjs no Forge quando houver falhas de
persistência ou reconexão.

Para criar um endereço especial, execute no diretório do release atual
`php artisan prefix:grant nome-do-endereco` e informe a senha quando solicitado.
Não há integração de pagamento.

## Verificação

```bash
composer test
vendor/bin/pint --test
npm run check
npm --prefix yjs-server test
composer audit --locked --no-dev
npm audit --omit=dev
npm --prefix yjs-server audit --omit=dev
```
