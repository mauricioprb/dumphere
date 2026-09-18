# Deploying with Laravel Forge

Forge manages Nginx, PHP-FPM, certificates, releases and the Yjs Node process.
PostgreSQL can live on the same server. Docker Compose stays a local development
tool only.

For a deployment without Forge, see [deploy.md](deploy.md) for the processes this
document configures through the panel.

## Server and site

Create an App Server with PostgreSQL 18 and configure PHP 8.5, Composer 2,
Node 24 and npm 11 or newer. Confirm `pdo_pgsql`, `mbstring`, `intl`, `bcmath`,
`pcntl` and `zip` in the PHP used by both the site and the commands.

Create a Laravel site connected to the repository and the `main` branch, with
zero-downtime deployments enabled and `/public` as the public directory.
Configure the domain and the HTTPS certificate through Forge. Add `storage` to
the paths shared between releases; Forge already shares `.env` automatically.

Keep "Push to deploy" disabled and publish from the panel once CI is green.
GitHub Actions keeps checking PHP, frontend, dependencies and collaboration.

Fill in Environment on Forge using `.env.example` as the base. Configure the real
PostgreSQL credentials and apply the values below, replacing the domain and the
email with your own.

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://editor.example.com
CONTACT_EMAIL=contact@editor.example.com
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

Generate different `APP_KEY` and `YJS_WS_SECRET` values, at least 32 characters
each and unique to this environment. To generate the WebSocket key on the
server, use `openssl rand -hex 32`.

Laravel and Yjs share the same PostgreSQL and the same `YJS_WS_SECRET`. Port 1234
is bound to `127.0.0.1`; the browser connects over HTTPS/WSS through Nginx. The
`VITE_YJS_WS_*` variables can stay empty because the public URL is derived from
the HTTPS domain open in the browser, with the `/yjs-ws/` path. Never put secrets
in `VITE_*` variables.

## Deploy script

Use the script below in Deployments > Deploy script on Forge. The macros are
interpreted by the panel and must not be run directly over SSH.

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

After the first deploy, create the Yjs process described below. Append the two
lines that follow to the end of the script, replacing `12345` with the real
process ID on Forge. That way the next deploys restart Yjs with the new release.

```bash
sudo -n supervisorctl restart 'daemon-12345:*'
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 http://127.0.0.1:1234/health
```

The frontend needs development dependencies to compile. That is why the script
uses `npm ci --include=dev`, while Yjs only gets production dependencies.
Migrations must stay compatible with the previous release, which keeps serving
while the new one is prepared.

The template follows the
[Forge deploy macros](https://laravel.com/forge/docs/sites/deployments).

## Collaboration process

After the first deploy, create a Custom process under Processes on the site.
Use the values below, adjusting the directory for the site's domain and user.

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Command     | `node --env-file=../.env server.mjs`                |
| Directory   | `/home/forge/editor.example.com/current/yjs-server` |
| User        | The site's user, usually `forge`                    |
| Processes   | `1`                                                 |
| Stop signal | `SIGTERM`                                           |
| Stop wait   | `60` seconds                                        |

Use the server's Node 24 executable, with an absolute path if it is not on
Supervisor's PATH. The signal and the wait time let Yjs persist its snapshots
before shutting down. Do not raise the process count without changing the
synchronization architecture between instances.

Use the ID assigned by Forge in the restart command of the deploy script and
confirm the process is running. Test on the server with
`curl --fail http://127.0.0.1:1234/health`.

Forge uses
[Supervisor to keep the process alive](https://laravel.com/forge/docs/resources/background-processes).

## Nginx and WebSocket

Add the snippet below to the Nginx `http` context on the server. It defines the
limits and the log format without IP, URL, query string, referrer or user agent.

```nginx
log_format app_privacy escape=json
    '{"timestamp":"$time_iso8601",'
    '"request_id":"$request_id",'
    '"method":"$request_method",'
    '"status":$status,'
    '"bytes":$body_bytes_sent,'
    '"duration_seconds":$request_time}';

limit_req_zone $binary_remote_addr zone=app_pages:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=app_saves:10m rate=1r/s;
limit_conn_zone $binary_remote_addr zone=app_websockets:10m;
```

In the site's Nginx configuration editor on Forge, merge the following snippet
into the HTTPS `server` block. Replace the existing directives of the same name,
including `access_log`, headers and `location /`, so they are not duplicated.
Preserve the includes, the paths, the PHP configuration and the certificates
managed by Forge. In the HTTP redirect block, use `access_log off` so document
addresses are not recorded.

```nginx
client_max_body_size 600k;
access_log /var/log/nginx/app.access.log app_privacy;

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

location /yjs-ws/ {
    limit_conn app_websockets 10;
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
    limit_req zone=app_pages burst=15 nodelay;
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ /save$ {
    limit_req zone=app_saves burst=5 nodelay;
    try_files $uri $uri/ /index.php?$query_string;
}
```

Run `sudo nginx -t` before reloading Nginx. The snippet keeps the HTTP limits and
forwards `/yjs-ws/` to Yjs, stripping the prefix before the room UUID. Never
expose port 1234 directly.

## Scheduling and operation

Enable the Laravel scheduler on Forge to run `php artisan schedule:run` every
minute in the current release. The `documents:purge` command is already scheduled
for 03:00 and respects reserved addresses.

Enable the deploy health check on Forge and point it at `/health` on the domain.
Configure PostgreSQL backups. Check the application logs in shared storage and
the Yjs process logs on Forge when persistence or reconnection fails.

To create a reserved address, run `php artisan prefix:grant address-name` in the
current release directory and enter the password when prompted.
