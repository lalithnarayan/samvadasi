#!/bin/bash
# Commit any changes and push to GitHub. Run add-ci.command once to also publish the CI workflow.
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
LOG=push.log; : > $LOG
exec > >(tee -a $LOG) 2>&1
if ! gh auth status 2>&1 | grep -q "'workflow'\|workflow"; then
  # token can't push workflow files yet: keep them local only
  git rm -r -q --cached .github/workflows 2>/dev/null
  grep -qx '.github/workflows/' .git/info/exclude || echo '.github/workflows/' >> .git/info/exclude
fi
git add -A
if [ "$(git rev-list --count HEAD 2>/dev/null)" = "1" ] && ! git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
  git commit -q --amend --no-edit
else
  git commit -q -m "Conversational Telugu, Kannada and Tamil UI; उत्तम first on the verb page; layout fixes for Indic scripts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EgpTnnJ4rUt6iqepPwq4C5" || echo "(nothing to commit)"
fi
git push -u origin main && echo "PUSHED"
git log --oneline | head -3
