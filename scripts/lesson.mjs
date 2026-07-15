#!/usr/bin/env node
// lesson.mjs — compact reader/editor for the lesson JSON in src/lessons.
//
// One exercise per line; derivable fields are never written. correctLabel,
// blank indices, tile/bank composition and glyph flags are all reconstructed
// from the line itself. Grammar: .claude/skills/lesson-editor/SKILL.md
//
//   node scripts/lesson.mjs list
//   node scripts/lesson.mjs show <id> [n]
//   node scripts/lesson.mjs grep <regex>
//   node scripts/lesson.mjs put <id> <n> '<line>'
//   node scripts/lesson.mjs add <id> [--at n] '<line>'
//   node scripts/lesson.mjs rm <id> <n>
//   node scripts/lesson.mjs mv <id> <from> <to>
//   node scripts/lesson.mjs meta <id> title=… glyph=… chapter=…
//   node scripts/lesson.mjs new <id> <slug> <title> <glyph> <chapter>
//   node scripts/lesson.mjs renumber <from>..<to> <±delta>
//   node scripts/lesson.mjs check          (structure + taught letters + round-trip)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lessons');
const SEP = ' :: ';
const SHAVIAN = /[\u{10450}-\u{1047F}·]/gu;

// Captions this common are omitted from lines and restored on parse.
const DEFAULT_CAPTION = {
  type: 'Sound it out — what does this say?',
  build: 'Build this word from Shavian letters',
  choice: '',
};

// Letters (and the naming dot) available from each lesson on, cumulatively.
// `check` flags any exercise using a glyph its lesson hasn't reached yet.
const INTRODUCED = {
  1: '𐑐𐑚𐑪', 2: '𐑑𐑛𐑨', 3: '𐑒𐑜𐑦', 6: '𐑓𐑝', 7: '𐑕𐑟', 8: '𐑧',
  10: '𐑫𐑳', 12: '𐑤𐑥', 13: '𐑯𐑮', 15: '𐑰𐑱', 16: '𐑲𐑴', 17: '𐑵',
  19: '𐑢𐑣', 20: '𐑘𐑙', 21: '𐑖𐑗', 22: '𐑡', 24: '𐑞𐑩·',
  25: '𐑠𐑔', 26: '𐑸𐑹', 28: '𐑺𐑻', 29: '𐑼𐑽', 30: '𐑾𐑿', 31: '𐑬𐑷𐑶𐑭', 32: '·',
};

function lettersTaughtBy(id) {
  let set = '';
  for (const [lesson, letters] of Object.entries(INTRODUCED)) {
    if (Number(lesson) <= id) set += letters;
  }
  return new Set(set);
}

// ---------------------------------------------------------------- storage

const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

function lessonFiles() {
  return fs.readdirSync(DIR)
    .filter((f) => /^\d+-.+\.json$/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));
}

function fileFor(id) {
  const f = lessonFiles().find((f) => parseInt(f) === id);
  if (!f) die(`no lesson with id ${id}`);
  return path.join(DIR, f);
}

const load = (id) => JSON.parse(fs.readFileSync(fileFor(id), 'utf8'));
const loadAll = () => lessonFiles().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

function save(lesson, file = fileFor(lesson.id)) {
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + '\n');
}

// ------------------------------------------------------------- serializer

// Mark `items` so the unmarked ones read back as `wanted` (in order) and the
// rest carry a `+` distractor prefix. Returns null when `wanted` is not an
// in-order subsequence of `items` (the caller falls back to explicit fields).
function markDistractors(items, wanted) {
  const out = [];
  let k = 0;
  for (const item of items) {
    if (k < wanted.length && item === wanted[k]) { out.push(item); k++; }
    else out.push('+' + item);
  }
  return k === wanted.length ? out : null;
}

function joinCap(parts, ex) {
  const def = DEFAULT_CAPTION[ex.type];
  if ((ex.caption ?? '') !== (def ?? '')) parts.push(`cap=${ex.caption ?? ''}`);
}

