#!/usr/bin/env node
// spellcheck.mjs — audit every Shavian spelling in the curriculum against the
// Read Lexicon and report what needs a human look.
//
//   node scripts/spellcheck.mjs            # report problems
//   node scripts/spellcheck.mjs --all      # also list every verified spelling
//   node scripts/spellcheck.mjs --lesson 9 # limit to one lesson
//
// `lesson.mjs check` can only see letters, so a plausible-but-wrong spelling
// sails through it: 𐑒𐑪𐑑 is a perfectly real word, just not the "cat" a lesson
// might claim. This checks two things the JSON can't:
//
//   1. every asserted spelling exists in the lexicon (catches invented words)
//   2. where a lesson pairs Shavian with English, the lexicon agrees on the
//      meaning (catches real words used for the wrong gloss)
//
// Only spellings a lesson *asserts* are checked. A choice's wrong options and
// a bank's distractors are frequently non-words by design (𐑐𐑪𐑚 "pob"), so
// checking them would be all false alarms.
//
// A handful of spellings are right even though the lexicon disagrees (informal
// words it omits, an affix quoted while teaching it). Those live in
// spellcheck-allow.json with a reason, so this exits clean and can gate CI —
// and an entry that stops matching is reported, so the list can't rot.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, index, isStandard } from './readlex.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'src', 'lessons');
const ALLOW = path.join(HERE, 'spellcheck-allow.json');

const SHAVIAN = /[\u{10450}-\u{1047F}]/u;
// Punctuation and markup end a word — they don't just vanish, or "𐑐/𐑚" in a
// teach body would read as one six-letter word.
const SPLIT = /[^\u{10450}-\u{1047F}·]+/u;

/** Shavian words in a run of text: quotes, stops and markup all break words. */
const shawWords = (text) =>
  String(text ?? '')
    .split(SPLIT)
    .filter((w) => SHAVIAN.test(w));

/** Lexicon form of an English gloss: lowercase, punctuation gone, apostrophes kept. */
const normEn = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// A word as the lexicon indexes it: no naming dot (that only marks a proper
// noun), and no punctuation that rode along from a passage ("“𐑯𐑴,”").
const lookupKey = (word) => shawWords(word).join('').replace(/·/g, '');

// Shavian lives above the BMP, so every glyph is a surrogate pair: `.length`
// counts 2 per letter and would never see a "single glyph".
const glyphs = (word) => [...word].length;

const lessonFiles = () =>
  fs
    .readdirSync(DIR)
    .filter((f) => /^\d+-.+\.json$/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));

// ------------------------------------------------------------------ claims
// A claim is one spelling a lesson stands behind, with the English it says it
// means (when the exercise pairs them). `gloss: null` means existence-only.
// A gloss is a *list* — a prompt may accept several readings (𐑑𐑵 is "too" and
// "two"), and any one of them vindicates the spelling.

// `strict` claims never get the single-glyph exemption below — use it where a
// lone letter is genuinely being claimed to *be* a word (a match pair), not
// merely mentioned as a letter.
function claim(out, at, shaw, gloss = null, strict = false) {
  const word = lookupKey(shaw);
  const glosses = gloss === null ? null : [gloss].flat().map(normEn).filter(Boolean);
  // A lone letter in prose is a letter reference ("the letter for peep is 𐑐"),
  // not a word — only check single glyphs when a gloss is actually claimed.
  if (!word || (glyphs(word) === 1 && !glosses?.length)) return;
  out.push({ at, shaw: word, gloss: glosses?.length ? glosses : null, strict });
}

/**
 * Pair a Shavian run with its English. Sentences are checked word by word when
 * both sides have the same number of words; when they don't (a contraction, a
 * loose translation) the alignment would be guesswork, so each Shavian word is
 * only checked for existence.
 */
function pair(out, at, shawText, enText, strict = false) {
  const sw = shawWords(shawText);
  const ew = normEn(enText).split(' ').filter(Boolean);
  if (sw.length && sw.length === ew.length) {
    sw.forEach((w, i) => claim(out, at, w, ew[i], strict));
  } else {
    sw.forEach((w) => claim(out, at, w));
  }
}

/** The quoted word in a prompt like: Which word says “bop”? */
function quoted(text) {
  const m = String(text ?? '').match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : null;
}

