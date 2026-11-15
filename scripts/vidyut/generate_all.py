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
a = ap.parse_args()

entries = [dict(e, prefixes=[]) for e in S.dhatupatha(a.data)]
# Prefixed verbs used in the curated set (आ + गम्, उप + विश् …) are generated as their own entries.
if os.path.exists(a.curated):
    for c in json.load(open(a.curated, encoding='utf-8')):
        if c.get('prefixes'):
            base = next(e for e in entries if e['code'] == c['code'])
            entries.append(dict(base, prefixes=c['prefixes']))

curated = {}
if os.path.exists(a.curated):
    curated = {(c['code'], tuple(c.get('prefixes') or [])): c for c in json.load(open(a.curated, encoding='utf-8'))}
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
        lat = g['forms']['lat'][g['padas'][0]][0]
        out.append({**e, 'slug': e['code'] + ('-' + '-'.join(e['prefixes']) if e['prefixes'] else ''), **g, 'sample': lat[0] if lat else ''})
    except Exception as ex:
        failed.append(f"{e['code']}: {ex}")
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump({'vidyut': '0.4.0', 'generated': time.strftime('%Y-%m-%d'), 'count': len(out), 'dhatus': out}, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False)
print(f'{len(out)} dhatus generated in {time.time()-t:.1f}s → {a.out}  ({os.path.getsize(a.out)/1e6:.1f} MB); skipped {len(failed)}')
if failed: print('  skipped:', ', '.join(map(str, failed[:20])), '…' if len(failed) > 20 else '')
