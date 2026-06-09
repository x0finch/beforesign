#!/usr/bin/env bash
set -euo pipefail

PATTERN='@beforesign/orchestrator'

paths=(
  "apps/web/src/routes/ai.tsx"
  "apps/web/src/routes/api/ai"
  "apps/web/src/components/ai"
  "apps/web/src/server/ai"
  "apps/web/src/hooks/use_ask.ts"
  "packages/agent/src"
  "packages/ai-pipeline/src"
)

for path in "${paths[@]}"; do
  if [ -e "$path" ] && rg -q "$PATTERN" "$path"; then
    echo "Forbidden orchestrator import under $path"
    rg "$PATTERN" "$path"
    exit 1
  fi
done

echo "OK: no orchestrator imports in /ai paths"