function claimsFor(ex, at, out) {
  switch (ex.type) {
    case 'teach':
      shawWords(ex.body).forEach((w) => claim(out, at, w));
      break;
    case 'type':
      // `accept` lists homophone readings; any of them vindicates the spelling.
      pairAny(out, at, ex.prompt, [ex.correct, ...(ex.accept ?? [])]);
      break;
    case 'choice':
      if (ex.promptIsGlyph) pair(out, at, ex.prompt, ex.correct);
      else shawWords(ex.prompt).forEach((w) => claim(out, at, w));
      if (ex.optionIsGlyph) {
        // “Which word says “bop”?” claims a meaning worth checking. “Which
        // letter makes the “t” sound?” quotes a *sound*, not an English word —
        // 𐑑 is the letter there, not the word "to".
        const gloss = /\bword\b/i.test(ex.prompt) ? quoted(ex.prompt) : null;
        if (gloss) pair(out, at, ex.correct, gloss);
        else shawWords(ex.correct).forEach((w) => claim(out, at, w));
      }
      break;
    case 'match':
      // A match pair says "this Shavian means this English", so even a lone
      // glyph is a word claim: 𐑞 really is "the", but 𐑧 is not "bed".
      for (const [shaw, en] of Object.entries(ex.pairs)) pair(out, at, shaw, en, true);
      break;
    case 'build':
      pair(out, at, ex.answer.join(''), ex.prompt);
      break;
    case 'arrange':
      pair(out, at, ex.answer.join(' '), ex.promptEn);
      break;
    case 'complete':
      pair(out, at, ex.word.join(''), ex.prompt);
      break;
    case 'fill':
      pair(out, at, ex.words.join(' '), ex.promptEn);
      break;
    case 'cloze':
      if (ex.translation) pair(out, at, ex.words.join(' '), ex.translation);
      else ex.words.forEach((w) => claim(out, at, w));
      break;
    case 'spot':
      ex.words.forEach((w, i) => claim(out, at, w, i === ex.correct ? ex.prompt : null));
      break;
    case 'transcribe':
      pairAny(out, at, ex.passage, [ex.correct, ...(ex.accept ?? [])]);
      break;
    case 'write':
      // Any accepted spelling may be the one that matches the prompt.
      pairAny(out, at, ex.correct, [ex.prompt]);
      (ex.accept ?? []).forEach((s) => shawWords(s).forEach((w) => claim(out, at, w)));
      break;
  }
}

/** Like `pair`, but the English may be any one of several readings. */
function pairAny(out, at, shawText, glosses) {
  const sw = shawWords(shawText);
  const options = glosses.map((g) => normEn(g).split(' ').filter(Boolean));
  const aligned = options.filter((o) => o.length === sw.length);
  if (!sw.length || !aligned.length) {
    sw.forEach((w) => claim(out, at, w));
    return;
  }
  sw.forEach((w, i) => {
    const alts = [...new Set(aligned.map((o) => o[i]))];
    claim(out, at, w, alts);
  });
}

// ------------------------------------------------------------------ verdict

function verdict(claimed, byShavian) {
  const entries = byShavian.get(claimed.shaw) ?? [];
  if (!entries.length) return { status: 'missing' };

  const standard = entries.filter(isStandard);
  if (!standard.length) {
    const says = [...new Set(entries.map((e) => `${e.Latn} (${e.var})`))];
    return { status: 'variant', says };
  }
  if (!claimed.gloss) return { status: 'ok' };

  const wanted = new Set(claimed.gloss);
  if (standard.some((e) => wanted.has(normEn(e.Latn)))) return { status: 'ok' };

  const says = [...new Set(standard.map((e) => `${e.Latn} (${e.pos})`))];
  return { status: 'mismatch', says };
}

// ------------------------------------------------------------------ report

const args = process.argv.slice(2);
const showAll = args.includes('--all');
const only = args.includes('--lesson') ? Number(args[args.indexOf('--lesson') + 1]) : null;

const claims = [];
let lessons = 0;
for (const file of lessonFiles()) {
  const lesson = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  if (only !== null && lesson.id !== only) continue;
  lessons++;
  lesson.exercises.forEach((ex, i) => claimsFor(ex, `L${lesson.id}#${i}`, claims));
}

const { byShavian } = index(await load());

