#!/usr/bin/env bash

set -Eeuo pipefail

require_value() {
    variable_name=$1
    variable_value=${!variable_name:-}

    if [ -z "$variable_value" ]; then
        echo "Missing required environment variable: $variable_name" >&2
        exit 1
    fi
}

for variable_name in \
    DB_HOST \
    DB_PORT \
    DB_DATABASE \
    DB_USERNAME \
    DB_PASSWORD \
    BACKUP_DIRECTORY \
    BACKUP_AGE_RECIPIENT
do
    require_value "$variable_name"
done

case "${BACKUP_RETENTION_DAYS:-30}" in
    ''|*[!0-9]*)
        echo "BACKUP_RETENTION_DAYS must be a positive integer." >&2
        exit 1
        ;;
esac

if [ "${BACKUP_RETENTION_DAYS:-30}" -lt 1 ]; then
    echo "BACKUP_RETENTION_DAYS must be at least 1." >&2
    exit 1
fi

umask 077
mkdir -p "$BACKUP_DIRECTORY"

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
final_path="$BACKUP_DIRECTORY/dumphere-$timestamp.dump.age"
temporary_path=$(mktemp "$BACKUP_DIRECTORY/.dumphere-$timestamp.XXXXXX")

cleanup() {
    if [ -f "$temporary_path" ]; then
        rm -f -- "$temporary_path"
    fi
}
trap cleanup EXIT HUP INT TERM

export PGPASSWORD="$DB_PASSWORD"

pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    --dbname="$DB_DATABASE" \
    --format=custom \
    --no-owner \
    --no-acl \
    | age --recipient "$BACKUP_AGE_RECIPIENT" > "$temporary_path"

if [ ! -s "$temporary_path" ]; then
    echo "The encrypted backup is empty." >&2
    exit 1
fi

mv -- "$temporary_path" "$final_path"
trap - EXIT HUP INT TERM

find "$BACKUP_DIRECTORY" \
    -maxdepth 1 \
    -type f \
    -name 'dumphere-*.dump.age' \
    -mtime "+${BACKUP_RETENTION_DAYS:-30}" \
    -delete

printf '{"timestamp":"%s","level":"info","message":"Encrypted PostgreSQL backup created","backup":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$(basename "$final_path")"
