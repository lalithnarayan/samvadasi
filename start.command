#!/bin/bash
# संवादः — start everything locally. Double-click to run.
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"
LOG=start.log; : > $LOG
say() { echo "== $*" | tee -a $LOG; }

say "1/6 Docker"
if ! docker info >/dev/null 2>&1; then open -a Docker; fi
for i in $(seq 1 90); do docker info >/dev/null 2>&1 && break; sleep 2; done
docker info >/dev/null 2>&1 || { say "FAIL: Docker did not start"; exit 1; }

say "2/6 Postgres"
docker compose up -d >>$LOG 2>&1 || { say "FAIL: docker compose"; exit 1; }
for i in $(seq 1 60); do docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done

say "3/6 npm install"
[ -d node_modules ] || npm install >>$LOG 2>&1 || { say "FAIL: npm install"; exit 1; }

say "4/6 Python + Vidyut"
[ -d .venv ] || python3 -m venv .venv >>$LOG 2>&1
.venv/bin/pip install -q --upgrade pip >>$LOG 2>&1
.venv/bin/pip install -q -r requirements.txt >>$LOG 2>&1 || { say "FAIL: pip install vidyut"; exit 1; }

say "5/6 Migrate + seed (first run takes a minute)"
if [ ! -f .seeded ]; then npm run setup >>$LOG 2>&1 && touch .seeded || { say "FAIL: setup"; exit 1; }; fi

say "6/6 Grammar service + web app"
lsof -ti tcp:5328 | xargs kill 2>/dev/null
nohup .venv/bin/python api/grammar.py >grammar.log 2>&1 &
lsof -ti tcp:5329 | xargs kill 2>/dev/null
nohup .venv/bin/python api/card.py >card.log 2>&1 &
( for i in $(seq 1 120); do curl -s -o /dev/null http://localhost:3000 && { open http://localhost:3000; say "READY http://localhost:3000"; break; }; sleep 2; done ) &
npm run dev 2>&1 | tee -a $LOG
