<div align="center">

# 𐑐𐑰𐑐 · Peep

**Learn to read & write English in the Shavian alphabet — one short, calm lesson at a time.**

### 👉 Try it now at [**www.shavian-peep.com**](https://www.shavian-peep.com/) 👈

*Free, no account, works great on your phone.*

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE.md)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)

</div>

---

## What is Shavian?

Shavian is an alphabet for writing English **by sound rather than by traditional spelling**. Each of its 48 letters stands for exactly one English sound, so words are written the way they are spoken — no silent letters, no capital letters, no puzzling exceptions. It was funded by playwright **George Bernard Shaw**'s will and designed by **Ronald Kingsley Read**, first published in 1962.

**Peep** teaches it the way you'd actually learn a script: meet a couple of letters, then practise them until they stick, then build up to real words and whole sentences.

## Features

- 🔤 **The whole alphabet, taught gradually** — new letters arrive a pair at a time, always building on what you already know.
- ✍️ **Practice-first lessons** — every lesson mixes tapping, matching, typing, and word-building, with instant feedback and a skip button when you're stuck.
- 🧘 **Calm by design** — no streaks, no leaderboards, no accounts, no pressure. Just a clear path that unlocks as you learn. Progress is saved locally in your browser.
- 📖 **A full reference** — the About page lists all 48 letters with their naming word, IPA value, and an example word in Shavian, to come back to any time.
- 🌗 **Light & dark themes**, responsive layout, and a gentle animated hero.
- 🐛 **Report a problem** — a friendly in-lesson button lets anyone flag a mistake without needing to understand the code.

See the [**Roadmap**](./ROADMAP.md) for what's shipped and what's planned — video lessons, pronunciation helpers, richer sentence practice and more chapters.

## The curriculum

Lessons live as plain **JSON data files** — the code just renders them — which makes the content easy to read, review, and extend.

| Chapter | Theme | Lessons |
| --- | --- | --- |
| **Chapter 1** | The Alphabet | 24 lessons — every consonant and vowel, ~20 exercises each |
| **Chapter 2** | Reading Fluency | 11 lessons — the last letters, r-coloured vowels & ligatures, names, and sentence building |
| **Chapter 3** | Reading in the Wild | 8 lessons — sound-true endings, the schwa, sight words, dialogue, longer stories, and a real fable to transcribe |
| **Chapter 4** | Writing Shavian | 1 lesson so far — spell words on a full on-screen Shavian keyboard |
| **Chapter 5** | *Coming soon* | — |

Twelve kinds of exercise keep practice varied:

| Type | What it does |
| --- | --- |
| `teach` | A short explanation card (Shavian letters render inline as chips) |
| `choice` | Multiple choice — read a glyph, or pick the right spelling |
| `type` | Sound it out and type the English word |
| `match` | Pair each symbol with its word |
| `build` | Assemble a word from letter tiles |
| `arrange` | Order word-tiles into a full sentence |
| `complete` | Fill in a word's missing letter(s) from a tile bank |
| `fill` | Choose the missing words to finish a sentence (some pre-filled) |
| `cloze` | Read a short passage and fill its blanked words from context |
| `spot` | Read a sentence and tap the word that means the English prompt |
| `transcribe` | Read a real Shavian passage and write out the full English |
| `write` | Spell an English word in Shavian on a full on-screen keyboard |

## Getting started

Requires a recent **Node.js** (20+).

```bash
git clone https://github.com/franciscopaglia/peep.git
cd peep
npm install
npm run dev      # start the dev server
```

Other scripts:

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # run oxlint
```

## Tech stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Base UI · lucide-react · oxlint.

```
src/
├─ App.tsx            # top-level state machine + lesson playback
├─ views/             # Landing, Dashboard, Lesson, Complete, About, Resources
├─ components/        # Nav, Footer, Button, AlphabetChart, ReportProblem, …
├─ lessons/           # the curriculum — one JSON file per lesson (auto-discovered)
├─ hooks/             # useHeroCanvas
└─ lib/               # helpers, constants
```

## Contributing

Contributions are very welcome — **especially to the lessons**. You don't need to know React to help: lessons are just data.

### Add or fix a lesson

Drop a file named `NN-slug.json` into `src/lessons/`. It's picked up automatically (files are discovered with `import.meta.glob`, sorted by `id`).

```jsonc
{
  "id": 5,
  "title": "First Words",
  "glyph": "𐑒𐑨𐑑",       // the icon shown on the path
  "chapter": 1,
  "exercises": [
    { "type": "teach", "title": "Reading whole words",
      "body": "Blend letters left to right: 𐑛𐑪𐑑 is d-o-t, \"dot\"." },

    { "type": "type", "prompt": "𐑚𐑦𐑜",
      "caption": "Type what this word says",
      "correct": "big", "correctLabel": "big" },

    { "type": "choice", "promptIsGlyph": true, "prompt": "𐑒𐑦𐑛",
      "caption": "What does this word mean?",
      "optionIsGlyph": false,
      "options": ["kid", "kit", "cod", "cap"],
      "correct": "kid", "correctLabel": "kid" },

    { "type": "build", "prompt": "sit",
      "caption": "Build this word from Shavian letters",
      "tiles": ["𐑕", "𐑦", "𐑑", "𐑛", "𐑨"],
      "answer": ["𐑕", "𐑦", "𐑑"], "correctLabel": "𐑕𐑦𐑑" },

    { "type": "match",
      "pairs": { "𐑓𐑦𐑑": "fit", "𐑛𐑪𐑑": "dot" },
      "leftOrder": ["𐑛𐑪𐑑", "𐑓𐑦𐑑"],
      "rightOrder": ["fit", "dot"] }
  ]
}
```

A few guidelines that keep the curriculum sound:

- **Only use letters that have already been taught** by that point in the path.
- For `build`/`arrange`, make sure `answer` is buildable from `tiles`, and `correctLabel` equals the answer joined together (letters for `build`, space-separated words for `arrange`).
- For `choice`, include the `correct` value in `options`, keep four distinct options, and set `correctLabel` to match.
- Shavian lives in Unicode block `U+10450–U+1047F`.
- Run `node scripts/lesson.mjs check` and `npm test` afterwards — they validate every lesson's structure, solvability, and that no exercise uses letters the learner hasn't been taught yet.

Spelling questions? The [ReadLex dictionary](https://readlex.pw) and [shavian.info](https://www.shavian.info) are the go-to references.

### Spotted a mistake?

Every exercise has a **Report a problem** button that opens a pre-filled GitHub issue pointing at the exact lesson and card — the quickest way to flag a wrong spelling or a confusing prompt.

## Learn more

- [shavian.info](https://www.shavian.info) — the community reference hub
- [Shavian on Wikipedia](https://en.wikipedia.org/wiki/Shavian_alphabet)
- [ReadLex](https://readlex.pw) — English → Shavian dictionary
- [r/shavian](https://www.reddit.com/r/shavian/)

## License

Released under the [GNU GPL v3](./LICENSE.md).

A learning project by **Francisco Paglia**. Not affiliated with the estate of George Bernard Shaw or any official Shavian body.
