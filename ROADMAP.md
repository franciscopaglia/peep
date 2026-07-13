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
- **Chapter 2 — Reading Fluency** (9 lessons): the `ʒ` letter, the r-coloured
  vowels, writing names, sentence building, and a short reading passage.
- New letters only ever build on what you've already learned — the path never
  asks you to read a symbol it hasn't taught.

### Practice

Six kinds of exercise keep every lesson varied:

| Type | What it does |
| --- | --- |
| `teach` | A short explanation card (Shavian renders inline as chips) |
| `choice` | Multiple choice — read a glyph, or pick the right spelling |
| `type` | Sound it out and type the English word |
| `match` | Pair each symbol with its word |
| `build` | Assemble a word from letter tiles |
| `arrange` | Order word-tiles into a full sentence |

- **Everything is randomized** — choice options, letter tiles, and both match
  columns are shuffled on every load, and never render in their authored order,
  so nothing can be solved by tapping straight through.
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

- **🗓️ Fill-the-sentence** — you're shown an English sentence and a bank of
  Shavian words, and you pick the words that spell it out. Some slots come
  **pre-filled** (for example, words using letters not yet taught), so you only
  ever choose from what you know.
- **🗓️ Guided arranging** — the `arrange` exercise gains optional **pre-filled
  anchors**: harder or not-yet-taught words are locked in place, and you slot the
  rest around them. Great for easing into longer sentences.
- **💡 Cloze reading** — read a short Shavian passage with a few blanked words and
  fill them in from context.

### Video lessons

- **🗓️ Short lesson videos** — a handful of narrated walkthroughs (letter shapes,
  how to read a word left-to-right, sentence flow) embedded right into the path.
  The `teach` card already reserves a media slot for this.
- **💡 Handwriting clips** showing the natural stroke order of each letter.

### Pronunciation helpers

- **🗓️ Hear every sound** — tap any letter or example word to hear it spoken, on
  the About reference and inside lessons.
- **🗓️ IPA, in context** — pronunciation shown (and played) alongside the sound
  during `teach` and `choice` exercises, not just on the reference page.
- **💡 Accent toggle** — hear the same spelling in more than one accent, tying
  into the "one alphabet, many accents" idea already covered in About.
- **💡 Speak-it-back** — optional microphone practice to check your pronunciation.

### More chapters, more content

- **🚧 Chapter 3** — currently a "coming soon" placeholder on the path; being
  written now.
- **🗓️ Beyond the basics** — punctuation and abbreviations, numbers and dates,
  the common ligatures, and the standard shorthand spellings (`the`, `of`,
  `and`, `to`, `for`).
- **🗓️ Real reading** — longer graded passages, short stories and dialogue as
  reading fluency grows.
- **💡 Writing track** — go the other way: given English, write it in Shavian.

### Quality-of-life

- **💡 Review & spaced repetition** — revisit letters and words you've missed,
  surfaced at the right time.
- **💡 Progress export/import** — move your progress between devices without an
  account.
- **💡 Per-lesson stats** and a gentle sense of mastery per letter.
- **💡 Keyboard & typing practice** for writing Shavian on your own device.

---

## Contributing to the roadmap

The most valuable contributions are **lessons and content** — and because
lessons are just JSON, you don't need to know React to help. See
[the contributing section of the README](./README.md#contributing) for the
lesson format, and open an issue to discuss anything on this list (or something
that isn't).
