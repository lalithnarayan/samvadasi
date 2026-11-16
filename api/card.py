"""GET /api/card — a 1200×630 PNG card for Google/WhatsApp previews and the Share button.

  /api/card?t=गच्छति&s=goes&k=present · he&c=p&sc=deva&f=og
    t   main text, already in the lipi to show (Devanagari, Telugu, Kannada or Tamil)
    s   line under it (meaning, any of the four languages or English)
    k   small line above it
    c   colour: u (I/we), m (you), p (he/she) — the person colours of the site
    f   og (wide, 1200×630) or sq (square, 1080×1080 for Instagram)

Pillow with Raqm does the Indic shaping (conjuncts, vowel signs), which browser-less
renderers like Satori get wrong. Fonts are the site's own (OFL), in api/_fonts.
"""
import io, os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from PIL import Image, ImageDraw, ImageFont, features

HERE = os.path.join(os.path.dirname(__file__), '_fonts')
LAYOUT = ImageFont.Layout.RAQM if features.check('raqm') else ImageFont.Layout.BASIC
COLORS = {'u': ('#E7E6EE', '#3F4C7A'), 'm': ('#F1E6DE', '#9C5537'), 'p': ('#E6E9DC', '#56652F')}
INK, STONE, PAPER = '#24211D', '#F4F1EB', '#FBF9F5'
SCRIPT = [('deva', 0x0900, 0x097F), ('telu', 0x0C00, 0x0C7F), ('knda', 0x0C80, 0x0CFF), ('taml', 0x0B80, 0x0BFF)]
LANGS = {'deva': 'sa', 'telu': 'te', 'knda': 'kn', 'taml': 'ta'}
_cache: dict = {}

def font(name: str, size: int):
    k = (name, size)
    if k not in _cache:
        _cache[k] = ImageFont.truetype(os.path.join(HERE, name + '.ttf'), size, layout_engine=LAYOUT)
    return _cache[k]

def script_of(ch: str):
    o = ord(ch)
    for name, a, b in SCRIPT:
        if a <= o <= b or (name == 'deva' and 0x1CD0 <= o <= 0x1CFF):
            return name
    return None

def runs(text: str):
    """Split into (script|None, chunk); spaces and punctuation stick to the run before them."""
    out = []
    for ch in text:
        s = script_of(ch)
        if s is None and out and ch in ' \u200c\u200d।॥':
            s = out[-1][0]
        if out and out[-1][0] == s:
            out[-1][1] += ch
        else:
            out.append([s, ch])
    return out

def fonts_for(script, size, latin='disp', deva='deva'):
    if script is None:
        return font(latin, size), None
    return font(deva if script == 'deva' else script, size), LANGS[script]

def width(text, size, **kw):
    w = 0
    for s, chunk in runs(text):
        f, lang = fonts_for(s, size, **kw)
        w += f.getlength(chunk, language=lang) if lang else f.getlength(chunk)
    return w

def draw_text(d, x, y, text, size, fill, **kw):
    for s, chunk in runs(text):
        f, lang = fonts_for(s, size, **kw)
        d.text((x, y), chunk, font=f, fill=fill, language=lang) if lang else d.text((x, y), chunk, font=f, fill=fill)
        x += f.getlength(chunk, language=lang) if lang else f.getlength(chunk)

def wrap(text, size, maxw, lines=2, **kw):
    words, out, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if width(t, size, **kw) <= maxw or not cur:
            cur = t
        else:
            out.append(cur); cur = w
    if cur:
        out.append(cur)
    return out if len(out) <= lines else None

def fit(text, maxw, big, small, lines=2, maxh=10**6, lh=1.45, **kw):
    size = big
    while size >= small:
        ls = wrap(text, size, maxw, lines, **kw)
        if ls and all(width(l, size, **kw) <= maxw for l in ls) and len(ls) * size * lh <= maxh:
            return size, ls
        size -= 6
    return small, (wrap(text, small, maxw, 99, **kw) or [text])[:lines]

def card(t: str, s: str, k: str, c: str, fmt: str) -> bytes:
    W, H = (1080, 1080) if fmt == 'sq' else (1200, 630)
    tint, deep = COLORS.get(c, COLORS['p'])
    img = Image.new('RGB', (W, H), STONE)
    d = ImageDraw.Draw(img)
    pad = 72
    d.rounded_rectangle((28, 28, W - 28, H - 28), radius=44, fill=tint)
    # wordmark
    draw_text(d, pad, pad - 18, 'संवद', 44, INK, deva='rozha')
    draw_text(d, pad + width('संवद', 44, deva='rozha'), pad - 18, '.सि', 44, deep, deva='rozha')
    draw_text(d, W - pad - width('samvada.si', 26, latin='sans'), pad - 4, 'samvada.si', 26, INK, latin='sans')
    maxw = W - 2 * pad
    top = pad + 70
    if k:
        draw_text(d, pad, top, k[:80], 30, deep, latin='sans')
        top += 54
    room_bottom = H - pad - (110 if s else 20)
    big = 260 if fmt == 'sq' else 210
    size, lines = fit(t[:120] or 'संवदसि', maxw, big, 56, 4 if fmt == 'sq' else 2, maxh=room_bottom - top)
    lh = int(size * 1.45)
    block = lh * len(lines)
    y = top + max(0, (room_bottom - top - block) // 2) - int(size * 0.18)
    for l in lines:
        draw_text(d, pad, y, l, size, INK)
        y += lh
    if s:
        ss, sl = fit(s[:140], maxw, 46, 28, 2, latin='sans')
        yy = H - pad - int(ss * 1.4) * len(sl) + 6
        for l in sl:
            draw_text(d, pad, yy, l, ss, INK, latin='sans')
            yy += int(ss * 1.4)
    buf = io.BytesIO()
    img.save(buf, 'PNG', optimize=True)
    return buf.getvalue()

class handler(BaseHTTPRequestHandler):  # Vercel looks for a class named `handler`
    def do_GET(self):
        q = {k: v[0] for k, v in parse_qs(urlparse(self.path).query).items()}
        clean = lambda x, n: re.sub(r'[\x00-\x1f]', '', (x or ''))[:n]
        try:
            png = card(clean(q.get('t'), 120), clean(q.get('s'), 140), clean(q.get('k'), 80), q.get('c', 'p')[:1], q.get('f', 'og')[:2])
        except Exception as e:  # never break a preview: fall back to the plain card
            print('card error', e, file=sys.stderr)
            png = card('संवदसि', 'Speak Sanskrit by changing just the ending', '', 'p', 'og')
        self.send_response(200)
        self.send_header('Content-Type', 'image/png')
        self.send_header('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable')
        self.send_header('Content-Length', str(len(png)))
        self.end_headers()
        self.wfile.write(png)

if __name__ == '__main__':
    port = int(os.environ.get('CARD_PORT', 5329))
    print(f'card service on http://127.0.0.1:{port}/api/card')
    HTTPServer(('127.0.0.1', port), handler).serve_forever()
