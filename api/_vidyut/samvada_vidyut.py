"""Samvadasi ↔ Vidyut: generate and verify Sanskrit verb (tiṅanta), participle and noun (subanta) forms.

Single source of truth for grammar. Used by:
  * api/vidyut.py               – the Vercel Python function the CMS calls
  * scripts/vidyut/generate_all.py – bulk generation for the whole Dhātupāṭha
  * scripts/vidyut/verify.py     – CI check before every release
"""
from __future__ import annotations
from functools import lru_cache
from vidyut.prakriya import (Vyakarana, Data, Dhatu, Gana, Pada, Prayoga, Lakara, Purusha, Vacana,
                             DhatuPada, Pratipadika, Krt, Linga, Vibhakti)
from vidyut.lipi import transliterate, Scheme

LAKARAS = {  # app id -> Vidyut lakāra (लेट् is Vedic and left out)
    'lat': Lakara.Lat, 'lan': Lakara.Lan, 'lrt': Lakara.Lrt, 'lot': Lakara.Lot, 'vidhi': Lakara.VidhiLin,
    'lit': Lakara.Lit, 'lut': Lakara.Lut, 'lun': Lakara.Lun, 'ashir': Lakara.AshirLin, 'lrn': Lakara.Lrn,
}
SPOKEN = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
GANAS = [Gana.Bhvadi, Gana.Adadi, Gana.Juhotyadi, Gana.Divadi, Gana.Svadi, Gana.Tudadi,
         Gana.Rudhadi, Gana.Tanadi, Gana.Kryadi, Gana.Curadi]
# index order used everywhere: 0 he · 1 they two · 2 they | 3 you · 4 you two · 5 you all | 6 I · 7 we two · 8 we
PERSONS = [(Purusha.Prathama, Vacana.Eka), (Purusha.Prathama, Vacana.Dvi), (Purusha.Prathama, Vacana.Bahu),
           (Purusha.Madhyama, Vacana.Eka), (Purusha.Madhyama, Vacana.Dvi), (Purusha.Madhyama, Vacana.Bahu),
           (Purusha.Uttama, Vacana.Eka), (Purusha.Uttama, Vacana.Dvi), (Purusha.Uttama, Vacana.Bahu)]
PADAS = {'P': DhatuPada.Parasmaipada, 'A': DhatuPada.Atmanepada}
NUMS = [Vacana.Eka, Vacana.Dvi, Vacana.Bahu]
VIBHAKTIS = [Vibhakti.Prathama, Vibhakti.Dvitiya, Vibhakti.Trtiya, Vibhakti.Caturthi,
             Vibhakti.Panchami, Vibhakti.Sasthi, Vibhakti.Saptami, Vibhakti.Sambodhana]

_v = Vyakarana()

def dev(slp1: str) -> str:
    return transliterate(slp1, Scheme.Slp1, Scheme.Devanagari)

def slp(devanagari: str) -> str:
    return transliterate(devanagari, Scheme.Devanagari, Scheme.Slp1)

def _clean(variants: list[str]) -> list[str]:
    """Devanagari, de-duplicated, and drop the final -द् sandhi twin when the -त् form exists."""
    out: list[str] = []
    for t in (dev(x) for x in variants):
        if t not in out:
            out.append(t)
    return [t for t in out if not (t.endswith('द्') and t[:-2] + 'त्' in out)]

def make_dhatu(aupadeshika: str, gana: int, prefixes: list[str] | None = None) -> Dhatu:
    d = Dhatu.mula(aupadeshika, GANAS[gana - 1])
    return d.with_prefixes(prefixes) if prefixes else d

def tinanta(d: Dhatu, lak: str, idx: int, pada: str | None = None) -> list[str]:
    pur, vac = PERSONS[idx]
    kw = {'dhatu_pada': PADAS[pada]} if pada else {}
    p = Pada.Tinanta(dhatu=d, prayoga=Prayoga.Kartari, lakara=LAKARAS[lak], purusha=pur, vacana=vac, **kw)
    return _clean([x.text for x in _v.derive(p)])

_NASAL = {**{c: 'म्' for c in 'पफबभम'}, **{c: 'ङ्' for c in 'कखगघ'}, **{c: 'ञ्' for c in 'चछजझ'}, **{c: 'ण्' for c in 'टठडढ'}}

def root_of(d: Dhatu) -> str:
    """Readable root (गम्, नम्, चिन्त्, कम्प्): the dhātu after it-lopa, ṇ→n etc., just before a lakāra is added."""
    pr = _v.derive(Pada.Tinanta(dhatu=d, prayoga=Prayoga.Kartari, lakara=Lakara.Lat, purusha=Purusha.Prathama, vacana=Vacana.Eka))
    if not pr:
        return ''
    prev = None
    for st in pr[0].history:
        if len(st.result) > 1:
            break
        prev = st.result
    r = dev(prev[0]) if prev else ''
    r = ''.join(ch for ch in r if ch not in '\u0951\u0952' and not ('\u1cd0' <= ch <= '\u1cff') and not ('\ua8e0' <= ch <= '\ua8ff'))  # drop Vedic accent marks
    for i in range(len(r) - 2):  # न् + labial/velar/… → homorganic nasal (कन्प् → कम्प्)
        if r[i:i + 2] == 'न्' and r[i + 2] in _NASAL:
            r = r[:i] + _NASAL[r[i + 2]] + r[i + 2:]
    return r

