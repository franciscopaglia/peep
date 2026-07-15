# CLAUDE.md

Guidance for working in this repo. **Peep** (𐑐𐑰𐑐) is a web app for learning the
Shavian alphabet — Vite + React 19 + TypeScript (strict) + Tailwind CSS v4.

## What Peep is (intent)

A calm, self-paced way to learn to read and write English in the Shavian
alphabet — "the alphabet one short lesson at a time." The guiding ethos:

- **Calm, not gamified** — no streaks, no leaderboards, no accounts, no ads.
  Progress is saved locally and the path unlocks as you go.
- **Practice-first** — you learn by doing; every lesson is mostly exercises with
  instant feedback and a skip button.
- **Gradual & sound** — letters arrive a pair at a time, always building on what
  came before; a lesson only ever uses letters already taught.
- **Content as data** — the whole curriculum is plain JSON so anyone (no React
  needed) can read, review, and extend it.
- **Approachable to non-technical users** — friendly copy, a plain-language
  "report a problem" flow, works well on phones.

Keep these in mind when adding features: prefer clarity and gentleness over
density or pressure.

## Features

Gradual 48-letter curriculum (Chapters 1–2 shipped, 3–5 planned); nine exercise
types; retry-on-wrong with a 60% pass gate; a full alphabet **reference** (About
page); **light/dark theme** that follows the system and persists; **responsive**
with a mobile nav; per-chapter **unlock** (for when a release resets progress);
**report a problem** → GitHub issues; animated hero + drifting dashboard
background (both lighter on mobile); build **version** stamped in the footer.

## Commands

```bash
npm run dev      # dev server
npm test         # run the Vitest suite (vitest run)
npm run test:watch
npm run lint     # oxlint
npm run build    # tsc -b && vite build
npm run deploy   # build + publish dist/ to gh-pages (custom domain via public/CNAME)
```

**After any change, run `npm test` and `npm run build`** (build = typecheck +
production build). Both must pass before considering work done.

## Architecture

- **`src/App.tsx`** — top-level state machine keyed on `view`
  (`landing | dashboard | lesson | complete | about | resources`). Owns lesson
  playback state and progress. Progress is a single number in `localStorage`
  (`shavian-progress`); lessons unlock sequentially.
- **`src/lessons/`** — the curriculum. One **JSON file per lesson**,
  auto-discovered via `import.meta.glob` and sorted by `id`. `index.ts` exports
  `LESSONS`, `LESSON_META`, `CHAPTERS`, `getLessonExercises`,
  `shuffleExerciseOptions`. `types.ts` defines the `Exercise` union.
- **`src/lib/grading.ts`** — **the single source of truth for answer-checking.**
  `isCorrect(exercise, answerState)` grades every gradeable type; also
  `gradeableCount`, `lessonPassed`, `PASS_THRESHOLD`. The app and the tests both
  use it — never re-implement grading elsewhere.
- **`src/views/`** — `Landing`, `Dashboard`, `Lesson`, `Complete`, `About`,
  `Resources`. `Lesson.tsx` renders one exercise at a time (a block per type).
- **`src/components/`** — shared UI (`Nav`, `Footer`, `Button`, `Chip`,
  `AlphabetChart`, `ReportProblem`, `ComingSoonCard`, …).

## Pages & their intent

Each view has one clear job — keep them focused:

- **Landing** (`views/Landing.tsx`) — the front door. Explain what Shavian is and
  make it feel inviting: animated hero, a "See it in Shavian" showcase, feature
  cards, how-it-works, the whole alphabet, a Shaw quote, and a CTA into learning.
- **Dashboard** (`views/Dashboard.tsx`) — the home base once learning: the
  chapter path (vertical node trail), a "continue" card, coming-soon chapters,
  and the per-chapter unlock. This is where a returning learner lands.
- **Lesson** (`views/Lesson.tsx`) — distraction-free exercise playback: one card
  at a time, a progress bar over **graded** steps, check / skip / continue, and
  report-a-problem. The nav is hidden here on purpose (focus).
- **Complete** (`views/Complete.tsx`) — the results screen: first-try score,
  accuracy, pass/fail against the 60% gate, and a retry when not passed.
- **About** (`views/About.tsx`) — the **go-to reference**: history, how spelling
  works, accents, letter design, and all 48 letters with IPA + example words,
  with a table of contents and cited sources. Not a lesson — a place to look
  things up.
- **Resources** (`views/Resources.tsx`) — curated external links, grouped
  (learn more / tools / community).

## Exercise types

Nine types (see `src/lessons/types.ts`). Graded via `isCorrect`:
`choice`, `type`, `build`, `arrange`, `complete` (fill a word's missing
letters), `fill` (fill a sentence's missing words), `cloze` (fill a passage's
blanks). `teach` is not graded; `match` is graded through its own pairing flow
in `App.tsx` (not via `isCorrect`). `match` is **intentionally not failable** —
wrong picks just shake and reset, and finishing always scores the point.

**Randomization:** `shuffleExerciseOptions` shuffles `choice` options, `build`/
`arrange` tiles, and `complete`/`fill`/`cloze` banks on load. The shuffle
guarantees a **non-identity** order (never the authored order — the correct
answer is always authored first, so this stops "tap straight through").

## Lesson authoring rules

