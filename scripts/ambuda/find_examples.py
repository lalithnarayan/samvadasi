"""Find real usage of the conversational verbs in the texts Ambuda publishes (GRETIL TEI files).

  git clone --depth 1 https://github.com/ambuda-org/gretil.git vidyut-data/gretil
  python scripts/ambuda/find_examples.py --gretil vidyut-data/gretil      → data/generated/examples.json

Every form of every featured dhātu (all lakāras, both padas, क्तवतु) is looked up in each verse, after
undoing the common word-final sandhi (gamiṣyāmy → gamiṣyāmi, gacchad → gacchat, gataḥ/gato …).
Texts: Ambuda's own GRETIL selection (ambuda/seed/texts/gretil.py). Licence: CC BY-NC-SA 4.0 unless the
TEI header says otherwise — the verse, its source and the licence are stored with each example.
"""
import argparse, json, os, re, sys
import xml.etree.ElementTree as ET
from collections import defaultdict
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api', '_vidyut'))
import samvada_vidyut as S
from vidyut.lipi import transliterate, Scheme

# (Ambuda slug, title, TEI file) — the texts ambuda.org publishes from GRETIL
TEXTS = [
    ('raghuvamsham', 'Raghuvaṃśa', 'sa_kAlidAsa-raghuvaMza.xml'),
    ('kumarasambhavam', 'Kumārasambhava', 'sa_kAlidAsa-kumArasaMbhava.xml'),
    ('meghadutam-kale', 'Meghadūta', 'sa_kAlidAsa-meghadUta-edkale.xml'),
    ('rtusamharam', 'Ṛtusaṃhāra', 'sa_kAlidAsa-RtusaMhAra.xml'),
    ('bhattikavyam', 'Bhaṭṭikāvya', 'sa_bhaTTi-rAvaNavadha.xml'),
    ('kiratarjuniyam', 'Kirātārjunīya', 'sa_bhAravi-kirAtArjunIya.xml'),
    ('shishupalavadham', 'Śiśupālavadha', 'sa_mAgha-zizupAlavadha.xml'),
    ('shatakatrayam', 'Śatakatraya', 'sa_bhatRhari-zatakatraya.xml'),
    ('saundaranandam', 'Saundarananda', 'sa_azvaghoSa-saundarAnanda-edmatsunami.xml'),
    ('bodhicaryavatara', 'Bodhicaryāvatāra', 'sa_zAntideva-bodhicaryAvatAra.xml'),
    ('amarushatakam', 'Amaruśataka', 'sa_amaru-amaruzataka.xml'),
    ('hamsadutam', 'Haṃsadūta', 'sa_rUpagosvAmin-haMsadUta.xml'),
    ('mukundamala', 'Mukundamālā', 'sa_kulazekhara-mukundamAlA-eddurgaprasad.xml'),
]
SPOKEN = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
TEI = '{http://www.tei-c.org/ns/1.0}'

ap = argparse.ArgumentParser()
ap.add_argument('--gretil', default='vidyut-data/gretil')
ap.add_argument('--dhatus', default='data/generated/dhatus.json')
ap.add_argument('--curated', default='data/curated/verbs.json')
ap.add_argument('--per-verb', type=int, default=3)
ap.add_argument('--out', default='data/generated/examples.json')
a = ap.parse_args()

iast = lambda dev: transliterate(dev, Scheme.Devanagari, Scheme.Iast)
to_dev = lambda t: transliterate(t, Scheme.Iast, Scheme.Devanagari)