def padas_of(d: Dhatu) -> list[str]:
    return [k for k in ('P', 'A') if tinanta(d, 'lat', 0, k)]

def participle(d: Dhatu) -> dict:
    """क्त stem (गत) and क्तवतु forms (गतवान् / गतवती …) — the everyday spoken past."""
    kta = _clean([x.text for x in _v.derive(Pada.Subanta(Pratipadika.krdanta(d, Krt.kta), Linga.Pum, Vibhakti.Prathama, Vacana.Eka))])
    stems = [k[:-1] if k.endswith('ः') else k for k in kta]  # गतः -> गत
    ktavatu = Pratipadika.krdanta(d, Krt.ktavatu)
    out = {'kta': stems, 'm': [], 'f': []}
    for key, lg in (('m', Linga.Pum), ('f', Linga.Stri)):
        for n in NUMS:
            out[key].append(_clean([x.text for x in _v.derive(Pada.Subanta(ktavatu, lg, Vibhakti.Prathama, n))]))
    return out

def generate(aupadeshika: str, gana: int, prefixes: list[str] | None = None, lakaras: list[str] | None = None) -> dict:
    """Every form of one dhātu: forms[lakara][pada] = 9 lists of variants; plus participles."""
    d = make_dhatu(aupadeshika, gana, prefixes)
    padas = padas_of(d)
    forms = {lak: {p: [tinanta(d, lak, i, p) for i in range(9)] for p in padas} for lak in (lakaras or LAKARAS)}
    try:
        part = participle(d)
    except Exception:  # a few roots have no क्त in Vidyut yet
        part = None
    return {'root': root_of(make_dhatu(aupadeshika, gana)), 'padas': padas, 'forms': forms, 'participle': part}

def derivation(aupadeshika: str, gana: int, lak: str, idx: int, pada: str | None = None, prefixes=None) -> list[dict]:
    """Sūtra-by-sūtra steps for one form (for 'show me how it is built')."""
    d = make_dhatu(aupadeshika, gana, prefixes)
    pur, vac = PERSONS[idx]
    kw = {'dhatu_pada': PADAS[pada]} if pada else {}
    out = []
    for pr in _v.derive(Pada.Tinanta(dhatu=d, prayoga=Prayoga.Kartari, lakara=LAKARAS[lak], purusha=pur, vacana=vac, **kw)):
        out.append({'form': dev(pr.text), 'steps': [{'sutra': s.code, 'source': str(s.source), 'result': dev(''.join(s.result))} for s in pr.history]})
    return out

def verify(aupadeshika: str, gana: int, items: list[dict], prefixes=None) -> list[dict]:
    """items: [{lak, idx, pada?, form}] -> each with ok + what Vidyut expects."""
    d = make_dhatu(aupadeshika, gana, prefixes)
    res = []
    for it in items:
        exp = tinanta(d, it['lak'], it['idx'], it.get('pada'))
        res.append({**it, 'ok': it['form'] in exp, 'expected': exp})
    return res

def subanta(stem_slp1: str, linga: str) -> list[list[list[str]]]:
    """8 vibhaktis × 3 numbers for a noun / pronoun stem (e.g. 'Bavat', 'tad', 'vidyAlaya')."""
    lg = {'m': Linga.Pum, 'f': Linga.Stri, 'n': Linga.Napumsaka}[linga]
    # feminine -ā / -ī stems (कथा, नदी, भवती) carry the strī-pratyaya (ṭāp / ṅīp)
    pr = Pratipadika.nyap(stem_slp1) if linga == 'f' and stem_slp1[-1:] in ('A', 'I') else Pratipadika.basic(stem_slp1)
    return [[_clean([x.text for x in _v.derive(Pada.Subanta(pr, lg, vb, n))]) for n in NUMS] for vb in VIBHAKTIS]

@lru_cache(maxsize=1)
def dhatupatha(data_dir: str) -> list[dict]:
    """All Dhātupāṭha entries from Vidyut's data: code, upadeśa, gaṇa, Sanskrit meaning."""
    import csv, os
    rows = list(csv.reader(open(os.path.join(data_dir, 'dhatupatha.tsv'), encoding='utf-8'), delimiter='\t'))[1:]
    return [{'code': r[0], 'aupadeshika': r[1], 'gana': int(r[0].split('.')[0]), 'artha_sa': dev(r[2]) if len(r) > 2 else ''} for r in rows]
