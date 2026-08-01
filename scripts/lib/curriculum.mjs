// curriculum.mjs (lib) — what every content script needs to know about the
// curriculum: where the lessons live, which letters are taught by when, and
// how to read a lesson off disk.
//
// This exists so the taught-letter schedule has exactly one home. It gates
// `lesson.mjs check`, it decides what `vocab.mjs` may suggest, and it drives
// `curriculum.mjs`'s coverage report — three answers that must never drift
// apart.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(HERE, '..', '..');
export const DIR = path.join(ROOT, 'src', 'lessons');
export const META_FILE = path.join(DIR, 'meta.json');
const ALPHABET_FILE = path.join(ROOT, 'src', 'lib', 'shavian-alphabet.ts');

/** Every Shavian glyph, plus the naming dot. Global — clone before stateful use. */
export const SHAVIAN = /[\u{10450}-\u{1047F}·]/gu;
/** Anything that is not part of a Shavian word — punctuation, markup, latin. */
const SPLIT = /[^\u{10450}-\u{1047F}·]+/u;
const HAS_SHAVIAN = /[\u{10450}-\u{1047F}]/u;

// Letters (and the naming dot) available from each lesson on, cumulatively.
// A lesson may only use glyphs it has reached; branches inherit their anchor's
// budget.
export const INTRODUCED = {
  1: '𐑐𐑚𐑪', 2: '𐑑𐑛𐑨', 3: '𐑒𐑜𐑦', 6: '𐑓𐑝', 7: '𐑕𐑟', 8: '𐑧',
  10: '𐑫𐑳', 12: '𐑤𐑥', 13: '𐑯𐑮', 15: '𐑰𐑱', 16: '𐑲𐑴', 17: '𐑵',
  19: '𐑢𐑣', 20: '𐑘𐑙', 22: '𐑖', 23: '𐑗𐑡', 25: '𐑞𐑩·',
  26: '𐑠𐑔', 27: '𐑸𐑹', 29: '𐑺𐑻', 30: '𐑼𐑽', 31: '𐑾𐑿', 32: '𐑬𐑷', 33: '𐑶𐑭', 34: '·',
};

/** The lesson by which every letter has been taught. */
export const LAST_INTRODUCTION = Math.max(...Object.keys(INTRODUCED).map(Number));

// The 48 letters, read from the app's alphabet data so the two can't drift.
export const LETTERS = new Set(
  [...fs.readFileSync(ALPHABET_FILE, 'utf8').matchAll(/glyph: '(.)'/gu)].map((m) => m[1])
);

/** The set of glyphs a learner can read by the time they reach `id`. */
export function lettersTaughtBy(id) {
  let set = '';
  for (const [lesson, letters] of Object.entries(INTRODUCED)) {
    if (Number(lesson) <= id) set += letters;
  }
  return new Set(set);
}

/**
 * The id a lesson's letter budget is measured against. A branch lives in a
 * reserved id range (9241…), which says nothing about curriculum order, so it
 * inherits its anchor's position.
 */
export function effectiveId(lesson, byId = {}) {
  if (lesson.optional && byId[lesson.anchor]) return lesson.anchor;
  return lesson.id;
}

export function lessonFiles() {
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d+-.+\.json$/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));
}

export const readLesson = (file) => JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));

export const loadAll = () => lessonFiles().map(readLesson);

/** Lessons keyed by id — for anchor lookups. */
export const byId = (lessons) => Object.fromEntries(lessons.map((l) => [l.id, l]));

/** Shavian words in a run of text: quotes, stops and markup all break words. */
export const shawWords = (text) =>
  String(text ?? '')
    .split(SPLIT)
    .filter((w) => HAS_SHAVIAN.test(w));

/** A word as the lexicon indexes it: no naming dot, no stray punctuation. */
export const lookupKey = (word) => shawWords(word).join('').replace(/·/g, '');
