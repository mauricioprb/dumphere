#!/usr/bin/env bash

set -Eeuo pipefail

if [ "${CONFIRM_RESTORE_TEST:-}" != 'yes' ]; then
    echo "Set CONFIRM_RESTORE_TEST=yes to run the destructive restore drill." >&2
    exit 1
fi

backup_path=${1:-}

if [ -z "$backup_path" ]; then
    echo "Usage: restore-postgres-backup.sh /path/to/dumphere-TIMESTAMP.dump.age" >&2
    exit 1
fi

for variable_name in \
    DB_HOST \
    DB_PORT \
    DB_DATABASE \
    DB_USERNAME \
    DB_PASSWORD \
    BACKUP_DIRECTORY \
    BACKUP_AGE_IDENTITY_FILE \
    RESTORE_TEST_DATABASE
do
    variable_value=${!variable_name:-}

    if [ -z "$variable_value" ]; then
        echo "Missing required environment variable: $variable_name" >&2
        exit 1
    fi
done

case "$RESTORE_TEST_DATABASE" in
    *_restore_test) ;;
    *)
        echo "RESTORE_TEST_DATABASE must end with _restore_test." >&2
        exit 1
        ;;
esac

if [ "$RESTORE_TEST_DATABASE" = "$DB_DATABASE" ]; then
    echo "The restore-test database must not be the production database." >&2
    exit 1
fi

backup_directory_real=$(realpath -- "$BACKUP_DIRECTORY")
backup_path_real=$(realpath -- "$backup_path")

case "$(basename "$backup_path_real")" in
    dumphere-*.dump.age) ;;
    *)
        echo "Backup must match dumphere-*.dump.age." >&2
        exit 1
        ;;
esac

if [ "$(dirname "$backup_path_real")" != "$backup_directory_real" ]; then
    echo "Backup must be directly inside BACKUP_DIRECTORY." >&2
    exit 1
fi

if [ ! -r "$backup_path_real" ] || [ ! -r "$BACKUP_AGE_IDENTITY_FILE" ]; then
    echo "The backup or age identity file is not readable." >&2
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

dropdb \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    --if-exists \
    "$RESTORE_TEST_DATABASE"

createdb \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    "$RESTORE_TEST_DATABASE"

age --decrypt --identity "$BACKUP_AGE_IDENTITY_FILE" "$backup_path_real" \
    | pg_restore \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USERNAME" \
        --dbname="$RESTORE_TEST_DATABASE" \
        --no-owner \
        --no-acl \
        --exit-on-error

psql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    --dbname="$RESTORE_TEST_DATABASE" \
    --set=ON_ERROR_STOP=1 \
    --command='SELECT COUNT(*) AS restored_documents FROM documents;'

printf '{"timestamp":"%s","level":"info","message":"PostgreSQL restore drill completed","database":"%s","backup":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$RESTORE_TEST_DATABASE" \
    "$(basename "$backup_path_real")"