function exToLine(ex) {
  const parts = [ex.type];
  switch (ex.type) {
    case 'teach': {
      if (ex.media) break; // no compact form — fall through to json
      return [ex.type, ex.title, ex.body].join(SEP);
    }
    case 'choice': {
      parts.push((ex.promptIsGlyph ? 'gp ' : '') + ex.prompt);
      joinCap(parts, ex);
      const marked = ex.options.map((o) => (o === ex.correct ? o : '+' + o));
      parts.push((ex.optionIsGlyph ? 'go ' : '') + marked.join(' | '));
      if (ex.correctLabel !== ex.correct) parts.push(`label=${ex.correctLabel}`);
      return parts.join(SEP);
    }
    case 'type': {
      parts.push(ex.prompt);
      joinCap(parts, ex);
      parts.push(`ok=${ex.correct}`);
      if (ex.accept?.length) parts.push(`alt=${ex.accept.join(' | ')}`);
      if (ex.correctLabel !== ex.correct) parts.push(`label=${ex.correctLabel}`);
      return parts.join(SEP);
    }
    case 'match': {
      parts.push(ex.leftOrder.map((k) => `${k}=${ex.pairs[k]}`).join(' | '));
      parts.push(`R=${ex.rightOrder.join(' | ')}`);
      return parts.join(SEP);
    }
    case 'build':
    case 'arrange': {
      parts.push(ex.type === 'build' ? ex.prompt : ex.promptEn);
      if (ex.type === 'build') joinCap(parts, ex);
      const marked = markDistractors(ex.tiles, ex.answer);
      if (marked) parts.push(marked.join(' '));
      else parts.push(`tiles=${ex.tiles.join(' ')}`, `ans=${ex.answer.join(' ')}`);
      const label = ex.answer.join(ex.type === 'build' ? '' : ' ');
      if (ex.correctLabel !== label) parts.push(`label=${ex.correctLabel}`);
      return parts.join(SEP);
    }
    case 'complete':
    case 'fill':
    case 'cloze': {
      if (ex.type === 'complete') parts.push(ex.prompt);
      if (ex.type === 'fill') parts.push(ex.promptEn);
      const seq = ex.type === 'complete' ? ex.word : ex.words;
      const toks = [];
      seq.forEach((w, i) => {
        toks.push(ex.blanks.includes(i) ? '_' + w : w);
        if (ex.type === 'cloze' && ex.stops?.includes(i)) toks.push('.');
      });
      parts.push(toks.join(' '));
      const wanted = ex.blanks.map((b) => seq[b]);
      const marked = markDistractors(ex.bank, wanted);
      if (marked && marked.slice(0, wanted.length).every((t) => !t.startsWith('+'))) {
        const extra = marked.slice(wanted.length);
        if (extra.length) parts.push(extra.join(' '));
      } else {
        parts.push(`bank=${ex.bank.join(' ')}`);
      }
      joinCap(parts, ex);
      if (ex.type === 'cloze' && ex.translation) parts.push(`tr=${ex.translation}`);
      const label = seq.join(ex.type === 'complete' ? '' : ' ');
      if (ex.correctLabel !== label) parts.push(`label=${ex.correctLabel}`);
      return parts.join(SEP);
    }
  }
  return `json${SEP}${JSON.stringify(ex)}`; // safety valve for exotic shapes
}

// ---------------------------------------------------------------- parser

const KEYS = /^(cap|ok|alt|tr|label|tiles|ans|bank|R)=([\s\S]*)$/;

