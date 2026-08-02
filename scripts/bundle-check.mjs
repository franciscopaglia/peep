#!/usr/bin/env node
// bundle-check.mjs — prove the curriculum is still code-split.
//
//   npm run build && node scripts/bundle-check.mjs
//
// The app ships `meta.json` (what the dashboard path needs) and loads a
// lesson's exercises as their own chunk when it is opened, so a landing-page
// visitor downloads none of the ~300 kB curriculum. That property is an
// *intention*, not something the type system holds up: one eager
// `import lesson from './45-real-text.json'` anywhere in the entry graph
// silently folds the whole thing back into the main bundle, and nothing else
// in the toolchain would notice.
//
// So: take a distinctive string of exercise text from every lesson and assert
// it is not in the entry chunk.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadAll } from './lib/curriculum.mjs';

const ASSETS = path.join(ROOT, 'dist', 'assets');

// The entry chunk is allowed to grow, but not by a curriculum's worth. Raise
// this deliberately, with a reason — never to make a red build go green.
const ENTRY_BUDGET_KB = 420;

const die = (msg) => {
  console.error(`bundle-check: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(ASSETS)) die('no dist/assets — run `npm run build` first.');

const entryFile = fs.readdirSync(ASSETS).find((f) => /^index-.*\.js$/.test(f));
if (!entryFile) die('no entry chunk (dist/assets/index-*.js) found.');

const entry = fs.readFileSync(path.join(ASSETS, entryFile), 'utf8');
const entryKb = Buffer.byteLength(entry) / 1024;

const problems = [];

if (entryKb > ENTRY_BUDGET_KB)
  problems.push(
    `entry chunk is ${entryKb.toFixed(0)} kB, over the ${ENTRY_BUDGET_KB} kB budget`
  );

// A fingerprint no other lesson (and no app code) would contain: the longest
// run of exercise text in the lesson, trimmed to something searchable.
function fingerprint(lesson) {
  const texts = lesson.exercises.flatMap((ex) =>
    Object.values(ex).filter((v) => typeof v === 'string' && v.length > 40)
  );
  const longest = texts.sort((a, b) => b.length - a.length)[0];
  return longest?.slice(0, 40) ?? null;
}

// Every chunk that isn't the entry, so a lesson can be found in one of them.
const chunkFiles = fs.readdirSync(ASSETS).filter((f) => /\.js$/.test(f) && f !== entryFile);
const chunks = chunkFiles.map((f) => fs.readFileSync(path.join(ASSETS, f), 'utf8'));

const lessons = loadAll();
let checked = 0;
for (const lesson of lessons) {
  const mark = fingerprint(lesson);
  if (!mark) continue; // a lesson of only short prompts — nothing to search for
  checked++;
  if (entry.includes(mark)) {
    problems.push(`lesson ${lesson.id}'s exercises are inside the entry chunk`);
    continue;
  }
  // The flip side: "not in the entry" would also pass with the lesson dropped
  // from the build altogether, so insist it shipped somewhere.
  if (!chunks.some((c) => c.includes(mark)))
    problems.push(`lesson ${lesson.id} is in no chunk at all — did it ship?`);
}

const chunkCount = chunkFiles.filter((f) => /^\d+-/.test(f)).length;
if (chunkCount < lessons.length)
  problems.push(`only ${chunkCount} lesson chunks built, expected ${lessons.length}`);

if (problems.length) {
  for (const p of problems) console.error(`bundle-check: ${p}`);
  process.exit(1);
}

console.log(
  `bundle ok — entry ${entryKb.toFixed(0)} kB (budget ${ENTRY_BUDGET_KB}), ` +
    `${chunkCount} lesson chunks, ${checked} lessons verified out of the entry.`
);
