"""Generate every form for every dhātu in the Dhātupāṭha (≈2,250 entries) with Vidyut.

  python scripts/vidyut/generate_all.py [--data vidyut-data/prakriya] [--out data/generated/dhatus.json]

Writes one JSON file the seed script imports into the CMS. Re-run after a Vidyut upgrade.
"""
import argparse, json, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api', '_vidyut'))
import samvada_vidyut as S

ap = argparse.ArgumentParser()
ap.add_argument('--data', default='vidyut-data/prakriya')
ap.add_argument('--out', default='data/generated/dhatus.json')
ap.add_argument('--curated', default='data/curated/verbs.json')
ap.add_argument('--prefixed', default='data/curated/prefixed.json')
a = ap.parse_args()
import re

def load(path):
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else []

CURATED = load(a.curated) + load(a.prefixed)   # everyday verbs + the common prefixed verbs

def prefer(table, avoid):
    """Put Vidyut's variants that match `avoid` (a regex from the curated file) after the others,
    e.g. चिन्तयति before चिन्तति, आक्रामति before आक्राम्यति. Nothing is dropped."""
    rx = re.compile(avoid)
    for lak in table.values():
        for p, cells in lak.items():
            lak[p] = [sorted(c, key=lambda f: bool(rx.search(f))) for c in cells]

entries = [dict(e, prefixes=[]) for e in S.dhatupatha(a.data)]
# Prefixed verbs used in the curated set (आ + गम्, उप + विश् …) are generated as their own entries.
for c in CURATED:
    if c.get('prefixes'):
        base = next(e for e in entries if e['code'] == c['code'])
        entries.append(dict(base, prefixes=c['prefixes']))

curated = {(c['code'], tuple(c.get('prefixes') or [])): c for c in CURATED}
t, out, failed = time.time(), [], []
for e in entries:
    try:
        g = S.generate(e['aupadeshika'], e['gana'], e['prefixes'])
        if not g['padas']:
            failed.append(e['code']); continue
        cur = curated.get((e['code'], tuple(e['prefixes'])))
        if cur and cur.get('participleFrom'):  # e.g. अस् has no क्त: the spoken past uses भू (भूतवान्)
            pf = cur['participleFrom']
            g['participle'] = S.participle(S.make_dhatu(pf['aupadeshika'], pf['gana']))
        if cur:  # everyday and prefixed verbs also get their family: causative, desiderative, intensive, passive
            g['derived'] = S.derived(e['aupadeshika'], e['gana'], e['prefixes'])
            if cur.get('avoid'):
                prefer(g['forms'], cur['avoid'])
                for k, v in g['derived'].items():
                    for tab in ('forms', 'passive'):
                        if v.get(tab): prefer(v[tab], cur['avoid'])
        lat = g['forms']['lat'][g['padas'][0]][0]
        out.append({**e, 'slug': e['code'] + ('-' + '-'.join(e['prefixes']) if e['prefixes'] else ''), **g, 'sample': lat[0] if lat else ''})
    except Exception as ex:
        failed.append(f"{e['code']}: {ex}")
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump({'vidyut': '0.4.0', 'generated': time.strftime('%Y-%m-%d'), 'count': len(out), 'dhatus': out}, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)
print(f'{len(out)} dhatus generated in {time.time()-t:.1f}s → {a.out}  ({os.path.getsize(a.out)/1e6:.1f} MB); skipped {len(failed)}')
if failed: print('  skipped:', ', '.join(map(str, failed[:20])), '…' if len(failed) > 20 else '')
