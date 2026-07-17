---
name: shavian-spelling
description: Verify Shavian spellings against the Read Lexicon via scripts/readlex.mjs before authoring or editing lesson content. Use whenever writing new Shavian words into src/lessons/ — Shavian spells sounds, so spellings cannot be guessed from English, and lesson.mjs check cannot catch a plausible-but-wrong spelling.
---

# Checking Shavian spellings

**Never write a Shavian word from intuition.** Shavian spells *sounds*, so a
spelling can't be derived from how the English word looks — and a wrong one
sails past `lesson.mjs check`, which only validates structure and
letters-taught-so-far. The Read Lexicon
([Shavian-info/readlex](https://github.com/Shavian-info/readlex), MIT) is the
community's standard dictionary and the source of truth here.

```bash
node scripts/readlex.mjs million story        # English → Shavian
node scripts/readlex.mjs -r 𐑥𐑦𐑤𐑘𐑩𐑯 𐑕𐑑𐑹𐑦      # Shavian → English (verify what you wrote)
node scripts/readlex.mjs -a after             # include accent variants
```

It downloads and caches the lexicon on first use (~27 MB, gitignored), prints
`NOT FOUND` for anything unknown, and exits non-zero if any word missed — so
it can gate a script.

## How to use it

1. **Batch every word** of a planned lesson in one forward call before
   writing anything: `node scripts/readlex.mjs cat dog running boxes …`
2. **Reverse-check what you authored** — `-r` on each Shavian word proves the
   spelling is real *and* shows every English word sharing it.
3. **`NOT FOUND` means you invented it.** Don't ship it; look for the real
   form (try the base word, or a different sound analysis).

## Auditing what's already there

`npm run spellcheck` checks the **whole curriculum** in one pass — use it after
a batch of edits, or to vet a lesson you didn't write:

```bash
npm run spellcheck                 # problems only
node scripts/spellcheck.mjs --all        # also list every verified spelling
node scripts/spellcheck.mjs --lesson 9   # one lesson
```

It reports two things `lesson.mjs check` structurally cannot see:

- **NOT IN THE LEXICON** — the spelling doesn't exist; it was invented or mistyped.
- **MEANS SOMETHING ELSE** — a real spelling, but wherever the lesson pairs it
  with English the lexicon disagrees (𐑒𐑪𐑑 is "cot", not "cat").

Only spellings a lesson *asserts* are checked: a choice's wrong options and a
bank's distractors are non-words on purpose (𐑐𐑪𐑚 "pob"), and single glyphs in
prose are letters being taught, not words.

**A `match` pair is always a word claim**, so a lone glyph gets no exemption
there: `𐑞=the` passes because 𐑞 really is that word, but `𐑧=bed` is caught —
𐑧 is the *letter* in "bed", and bed is 𐑚𐑧𐑛. Never pair a letter with an
example word in a `match`; a match means "translates to". Use a `choice`
("which letter makes “e” as in bed?") to drill a letter's sound.

A few spellings are right even though the lexicon disagrees — informal words it
omits (𐑚𐑪𐑐 "bop"), an affix quoted while being taught (𐑩𐑛), a letter-name it
files under its Latin form (𐑟𐑧𐑛 → "z"). Those live in
`scripts/spellcheck-allow.json` with a **reason**, which is why the audit exits
clean. Add an entry only after checking the word by hand — never to quiet a
finding you haven't understood. Two guards keep the list honest: an entry only
waves through a *problem*, so a spelling that turns wrong is still reported,
and an entry no lesson claims any more is flagged as stale.

## Why this matters — real misses caught this way

- "million"/"onion" are 𐑥𐑦𐑤𐑘𐑩𐑯 / 𐑳𐑯𐑘𐑩𐑯 — **𐑘𐑩𐑯**, not the tempting 𐑾
- "familiar" is 𐑓𐑩𐑥𐑦𐑤𐑽, not 𐑾
- "story" is 𐑕𐑑𐑹𐑦 — the r lives *inside* 𐑹, there is no separate 𐑮
- syllabic endings take 𐑩: "wanted" 𐑢𐑪𐑯𐑑𐑩𐑛, "boxes" 𐑚𐑪𐑒𐑕𐑩𐑟
- "was" is 𐑢𐑪𐑟 (a z sound), "said" is 𐑕𐑧𐑛, "one" is 𐑢𐑳𐑯

## Homophones and variants

A reverse lookup showing several English words means the spelling is shared:
𐑕𐑑𐑹𐑦 is *storey* and *story*; 𐑑𐑵 is *too* and *two*; 𐑯𐑴 is *no* and *know*.
For a `type` or `transcribe` prompt, list them all in `alt=` so a correct
reading is never marked wrong — and avoid them as *wrong* `choice` options.

Entries tagged `TrapBath`, `GenAm`, etc. are other accents. The curriculum
follows the standard RRP voice, which is what the tool prints by default.
