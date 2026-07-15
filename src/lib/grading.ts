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
