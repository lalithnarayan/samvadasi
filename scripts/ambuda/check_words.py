"""Check every noun, pack word and avyaya against Monier-Williams (vidyut-data/monier.xml).

  python scripts/ambuda/check_words.py
Prints words MW lacks (modern coinages, compounds, inflected forms) and gender mismatches."""
import json, re, sys, html
sys.path.insert(0, 'api/_vidyut')
from vidyut.lipi import transliterate, Scheme
slp = lambda d: transliterate(d, Scheme.Devanagari, Scheme.Slp1)
# MW index: key1 -> list of (genders, gloss)
idx = {}
cur = None
for line in open('vidyut-data/monier.xml', encoding='utf-8'):
    m = re.search(r'<key1>([^<]+)</key1>.*?<body>(.*?)</body>', line)
    if not m: continue
    k, body = m.group(1), m.group(2)
    lex = re.findall(r'<info lex="([^"]+)"', body)
    gloss = re.sub(r'<[^>]+>', '', body)
    gloss = html.unescape(re.sub(r'\s+', ' ', gloss)).strip()[:140]
    idx.setdefault(k, []).append((lex, gloss))
def stem(w):
    s = slp(w).rstrip('?')
    cands = [s]
    for a, b in [('aH', 'a'), ('am', 'a'), ('iH', 'i'), ('uH', 'u'), ('A', 'A'), ('I', 'I'), ('f', 'f')]:
        if s.endswith(a): cands.append(s[: len(s) - len(a)] + b)
    if s.endswith('A'): cands.append(s[:-1] + 'f')  # pitA -> pitf
    if s.endswith('H'): cands.append(s[:-1]); cands.append(s[:-1] + 's')
    return cands
def variants(c):
    v = {c, re.sub(r'[NYRnm](?=[kKgGcCjJwWqQtTdDpPbBSzsh])', 'M', c)}
    for x in list(v):
        v.add(x.replace('tr', 'ttr'))
        if x.endswith('ikA'): v.add(x[:-3] + 'aka')
        if x.endswith('A') and not x.endswith('ikA'): v.add(x[:-1] + 'a')
        if x.endswith('I'): v.add(x[:-1] + 'a')
    return v
def look(cands):
    for c in cands:
        for v in variants(c):
            if v in idx: return v, idx[v]
    return None, None
def compound(c):
    # try splitting into two attested parts (sandhi a+A -> A handled)
    for i in range(2, len(c) - 1):
        a, b = c[:i], c[i:]
        for aa, bb in [(a, b), (a + 'a', b), (a + 'a', 'A' + b[1:] if b.startswith('A') else None), (a, 'a' + b[1:] if b.startswith('A') else None)]:
            if bb and look([aa])[0] and look([bb])[0] and len(aa) > 2 and len(bb) > 2:
                return f'{look([aa])[0]} + {look([bb])[0]}'
    return None
G = {'m': 'm', 'f': 'f', 'n': 'n'}
def gender_ok(lex, g):
    tags = ' '.join(l for ls, _ in lex for l in ls)
    if not tags: return None
    return g in re.findall(r'\b([mfn])\b', tags.replace('#', ' '))
rep = []
nouns = json.load(open('data/curated/nouns.json', encoding='utf-8'))
for n in nouns:
    k, e = look([n['stemSlp1']])
    if not e:
        cp = compound(n['stemSlp1'])
        rep.append(('NOUN-' + ('compound' if cp else 'MISSING'), n['display'], n['stemSlp1'], n['gender'], n['meaning_en'], cp or ''))
        continue
    ok = gender_ok(e, n['gender'])
    first = next((gl for ls, gl in e if gl), '')
    rep.append(('NOUN-' + ('ok' if ok else 'GENDER?' if ok is False else 'nolex'), n['display'], k, n['gender'], n['meaning_en'], first[:110]))
for p in json.load(open('data/curated/packs.json', encoding='utf-8')):
    for w in p['words']:
        if w.get('noun'): continue
        k, e = look(stem(w['sa']))
        first = next((gl for ls, gl in e if gl), '') if e else ''
        cp = None if e else next((compound(c) for c in stem(w['sa']) if compound(c)), None)
        rep.append(('PACK-' + ('ok' if e else 'compound' if cp else 'MISSING'), w['sa'], k or slp(w['sa']), p['slug'], w['en'], first[:110] or cp or ''))
for a in json.load(open('data/curated/avyayas.json', encoding='utf-8')):
    k, e = look(stem(a['word']))
    first = next((gl for ls, gl in e if gl), '') if e else ''
    rep.append(('AVY-' + ('ok' if e else 'MISSING'), a['word'], k or slp(a['word']), '', a['meaning_en'], first[:110]))
for r in rep:
    if not r[0].endswith('ok'): print('\t'.join(r))
print('---- checked', len(rep), 'flagged', sum(1 for r in rep if not r[0].endswith('ok')))
json.dump(rep, open('/tmp/mwrep.json', 'w', encoding='utf-8'), ensure_ascii=False)
