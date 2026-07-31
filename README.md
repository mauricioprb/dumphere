# Dumphere

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
composer run setup
```

Depois, todo o ambiente de desenvolvimento inicia com um único comando:

```bash
composer run dev
```

Esse comando inicia o PostgreSQL 18 pelo Compose, aplica migrations e executa
Laravel, Vite e o servidor Yjs diretamente no host, todos com reload automático.
Se o `.env` não existir, ele será criado a partir do `.env.example` com uma
`APP_KEY` e um `YJS_WS_SECRET` locais aleatórios. Segredos já configurados nunca
são substituídos.

Depois, acesse:

- aplicação: <http://localhost:8000>
- Vite/HMR: `localhost:5173`
- WebSocket Yjs: `localhost:1234`

O Compose usa as configurações `DB_*` do `.env` convencional e publica o
PostgreSQL em `127.0.0.1:${DB_PORT}`. Não há `.env.testing`: PHPUnit carrega o
mesmo `.env`, mantendo apenas banco, cache, sessão e filas isolados durante os
testes pelas opções do `phpunit.xml`.

Comandos úteis:

```bash
# Executar a suíte PHP
composer test

# Verificar frontend
npm run check

# Testar o servidor colaborativo
npm --prefix yjs-server test

# Iniciar ou parar somente o PostgreSQL
composer run services
composer run services:stop
```

Ao migrar um volume local existente do PostgreSQL 17 para o 18, faça
dump/restore ou `pg_upgrade`. Se os dados locais forem descartáveis, é possível
recriar o volume com `docker compose down -v`; esse comando apaga
definitivamente o banco local. O volume anterior `md-online-editor_postgres_data`
não é reutilizado automaticamente e permanece preservado para uma eventual
migração.

### Política de versões

O projeto acompanha os majors estáveis atuais de PHP, Laravel, Inertia, Vite,
Node LTS e PostgreSQL. Três dependências permanecem deliberadamente abaixo do
maior número publicado:

- PHPUnit 12 é a linha recomendada pelo guia oficial do Laravel 13;
- TypeScript 6 é a versão mais nova compatível com o `vue-tsc` atual;
- o servidor usa `y-websocket` 1.5 porque a linha 3 removeu as APIs de servidor
  embutidas; o cliente já utiliza `y-websocket` 3.

Os tipos `@types/node` acompanham o runtime Node 24, não a linha Current 26.

## Produção com Deployer

Produção é publicada pelo Deployer 8, instalado em `require-dev`.

O servidor deve ter:

- PHP 8.5 com `pdo_pgsql`, `mbstring`, `intl`, `bcmath`, `pcntl` e `zip`;
- PHP-FPM, Nginx, Composer 2, Node 24 LTS, npm, PostgreSQL client, Git, unzip, curl, ACL e `age`;
- um usuário de deploy com acesso SSH;
- permissão sem senha apenas para reiniciar e consultar o serviço `md-editor-yjs`.

### Preparação inicial do servidor

Envie o modelo e crie o diretório compartilhado:

```bash
scp deploy/production.env.example deploy@editor.example.com:/tmp/dumphere.env
ssh deploy@editor.example.com
sudo mkdir -p /var/www/dumphere/shared
sudo chown -R deploy:www-data /var/www/dumphere
mv /tmp/dumphere.env /var/www/dumphere/shared/.env
```

Edite `/var/www/dumphere/shared/.env`, gere valores aleatórios e diferentes para
`APP_KEY` e `YJS_WS_SECRET` e configure banco, domínio e origens. Não reutilize
esses valores em desenvolvimento ou staging.

Antes do primeiro deploy, envie os modelos:

```bash
scp \
  deploy/nginx-http.conf.example \
  deploy/nginx.conf.example \
  deploy/md-editor-yjs.service.example \
  deploy/dumphere-backup.service.example \
  deploy/dumphere-backup.timer.example \
  deploy@editor.example.com:/tmp/
```

Obtenha um certificado TLS válido antes de habilitar o virtual host. No
servidor, ajuste domínio, caminhos e usuário e então instale os arquivos:

```bash
sudo cp /tmp/nginx-http.conf.example /etc/nginx/conf.d/dumphere-http.conf
sudo cp /tmp/nginx.conf.example /etc/nginx/sites-available/dumphere
sudo ln -s /etc/nginx/sites-available/dumphere /etc/nginx/sites-enabled/dumphere
sudo nginx -t
sudo systemctl reload nginx

sudo cp /tmp/md-editor-yjs.service.example /etc/systemd/system/md-editor-yjs.service
sudo systemctl daemon-reload
sudo systemctl enable md-editor-yjs
```

O template aceita somente TLS 1.2/1.3, redireciona HTTP para HTTPS, ativa HSTS
e registra metadados mínimos sem IP, URL, query string, referrer ou user-agent.
Não ative o site antes de ajustar os caminhos do certificado.

### Backups criptografados

Crie uma identidade `age` em uma estação administrativa ou ambiente isolado,
guarde a chave privada fora do servidor de produção e configure somente a chave
pública em `BACKUP_AGE_RECIPIENT`:

```bash
age-keygen -o dumphere-backup-age-key.txt
age-keygen -y dumphere-backup-age-key.txt

