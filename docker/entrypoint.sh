#!/bin/sh
set -e

php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "${MIGRATE_ON_STARTUP:-false}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

exec "$@"
