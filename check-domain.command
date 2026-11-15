#!/bin/bash
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
{ echo "=== DNS (as the world sees it)"
  echo "samvada.si A:"; dig +short A samvada.si @8.8.8.8
  echo "www CNAME:"; dig +short CNAME www.samvada.si @8.8.8.8
  echo "=== HTTPS"
  for u in https://samvada.si https://www.samvada.si; do echo "$u -> $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 15 $u)"; done
  curl -s --max-time 15 https://samvada.si | grep -o '<title>[^<]*'
  echo "=== Vercel"
  for d in samvada.si www.samvada.si; do npx --yes vercel@latest domains verify $d --project samvadasi 2>&1 | grep -E "DNS Configuration|Verified"; done
  echo done; } > check-domain.log 2>&1
