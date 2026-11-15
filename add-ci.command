#!/bin/bash
# One-time: give the GitHub CLI permission to push workflow files, then publish .github/workflows.
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
gh auth refresh -h github.com -s workflow || exit 1
sed -i '' '/^\.github\/workflows\/$/d' .git/info/exclude
git add .github/workflows
git commit -m "CI: verify forms with Vidyut

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EgpTnnJ4rUt6iqepPwq4C5" && git push
echo "Done — you can close this window."
