#!/bin/sh
# Installs this repo's versioned git hooks (scripts/hooks/) into .git/hooks, which is machine-local and shared by
# every worktree. Hooks already there under other names (Martin's pre-commit QA gate) are left alone.
cd "$(git rev-parse --show-toplevel)" || exit 1
hooks_dir=$(git rev-parse --git-common-dir)/hooks

for hook in scripts/hooks/*; do
  name=$(basename "$hook")
  cp "$hook" "$hooks_dir/$name" && chmod +x "$hooks_dir/$name" && echo "installed $name"
done
