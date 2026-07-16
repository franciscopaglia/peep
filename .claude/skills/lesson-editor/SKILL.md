---
name: lesson-editor
description: Read, search, and edit Peep's lesson JSON via scripts/lesson.mjs and its compact one-line-per-exercise protocol. Use whenever viewing or changing anything in src/lessons/ — never Read or Edit the lesson JSON files directly; the CLI is ~5-8x cheaper in tokens and derives labels/blanks/banks so whole bug classes can't happen.
---

# Editing lessons with `scripts/lesson.mjs`

All lesson content lives in `src/lessons/NN-slug.json`, but you should never
read or edit those files directly. Use the CLI:

```
node scripts/lesson.mjs list                 # id :: title :: glyph :: chapter :: type tally
node scripts/lesson.mjs show 24 [3]          # whole lesson (or one exercise) as compact lines
node scripts/lesson.mjs grep '𐑑𐑵'            # regex over compact lines; prints `24#5 <line>`
node scripts/lesson.mjs put 24 3 '<line>'    # replace exercise 3
node scripts/lesson.mjs add 27 --at 5 '<line>'   # insert (omit --at to append)
node scripts/lesson.mjs rm 24 3              # delete
node scripts/lesson.mjs mv 24 3 7            # reorder
node scripts/lesson.mjs meta 24 title=… glyph=… chapter=…
node scripts/lesson.mjs new 36 reading-2 'Reading II' 𐑮 2
node scripts/lesson.mjs renumber 27..34 +1   # shift ids + filenames (descending-safe)
node scripts/lesson.mjs check                # structure + taught-letters + round-trip
```

## The line protocol

One exercise per line. Fields are separated by ` :: `. Everything derivable
is derived, never written: `correctLabel`, blank indices, tile/bank
composition, and glyph flags all come from the line.

- `+` marks a **distractor** (wrong option, unused tile, extra bank word)
- `_` marks a **blank** (in `complete`/`fill`/`cloze` word sequences)
- `*` marks the **target word** (`spot` only — exactly one)
- a bare `.` token marks a **sentence stop** (`cloze`/`spot` only)
- `gp` / `go` prefixes mean the prompt / options are **glyphs**
- `cap=` overrides the per-type default caption (type: "Sound it out — what
  does this say?", build: "Build this word from Shavian letters", choice: "")

```
teach  :: Title :: Body; [[𐑖𐑱𐑝𐑾𐑯 𐑮𐑳𐑯𐑟]] is one chip, {{𐑩 𐑣𐑴𐑤 𐑐𐑨𐑕𐑦𐑡.}} a display block (sentences + punctuation).
choice :: gp 𐑓𐑹 :: cap=What does this word mean? :: four | +for | +far | +form
choice :: Which letter is the word “of”? :: go 𐑝 | +𐑓 | +𐑞 | +𐑑
type   :: 𐑑𐑵 :: ok=too :: alt=two            (alt= lists accepted homophones)
match  :: 𐑝=of | 𐑓=for | 𐑯=and | 𐑑=to :: R=and | of | to | for
build  :: visit :: 𐑝 𐑦 𐑟 𐑦 𐑑 +𐑕              (answer = unmarked tiles, in order)
arrange :: we run to the car :: 𐑢𐑰 𐑮𐑳𐑯 𐑑 𐑞 𐑒𐑸 +𐑑𐑵
complete :: jump :: 𐑡 _𐑳 𐑥 𐑐 :: +𐑨 +𐑦        (bank = blank letters + distractors)
fill   :: the dog ran :: 𐑞 _𐑛𐑪𐑜 _𐑮𐑨𐑯 :: +𐑒𐑨𐑑
cloze  :: ·𐑕𐑨𐑥 𐑣𐑨𐑟 𐑩 _𐑚𐑦𐑜 𐑛𐑪𐑜 . 𐑞 𐑛𐑪𐑜 𐑦𐑟 _𐑒𐑿𐑑 . :: +𐑒𐑨𐑑 :: tr=Sam has a big dog. The dog is cute.
spot   :: dog :: 𐑞 *𐑛𐑪𐑜 𐑦𐑟 𐑒𐑿𐑑 .        (tap the sentence word meaning "dog"; graded by position)
transcribe :: 𐑞 𐑯𐑹𐑔 𐑢𐑦𐑯𐑛 𐑚𐑤𐑵. :: ok=the north wind blew :: alt=… :: src=Aesop
write  :: cat :: ok=𐑒𐑨𐑑                     (spell the English word on the full Shavian keyboard)
```

`transcribe` shows a real Shavian passage (punctuation kept, `src=` cited)
beside a free-text box; grading is case/punctuation/whitespace-insensitive
with `alt=` full-sentence variants. Passages must come from real sourced
texts with readlex-verified spellings — never invent them.

Rare escape hatches (only when `show` prints them): `tiles=… :: ans=…` or
`bank=…` appear when the authored order isn't answer-first; `label=…` when a
correctLabel isn't the joined answer; `json :: {…}` for shapes the protocol
doesn't cover.

## Workflow rules

1. **Author the correct answer first** (unmarked option first, answer tiles
   before `+` distractors) — the app's shuffle guarantees a non-identity
   order, and `check` relies on this layout staying compact.
2. After any change, run `node scripts/lesson.mjs check` — it enforces
   structure, **letters-taught-by-lesson** (the table lives in the script;
   extend `INTRODUCED` when a new lesson introduces letters), and protocol
   round-trip. Then run `npm test` as the final gate.
3. Remember the content rules in CLAUDE.md: abbreviated words (𐑞 𐑝 𐑯 𐑑 𐑓),
   `alt=` for homophone prompts, and only letters taught by that point —
   including a word's *sounds* ("digit" has 𐑡, not 𐑜).
4. `check` allows untaught letters in a choice's *wrong* options only.
