"""Release check: every stored form must match Vidyut, or be a labelled override with a reason.

  python scripts/vidyut/verify.py                       # checks data/generated + data/curated
  python scripts/vidyut/verify.py --cms data/export/cms-forms.json   # also checks what is in the CMS (npm run export:forms)

Exit code 1 on any problem, so CI blocks the release.
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api', '_vidyut'))
import samvada_vidyut as S

ap = argparse.ArgumentParser()
ap.add_argument('--generated', default='data/generated/dhatus.json')
ap.add_argument('--curated', default='data/curated/verbs.json')
ap.add_argument('--cms', help='JSON exported from the CMS (npm run export:forms)')
ap.add_argument('--sample', type=int, default=0, help='check only every Nth dhatu (faster local runs)')
a = ap.parse_args()
problems: list[str] = []

# 1. The generated file must be exactly what Vidyut produces today (catches stale data / engine upgrades).
gen = json.load(open(a.generated, encoding='utf-8'))['dhatus']
for i, d in enumerate(gen):
    if a.sample and i % a.sample:
        continue
    g = S.generate(d['aupadeshika'], d['gana'], d.get('prefixes') or [])
    if g['forms'] != d['forms'] or g['padas'] != d['padas']:
        problems.append(f"{d['slug']} {d['root']}: generated forms are out of date — run npm run vidyut:generate")
checked = len(gen) if not a.sample else len(gen) // a.sample

# 2. Curated verbs: exist, and every override is labelled and explained.
cur = json.load(open(a.curated, encoding='utf-8'))
slugs = {d['slug'] for d in gen}
for c in cur:
    slug = c['code'] + ('-' + '-'.join(c['prefixes']) if c.get('prefixes') else '')
    if slug not in slugs:
        problems.append(f"curated {c['display']}: {slug} is not in the generated Dhātupāṭha")
    for o in c.get('overrides', []):
        if not o.get('label') or not (o.get('note') or '').strip():
            problems.append(f"curated {c['display']}: an override has no label or no reason")

# 3. Optionally: what editors have stored in the CMS.
cms_checked = 0
if a.cms:
    for d in json.load(open(a.cms, encoding='utf-8')):
        items = [{'lak': lak, 'idx': idx, 'pada': pada, 'form': v[0]}
                 for lak, by in (d.get('forms') or {}).items() for pada, nine in (by or {}).items() for idx, v in enumerate(nine) if v]
        for r in S.verify(d['aupadeshika'], d['gana'], items, d.get('prefixes') or []):
            if not r['ok']:
                problems.append(f"CMS {d['slug']} {d.get('display')}: {r['lak']}[{r['idx']}] {r['form']} ≠ Vidyut {'/'.join(r['expected'])}")
        for o in d.get('overrides') or []:
            if not o.get('label') or not (o.get('note') or '').strip():
                problems.append(f"CMS {d['slug']}: override without label or reason")
        cms_checked += len(items)

print(f'Vidyut check: {checked} dhatus regenerated, {len(cur)} curated verbs, {cms_checked} CMS forms verified.')
if problems:
    print(f'\n✗ {len(problems)} problem(s):')
    for p in problems[:200]:
        print('  -', p)
    sys.exit(1)
print('✓ everything matches Vidyut (overrides are labelled and explained)')
