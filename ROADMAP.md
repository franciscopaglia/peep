# 𐑐𐑰𐑐 · Peep — Roadmap

Where Peep is today, and where it's headed. This is a living document — dates
aren't promised, and priorities shift with community feedback. Spotted something
you'd love to see? Open an issue.

Legend: ✅ shipped · 🚧 in progress · 🗓️ planned · 💡 idea / under consideration

---

## ✅ What Peep does today

### Curriculum

- **Chapter 1 — The Alphabet** (24 lessons): every consonant and vowel of the
  48-letter Shavian alphabet, introduced a pair at a time, with ~20
  practice-heavy exercises per lesson.
- **Chapter 2 — Reading Fluency** (11 lessons): the `ʒ` letter, the r-coloured
  vowels, the little words (the single-letter spellings 𐑞 𐑝 𐑯 𐑑 𐑓 and a first
  look at homographs like 𐑑𐑵 = *too*/*two*), writing names, sentence building,
  and a short reading passage.
- **Chapter 3 — Reading in the Wild** (8 lessons): the word endings (`-s`, `-ing`,
  `-ed`), the busy schwa, a deeper pass on shorthand and homographs, dialogue on
  the page, and longer *unassisted* passages of real Shavian — including whole
  sourced texts read straight, no word banks.
- **Chapter 4 — Writing Shavian** (just begun): the reverse direction — given an
  English word, spell it yourself on the full on-screen Shavian keyboard.
- New letters only ever build on what you've already learned — the path never
  asks you to read a symbol it hasn't taught.

### Practice

Twelve kinds of exercise keep every lesson varied:

| Type | What it does |
| --- | --- |
| `teach` | A short explanation card (Shavian renders inline as chips) |
| `choice` | Multiple choice — read a glyph, or pick the right spelling |
| `type` | Sound it out and type the English word |
| `match` | Pair each symbol with its word |
| `build` | Assemble a word from letter tiles |
| `arrange` | Order word-tiles into a full sentence |
| `complete` | Fill in a word's missing letter(s) from a tile bank |
| `fill` | Choose the missing words to finish a sentence (some pre-filled) |
| `cloze` | Read a short passage and fill its blanked words from context |
| `spot` | Tap the word in a sentence that means the English prompt |
| `transcribe` | Read a real, sourced Shavian passage and write the full English |
| `write` | Spell an English word in Shavian on the full on-screen keyboard |

- **Everything is randomized** — choice options, letter tiles, fill-in banks, and
  both match columns are shuffled on every load, and never render in their
  authored order, so nothing can be solved by tapping straight through.
- **Instant feedback** with a gentle retry: miss one and it comes back later in
  the lesson, reshuffled.
- **Skip** anything you're stuck on.

### Reference & discovery

- **About page** — a full reference: the alphabet's history and design, how
  spelling works, one alphabet across many accents, and all 48 letters with
  their naming word, IPA value and an example word in Shavian.
- **Resources page** — hand-picked links to dictionaries, fonts, keyboards and
  the wider community.

### The app itself

- **A branching path.** The main path stays lean, and **optional branch
  lessons** hang off it for extra practice on trickier words. Branches unlock
  once you reach their spot, but they never gate the path or count toward your
  progress — take them when you want more, skip them when you don't.
- **No accounts, no streaks, no pressure.** Progress is saved locally in your
  browser and the path unlocks as you go.
- **Light & dark themes** — follows your system by default, remembers your
  choice, and applies before first paint (no flash).
- **Responsive** from phone to desktop, with a dedicated mobile navigation menu.
- **Report a problem** — a friendly button in every lesson (and in the header)
  opens a pre-filled GitHub issue, no code knowledge needed.
- **Data-driven lessons** — the whole curriculum is plain JSON, auto-discovered,
  so anyone can read, review or extend it.

---

## 🗓️ On the roadmap

### Richer sentence practice

Chapter 2 already has you *ordering* word-tiles into a sentence (the `arrange`
exercise). The next step is to make sentence work deeper and more forgiving:

- **✅ Fill-the-sentence** (the `fill` exercise) — you're shown an English
  sentence and a bank of Shavian words, and you pick the words that spell it out.
  Some slots come **pre-filled** (for example, words using letters not yet
  taught), so you only ever choose from what you know.
- **🗓️ Guided arranging** — the `arrange` exercise gains optional **pre-filled
  anchors**: harder or not-yet-taught words are locked in place, and you slot the
  rest around them. Great for easing into longer sentences.
- **✅ Cloze reading** (the `cloze` exercise) — read a short Shavian passage with
  a few blanked words and fill them in from context; a supporting English
  translation can be shown. Chapter 2's reading capstone.

### Richer word practice

Between reading single letters and ordering whole sentences sits the **word** —
the level that makes reading really click. New exercise types planned here:

- **✅ Complete the word** (the `complete` exercise) — a Shavian word appears
  with one or more letters blanked out (e.g. `𐑒_𐑑` for *cat*), and you fill the
  gaps from a small bank of letters. It cements full-word spelling once the
  individual letters are known, and bridges nicely between the `build` exercise
  and reading a word on sight. Not-yet-taught letters can be left pre-filled so
  you only ever choose from what you've learned.
- **💡 Fix the spelling** — a word is shown with one letter swapped for a wrong
  one; spot it and correct it. Great for sharpening letter-by-letter attention.
- **💡 Word dictation** — hear a word spoken (ties into the pronunciation
  helpers) and build it letter by letter, no English prompt shown.

### More theory, woven in

- **🚧 Richer teach cards throughout existing lessons** — most `teach` cards
  introduce a new letter and move on; the plan is short theory woven through
  the path instead — shape design, why a spelling looks the way it does,
  reading tips, a pinch of history — so the "why" arrives alongside the "how".
  **Chapter 1 has a first pass** (11 new cards: the tall/deep rotation pattern,
  the three letter-shape families, a Shaw history nugget, sonorants, vowel
  length, reading-by-silhouette, and a ligature preview). Chapter 2 and beyond
  are still open.

### Video lessons

- **🗓️ Short lesson videos** — a handful of narrated walkthroughs (letter shapes,
  how to read a word left-to-right, sentence flow) embedded right into the path.
  The `teach` card already reserves a media slot for this.
- **💡 Handwriting clips** showing the natural stroke order of each letter.

### Pronunciation helpers

- **✅ Hear every letter** — a speaker button on each letter reads its name
  aloud (first tap at normal speed, then alternating slow/normal), both on the
  letter cards inside lessons and on the About reference table.
- **🗓️ Hear every word** — extend tap-to-hear from single letters to example
  words and the words in exercises.
- **🗓️ IPA, in context** — pronunciation shown (and played) alongside the sound
  during `teach` and `choice` exercises, not just on the reference page.
- **💡 Accent toggle** — hear the same spelling in more than one accent, tying
  into the "one alphabet, many accents" idea already covered in About.
- **💡 Speak-it-back** — optional microphone practice to check your pronunciation.

### The five-chapter arc

The curriculum is planned as **five chapters**, each a distinct *mode* rather
than just more lessons. The progression runs **learn letters → read words →
read real text → write → master**, and every chapter assumes the one before it,
so nothing re-teaches what came earlier.

- **✅ Chapter 1 — The Alphabet** *(shipped · 24 lessons)* — all 48 letters, a
  pair at a time, blending into first words.
- **✅ Chapter 2 — Reading Fluency** *(shipped · 11 lessons)* — the `ʒ` letter,
  the r-coloured vowels, the little words (single-letter spellings and first
  homographs), the naming dot, sentence building, and a first short story.
- **✅ Chapter 3 — Reading in the Wild** *(shipped · 8 lessons)* — you can read
  sentences; now read *published* Shavian. The word endings (`-s`, `-ing`,
  `-ed`), the busy schwa, a deeper pass on shorthand words and homographs,
  dialogue on the page, and longer *unassisted* passages (no word banks) —
  culminating in a whole sourced text read straight through.
- **🚧 Chapter 4 — Writing Shavian** *(started · 1 lesson so far)* — the reverse
  direction: given English, spell it in Shavian on the full on-screen keyboard
  (the `write` exercise). Its own chapter because writing needs rules reading
  doesn't — schwa vs. full vowels under stress, the fixed spellings, dropping
  apostrophes, and telling homophones apart (their/there, to/too).
- **💡 Chapter 5 — Fluency & Beyond** *(placeholder — ideas only)* — mastery and
  range: timed or self-paced reading, longer stories and real documents, accents
  & variation (one spelling across RP and rhotic speech), free-writing prompts,
  and a capstone.

### Quality-of-life

- **💡 Review & spaced repetition** — revisit letters and words you've missed,
  surfaced at the right time.
- **💡 Progress export/import** — move your progress between devices without an
  account.
- **💡 Per-lesson stats** and a gentle sense of mastery per letter.
- **💡 Type on your own keyboard** — the `write` exercise already gives an
  on-screen Shavian keyboard; a next step is practice mapping it to a physical
  keyboard or system IME for writing Shavian outside Peep.

---

## Contributing to the roadmap

The most valuable contributions are **lessons and content** — and because
lessons are just JSON, you don't need to know React to help. See
[the contributing section of the README](./README.md#contributing) for the
lesson format, and open an issue to discuss anything on this list (or something
that isn't).
