# Deploying

The application is four things running against one PostgreSQL database. Any host
that can run them works.

| Process       | What it is                                             |
| ------------- | ------------------------------------------------------ |
| Web           | PHP-FPM behind Nginx, document root `public/`          |
| Assets        | `npm run build` at deploy time, not a daemon           |
| Collaboration | `node yjs-server/server.mjs`, long-lived, one instance |
| Scheduler     | `php artisan schedule:run` every minute                |

Requirements on the server: PHP 8.5 with `pdo_pgsql`, `mbstring`, `intl`,
`bcmath`, `pcntl` and `zip`; Composer 2; Node 24; PostgreSQL 18.

## Deploy steps

```bash
composer install --no-dev --optimize-autoloader
npm ci --include=dev && npm run build
npm --prefix yjs-server ci --omit=dev --omit=optional
php artisan migrate --force
php artisan optimize
```

The frontend needs its development dependencies to compile, which is why the
build install is not `--omit=dev`. The collaboration server only needs production
dependencies.

## What the environment needs

Start from `.env.example`. In production, at minimum:

- `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` on your HTTPS domain.
- `APP_KEY` and `YJS_WS_SECRET` generated separately, 32+ characters, unique to
  the environment. `openssl rand -hex 32` produces a usable WebSocket secret.
- `YJS_ALLOWED_ORIGINS` set to your domain, and `YJS_TRUST_PROXY=true` when the
  collaboration server sits behind a reverse proxy.
- `SESSION_ENCRYPT=true`, `SESSION_SECURE_COOKIE=true` and `SESSION_SAME_SITE=lax`.
- Never a secret in a `VITE_*` variable: those are compiled into the bundle the
  browser downloads.

Laravel and the collaboration server share the same database and the same
`YJS_WS_SECRET`. The Yjs port stays bound to loopback; the browser reaches it
through the reverse proxy over WSS, so `YJS_WS_PUBLIC_URL` is a `wss://` URL on
your own domain and the `VITE_YJS_WS_*` variables can stay empty.

## Keeping the collaboration server alive

Run it under whatever supervisor the host offers (systemd, Supervisor, or the
process manager of a panel), with one instance, `SIGTERM` to stop and at least 60
seconds of stop timeout so it can persist its snapshots. Restart it on every
deploy, after the new release is in place, and check
`http://127.0.0.1:1234/health` afterwards.

## Nginx

Add this to the `http` context. It sets the limits and a log format that records
no IP, URL, query string, referrer or user agent, because document addresses are
the secret.

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

And this to the HTTPS `server` block, replacing any existing directive of the
same name rather than duplicating it. In the HTTP redirect block, use
`access_log off` for the same reason.

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

Run `sudo nginx -t` before reloading. Never expose port 1234 directly.

## Things that are easy to get wrong

Run exactly one collaboration process. The synchronization architecture assumes a
single instance holding the in-memory documents; a second one will diverge.

Keep migrations compatible with the previous release if you deploy without
downtime, because that release keeps serving while the new one is prepared.

`/health` on the collaboration server and `/health` on the application are both
suitable for a deploy health check.

## Operation

The scheduler runs `documents:purge` at 03:00, which deletes documents untouched
for more than 30 days and skips reserved addresses. It is destructive and has no
trash, so configure PostgreSQL backups.

Reserved addresses are granted by command:

```bash
php artisan prefix:grant address-name
```