function lineToEx(line) {
  const fields = line.trim().split(SEP);
  const type = fields.shift();
  if (type === 'json') return JSON.parse(fields.join(SEP));
  const kv = {};
  const pos = [];
  for (const f of fields) {
    const m = f.match(KEYS);
    if (m) kv[m[1]] = m[2];
    else pos.push(f);
  }
  const caption = kv.cap ?? DEFAULT_CAPTION[type];
  switch (type) {
    case 'teach':
      return { type, title: pos[0], body: pos.slice(1).join(SEP) };
    case 'choice': {
      let [prompt, opts] = pos;
      const promptIsGlyph = prompt.startsWith('gp ');
      if (promptIsGlyph) prompt = prompt.slice(3);
      const optionIsGlyph = opts.startsWith('go ');
      if (optionIsGlyph) opts = opts.slice(3);
      const raw = opts.split(' | ');
      const correct = raw.find((o) => !o.startsWith('+'));
      if (!correct) die(`choice needs one unmarked (correct) option: ${line}`);
      const options = raw.map((o) => (o.startsWith('+') ? o.slice(1) : o));
      return { type, promptIsGlyph, prompt, caption, optionIsGlyph, options,
               correct, correctLabel: kv.label ?? correct };
    }
    case 'type': {
      const ex = { type, prompt: pos[0], caption, correct: kv.ok,
                   correctLabel: kv.label ?? kv.ok };
      if (!ex.correct) die(`type needs ok=…: ${line}`);
      if (kv.alt) ex.accept = kv.alt.split(' | ');
      return ex;
    }
    case 'match': {
      const pairs = {};
      const leftOrder = [];
      for (const p of pos[0].split(' | ')) {
        const i = p.indexOf('=');
        const k = p.slice(0, i);
        pairs[k] = p.slice(i + 1);
        leftOrder.push(k);
      }
      const rightOrder = kv.R ? kv.R.split(' | ') : [...leftOrder.map((k) => pairs[k])];
      return { type, pairs, leftOrder, rightOrder };
    }
    case 'build':
    case 'arrange': {
      const promptField = pos[0];
      let tiles, answer;
      if (kv.tiles) {
        tiles = kv.tiles.split(' ');
        answer = kv.ans.split(' ');
      } else {
        const toks = pos[1].split(' ');
        tiles = toks.map((t) => (t.startsWith('+') ? t.slice(1) : t));
        answer = toks.filter((t) => !t.startsWith('+'));
      }
      const correctLabel = kv.label ?? answer.join(type === 'build' ? '' : ' ');
      return type === 'build'
        ? { type, prompt: promptField, caption, tiles, answer, correctLabel }
        : { type, promptEn: promptField, tiles, answer, correctLabel };
    }
    case 'complete':
    case 'fill':
    case 'cloze': {
      const wordField = type === 'cloze' ? pos[0] : pos[1];
      const seq = [];
      const blanks = [];
      const stops = [];
      for (const t of wordField.split(' ')) {
        if (t === '.') stops.push(seq.length - 1);
        else if (t.startsWith('_')) { blanks.push(seq.length); seq.push(t.slice(1)); }
        else seq.push(t);
      }
      const wanted = blanks.map((b) => seq[b]);
      let bank;
      if (kv.bank) bank = kv.bank.split(' ');
      else {
        const extraField = type === 'cloze' ? pos[1] : pos[2];
        const extras = extraField ? extraField.split(' ').map((t) => t.replace(/^\+/, '')) : [];
        bank = [...wanted, ...extras];
      }
      const label = kv.label ?? seq.join(type === 'complete' ? '' : ' ');
      const ex = { type, blanks, bank, correctLabel: label };
      if (type === 'complete') Object.assign(ex, { prompt: pos[0], word: seq });
      else Object.assign(ex, { words: seq });
      if (type === 'fill') ex.promptEn = pos[0];
      if (type === 'cloze') {
        if (stops.length) ex.stops = stops;
        if (kv.tr) ex.translation = kv.tr;
      }
      if (kv.cap !== undefined || DEFAULT_CAPTION[type] !== undefined) {
        if (kv.cap !== undefined) ex.caption = kv.cap;
      }
      return ex;
    }
  }
  die(`unknown exercise type "${type}"`);
}

// ------------------------------------------------------------ validation

const canon = (v) => JSON.stringify(sortKeys(v));
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

function multisetCovers(pool, wanted) {
  const left = [...pool];
  return wanted.every((w) => {
    const i = left.indexOf(w);
    if (i === -1) return false;
    left.splice(i, 1);
    return true;
  });
}