# 1. Index every form of the featured verbs (IAST) → (slug, form, lakāra)
cur = json.load(open(a.curated, encoding='utf-8'))
featured = {c['code'] + ('-' + '-'.join(c['prefixes']) if c.get('prefixes') else ''): c for c in cur}
index: dict[str, tuple[str, str, str]] = {}
for d in json.load(open(a.dhatus, encoding='utf-8'))['dhatus']:
    if d['slug'] not in featured or d['root'] == 'अस्':  # अस् forms (स्मः, स्थ…) collide with particles like स्म
        continue
    for lak, by in d['forms'].items():
        for nine in by.values():
            for cell in nine:
                for f in cell:
                    if len(f) > 3:
                        index.setdefault(iast(f), (d['slug'], f, lak))
    for g in ('m', 'f'):
        for cell in (d.get('participle') or {}).get(g, []):
            for f in cell:
                index.setdefault(iast(f), (d['slug'], f, 'kta'))
# Very common forms that are also ordinary words would flood the results.
for w in ['asti', 'santi', 'bhava', 'bhavati', 'syāt', 'kuru', 'kṛtvā', 'smaḥ', 'staḥ', 'sthaḥ', 'nayati']:
    index.pop(w, None)

def candidates(tok: str) -> list[str]:
    """Undo the usual word-final sandhi of a token."""
    t = tok.strip("'’.,;:!?|/()[]0-9 ").replace('-', '')
    out = {t}
    if t.endswith('y'): out.add(t[:-1] + 'i')
    if t.endswith('v'): out.add(t[:-1] + 'u')
    if t.endswith('d') or t.endswith('n') or t.endswith('c') or t.endswith('j') or t.endswith('l'): out.add(t[:-1] + 't')
    if t.endswith('ṃ') or t.endswith('ṅ') or t.endswith('ñ'): out.add(t[:-1] + 'm')
    if t.endswith('o'): out.add(t[:-1] + 'aḥ')
    if t.endswith('ā') or t.endswith('a'): out.add(t + 'ḥ')
    if t[-1:] in ('ś', 's', 'r', 'ṣ'): out.add(t[:-1] + 'ḥ')
    if t.endswith('ān'): out.add(t)
    return [c for c in out if c]

# 2. Scan verses
hits: dict[str, list[dict]] = defaultdict(list)
scanned = 0
for slug, title, fname in TEXTS:
    path = os.path.join(a.gretil, '1_sanskr', 'tei', fname)
    if not os.path.exists(path):
        continue
    root = ET.parse(path).getroot()
    lic = root.find(f'.//{TEI}licence')
    licence = (lic.attrib.get('target') if lic is not None else '') or 'GRETIL'
    for lg in root.iter(f'{TEI}lg'):
        vid = lg.attrib.get('{http://www.w3.org/XML/1998/namespace}id', '')
        lines = [' '.join(''.join(l.itertext()).split()) for l in lg.findall(f'{TEI}l')]
        text = ' / '.join(x.strip(' /') for x in lines if x.strip())
        if not text or len(text) > 220:
            continue
        scanned += 1
        for tok in re.split(r'\s+', text):
            for c in candidates(tok):
                if c in index:
                    s, form, lak = index[c]
                    ref = vid.split('_', 1)[-1] if '_' in vid else vid
                    hits[s].append({'dhatu': s, 'form': form, 'token': to_dev(tok.strip("'’.,;:!?|/()[]0-9 ")), 'lakara': lak, 'iast': text,
                                    'text': to_dev(text).replace(' / ', '\n'), 'source': f'{title} {ref}',
                                    'url': f'https://ambuda.org/texts/{slug}', 'licence': licence})
                    break

# 3. Pick a few per verb: spoken lakāras first, shorter verses, different texts
out = []
for s, hs in hits.items():
    hs.sort(key=lambda h: (h['lakara'] not in SPOKEN + ['kta'], len(h['iast'])))
    seen_src, chosen = set(), []
    for h in hs:
        book = h['source'].rsplit(' ', 1)[0]
        if book in seen_src:
            continue
        seen_src.add(book); chosen.append(h)
        if len(chosen) >= a.per_verb:
            break
    out.extend(chosen)
json.dump(out, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'scanned {scanned} verses; {len(out)} examples for {len({e["dhatu"] for e in out})} of {len(featured)} verbs → {a.out}')
