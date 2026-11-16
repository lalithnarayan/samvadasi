#!/bin/bash
cd "$(dirname "$0")"
{ for u in / "/verb/01.1137" "/verb/01.1137-ava" "/verbs?scope=prefixed"; do
  c=$(curl -s -o /tmp/p.html -w '%{http_code}' "https://samvada.si$u")
  echo "$u $c $(grep -o 'जिगमिषति\|अवगच्छति\|202' /tmp/p.html | sort -u | tr '\n' ' ')"
done; } > check-domain.log 2>&1
echo DONE >> check-domain.log
