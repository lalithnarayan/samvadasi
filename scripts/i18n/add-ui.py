#!/usr/bin/env python3
"""Add or replace interface strings in src/lib/i18n/ui.ts.

Usage: python3 scripts/i18n/add-ui.py strings.json
where strings.json is a list of [key, english, telugu, kannada, tamil].
Every entry needs all four languages; the test in src/lib/i18n/ui.test.ts checks it."""
import json, sys, re
import os
p = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'lib', 'i18n', 'ui.ts')
s = open(p, encoding='utf-8').read()
rows = json.load(open(sys.argv[1], encoding='utf-8'))
def q(x): return "'" + x.replace('\\', '\\\\').replace("'", "\\'") + "'"
for k, *v in rows:
    assert len(v) == 4, k
    s = re.sub(r"\n  " + re.escape(q(k)) + r": \[.*\],(?=\n)", "", s)
    line = f"  {q(k)}: [{', '.join(q(x) for x in v)}],\n"
    s = s.replace("} as const satisfies", line + "} as const satisfies", 1)
open(p, 'w', encoding='utf-8').write(s)
print(len(rows), 'entries')
