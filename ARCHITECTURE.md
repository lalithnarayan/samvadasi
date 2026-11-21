# Architecture

Samvadasi is one Next.js app with Payload CMS inside it, a Postgres database (Neon) and two small
Python functions (Vidyut grammar, share cards). Almost all content is generated once by Vidyut and
rarely edited, so the design goal is simple: **serve pages from the CDN, and touch the server only
when content changes.**

```
reader ──▶ Vercel CDN (Mumbai) ──miss──▶ Next.js function ──▶ Payload ──▶ Neon Postgres
                   ▲                                   ▲
                   └── CMS save: revalidatePath ───────┘   (only the routes that read that collection)
```

## Pages and caching

- Every page is static or ISR. Dynamic routes (`/verb/[slug]`, `/noun/[slug]`, `/packs/[slug]`,
  `/subhashita/[slug]`, `/path/[n]`) export `generateStaticParams`: the 64 everyday verbs, all packs,
  verses and units are built ahead; any other verb or noun is built on its first visit and then cached.
  Without `generateStaticParams` a dynamic route renders on every request; a test guards this.
- `revalidate = 86400` is only a safety net. Edits refresh pages at once: each collection's
  `afterChange` hook calls `revalidateSite`, which looks up the routes in `ROUTES`
  (`src/lib/revalidate.ts`) and refreshes them in both trees. Next tags cached pages with their file
  path **including the route-group folder** (`/(frontend)/noun/[slug]/page`), so patterns include it.
- `/search` (verb lookup by conjugated form) is cached at the edge for a day; `/search-index` (all verbs,
  ~49 KB gzipped) lets the verb picker search in the browser.

## Languages

- English pages live in `src/app/(frontend)`; Telugu, Kannada and Tamil copies in `src/app/(loc)/[lang]`,
  each a one-line re-export of the English page plus its own segment config. They are separate root
  layouts, so `<html lang>` is right for search engines. A test checks every English page has its twin.
- Do **not** put `dynamicParams = false` on the `[lang]` layout: pages inherit it and every verb not
  built ahead would 404. Unknown languages are refused in the layout instead.
- Interface strings: edit `src/lib/i18n/ui.ts` (every key in four languages; add with
  `python3 scripts/i18n/add-ui.py strings.json`). Before each build, `scripts/i18n/build-dicts.ts`
  writes one file per language to `src/lib/i18n/dict/`; the server hands a page only its own language,
  and switching script loads another on demand. Tests fail if a language is missing or the files are stale.
- SEO copy (titles, descriptions, JSON-LD) is in `src/lib/seo.ts`; words shown on verb pages are in
  `src/lib/verbText.ts` so the browser doesn't download every page's copy.

## Data

- Reads go through `src/lib/data.ts` (server only). Generated forms (Vidyut) and editorial fields
  (meanings, overrides, examples, review status) are both stored in Postgres today; `scripts/seed.ts`
  refreshes forms without overwriting editors' work.
- JSON fields that hold arrays use `jsonField()` (`src/lib/jsonField.ts`): Payload's partial update
  otherwise turns nested arrays into `{"0": …}` objects.
- `/api/grammar` answers public questions only by verb slug (`api/_data/verbs.json`), with responses
  cached for good; generating and verifying forms needs a CMS login.

## Browser state

- Who/when, script and IAST live in `SamvadaStateProvider` (`components/samvada/state.tsx`) and are
  mirrored into the URL.
- Anything kept between visits (practice progress, script-trainer level, text size) goes through
  `useStored` / `writeStored` (`src/lib/storage.ts`, built on `useSyncExternalStore`): every reader
  updates when one writes, and nothing sets state inside an effect.

## Practice

- `src/lib/practice.ts`: spaced review (boxes 0–5, intervals 1/1/3/7/21/60 days), streak with a weekly
  freeze, and `buildSession(pool, store, …, plan)`, which Today and every path unit share.
- `src/components/practice/`: `PracticeShell`, `SessionHeader`, `ChoiceButton` (✓/✗, not colour only),
  `Step`, `Runner`, `Summary`. **To add an exercise:** add its type to `Ex` and its builder in
  `practice.ts`, its question key to `QUESTION` in `Step.tsx`, and a renderer if it isn't multiple choice.
- **To add a unit:** add an entry to `UNITS` (and a section) in `src/lib/path.ts`; a test checks it has
  enough to practise.

## Checks

`npm run check` = typecheck + lint + tests, the same as CI (`.github/workflows/verify.yml`), which also
re-generates every form with Vidyut and fails on any difference.
