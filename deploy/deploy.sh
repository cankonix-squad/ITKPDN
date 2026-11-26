#!/usr/bin/env bash
set -euo pipefail
base=/root/cankonix-node/apps/itkpdn
sha=${1:?Release SHA required}
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 2
exec 9>"$base/deploy.lock"
flock -w 300 9
release="$base/releases/$sha"
previous=$(cat "$base/current-sha" 2>/dev/null || true)
compose() { RELEASE_SHA="$1" docker compose -p itkpdn -f "$base/releases/$1/deploy/compose.yml" "${@:2}"; }
compose "$sha" build --pull
if ! compose "$sha" up -d --wait --wait-timeout 120; then
  if [[ -n "$previous" && "$previous" != "$sha" ]]; then compose "$previous" up -d --wait --wait-timeout 120; fi
  exit 1
fi
printf '%s\n' "$sha" > "$base/current-sha"
ln -sfn "$release" "$base/current"
