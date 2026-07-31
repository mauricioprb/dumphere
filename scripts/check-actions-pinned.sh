#!/usr/bin/env bash

set -Eeuo pipefail

violations=0

while IFS= read -r workflow; do
    while IFS=: read -r line_number content; do
        reference=${content#*uses:}
        reference=${reference%%#*}
        reference=$(printf '%s' "$reference" | xargs)

        if [[ "$reference" == ./* ]]; then
            continue
        fi

        version=${reference##*@}

        if [[ ! "$version" =~ ^[0-9a-f]{40}$ ]]; then
            printf '%s:%s: action is not pinned to a full commit SHA: %s\n' \
                "$workflow" \
                "$line_number" \
                "$reference" >&2
            violations=1
        fi
    done < <(grep -nE '^[[:space:]]*uses:[[:space:]]*' "$workflow" || true)
done < <(find .github/workflows -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) -print)

exit "$violations"
