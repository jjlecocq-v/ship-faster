#!/usr/bin/env bash
set -euo pipefail
# 10 comment-only commits on main to populate Deployments.
# Run only on a throwaway demo repo.

root="$(git rev-parse --show-toplevel)"
file="$root/apps/web/lib/copy.ts"
remote="${1:-origin}"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "seed-deployments.sh must run on main" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree must be clean" >&2
  exit 1
fi

for i in $(seq 1 10); do
  printf '\n// seed deployment %02d\n' "$i" >> "$file"
  git add "$file"
  git -c user.name="JJ Lecocq" -c user.email="jjlecocq-v@users.noreply.github.com" \
    commit -m "chore: seed deployment ${i}"
done

git push "$remote" main
