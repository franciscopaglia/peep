#!/usr/bin/env node
// curriculum.mjs — a health report for the curriculum as a whole.
//
// `lesson.mjs check` answers "is each lesson valid?" and spellcheck answers
// "is each spelling real?". Neither can answer the question you actually ask
// when planning content: what shape is the course in? Which letters were
// taught and then never seen again, which words are worn out, where is the
// practice thin, what has no branch lesson.
//
//   node scripts/curriculum.mjs             the full report
//   node scripts/curriculum.mjs letters     one section only
//   node scripts/curriculum.mjs chapters | types | words | gaps
//   node scripts/curriculum.mjs --json
//
// Everything here is descriptive — it reports, it never fails a build. The
// judgement about what "thin" means stays with the author.

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  INTRODUCED,
  LETTERS,
  loadAll,
  byId,
  effectiveId,
  shawWords,
  lookupKey,
} from './lib/curriculum.mjs';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const only = argv.find((a) => !a.startsWith('--'));
const wants = (section) => !only || only === section;

const lessons = loadAll();
const index = byId(lessons);
const spine = lessons.filter((l) => !l.optional);
const branches = lessons.filter((l) => l.optional);

const isGradeable = (ex) => ex.type !== 'teach' && !ex.retry;

// The chapters the app declares, so a chapter with no lessons still shows up.
const CHAPTERS = [
  ...fs
    .readFileSync(path.join(ROOT, 'src', 'lessons', 'index.ts'), 'utf8')
    .matchAll(/\{\s*id:\s*(\d+),\s*title:\s*'([^']+)',\s*subtitle:\s*'([^']+)'([\s\S]*?)\}/g),
].map((m) => ({
  id: Number(m[1]),
  title: m[2],
  subtitle: m[3],
  comingSoon: /comingSoon:\s*true/.test(m[4]),
}));

// ------------------------------------------------------------------ facts

const chapters = CHAPTERS.map((ch) => {
  const own = lessons.filter((l) => l.chapter === ch.id);
  const ownSpine = own.filter((l) => !l.optional);
  const exercises = own.flatMap((l) => l.exercises);
  return {
    ...ch,
    spine: ownSpine.length,
    branches: own.length - ownSpine.length,
    exercises: exercises.length,
    gradeable: exercises.filter(isGradeable).length,
    range: ownSpine.length ? [ownSpine[0].id, ownSpine[ownSpine.length - 1].id] : null,
  };
});

// Where each letter is introduced, and every lesson that uses it afterwards.
const introducedAt = new Map();
for (const [lesson, letters] of Object.entries(INTRODUCED)) {
  for (const ch of letters) if (!introducedAt.has(ch)) introducedAt.set(ch, Number(lesson));
}

const letterUse = new Map([...LETTERS].map((g) => [g, []]));
const wordUse = new Map();
for (const lesson of lessons) {
  const text = JSON.stringify(lesson.exercises);
  for (const glyph of new Set(text.match(/[\u{10450}-\u{1047F}]/gu) ?? [])) {
    if (letterUse.has(glyph)) letterUse.get(glyph).push(lesson.id);
  }
  for (const word of shawWords(text)) {
    const key = lookupKey(word);
    if (!key || [...key].length < 2) continue; // single glyphs are letter drills
    if (!wordUse.has(key)) wordUse.set(key, new Set());
    wordUse.get(key).add(lesson.id);
  }
}

const letters = [...LETTERS].map((glyph) => {
  const taughtAt = introducedAt.get(glyph) ?? null;
  const used = letterUse.get(glyph) ?? [];
  // Only lessons at or past the introduction count as practice; a branch
  // hanging off an earlier lesson is measured by its anchor.
  const after = used.filter((id) => taughtAt !== null && effectiveId(index[id], index) > taughtAt);
  return { glyph, taughtAt, lessons: used.length, recycled: after.length };
});

const typeMatrix = new Map();
for (const lesson of lessons) {
  for (const ex of lesson.exercises) {
    if (!typeMatrix.has(ex.type)) typeMatrix.set(ex.type, new Map());
    const row = typeMatrix.get(ex.type);
    row.set(lesson.chapter, (row.get(lesson.chapter) ?? 0) + 1);
  }
}

const words = [...wordUse.entries()]
  .map(([word, ids]) => ({ word, lessons: [...ids].sort((a, b) => a - b) }))
  .sort((a, b) => b.lessons.length - a.lessons.length);