function checkLesson(lesson, problems) {
  const taught = lettersTaughtBy(lesson.id);
  const knowAll = lesson.id > Math.max(...Object.keys(INTRODUCED).map(Number));
  lesson.exercises.forEach((ex, i) => {
    const at = `${lesson.id}#${i}`;
    const flag = (msg) => problems.push(`${at} (${ex.type}): ${msg}`);

    if (!knowAll) {
      // Wrong options in a choice may show letters the learner can't read yet
      // (they only need to recognise the right one), so scan everything else.
      const scanned = ex.type === 'choice' ? { ...ex, options: [ex.correct] } : ex;
      const used = [...new Set(JSON.stringify(scanned).match(SHAVIAN) ?? [])];
      const early = used.filter((ch) => !taught.has(ch));
      if (early.length) flag(`uses letters not yet taught: ${early.join(' ')}`);
    }

    if (ex.type === 'choice') {
      if (!ex.options.includes(ex.correct)) flag('correct not among options');
      if (new Set(ex.options).size !== ex.options.length) flag('duplicate options');
    }
    if (ex.type === 'build' || ex.type === 'arrange') {
      if (!multisetCovers(ex.tiles, ex.answer)) flag('answer not buildable from tiles');
      if (ex.correctLabel !== ex.answer.join(ex.type === 'build' ? '' : ' '))
        flag('correctLabel does not match joined answer');
    }
    if (ex.type === 'complete' || ex.type === 'fill' || ex.type === 'cloze') {
      const seq = ex.type === 'complete' ? ex.word : ex.words;
      if (ex.blanks.some((b) => b < 0 || b >= seq.length)) flag('blank index out of range');
      if (!multisetCovers(ex.bank, ex.blanks.map((b) => seq[b]))) flag('bank cannot fill blanks');
      if (ex.correctLabel !== seq.join(ex.type === 'complete' ? '' : ' '))
        flag('correctLabel does not match joined words');
    }
    if (ex.type === 'match') {
      const keys = Object.keys(ex.pairs);
      const values = Object.values(ex.pairs);
      if (canon([...ex.leftOrder].sort()) !== canon([...keys].sort())) flag('leftOrder ≠ pair keys');
      if (canon([...ex.rightOrder].sort()) !== canon([...values].sort())) flag('rightOrder ≠ pair values');
      if (new Set(values).size !== values.length) flag('duplicate pair values');
    }

    // Every exercise must survive the compact round-trip.
    const back = lineToEx(exToLine(ex));
    if (canon(back) !== canon(ex)) flag('does not round-trip through the line format');
  });
}

// ------------------------------------------------------------- commands

const args = process.argv.slice(2);
const cmd = args.shift();

function printLesson(lesson, only) {
  console.log(`${lesson.id} :: ${lesson.title} :: ${lesson.glyph} :: ch${lesson.chapter}`);
  lesson.exercises.forEach((ex, i) => {
    if (only !== undefined && i !== only) return;
    console.log(`${i}: ${exToLine(ex)}`);
  });
}

