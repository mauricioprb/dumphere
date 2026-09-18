# Deploying anywhere

The application is four things running against one PostgreSQL database. Any host
that can run them works; [deploy-forge.md](deploy-forge.md) is one worked example
with the exact Nginx, Supervisor and deploy-script configuration.

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
- Never a secret in a `VITE_*` variable: those are compiled into the bundle the
  browser downloads.

Laravel and the collaboration server share the same database and the same
`YJS_WS_SECRET`. The Yjs port stays bound to loopback; the browser reaches it
through the reverse proxy over WSS.

## Things that are easy to get wrong

Run exactly one collaboration process. The synchronization architecture assumes a
single instance holding the in-memory documents; a second one will diverge.

Give it `SIGTERM` and at least 60 seconds to stop, so it can persist snapshots.

Keep migrations compatible with the previous release if you deploy without
downtime, because that release keeps serving while the new one is prepared.

`/health` on the collaboration server and `/health` on the application are both
suitable for a deploy health check.

## After the first deploy

Reserved addresses are granted by command:

```bash
php artisan prefix:grant address-name
```
