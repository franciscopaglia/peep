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