// Collapse to one row per (spelling, claimed meaning), keeping where it appears.
const rows = new Map();
for (const c of claims) {
  const key = `${c.shaw}|${c.gloss?.join(',') ?? ''}`;
  if (!rows.has(key)) rows.set(key, { ...c, at: [] });
  const row = rows.get(key);
  row.at.push(c.at);
  // One strict claim is enough to hold the whole row to the strict rule.
  row.strict = row.strict || c.strict;
}

// Spellings a human has already vetted — see spellcheck-allow.json.
const allowed = JSON.parse(fs.readFileSync(ALLOW, 'utf8'));
const used = new Set();
const allowFor = (row) =>
  allowed.find(
    (a) => a.shaw === row.shaw && (a.gloss ?? null) === (row.gloss?.join(' ') ?? null)
  );

const buckets = { missing: [], mismatch: [], variant: [], ok: [], allowed: [] };
for (const row of rows.values()) {
  const v = verdict(row, byShavian);
  // A single glyph the lexicon doesn't know as a word is a letter being
  // taught, not a spelling — "which letter makes the “p” sound?" is asking
  // about 𐑐 the letter. The single glyphs that *are* words (𐑞 𐑯 𐑑 𐑝 𐑓 𐑲 𐑩)
  // are in the lexicon, so they still get checked against their gloss.
  // A `strict` claim waives the exemption: there, the letter *is* the claim.
  if (v.status === 'missing' && glyphs(row.shaw) === 1 && !row.strict) continue;

  // Only a *problem* can be waved through — an allowlist entry must never hide
  // a spelling that has quietly gone from right to wrong.
  const pass = v.status === 'missing' || v.status === 'mismatch' ? allowFor(row) : null;
  if (pass) {
    used.add(pass);
    buckets.allowed.push({ ...row, ...v, why: pass.why });
    continue;
  }
  buckets[v.status].push({ ...row, ...v });
}

const stale = allowed.filter((a) => !used.has(a));

const label = (row) => {
  const glosses = row.gloss ? row.gloss.join('” / “') : null;
  return `${row.shaw}${glosses ? ` “${glosses}”` : ''}`;
};
const where = (row) => {
  const at = [...new Set(row.at)];
  return at.length > 6 ? `${at.slice(0, 6).join(' ')} +${at.length - 6} more` : at.join(' ');
};
const section = (title, list, note) => {
  if (!list.length) return;
  console.log(`\n${title} (${list.length})`);
  if (note) console.log(`  ${note}\n`);
  // Shavian glyph widths vary by font, so columns can't be padded into line —
  // each finding gets its own indented lines instead.
  for (const row of list.sort((a, b) => a.shaw.localeCompare(b.shaw))) {
    console.log(`  ${label(row)}`);
    if (row.says) console.log(`      lexicon has: ${row.says.join(' | ')}`);
    if (row.why) console.log(`      allowed: ${row.why}`);
    console.log(`      at ${where(row)}`);
  }
};

console.log(
  `Shavian spelling audit — ${lessons} lesson${lessons === 1 ? '' : 's'}, ` +
    `${claims.length} spellings checked, ${rows.size} distinct`
);

section(
  '✗ NOT IN THE LEXICON',
  buckets.missing,
  'Invented or mistyped — no such spelling. Fix these.'
);
section(
  '✗ MEANS SOMETHING ELSE',
  buckets.mismatch,
  'A real spelling, but the lexicon disagrees with the English the lesson claims.'
);
section(
  '⚠ NON-STANDARD ACCENT ONLY',
  buckets.variant,
  'Exists, but not in the standard RRP voice the curriculum follows.'
);
section(
  '⚠ STALE ALLOWLIST',
  stale.map((a) => ({ shaw: a.shaw, gloss: a.gloss ? [a.gloss] : null, at: [], why: a.why })),
  'No lesson claims these any more — drop them from spellcheck-allow.json.'
);
if (showAll) {
  section(
    '✓ ALLOWED',
    buckets.allowed,
    'The lexicon disagrees, but a human checked these and they are right.'
  );
  section('✓ VERIFIED', buckets.ok);
}

const problems = buckets.missing.length + buckets.mismatch.length;
console.log(
  `\n${buckets.ok.length} verified · ${buckets.allowed.length} allowed · ` +
    `${buckets.variant.length} accent-only · ${problems} to fix`
);
if (stale.length) console.log(`${stale.length} stale allowlist entr${stale.length === 1 ? 'y' : 'ies'}`);
process.exit(problems ? 1 : 0);
