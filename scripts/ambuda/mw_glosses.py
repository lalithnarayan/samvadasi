"""English meanings for every dhātu from Monier-Williams (via Ambuda's data repository).

  curl -L -o vidyut-data/monier.xml https://raw.githubusercontent.com/ambuda-org/data/main/dictionaries/monier.xml
  python scripts/ambuda/mw_glosses.py --mw vidyut-data/monier.xml      → data/generated/glosses.json

Monier-Williams Sanskrit-English Dictionary (1899), digitised by the Cologne Digital Sanskrit Dictionaries
(CC BY-SA). Root entries carry <info verb="genuineroot|root" cp="1P,2Ā…"/>; we take the first English senses
of the entry whose class matches the dhātu's gaṇa.
"""
import argparse, json, os, re, sys, html
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api', '_vidyut'))
import samvada_vidyut as S

ap = argparse.ArgumentParser()
ap.add_argument('--mw', default='vidyut-data/monier.xml')
ap.add_argument('--dhatus', default='data/generated/dhatus.json')
ap.add_argument('--out', default='data/generated/glosses.json')
a = ap.parse_args()

ENTRY = re.compile(r'<key>([^<]+)</key>\s*<value>(.*?)</value>', re.S)
roots: dict[str, list[tuple[set, str]]] = {}
for key, val in ENTRY.findall(open(a.mw, encoding='utf-8').read()):
    m = re.search(r'<info verb="(genuineroot|root)"(?: cp="([^"]*)")?', val)
    if m:
        classes = {c[:-1] if c[-1:] in 'PĀ' else c for c in (m.group(2) or '').split(',') if c}
        rank = 0 if m.group(1) == 'genuineroot' else 1
    else:  # verbs MW marks only by their class ("cl. 1. P.")
        cl = re.findall(r'<ab>cl\.</ab>\s*(\d+)', val)
        if not cl:
            continue
        classes, rank = set(cl), 2
    roots.setdefault(key, []).append((rank, classes, val))

def clean(fragment: str) -> str:
    t = re.sub(r'<tail>.*?</tail>|<pb[^>]*/>|<info[^>]*/>', '', fragment, flags=re.S)  # page/line refs
    t = re.sub(r'<ls[^>]*>.*?</ls>', '', t, flags=re.S)                  # drop source references
    t = re.sub(r'<s>(.*?)</s>', lambda m: S.dev(m.group(1).replace('/', '')), t)  # Sanskrit words → Devanagari
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    t = re.sub(r'\(\s*\)|\[\s*\]', '', t)
    t = re.sub(r'\s+', ' ', t).strip(' ;,:&.')
    return t

def gloss_of(val: str) -> str:
    body = re.sub(r'<div n="(?:to|vp)"\s*/>', '; ', val)
    text = clean(re.sub(r'<info[^>]*/>', '', body))
    m = re.search(r'(?<![A-Za-z])to [a-z]', text)
    if not m:
        return ''
    text = re.split(r'\s:\s|Caus\.|Desid\.|Intens\.|Pass\.', text[m.start():])[0]
    senses = [x.strip(' ,;.&c') for x in text.split(';')]
    def tidy(x: str) -> str:
        x = re.sub(r'\([^()]*\)|\[[^\[\]]*\]', '', x)          # drop parentheticals
        x = re.split(r'[(\[]', x)[0]                                  # and any left unclosed
        return re.sub(r'\s+', ' ', x).strip(' ,;.&c')
    senses = [tidy(x) for x in senses]
    senses = [x for x in senses if x.startswith('to ') and 3 < len(x) < 140]
    out, n = [], 0
    for s in senses:
        if n + len(s) > 110: break
        out.append(s); n += len(s) + 2
    return '; '.join(out)

gen = json.load(open(a.dhatus, encoding='utf-8'))['dhatus']
out, hit = {}, 0
for d in gen:
    key = S.slp(d['root']).rstrip('~')
    cands = sorted(roots.get(key, []), key=lambda c: c[0])
    pick = next((v for _, cls, v in cands if str(d['gana']) in cls), cands[0][2] if cands else None)
    g = gloss_of(pick) if pick else ''
    if g:
        hit += 1
        out[d['slug']] = {'gloss': g, 'mw': key, 'short': g.split(';')[0].split(',')[0].strip()}
json.dump(out, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'{hit} of {len(gen)} dhatus got a Monier-Williams meaning → {a.out}')
