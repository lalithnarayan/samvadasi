"""/api/grammar — Vidyut (Ambuda's Pāṇinian grammar engine) for Samvadasi.

Public, read-only and cached at the edge for good (answers never change for a given input):
  GET ?a=derived&slug=01.1137                    a verb's family: causative, desiderative, intensive, passive
  GET ?a=derive&slug=01.1137&lak=lat&idx=0&pada=P[&sanadi=nic][&prayoga=karmani]
                                                 the sūtra-by-sūtra derivation of one form
Only verbs listed in _data/verbs.json are accepted, so arbitrary input never reaches Vidyut.

Editors only (POST, needs the CMS login cookie or "Authorization: JWT <token>"); JSON body:
  {"action": "generate", "aupadeshika": "ga\\mx~", "gana": 1, "prefixes": []}
  {"action": "verify",   "aupadeshika": ..., "gana": ..., "prefixes": [], "items": [{"lak": "lat", "idx": 0, "pada": "P", "form": "गच्छति"}]}
  {"action": "derive",   "aupadeshika": ..., "gana": ..., "lak": "lat", "idx": 0, "pada": "P"}
  {"action": "derived",  "aupadeshika": ..., "gana": ..., "prefixes": []}
  {"action": "subanta",  "stem": "vidyAlaya", "linga": "m"}
  {"action": "health"}

Runs as a Vercel Python function in production, and as a small local server in development:
  python api/grammar.py       # http://127.0.0.1:5328/api/grammar
"""
import base64
import hashlib
import hmac
import json
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '_vidyut'))
import samvada_vidyut as S  # noqa: E402

MAX_ITEMS = 2000
VERBS = json.load(open(os.path.join(os.path.dirname(__file__), '_data', 'verbs.json'), encoding='utf-8'))
LAKARAS = {'lat', 'lit', 'lut', 'lrt', 'let', 'lot', 'lan', 'vidhi', 'ashir', 'lun', 'lrn'}
FOREVER = 'public, max-age=86400, s-maxage=31536000, immutable'


def b64url(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def editor(headers) -> bool:
    """True for a valid, unexpired Payload login token (HS256, key = sha256(PAYLOAD_SECRET)[:32])."""
    secret = os.environ.get('PAYLOAD_SECRET')
    if not secret:  # local development without a secret: allow, as before
        return os.environ.get('VERCEL') is None
    token = ''
    auth = headers.get('Authorization') or ''
    if auth.startswith('JWT ') or auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1]
    for part in (headers.get('Cookie') or '').split(';'):
        k, _, v = part.strip().partition('=')
        if k == 'payload-token':
            token = v
    try:
        head, body, sig = token.split('.')
        key = hashlib.sha256(secret.encode()).hexdigest()[:32].encode()
        good = hmac.new(key, f'{head}.{body}'.encode(), hashlib.sha256).digest()
        claims = json.loads(b64url(body))
        return hmac.compare_digest(good, b64url(sig)) and claims.get('exp', 0) > time.time() and claims.get('collection') == 'users'
    except Exception:
        return False


def public(q: dict) -> tuple[int, dict]:
    """Read-only questions about a known verb, answered from its slug."""
    one = lambda k, d=None: (q.get(k) or [d])[0]
    verb = VERBS.get(one('slug', ''))
    if not verb:
        return 404, {'ok': False, 'error': 'unknown verb'}
    aup, gana, prefixes = verb
    a = one('a')
    if a == 'derived':
        return 200, run({'action': 'derived', 'aupadeshika': aup, 'gana': gana, 'prefixes': prefixes})
    if a == 'derive':
        lak, idx, pada, sanadi, prayoga = one('lak'), one('idx', '0'), one('pada', 'P'), one('sanadi'), one('prayoga', 'kartari')
        if lak not in LAKARAS or not idx.isdigit() or int(idx) > 8 or pada not in ('P', 'A') or sanadi not in (None, 'nic', 'san', 'yan') or prayoga not in ('kartari', 'karmani'):
            return 400, {'ok': False, 'error': 'bad parameters'}
        return 200, run({'action': 'derive', 'aupadeshika': aup, 'gana': gana, 'prefixes': prefixes, 'lak': lak, 'idx': int(idx), 'pada': pada, 'sanadi': sanadi, 'prayoga': prayoga})
    return 400, {'ok': False, 'error': 'unknown question'}


def run(body: dict) -> dict:
    a = body.get('action')
    if a == 'health':
        return {'ok': True, 'engine': 'vidyut 0.4.0'}
    if a == 'generate':
        g = S.generate(body['aupadeshika'], int(body['gana']), body.get('prefixes') or [])
        return {'ok': True, **g, 'generatedWith': 'vidyut 0.4.0'}
    if a == 'verify':
        items = (body.get('items') or [])[:MAX_ITEMS]
        res = S.verify(body['aupadeshika'], int(body['gana']), items, body.get('prefixes') or [])
        bad = [r for r in res if not r['ok']]
        return {'ok': True, 'checked': len(res), 'mismatched': len(bad), 'mismatches': bad[:100]}
    if a == 'derive':
        return {'ok': True, 'derivations': S.derivation(body['aupadeshika'], int(body['gana']), body['lak'], int(body['idx']),
                                                        body.get('pada'), body.get('prefixes') or [],
                                                        body.get('sanadi'), body.get('prayoga') or 'kartari')}
    if a == 'derived':  # causative / desiderative / intensive + passive, for roots whose family is not stored
        return {'ok': True, 'derived': S.derived(body['aupadeshika'], int(body['gana']), body.get('prefixes') or []), 'generatedWith': 'vidyut 0.4.0'}
    if a == 'subanta':
        return {'ok': True, 'forms': S.subanta(body['stem'], body.get('linga', 'm'))}
    return {'ok': False, 'error': f'unknown action {a!r}'}


class handler(BaseHTTPRequestHandler):  # Vercel looks for a class named `handler`
    def _send(self, code: int, payload: dict, cache: str = 'no-store'):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', cache)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        if not q.get('a'):
            return self._send(200, run({'action': 'health'}))
        try:
            code, body = public(q)
            self._send(code, body, FOREVER if code == 200 else 'public, max-age=300')
        except Exception as e:
            self._send(500, {'ok': False, 'error': str(e)})

    def do_POST(self):
        if not editor(self.headers):
            return self._send(401, {'ok': False, 'error': 'sign in to the CMS to use this'})
        try:
            n = int(self.headers.get('Content-Length') or 0)
            if n > 2_000_000:
                return self._send(413, {'ok': False, 'error': 'request too large'})
            body = json.loads(self.rfile.read(n) or b'{}')
            self._send(200, run(body))
        except KeyError as e:
            self._send(400, {'ok': False, 'error': f'missing field {e}'})
        except Exception as e:  # report grammar-engine errors to the CMS instead of crashing
            self._send(500, {'ok': False, 'error': str(e)})

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(os.environ.get('VIDYUT_PORT', 5328))
    print(f'Vidyut service on http://127.0.0.1:{port}/api/grammar')
    HTTPServer(('127.0.0.1', port), handler).serve_forever()
