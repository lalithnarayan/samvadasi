"""POST /api/grammar — Vidyut (Ambuda's Pāṇinian grammar engine) for the Samvadasi CMS.

Actions (JSON body):
  {"action": "generate", "aupadeshika": "ga\\mx~", "gana": 1, "prefixes": []}
  {"action": "verify",   "aupadeshika": ..., "gana": ..., "prefixes": [], "items": [{"lak": "lat", "idx": 0, "pada": "P", "form": "गच्छति"}]}
  {"action": "derive",   "aupadeshika": ..., "gana": ..., "lak": "lat", "idx": 0, "pada": "P"}
  {"action": "subanta",  "stem": "vidyAlaya", "linga": "m"}
  {"action": "health"}

Runs as a Vercel Python function in production, and as a small local server in development:
  python api/grammar.py       # http://127.0.0.1:5328/api/grammar
"""
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '_vidyut'))
import samvada_vidyut as S  # noqa: E402

MAX_ITEMS = 2000


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
                                                        body.get('pada'), body.get('prefixes') or [])}
    if a == 'subanta':
        return {'ok': True, 'forms': S.subanta(body['stem'], body.get('linga', 'm'))}
    return {'ok': False, 'error': f'unknown action {a!r}'}


class handler(BaseHTTPRequestHandler):  # Vercel looks for a class named `handler`
    def _send(self, code: int, payload: dict):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        self._send(200, run({'action': 'health'}))

    def do_POST(self):
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