const anchored = new Set(branches.map((l) => l.anchor));
const gaps = {
  emptyChapters: chapters.filter((c) => c.spine === 0).map((c) => c.id),
  spineWithoutBranch: spine.filter((l) => !anchored.has(l.id)).map((l) => l.id),
  thinLessons: spine
    .map((l) => ({ id: l.id, gradeable: l.exercises.filter(isGradeable).length }))
    .filter((l) => l.gradeable < 6),
  neverRecycled: letters.filter((l) => l.taughtAt !== null && l.recycled === 0).map((l) => l.glyph),
  usedOnce: words.filter((w) => w.lessons.length === 1).length,
};

if (asJson) {
  console.log(JSON.stringify({ chapters, letters, words: words.slice(0, 50), gaps }, null, 2));
  process.exit(0);
}

// ----------------------------------------------------------------- report

const rule = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);
const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - [...String(s)].length));

if (wants('chapters')) {
  rule('Chapters');
  for (const c of chapters) {
    const span = c.range ? `${c.range[0]}–${c.range[1]}` : '—';
    const state = c.spine === 0 ? (c.comingSoon ? 'planned' : 'DECLARED BUT EMPTY') : '';
    console.log(
      `  ${pad(c.title, 11)} ${pad(c.subtitle, 22)} ${pad(span, 8)} ` +
        `${pad(`${c.spine} lessons`, 12)} ${pad(`${c.branches} branches`, 14)} ` +
        `${pad(`${c.gradeable} graded`, 12)} ${state}`
    );
  }
  console.log(
    `  ${spine.length} spine · ${branches.length} branches · ` +
      `${lessons.flatMap((l) => l.exercises).filter(isGradeable).length} graded exercises`
  );
}

if (wants('letters')) {
  rule('Letters — introduced, then practised');
  const cold = letters.filter((l) => l.taughtAt !== null).sort((a, b) => a.recycled - b.recycled);
  console.log('  least practised after introduction:');
  for (const l of cold.slice(0, 12)) {
    console.log(
      `    ${l.glyph}  taught in ${pad(l.taughtAt, 4)} then used in ${pad(l.recycled, 3)} later lesson(s)`
    );
  }
  const untaught = letters.filter((l) => l.taughtAt === null);
  if (untaught.length)
    console.log(`  never introduced: ${untaught.map((l) => l.glyph).join(' ')}`);
}

if (wants('types')) {
  rule('Exercise types by chapter');
  const ids = chapters.map((c) => c.id);
  console.log(`    ${pad('type', 12)}${ids.map((i) => pad(`ch${i}`, 7)).join('')}total`);
  const rows = [...typeMatrix.entries()].sort(
    (a, b) =>
      [...b[1].values()].reduce((x, y) => x + y, 0) - [...a[1].values()].reduce((x, y) => x + y, 0)
  );
  for (const [type, row] of rows) {
    const cells = ids.map((i) => pad(row.get(i) ?? '·', 7)).join('');
    const total = [...row.values()].reduce((x, y) => x + y, 0);
    console.log(`    ${pad(type, 12)}${cells}${total}`);
  }
}

if (wants('words')) {
  rule('Vocabulary');
  console.log(`  ${words.length} distinct words · ${gaps.usedOnce} appear in only one lesson`);
  console.log('  most recycled:');
  for (const w of words.slice(0, 10)) {
    console.log(`    ${pad(w.word, 12)} ${pad(`${w.lessons.length} lessons`, 12)} ${w.lessons.slice(0, 12).join(',')}`);
  }
}

if (wants('gaps')) {
  rule('Gaps');
  if (gaps.emptyChapters.length)
    console.log(`  chapters with no lessons: ${gaps.emptyChapters.join(', ')}`);
  if (gaps.neverRecycled.length)
    console.log(`  letters never used after the lesson that taught them: ${gaps.neverRecycled.join(' ')}`);
  if (gaps.thinLessons.length)
    console.log(
      `  lessons under 6 graded exercises: ` +
        gaps.thinLessons.map((l) => `${l.id} (${l.gradeable})`).join(', ')
    );
  console.log(`  spine lessons with no branch (${gaps.spineWithoutBranch.length}):`);
  console.log(`    ${gaps.spineWithoutBranch.join(', ')}`);
}

console.log();
