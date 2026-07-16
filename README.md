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

Lessons are one JSON file per lesson in `src/lessons/`, named `NN-slug.json` and picked up automatically. You can edit that JSON directly, but there's a friendlier way: a small CLI that ships with the repo and speaks **one compact line per exercise**. It works out the fiddly bits — `correctLabel`, blank indices, tile and bank composition — so they can't drift out of sync.

```bash
node scripts/lesson.mjs list                 # every lesson, with a tally of its exercise types
node scripts/lesson.mjs show 27              # read one lesson as compact lines
node scripts/lesson.mjs grep '𐑑𐑵'            # search the whole curriculum
node scripts/lesson.mjs add 27 'type :: 𐑝 :: ok=of'      # append an exercise
node scripts/lesson.mjs put 27 3 '<line>'    # replace exercise 3
node scripts/lesson.mjs new 45 my-slug 'My Lesson' 𐑐 4   # start a new lesson
node scripts/lesson.mjs check                # validate the whole curriculum
```

The grammar in miniature — `+` marks a wrong option or an unused tile, `_` a blank, `*` the word to find:

```
teach   :: Title :: Body text; {{𐑞 𐑛𐑪𐑜 𐑦𐑟 𐑒𐑿𐑑.}} renders as a passage block.
choice  :: gp 𐑓𐑹 :: cap=What does this word mean? :: four | +for | +far | +form
type    :: 𐑑𐑵 :: ok=too :: alt=two
build   :: sit :: 𐑕 𐑦 𐑑 +𐑛
arrange :: the cat sat :: 𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑 +𐑛𐑪𐑜
fill    :: the dog ran :: 𐑞 _𐑛𐑪𐑜 _𐑮𐑨𐑯 :: +𐑒𐑨𐑑
spot    :: dog :: 𐑞 *𐑛𐑪𐑜 𐑦𐑟 𐑒𐑿𐑑 .
write   :: cat :: ok=𐑒𐑨𐑑
```

The full grammar lives in [`.claude/skills/lesson-editor/SKILL.md`](./.claude/skills/lesson-editor/SKILL.md), and the underlying data shapes in [`src/lessons/types.ts`](./src/lessons/types.ts).

A few guidelines that keep the curriculum sound:

- **Only use letters that have already been taught** by that point in the path — including a word's *sounds*, since "digit" contains 𐑡 (j), not 𐑜 (g). `check` enforces this.
- **Verify spellings** against the [Read Lexicon](https://readlex.pw) rather than intuition — Shavian spells sounds, so "million" is 𐑥𐑦𐑤𐑘𐑩𐑯 and "story" is 𐑕𐑑𐑹𐑦. When a spelling is shared by homophones (𐑑𐑵 is both "too" and "two"), list the alternates in `alt=`.
- **`transcribe` passages must be real, sourced texts** — never invented ones.
- Shavian lives in Unicode block `U+10450–U+1047F`.
- Run `node scripts/lesson.mjs check` and `npm test` afterwards. They validate every lesson's structure and solvability, and catch letters the learner hasn't met yet.

Spelling questions? The [Read Lexicon](https://readlex.pw) and [shavian.info](https://www.shavian.info) are the go-to references.

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
