# संवद.सि · Samvadasi — samvada.si

> संवदसि (*saṃvadasi*) — “you converse”.

**Speak Sanskrit by changing just the ending.** A conversational Sanskrit site and CMS: every dhātu of the
Dhātupāṭha, every lakāra, respectful and gendered forms, all generated and verified with
[Vidyut](https://github.com/ambuda-org/vidyut) (Ambuda's Pāṇinian grammar engine).

- **Site** (Next.js + Tailwind + shadcn/ui): Home · Today (daily practice with streaks and spaced review) · Path
  (30 units, placement test) · Phrases · Verbs · Nouns · Builder · Packs · Subhāṣitas · Script trainer, with the
  WHO / WHEN bar (I · you · *you, respectful* · he/she × one · two · many × masc. · fem.; spoken past · लङ् · लट् ·
  लृट् · लोट् · विधिलिङ्), Devanagari / Telugu / Kannada / Tamil, IAST on/off. Every page also exists at
  `/te/…`, `/kn/…`, `/ta/…`, rendered on the server for search.
- **CMS** (Payload 3, at `/admin`): dhātus, overrides, nouns & pronouns, situations, phrases, practice decks,
  Ambuda examples, users with roles (admin · editor · reviewer), version history, review workflow.
- **Grammar** (Vidyut, Python): generates every form, verifies stored forms, and shows the sūtra-by-sūtra derivation.

Free and open source (MIT). See *Data and licences* for the dictionary and text data.

---

## What's inside

| | |
|---|---|
| Dhātus | **2,235** — the whole Dhātupāṭha (2,229 roots) + 6 prefixed curated verbs (आ + गम्, उप + विश् …) |
| Forms | all 10 lakāras × both padas × 9 persons, plus क्तवतु (गतवान् / गतवती) — **≈258,000 forms**, every one checked against Vidyut |
| Conversational set | 64 everyday verbs with English meanings, used by Phrases, Verbs and Practice |
| Meanings | Monier-Williams senses for **1,871** dhātus (via Ambuda's data repository); Sanskrit Dhātupāṭha meaning for all |
| Examples | **170** verses for 61 verbs from texts published on Ambuda (GRETIL), sandhi-aware matching |
| Nouns | 28 nouns & pronouns with all 8 vibhaktis × 3 numbers (Vidyut; भवत् masc. hand-checked) |

Usage that differs from strict Pāṇini is kept, labelled and explained — e.g. धाव् “ran”: **धावितवान्** (colloquial)
and **धौतवान्** (classical) are both shown.

## Run it on your Mac

You need **Node 22+**, **Python 3.11+** and **Postgres** (Docker, Postgres.app or `brew install postgresql@16`).

```bash
cd samavada
# .env is prefilled for the local Docker Postgres — change PAYLOAD_SECRET and SEED_ADMIN_PASSWORD first
npm install
pip3 install -r requirements.txt   # Vidyut

docker compose up -d            # local Postgres (or point DATABASE_URL at your own / Neon)
npm run setup                   # creates the tables and imports all 2,235 dhātus, phrases, deck, examples

# two terminals:
npm run grammar                 # Vidyut service on http://127.0.0.1:5328/api/grammar
npm run dev                     # site on http://localhost:3000, CMS on http://localhost:3000/admin
```

Log in to `/admin` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.

## Everyday commands

```bash
npm run dev          # site + CMS on http://localhost:3000
npm run check        # typecheck + lint + tests (what CI runs; ~10 s)
npm run test:watch   # tests while you work
npm run build        # production build (regenerates the per-language string files first)
```

Architecture, caching and how to add a page, string, unit or exercise: see **ARCHITECTURE.md**.

## Working in the CMS

1. **Dhatus → any root → “Forms (Vidyut)” tab.** *Generate all forms* asks Vidyut for every form; *Verify stored
   forms* checks them. The table shows each lakāra and pada for review.
2. **Overrides tab** — only when real usage differs from Vidyut. Every override needs a label
   (colloquial · classical · alternative · correction) and a reason, which learners see as a note.
3. **Review tab** — status goes *Generated → Vidyut-checked → Approved*. Only **reviewers** (teachers) can approve.
4. **Featured** puts a root in the conversational set (Verbs page, Phrases, Practice).
5. **Phrases / Situations / Practice decks** — sentence patterns: subject and verb change with WHO / WHEN; you
   write the words in between, already in the right case (विद्यालयं, उद्याने), and the English template.

Every edit refreshes, within seconds, exactly the pages that use what changed, in all four languages
(`src/lib/revalidate.ts`).

## Keeping every form correct

```bash
npm run vidyut:verify        # regenerate all 2,235 dhātus with Vidyut and compare (≈10 s)
npm run vidyut:verify:cms    # also check everything stored in the CMS (≈258,000 forms)
```

The check fails if any stored form differs from Vidyut **unless** it is a labelled override with a reason.
`.github/workflows/verify.yml` runs it on every push; add `DATABASE_URL` and `PAYLOAD_SECRET` as repository
secrets to include the CMS check. A teacher's review is still needed for what a machine can't judge: usage,
naturalness of sentences, English meanings, and automatically-found examples (marked until reviewed).

## Regenerating data

```bash
npm run vidyut:data          # Vidyut's linguistic data → vidyut-data/
npm run vidyut:generate      # all dhātus → data/generated/dhatus.json, nouns → data/generated/nouns.json
npm run ambuda:data          # Monier-Williams + GRETIL texts from Ambuda's GitHub (≈400 MB)
npm run ambuda:meanings      # → data/generated/glosses.json
npm run ambuda:examples      # → data/generated/examples.json
npm run seed                 # import; safe to re-run (refreshes Vidyut forms, never overwrites editors' work)
```

Schema changes: edit a collection in `src/collections`, then `npm run migrate:create <name>` and `npm run migrate`.

## Deploy (free tier) — samvada.si

1. **Database:** create a free project at [neon.tech](https://neon.tech); copy its connection string.
2. **Code:** push this folder to GitHub (`samvada` repo).
3. **Vercel:** import the repo. Environment variables:
   `DATABASE_URL` (Neon), `PAYLOAD_SECRET` (`openssl rand -hex 32`), `NEXT_PUBLIC_SERVER_URL=https://samvada.si`.
   Do **not** set `VIDYUT_URL` there — `api/grammar.py` is deployed as a Python function at `/api/grammar`.
   The build runs `npm run ci` (migrations, then `next build`).
4. **First import:** from your Mac, with `DATABASE_URL` pointing at Neon: `npm run seed`.
5. **Domain:** in Vercel → Settings → Domains add `samvada.si` and set the DNS records it shows at your `.si` registrar.

Vercel's free (Hobby) plan is for non-commercial projects, which fits a free open-source site. Neon's free
database sleeps when idle; the first visit after a quiet spell takes a moment longer.

## Project layout

```
api/grammar.py                 Vidyut: public GETs (cached forever, known verbs only) + editor-only POSTs
api/_data/verbs.json           slug → root, for the public endpoint (scripts/vidyut/build_api_index.py)
api/card.py                    share-card images (Pillow + RAQM)
data/curated/                  hand-made layer: verbs, phrases, packs, nouns, verses, greetings
data/generated/                Vidyut / Ambuda output (dhatus, nouns, glosses, examples, lookup)
scripts/vidyut/ ambuda/ audio/ generators; scripts/i18n/ string tools; scripts/seed.ts CMS import
src/app/(frontend)/            English pages        src/app/(loc)/[lang]/   the same pages in te / kn / ta
src/collections/               Payload collections  src/lib/revalidate.ts   which pages each collection refreshes
src/components/pages/          one client component per screen
src/components/practice/       shared practice parts: shell, header, choices, steps, runner, summary
src/components/samvada/        WHO/WHEN state, nav, dock, verb picker, speak, share, a11y menu
src/lib/                       grammar/ (forms, scripts), i18n/ (strings, per-language dicts), data.ts (reads),
                               practice.ts (spaced review, streak), path.ts, scriptTrainer.ts, seo.ts, storage.ts
```

## Data and licences

- Code: **MIT**.
- **Vidyut** and its Dhātupāṭha data: MIT — <https://github.com/ambuda-org/vidyut>.
- **Monier-Williams** (meanings): Cologne Digital Sanskrit Dictionaries, CC BY-SA, via
  <https://github.com/ambuda-org/data>. `data/generated/glosses.json` is shared under the same licence.
- **Verses** (examples): GRETIL texts as published by Ambuda (<https://github.com/ambuda-org/gretil>), mostly
  **CC BY-NC-SA 4.0** — non-commercial, attribute, share alike. Each example stores its source and licence;
  `data/generated/examples.json` is shared under the same terms.
- Fonts (self-hosted via Fontsource): Rozha One, Noto Serif Devanagari, Baloo Tammudu 2 / Tamma 2 / Thambi 2,
  Bricolage Grotesque, Instrument Sans — SIL Open Font License.

## Known limits / next steps

- 364 rare dhātus have no Monier-Williams match yet (they show their Dhātupāṭha meaning).
- Vidyut doesn't yet derive the pronoun भवत् (masc.); its table is hand-checked and marked.
- Examples are found automatically; homographs (गच्छतः as verb vs participle) need a teacher's tick.
- Add more situations and phrases in the CMS; every new verb only needs to be marked *Featured*.