# No servidor de produção:
sudo install -d -o deploy -g www-data -m 0700 /var/backups/dumphere

sudo cp /tmp/dumphere-backup.service.example /etc/systemd/system/dumphere-backup.service
sudo cp /tmp/dumphere-backup.timer.example /etc/systemd/system/dumphere-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now dumphere-backup.timer
systemctl list-timers dumphere-backup.timer
```

O job cria um dump PostgreSQL em formato custom, cifra no próprio pipeline
antes de gravar no destino definitivo e remove arquivos além da retenção
configurada. A chave privada não é necessária para criar backups.

Execute um backup antes de liberar produção:

```bash
sudo systemctl start dumphere-backup.service
sudo journalctl -u dumphere-backup.service --since today
```

Copie um backup cifrado para o ambiente isolado de restauração, configure ali
as variáveis de banco, `BACKUP_DIRECTORY`, `BACKUP_AGE_IDENTITY_FILE` e
`RESTORE_TEST_DATABASE`, e execute:

```bash
sudo systemd-run --wait --pipe --collect \
  --uid=deploy \
  --gid=www-data \
  --property=EnvironmentFile=/caminho/seguro/restore.env \
  --setenv=CONFIRM_RESTORE_TEST=yes \
  /caminho/md-online-editor/scripts/restore-postgres-backup.sh \
  /caminho/backups/dumphere-AAAAMMDDTHHMMSSZ.dump.age
```

O script de restauração aceita somente o banco definido por
`RESTORE_TEST_DATABASE`, que deve terminar em `_restore_test`; ele nunca aceita
o nome do banco de produção. Registre e repita esse exercício periodicamente.

Adicione o scheduler ao `crontab` do usuário `deploy`:

```cron
* * * * * cd /var/www/dumphere/current && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

Use `command -v systemctl` para confirmar o caminho e limite o `sudoers`:

```sudoers
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart md-editor-yjs, /usr/bin/systemctl is-active --quiet md-editor-yjs
```

### Executando o deploy

Na máquina de onde o deploy será disparado:

```bash
export DEPLOY_HOST=editor.example.com
export DEPLOY_USER=deploy
export DEPLOY_PATH=/var/www/dumphere
export DEPLOY_HEALTHCHECK_URL=https://editor.example.com/health

vendor/bin/dep deploy production
```

Variáveis opcionais:

- `DEPLOY_PORT`: porta SSH;
- `DEPLOY_IDENTITY_FILE`: chave SSH;
- `DEPLOY_BRANCH`: branch, padrão `main`;
- `DEPLOY_REPOSITORY`: repositório Git;
- `DEPLOY_YJS_SERVICE`: nome do serviço systemd;
- `DEPLOY_BACKUP_TIMER`: timer systemd de backup, padrão `dumphere-backup.timer`;
- `DEPLOY_REMOTE_PATH`: `PATH` remoto quando Node/PHP não estão no caminho padrão.

`DEPLOY_HEALTHCHECK_URL` é obrigatório e deve usar HTTPS. O deploy também falha
se o timer de backup não estiver habilitado e ativo.

No GitHub Actions, cadastre `DEPLOY_SSH_KEY` e
`DEPLOY_SSH_KNOWN_HOSTS` como secrets do environment `production`. Gere
`DEPLOY_SSH_KNOWN_HOSTS` em um canal confiável e confira a fingerprint do host;
o workflow não aprende chaves automaticamente pela rede. Cadastre as demais
variáveis `DEPLOY_*` usadas pelo workflow e exija aprovação humana no
environment.

O deploy:

1. cria um release isolado;
2. instala dependências PHP sem pacotes de desenvolvimento;
3. compila o frontend;
4. instala dependências de produção do Yjs;
5. ativa maintenance mode;
6. executa migrations e otimizações;
7. troca o symlink `current` de forma atômica;
8. reinicia o Yjs e verifica o health check HTTPS;
9. preserva os cinco releases mais recentes.

Rollback:

```bash
vendor/bin/dep rollback production
```

O rollback troca o release da aplicação e reinicia o servidor Yjs. Migrations devem continuar compatíveis com pelo menos o release anterior.

### Operação e alertas

Envie os logs JSON de PHP/Nginx e os eventos do journal
`dumphere-yjs`/`dumphere-backup` para a plataforma de observabilidade. Configure
alertas, no mínimo, para:

- health check indisponível e falhas de conexão com PostgreSQL;
- mensagens `Failed to persist Yjs snapshot` ou documento acima do limite;
- repetição de HTTP 429/5xx e reinícios do serviço Yjs;
- falha do `dumphere-backup.service` ou ausência de backup válido nas últimas 26 horas.

Proteja `main` exigindo CI verde e aprovação de um code owner. As referências
dos GitHub Actions são fixadas por SHA e o Dependabot abre atualizações semanais
para Composer, npm e Actions.

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
