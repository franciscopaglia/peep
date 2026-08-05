import type { Exercise } from '@/lessons/types';

// First-try accuracy needed to pass a lesson and unlock the next one.
export const PASS_THRESHOLD = 0.6;

/** The selection state a learner can build up while answering one exercise. */
export type AnswerState = {
  selected: string | null;
  typedValue: string;
  /**
   * Tile indices in the order they were tapped — `build` spells a word out of
   * them, `arrange` a sentence. One list for both: the exercises differ in what
   * the tiles hold, not in how they are picked.
   */
  tileSel: number[];
  /**
   * The bank index chosen for each blank, keyed by **blank position**, for
   * `complete`/`fill`/`cloze`. Deliberately sparse rather than a list in tap
   * order: clearing the first of two blanks must leave the second where it is,
   * and a list indexed by tap order made the later answer slide into the gap.
   */
  fillSel: Record<number, number>;
};

export const emptyAnswer: AnswerState = {
  selected: null,
  typedValue: '',
  tileSel: [],
  fillSel: {},
};

/**
 * The bank words chosen for every blank, in blank order — or `null` if any
 * blank is still empty, which is never a correct answer.
 */
function filledBlanks(bank: string[], blankCount: number, fillSel: AnswerState['fillSel']) {
  const chosen: string[] = [];
  for (let position = 0; position < blankCount; position++) {
    const bankIndex = fillSel[position];
    if (bankIndex === undefined) return null;
    chosen.push(bank[bankIndex]);
  }
  return chosen;
}

/**
 * Canonical form for comparing a learner's transcription with the answer:
 * case-insensitive, apostrophes dropped, all other punctuation treated as a
 * space, whitespace collapsed.
 */
export function normalizeTranscription(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Canonical form for comparing a `write` answer: the glyphs must match exactly
 * (it's a spelling exercise), but spacing between words is forgiven — leading,
 * trailing and repeated spaces collapse to one.
 */
export function normalizeSpacing(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Letters a word may differ by and still count. `transcribe` asks the learner
 * to *read* a passage, so a slip of the keyboard shouldn't fail them — but the
 * budget has to scale with length, or a short word turns into a different word
 * within budget ("cat" is only two edits from "dot"). Short function words —
 * the abbreviated 𐑞/𐑯/𐑑/𐑝/𐑓 the curriculum drills — stay exact.
 */
export function editBudget(word: string): number {
  if (word.length <= 2) return 0;
  return word.length <= 4 ? 1 : 2;
}

/** Levenshtein distance: substitutions, insertions and deletions, cost 1 each. */
function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Whether a typed transcription reads as `expected`, allowing each word to be
 * off by up to its `editBudget` (a wrong, missing or extra letter). Word count
 * must still match — a dropped word is a misreading, not a typo.
 */
export function transcriptionMatches(expected: string, typed: string): boolean {
  const want = normalizeTranscription(expected).split(' ').filter(Boolean);
  const got = normalizeTranscription(typed).split(' ').filter(Boolean);
  if (want.length === 0 || want.length !== got.length) return false;
  return want.every((word, i) => {
    if (word === got[i]) return true;
    const budget = editBudget(word);
    // Length gap alone can exceed the budget — cheaper than the full matrix.
    if (budget === 0 || Math.abs(word.length - got[i].length) > budget) return false;
    return editDistance(word, got[i]) <= budget;
  });
}

/**
 * Whether a spelled answer matches — for `write` and for `listen` dictation.
 * The glyphs must be exact (it is a spelling exercise), but phrase prompts are
 * typed with the keyboard's space key, so a stray double space, or one at
 * either end, shouldn't fail an otherwise perfect spelling.
 */
function matchesSpelling(correct: string, accept: string[] | undefined, typed: string): boolean {
  const answer = normalizeSpacing(typed);
  return [correct, ...(accept ?? [])].some((option) => normalizeSpacing(option) === answer);
}

/**
 * Whether the given answer state solves the exercise. Pure — the single source
 * of truth for grading, shared by the app and the tests.
 *
 * `teach` has nothing to grade and `match` is graded through its own pairing
 * flow, so both return false here.
 */
export function isCorrect(exercise: Exercise, state: AnswerState): boolean {
  switch (exercise.type) {
    case 'choice':
      return state.selected === exercise.correct;

    case 'listen':
      // With options it is a `choice` whose prompt happens to be audio; without
      // them it is dictation, graded exactly as `write` — an exact glyph match,
      // with only the spacing between words forgiven.
      return exercise.options
        ? state.selected === exercise.correct
        : matchesSpelling(exercise.correct, exercise.accept, state.typedValue);

    case 'sort': {
      // Every item has to be placed, and placed right. `fillSel` maps item
      // index to bucket index here — the same shape the blanks use.
      return exercise.answer.every((bucket, item) => state.fillSel[item] === bucket);
    }
    case 'type': {
      const typed = state.typedValue.trim();
      return [exercise.correct, ...(exercise.accept ?? [])].some((answer) =>
        // A single word is a minimal-pair drill — the whole point of "𐑒𐑨𐑑 → cat"
        // is that "cot" is wrong — so it is graded exactly. A phrase is a
        // *reading*, the same skill `transcribe` tests, so one slipped letter
        // in one word shouldn't fail the sentence.
        answer.trim().includes(' ')
          ? transcriptionMatches(answer, typed)
          : typed.toLowerCase() === answer.toLowerCase()
      );
    }
    case 'build':
      return state.tileSel.map((i) => exercise.tiles[i]).join('') === exercise.answer.join('');
    case 'arrange':
      return state.tileSel.map((i) => exercise.tiles[i]).join(' ') === exercise.answer.join(' ');
    case 'complete': {
      const chosen = filledBlanks(exercise.bank, exercise.blanks.length, state.fillSel);
      return chosen !== null && chosen.join('') === exercise.blanks.map((b) => exercise.word[b]).join('');
    }
    case 'fill':
    case 'cloze': {
      const chosen = filledBlanks(exercise.bank, exercise.blanks.length, state.fillSel);
      return (
        chosen !== null && chosen.join(' ') === exercise.blanks.map((b) => exercise.words[b]).join(' ')
      );
    }
    case 'spot':
      // The tapped word is stored by index — words can repeat in a sentence.
      return state.selected === String(exercise.correct);
    case 'transcribe': {
      if (normalizeTranscription(state.typedValue).length === 0) return false;
      return [exercise.correct, ...(exercise.accept ?? [])].some((answer) =>
        transcriptionMatches(answer, state.typedValue)
      );
    }
    case 'write':
      return matchesSpelling(exercise.correct, exercise.accept, state.typedValue);
    // Nothing to grade here: a teach card is read, and `match` grades itself
    // as the pairs are found. Listed explicitly rather than caught by a
    // `default`, so a new member of the union fails to compile until grading
    // it has actually been thought about.
    case 'teach':
    case 'match':
      return false;
    default:
      exercise satisfies never;
      return false;
  }
}

/** Exercises that count toward the score (everything but teach cards and retries). */
export function isGradeable(exercise: Exercise): boolean {
  return exercise.type !== 'teach' && !exercise.retry;
}

export function gradeableCount(exercises: Exercise[]): number {
  return exercises.filter(isGradeable).length;
}

export function lessonPassed(score: number, gradeableTotal: number): boolean {
  return gradeableTotal === 0 || score / gradeableTotal >= PASS_THRESHOLD;
}
