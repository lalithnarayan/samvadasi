"""Index of every verb for /api/grammar: slug -> [aupadeshika, gana, prefixes].

The public grammar endpoint accepts only slugs listed here, so it can never be asked to run
Vidyut on arbitrary input, and every answer can be cached at the edge for good.
  python3 scripts/vidyut/build_api_index.py
"""
import json, os
src = json.load(open('data/generated/dhatus.json', encoding='utf-8'))['dhatus']
idx = {d['slug']: [d['aupadeshika'], int(d['gana']), d.get('prefixes') or []] for d in src}
os.makedirs('api/_data', exist_ok=True)
json.dump(idx, open('api/_data/verbs.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(idx), 'verbs → api/_data/verbs.json', os.path.getsize('api/_data/verbs.json') // 1024, 'KB')
