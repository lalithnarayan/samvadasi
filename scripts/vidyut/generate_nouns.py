"""Generate case forms (8 vibhaktis × 3 numbers) for the curated nouns and pronouns with Vidyut.

  python scripts/vidyut/generate_nouns.py   → data/generated/nouns.json
"""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api', '_vidyut'))
import samvada_vidyut as S

src = json.load(open('data/curated/nouns.json', encoding='utf-8'))
out = []
for n in src:
    forms = n.get('manual') or S.subanta(n['stemSlp1'], n['gender'])
    out.append({k: v for k, v in n.items() if k != 'manual'} | {'forms': forms, 'source': 'manual' if n.get('manual') else 'vidyut 0.4.0'})
json.dump(out, open('data/generated/nouns.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'nouns →', 'data/generated/nouns.json')
for n in out[:7] + out[-3:]:
    print(' ', n['display'], n['gender'], [c[0] for c in n['forms'][0]], n['forms'][1][0])
