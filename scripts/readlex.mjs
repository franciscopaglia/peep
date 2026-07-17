#!/usr/bin/env node
// readlex.mjs — look up Shavian spellings in the Read Lexicon.
//
// Shavian spells sounds, not English letters, so a spelling can never be
// guessed from how a word looks: "million" is 𐑥𐑦𐑤𐑘𐑩𐑯 (not 𐑾), "story" is
// 𐑕𐑑𐑹𐑦 (the r lives inside 𐑹). Check every word you author here.
//
//   node scripts/readlex.mjs million story        English → Shavian
//   node scripts/readlex.mjs -r 𐑥𐑦𐑤𐑘𐑩𐑯 𐑕𐑑𐑹𐑦      Shavian → English (verify a spelling)
//   node scripts/readlex.mjs -a after             include accent variants
//
// The lexicon (https://github.com/Shavian-info/readlex, MIT licensed) is
// ~27 MB, so it is downloaded on first use and cached in .readlex-cache/
// rather than committed. Delete that directory to refresh it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.readlex-cache', 'readlex.json');
const URL_ = 'https://raw.githubusercontent.com/Shavian-info/readlex/main/readlex.json';

const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

// The curriculum follows one standard voice (RRP); the rest are accent
// variants. Source data spells the tag inconsistently, hence the lowercasing.
export const isStandard = (entry) => entry.var?.toLowerCase() === 'rrp';

export async function load() {
  if (!fs.existsSync(CACHE)) {
    console.error('fetching the Read Lexicon (~27 MB, once)…');
    const res = await fetch(URL_);
    if (!res.ok) die(`download failed: ${res.status} ${res.statusText}`);
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
}

// Index every entry under both its English and its Shavian spelling, so one
// pass serves lookups in either direction.
export function index(lex) {
  const byEnglish = new Map();
  const byShavian = new Map();
  const push = (map, key, entry) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  };
  for (const entries of Object.values(lex)) {
    for (const e of entries) {
      push(byEnglish, e.Latn.toLowerCase(), e);
      push(byShavian, e.Shaw, e);
    }
  }
  return { byEnglish, byShavian };
}

function report(query, hits, { reverse, all }) {
  const kept = all ? hits : hits.filter(isStandard);
  if (!kept.length) {
    const why = hits.length ? ' (only non-standard accent variants — retry with -a)' : '';
    console.log(`${query}: NOT FOUND${why}`);
    return false;
  }
  // Collapse entries that agree on the spelling but differ only by part of
  // speech, so "dog (NN2) | dog (VVZ)" reads as one answer with two tags.
  const seen = new Map();
  for (const e of kept) {
    const key = reverse ? e.Latn : e.Shaw;
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key).add(e.pos + (isStandard(e) ? '' : `,${e.var}`));
  }
  const shown = [...seen].map(([k, tags]) => `${k} (${[...tags].join(' ')})`);
  console.log(`${query}: ${shown.join(' | ')}`);
  return true;
}

// Only run the CLI when invoked directly — spellcheck.mjs imports the loader.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const all = args.some((a) => a === '-a' || a === '--all');
  const reverse = args.some((a) => a === '-r' || a === '--reverse');
  const words = args.filter((a) => !a.startsWith('-'));
  if (!words.length) die('usage: readlex.mjs [-r] [-a] <word>…   (-r: Shavian → English)');

  const { byEnglish, byShavian } = index(await load());
  let missing = 0;
  for (const w of words) {
    const hits = reverse ? byShavian.get(w) : byEnglish.get(w.toLowerCase());
    if (!report(w, hits ?? [], { reverse, all })) missing++;
  }
  // Exit non-zero when anything is unknown, so this can gate a script.
  process.exit(missing ? 1 : 0);
}
