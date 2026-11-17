"""Generate the AI voice for every play button with AI4Bharat Indic Parler-TTS (Apache-2.0).

Runs on a Mac (Apple Silicon uses the GPU via MPS) or any machine with Python 3.10+.
  python scripts/audio/generate_ai.py            # everything, resumes where it stopped
  python scripts/audio/generate_ai.py --limit 8  # a few samples first

Reads data/generated/audio-texts.json, writes public/audio/ai/<hash>.m4a and the manifest
data/generated/audio-ai.json ({text: url}). Files already made are skipped.
The model is gated on Hugging Face: accept its terms once at
https://huggingface.co/ai4bharat/indic-parler-tts and log in with a read token.
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, tempfile, time

ap = argparse.ArgumentParser()
ap.add_argument('--limit', type=int, default=0)
ap.add_argument('--kinds', default='verse,greeting,word,noun,form,phrase')
a = ap.parse_args()

import torch, soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'audio', 'ai')
MAN = os.path.join(ROOT, 'data', 'generated', 'audio-ai.json')
os.makedirs(OUT, exist_ok=True)
texts = json.load(open(os.path.join(ROOT, 'data', 'generated', 'audio-texts.json'), encoding='utf-8'))
order = a.kinds.split(',')
texts = sorted([t for t in texts if t['kind'] in order], key=lambda t: order.index(t['kind']))
man = json.load(open(MAN, encoding='utf-8')) if os.path.exists(MAN) else {}

device = 'mps' if torch.backends.mps.is_available() else 'cuda:0' if torch.cuda.is_available() else 'cpu'
print('device:', device, flush=True)
model = ParlerTTSForConditionalGeneration.from_pretrained('ai4bharat/indic-parler-tts').to(device)
tok = AutoTokenizer.from_pretrained('ai4bharat/indic-parler-tts')
dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
DESC = {
    'verse': "Aryan recites slowly and calmly with a warm, clear voice and gentle pauses. The recording is very clear with almost no background noise.",
    'default': "Aryan speaks at a moderate, slightly slow pace with a clear, natural voice. The recording is very clear with almost no background noise.",
}
enc = {k: dtok(v, return_tensors='pt').to(device) for k, v in DESC.items()}
has_afconvert = shutil.which('afconvert') is not None
has_ffmpeg = shutil.which('ffmpeg') is not None

done, t0 = 0, time.time()
todo = [t for t in texts if t['text'] not in man]
if a.limit: todo = todo[: a.limit]
print(f'{len(texts) - len(todo)} already done, {len(todo)} to make', flush=True)
for i, t in enumerate(todo):
    text = t['text']
    h = hashlib.sha1(text.encode('utf-8')).hexdigest()[:14]
    d = enc['verse' if t['kind'] == 'verse' else 'default']
    p = tok(text + '।', return_tensors='pt').to(device)
    with torch.no_grad():
        g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    audio = g.cpu().numpy().squeeze()
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        sf.write(wav, audio, model.config.sampling_rate)
        dest = os.path.join(OUT, h + '.m4a')
        if has_afconvert:
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '40000', wav, dest], check=True)
        elif has_ffmpeg:
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', '40k', dest], check=True)
        else:
            dest = os.path.join(OUT, h + '.wav'); shutil.copy(wav, dest)
    man[text] = '/audio/ai/' + os.path.basename(dest)
    done += 1
    if done % 5 == 0 or i == len(todo) - 1:
        json.dump(man, open(MAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    rate = (time.time() - t0) / done
    print(f'[{done}/{len(todo)}] {t["kind"]:8} {text[:40]}  ({rate:.1f}s each, ~{rate * (len(todo) - done) / 60:.0f} min left)', flush=True)
json.dump(man, open(MAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('done:', len(man), 'clips in', MAN)
