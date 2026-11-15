#!/bin/bash
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
V="npx --yes vercel@latest"
{
echo "=== who owns which name"
for d in samvada.si samavada.si; do echo "-- $d NS:"; dig +short NS $d; echo "-- $d A:"; dig +short A $d; done
if dig +short NS samvada.si | grep -q domaincontrol; then
  echo "=== adding samvada.si to the Vercel project"
  $V domains add samvada.si samvadasi 2>&1 | tail -2
  $V domains add www.samvada.si samvadasi 2>&1 | tail -2
  for d in samvada.si www.samvada.si; do echo "=== $d"; $V domains verify $d --project samvadasi 2>&1 | sed -n '/What to fix/,/Nameservers/p'; done
fi
echo done
} > domain2.log 2>&1