- **Only use letters taught by that point.** Chapter 1 must not use Chapter 2
  letters (`𐑠` zh, the r-vowels `𐑸𐑹𐑺𐑻𐑼𐑽𐑾𐑿`, or `𐑬𐑭𐑷𐑶`), and never `𐑔`; `𐑞`
  appears in Ch1 only as the fixed word "the". Also beware words whose *sounds*
  aren't all taught yet — "digit" contains `𐑡` (j), not `𐑜` (g).
- **Use the standard abbreviated words.** In running Shavian text, the = `𐑞`,
  and = `𐑯`, to = `𐑑`, of = `𐑝`, for = `𐑓` — never spelled out. `𐑨𐑯𐑛` is a
  misspelling of "and", and `𐑑𐑵` reads "too/two", never "to". They're taught in
  lesson 24 (`𐑞 𐑯 𐑑`) and lesson 27 "Little Words" (`𐑝 𐑓`, plus for/four and
  the first homographs); Chapter 3 will deepen this (ligatures, more shorthand).
- `type`: when the prompt's spelling is shared by English homophones (`𐑑𐑵` is
  both "too" and "two", `𐑓𐑹` is "four"/"fore"), list the alternates in
  `accept` so a correct reading is never marked wrong.
- `correctLabel` must equal the joined answer (letters for `build`, space-joined
  words for `arrange`/`fill`/`cloze`, the full word for `complete`).
- `choice`: options distinct and include `correct`.
- `build`/`arrange`/`complete`/`fill`/`cloze`: the answer must be buildable from
  the tiles/bank.
- Pass mark is **60% first-try accuracy** (`PASS_THRESHOLD`); below that the
  lesson is "not passed" and the next stays locked.
- In `teach` bodies, Shavian runs render as chips. Wrap a span in `[[ … ]]` to
  render it as **one** chip (e.g. a whole sentence) instead of one per word.

## Tests

`npm test` runs three suites:

- `src/lib/grading.test.ts` — unit tests for `isCorrect` per type, plus
  `gradeableCount` and `lessonPassed`.
- `src/lessons/shuffle.test.ts` — shuffle preserves the multiset, keeps the
  answer present, is non-identity, and doesn't mutate the input.
- `src/lessons/lessons.test.ts` — loads **every real lesson** and asserts each
  exercise is solvable (raw and after shuffling) plus structural checks. This
  catches bad lesson edits.

**When adding a new exercise type:** extend the `Exercise` union, add a branch to
`isCorrect`, handle it in `shuffleExerciseOptions` if it has orderable elements,
render it in `Lesson.tsx`, and add coverage in `grading.test.ts` (the
`lessons.test.ts` `solve()` helper also needs a case).

## Conventions & DRY

Reuse before adding. Common patterns already have a home:

- **Design tokens over raw colors.** Tailwind v4 `@theme inline` in
  `src/index.css` defines semantic CSS vars (`--accent`, `--accent-soft`,
  `--accent-border`, `--card`, `--foreground`, `--muted(-foreground)`,
  `--border`, `--success`, `--danger`, `--locked-*`, …) mapped to `--color-*`, so
  utilities like `bg-accent`, `text-card`, `border-accent-border` work and adapt
  to light/dark. Use these; avoid hard-coded hex. Inline `style` is only for
  *dynamic* values (progress width, computed state colors).
- **Shared components, not copies:** `Button` (variants `primary|outline|
  inverted`, sizes `sm|md`), `Chip` (Shavian glyph/badge), `SectionLabel`,
  `ComingSoonCard`, `ReportProblem`, `AlphabetChart` / `AlphabetReferenceTable`.
- **Single sources of truth:** grading → `lib/grading.ts`; URLs + issue links →
  `lib/constants.ts`; the site-wide report modal content → `siteReport` in
  `lib/report.tsx` (used by both nav and footer); glyph-chip rendering →
  `lib/shavian-text.tsx`; class merging → `cn` in `lib/utils.ts`. If you find
  yourself duplicating one of these, import it instead.

## React & TypeScript practices

- **Strict TS + a discriminated union.** `Exercise` is discriminated on `type`;
  handle it exhaustively (switch on `type`) so new types surface as errors.
- **Lift state up.** `App.tsx` owns lesson/progress state; views are largely
  presentational, receiving props + callbacks. Keep new stateful logic there or
  in a small hook, not scattered across views.
- **Pure logic lives outside components** (e.g. `grading.ts`) so it's unit-
  testable without rendering. Prefer this for anything with real logic.
- **Fast-refresh rule** (oxlint `react-refresh/only-export-components`): a file
  that exports a React component must export **only** components. Put shared
  non-component values in their own module — that's why `siteReport` is in
  `lib/report.tsx` (not `ReportProblem.tsx`) and `SHAVIAN_ALPHABET` stays
  unexported inside `AlphabetChart.tsx`.
- **`useCallback` for handlers** passed to children; keep dependency arrays
  correct (grading/`continueNext` close over live state).
- **Effects clean up** their listeners (`keydown`, `matchMedia`, canvas RAF).
  See `useDarkMode`, `useIsMobile`, `useHeroCanvas`.
- **Accessibility:** icon-only buttons get `aria-label`; modals use
  `role="dialog"` + `aria-modal` and close on Escape and backdrop click.
- **Mobile:** heavy visuals scale down on small screens (hero particle count and
  the dashboard glyph pattern are reduced ~25% under 640px).
