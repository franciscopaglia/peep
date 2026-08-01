---
name: lesson-author
description: Author a new Peep lesson end to end — pick vocabulary the learner can actually read with vocab.mjs, verify every spelling, write the exercises with lesson.mjs, then check, spellcheck and see it run. Use whenever adding or substantially rewriting a lesson, or when asked what to teach next; the other content skills each cover one step of this.
---

# Writing a lesson

Three skills cover the pieces — `lesson-editor` (the line protocol),
`shavian-spelling` (verifying a word), `run-app` (seeing it) — and this one is
the order to use them in. The order matters: it is what stops you writing a
lesson around a word the learner can't read yet, or one that doesn't exist.

**Never invent Shavian.** Shavian spells sounds, so a spelling can't be guessed
from English, and a plausible-but-wrong one passes `lesson.mjs check` silently.
Everything below exists to make invention impossible rather than merely
detectable.

## 1. Know where the lesson sits

```bash
node scripts/curriculum.mjs chapters      # what each chapter holds
node scripts/curriculum.mjs gaps          # empty chapters, thin lessons, unbranched spine
node scripts/lesson.mjs list              # every lesson, with its exercise tally
```

A lesson may only use letters taught by its point in the course. A **branch**
(id `9xy1`, `anchor` set) inherits its anchor's budget, not its own id's.

If you are picking *what* to write, `curriculum.mjs` is the argument: letters it
reports as never recycled are the ones a new lesson should drill, and
`spineWithoutBranch` is the list of lessons with no extra practice.

## 2. Choose vocabulary from the lexicon — don't think of it yourself

```bash
node scripts/vocab.mjs 43                 # every word readable by lesson 43, by frequency
node scripts/vocab.mjs 43 --new           # …minus everything the curriculum already uses
node scripts/vocab.mjs 23 --has 𐑗𐑡        # …that drill the letters this lesson teaches
node scripts/vocab.mjs 23 --len 3-5 --pos NN1
```

Every row is a real RRP lexicon entry spelled only in letters the lesson has
reached, with its frequency and where the curriculum already uses it. Take the
lesson's words from this list and both failure modes — an invented spelling, a
letter taught later — are gone before you write a line.

Frequency is a hint, not a curriculum: prefer concrete, teachable words over
whatever is merely common. `--new` is for fresh material; deliberately reusing a
familiar word is often the better teaching choice.

## 3. Verify anything you didn't take from `vocab.mjs`

Proper nouns, informal words the lexicon omits, and anything you typed by hand:

```bash
node scripts/readlex.mjs million story    # English → Shavian
node scripts/readlex.mjs -r 𐑥𐑦𐑤𐑘𐑩𐑯       # Shavian → English — reverse-check what you wrote
```

`NOT FOUND` means you invented it. Reverse-checking is the step people skip and
the one that catches a real word used for the wrong gloss (𐑒𐑪𐑑 is "cot", never
"cat").

## 4. Write it

Create the file, then add exercises as compact lines — see `lesson-editor` for
the grammar:

```bash
node scripts/lesson.mjs new 53 fluency-1 'Reading Faster' 𐑓 5
node scripts/lesson.mjs add 53 'teach :: Title :: Body with 𐑖𐑨𐑝𐑾𐑯 runs.'
node scripts/lesson.mjs add 53 'choice :: gp 𐑒𐑨𐑑 :: cat | +cot | +kit | +cap'
```

Shape a lesson the way the shipped ones are shaped: teach cards first, then
mostly practice, one `match` to close. Aim for at least 6 graded exercises —
`curriculum.mjs gaps` lists the ones that fall short. Use the standard
abbreviated words (`𐑞 𐑯 𐑑 𐑝 𐑓`), never spelled out.

## 5. Prove it

```bash
node scripts/lesson.mjs check     # structure, taught letters, round-trip, meta.json
npm run spellcheck                # every spelling, against the lexicon
npm test                          # solvability, shuffling, grading
```

`check` and `spellcheck` answer different questions — the first knows only
letters, the second knows meanings. A lesson needs both. Then look at it: the
`run-app` skill drives a browser to the lesson, which is the only way to catch
a card that reads badly or overflows on a phone.

`npm run check` runs the whole battery in one go, the same as CI.