switch (cmd) {
  case 'list': {
    for (const lesson of loadAll()) {
      const tally = {};
      for (const ex of lesson.exercises) tally[ex.type] = (tally[ex.type] ?? 0) + 1;
      const kinds = Object.entries(tally).map(([t, n]) => `${t}:${n}`).join(' ');
      console.log(`${lesson.id} :: ${lesson.title} :: ${lesson.glyph} :: ch${lesson.chapter} :: ${kinds}`);
    }
    break;
  }
  case 'show': {
    const [id, n] = args.map(Number);
    printLesson(load(id), Number.isNaN(n) ? undefined : n);
    break;
  }
  case 'grep': {
    const re = new RegExp(args[0], 'u');
    for (const lesson of loadAll()) {
      lesson.exercises.forEach((ex, i) => {
        const line = exToLine(ex);
        if (re.test(line)) console.log(`${lesson.id}#${i} ${line}`);
      });
    }
    break;
  }
  case 'put': {
    const id = Number(args[0]);
    const n = Number(args[1]);
    const lesson = load(id);
    if (n < 0 || n >= lesson.exercises.length) die(`no exercise ${n} in lesson ${id}`);
    lesson.exercises[n] = lineToEx(args[2]);
    save(lesson);
    console.log(`${id}#${n} ${exToLine(lesson.exercises[n])}`);
    break;
  }
  case 'add': {
    const id = Number(args.shift());
    let at;
    if (args[0] === '--at') { args.shift(); at = Number(args.shift()); }
    const lesson = load(id);
    const ex = lineToEx(args[0]);
    if (at === undefined) at = lesson.exercises.length;
    lesson.exercises.splice(at, 0, ex);
    save(lesson);
    console.log(`${id}#${at} ${exToLine(ex)}`);
    break;
  }
  case 'rm': {
    const [id, n] = args.map(Number);
    const lesson = load(id);
    const [gone] = lesson.exercises.splice(n, 1);
    if (!gone) die(`no exercise ${n} in lesson ${id}`);
    save(lesson);
    console.log(`removed ${id}#${n} ${exToLine(gone)}`);
    break;
  }
  case 'mv': {
    const [id, from, to] = args.map(Number);
    const lesson = load(id);
    const [ex] = lesson.exercises.splice(from, 1);
    if (!ex) die(`no exercise ${from} in lesson ${id}`);
    lesson.exercises.splice(to, 0, ex);
    save(lesson);
    printLesson(lesson);
    break;
  }
  case 'meta': {
    const id = Number(args.shift());
    const lesson = load(id);
    for (const kv of args) {
      const i = kv.indexOf('=');
      const key = kv.slice(0, i);
      const value = kv.slice(i + 1);
      if (!['title', 'glyph', 'chapter'].includes(key)) die(`meta can set title/glyph/chapter, not "${key}"`);
      lesson[key] = key === 'chapter' ? Number(value) : value;
    }
    save(lesson);
    console.log(`${lesson.id} :: ${lesson.title} :: ${lesson.glyph} :: ch${lesson.chapter}`);
    break;
  }
  case 'new': {
    const [id, slug, title, glyph, chapter] = args;
    const file = path.join(DIR, `${String(id).padStart(2, '0')}-${slug}.json`);
    if (fs.existsSync(file)) die(`${file} already exists`);
    if (lessonFiles().some((f) => parseInt(f) === Number(id))) die(`id ${id} is taken`);
    save({ id: Number(id), title, glyph, chapter: Number(chapter), exercises: [] }, file);
    console.log(`created ${path.basename(file)}`);
    break;
  }
  case 'renumber': {
    const m = args[0]?.match(/^(\d+)\.\.(\d+)$/);
    const delta = Number(args[1]);
    if (!m || !delta) die('usage: renumber <from>..<to> <±delta>');
    let ids = [];
    for (let i = Number(m[1]); i <= Number(m[2]); i++) ids.push(i);
    if (delta > 0) ids.reverse(); // avoid collisions
    for (const id of ids) {
      const oldFile = fileFor(id);
      const lesson = load(id);
      lesson.id = id + delta;
      const newFile = path.join(DIR, path.basename(oldFile).replace(/^\d+/, String(lesson.id).padStart(2, '0')));
      if (fs.existsSync(newFile)) die(`${path.basename(newFile)} already exists`);
      save(lesson, newFile);
      fs.unlinkSync(oldFile);
      console.log(`${path.basename(oldFile)} -> ${path.basename(newFile)}`);
    }
    break;
  }
  case 'check': {
    const problems = [];
    const lessons = loadAll();
    const ids = lessons.map((l) => l.id);
    if (new Set(ids).size !== ids.length) problems.push('duplicate lesson ids');
    for (const f of lessonFiles()) {
      const lesson = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
      if (parseInt(f) !== lesson.id) problems.push(`${f}: filename prefix ≠ id ${lesson.id}`);
      checkLesson(lesson, problems);
    }
    if (problems.length) {
      for (const p of problems) console.log(p);
      console.log(`\n${problems.length} problem(s).`);
      process.exit(1);
    }
    console.log(`all ${lessons.length} lessons ok (structure, taught letters, round-trip).`);
    break;
  }
  case 'fmt': {
    for (const lesson of loadAll()) save(lesson);
    console.log('reformatted all lessons canonically.');
    break;
  }
  default:
    console.log('commands: list · show <id> [n] · grep <re> · put <id> <n> <line> · add <id> [--at n] <line> · rm <id> <n> · mv <id> <a> <b> · meta <id> k=v… · new <id> <slug> <title> <glyph> <ch> · renumber a..b ±d · check · fmt');
    process.exit(cmd ? 1 : 0);
}
