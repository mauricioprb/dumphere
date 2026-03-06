#!/bin/sh
set -e

if [ -d /tmp/public-build ]; then
    cp -r /tmp/public-build/* /var/www/html/public/ 2>/dev/null || true
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "${MIGRATE_ON_STARTUP:-false}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

exec "$@"
