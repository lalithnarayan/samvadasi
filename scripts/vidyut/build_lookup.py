"""Form → verb lookup for search: every present-tense form of every root, plus all spoken
forms of the everyday and prefixed verbs (and their causatives), so typing गच्छति, gacchati
or gachchati finds गम्.

  python scripts/vidyut/build_lookup.py   → data/generated/lookup.json
"""
import json
src = json.load(open('data/generated/dhatus.json', encoding='utf-8'))['dhatus']
slugs, index = [], {}
def add(form, i):
    for f in (form if isinstance(form, list) else [form]):
        if f:
            s = index.setdefault(f, [])
            if i not in s: s.append(i)
for d in src:
    i = len(slugs); slugs.append(d['slug'])
    rich = bool(d.get('derived'))
    add(d.get('root', ''), i)
    for lak, padas in (d.get('forms') or {}).items():
        if lak != 'lat' and not (rich and lak in ('lan', 'lrt', 'lot', 'vidhi')):
            continue
        for cells in padas.values():
            for c in cells: add(c, i)
    p = d.get('participle') or {}
    for k in p.get('kta') or []: add(k, i)
    for cells in (p.get('m') or [])[:1]: add(cells, i)
    for fam, e in (d.get('derived') or {}).items():
        if fam == 'mula':
            for cells in ((e.get('passive') or {}).get('lat') or {}).values():
                for c in cells: add(c, i)
            continue
        for cells in ((e.get('forms') or {}).get('lat') or {}).values():
            for c in cells: add(c, i)
out = {'slugs': slugs, 'forms': [[f] + v for f, v in index.items()]}
json.dump(out, open('data/generated/lookup.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(index), 'forms for', len(slugs), 'verbs')
