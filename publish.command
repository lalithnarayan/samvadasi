#!/bin/bash
# Put Samvadasi under git and (if the GitHub CLI is signed in) create + push the repo.
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
LOG=publish.log; : > $LOG
exec > >(tee -a $LOG) 2>&1
REPO=samvadasi
echo "== git: $(git --version)"
[ -d .git ] || git init -b main
git config user.name >/dev/null || git config user.name "slnkashyap"
git config user.email >/dev/null || git config user.email "slnkashyap@users.noreply.github.com"
git add -A
git commit -q -m "Samvadasi: conversational Sanskrit, Next.js + Payload CMS + Vidyut

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EgpTnnJ4rUt6iqepPwq4C5" || echo "(nothing new to commit)"
git log --oneline | head -3
echo "files: $(git ls-files | wc -l)"
if ! command -v gh >/dev/null; then echo "GH: not installed"; exit 0; fi
if ! gh auth status >/dev/null 2>&1; then echo "GH: not signed in"; exit 0; fi
echo "GH user: $(gh api user -q .login)"
if git remote get-url origin >/dev/null 2>&1; then git push -u origin main
else gh repo create "$REPO" --public --source=. --remote=origin --push \
  --description "Speak Sanskrit by changing just the ending — every dhātu, verified with Vidyut. samvada.si" \
  --homepage "https://samvada.si"; fi
echo "REMOTE: $(git remote get-url origin 2>/dev/null)"
echo "== done"
