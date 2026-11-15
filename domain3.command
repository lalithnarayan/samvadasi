#!/bin/bash
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
V="npx --yes vercel@latest"
{ $V env rm NEXT_PUBLIC_SERVER_URL production -y >/dev/null 2>&1
  printf "https://samvada.si" | $V env add NEXT_PUBLIC_SERVER_URL production 2>&1 | tail -1
  $V domains rm www.samavada.si -y 2>&1 | tail -1
  $V domains rm samavada.si -y 2>&1 | tail -1
  echo done; } > domain3.log 2>&1
./push.command
