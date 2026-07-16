import type { Exercise } from '@/lessons/types';

// First-try accuracy needed to pass a lesson and unlock the next one.
export const PASS_THRESHOLD = 0.6;

/** The selection state a learner can build up while answering one exercise. */
export type AnswerState = {
  selected: string | null;
  typedValue: string;
  buildSel: number[];
  arrangeSel: number[];
  fillSel: number[];
};

export const emptyAnswer: AnswerState = {
  selected: null,
  typedValue: '',
  buildSel: [],
  arrangeSel: [],
  fillSel: [],
};

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
    case 'type': {
      const typed = state.typedValue.trim().toLowerCase();
      if (typed === exercise.correct.toLowerCase()) return true;
      return (exercise.accept ?? []).some((alt) => typed === alt.toLowerCase());
    }
    case 'build':
      return (
        state.buildSel.map((i) => exercise.tiles[i]).join('') === exercise.answer.join('')
      );
    case 'arrange':
      return (
        state.arrangeSel.map((i) => exercise.tiles[i]).join(' ') === exercise.answer.join(' ')
      );
    case 'complete':
      return (
        state.fillSel.map((i) => exercise.bank[i]).join('') ===
        exercise.blanks.map((b) => exercise.word[b]).join('')
      );
    case 'fill':
    case 'cloze':
      return (
        state.fillSel.map((i) => exercise.bank[i]).join(' ') ===
        exercise.blanks.map((b) => exercise.words[b]).join(' ')
      );
    case 'spot':
      // The tapped word is stored by index — words can repeat in a sentence.
      return state.selected === String(exercise.correct);
    case 'transcribe': {
      if (normalizeTranscription(state.typedValue).length === 0) return false;
      return [exercise.correct, ...(exercise.accept ?? [])].some((answer) =>
        transcriptionMatches(answer, state.typedValue)
      );
    }
    case 'write': {
      const typed = state.typedValue.trim();
      return typed === exercise.correct || (exercise.accept ?? []).includes(typed);
    }
    default:
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
