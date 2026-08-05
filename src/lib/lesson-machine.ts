import { isCorrect, gradeableCount, emptyAnswer, type AnswerState } from '@/lib/grading';
import { shuffleExerciseOptions } from '@/lessons';
import type { Exercise } from '@/lessons/types';

/**
 * Lesson playback, as a pure state machine.
 *
 * This is the most rule-bound part of the app — a point is scored exactly once,
 * a revisited exercise can't be re-answered, a skipped one stays answerable,
 * and a wrong answer queues a retry that never scores. Keeping it out of the
 * component is what makes those rules testable without rendering anything.
 *
 * What deliberately stays in `App`: anything that isn't a function of this
 * state — switching views, saving progress to localStorage, and the timer that
 * clears a wrong match (the reducer exposes `matchReset` for it to dispatch).
 */

export type Status = 'active' | 'correct' | 'wrong';

/**
 * One exercise's saved work. Stepping back and forth restores these instead of
 * resetting, so an answer is never lost — and a graded one comes back `correct`
 * or `wrong`, which is what locks its inputs and stops it being scored twice.
 */
export type Attempt = AnswerState & {
  status: Status;
  matchedKeys: string[];
};

export const emptyAttempt: Attempt = {
  ...emptyAnswer,
  status: 'active',
  matchedKeys: [],
};

export type LessonState = {
  lessonId: number;
  exercises: Exercise[];
  exIndex: number;
  /** How far into the lesson we've reached — you may revisit, never skip ahead. */
  furthest: number;
  score: number;
  /** Work saved per exercise index. */
  attempts: Record<number, Attempt>;
  /** The current exercise's live work. */
  current: Attempt;
  // Mid-gesture match state: never saved into `attempts`, never restored.
  matchSelLeft: string | null;
  matchSelRight: string | null;
  matchWrong: boolean;
};

export const initialLessonState: LessonState = {
  lessonId: 1,
  exercises: [],
  exIndex: 0,
  furthest: 0,
  score: 0,
  attempts: {},
  current: emptyAttempt,
  matchSelLeft: null,
  matchSelRight: null,
  matchWrong: false,
};

export type LessonAction =
  | { type: 'start'; lessonId: number; exercises: Exercise[] }
  | { type: 'goTo'; index: number }
  | { type: 'check' }
  | { type: 'select'; option: string }
  | { type: 'typed'; value: string }
  | { type: 'tileAdd'; index: number }
  | { type: 'tileRemove'; position: number }
  | { type: 'fillAdd'; index: number }
  | { type: 'fillRemove'; position: number }
  | { type: 'assign'; item: number; bucket: number }
  | { type: 'matchClick'; side: 'left' | 'right'; value: string }
  | { type: 'matchReset' };

const withCurrent = (state: LessonState, patch: Partial<Attempt>): LessonState => ({
  ...state,
  current: { ...state.current, ...patch },
});

/** Every input is ignored unless the exercise is still open for answering. */
const isActive = (state: LessonState) => state.current.status === 'active';

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  const exercise = state.exercises[state.exIndex];

  switch (action.type) {
    case 'start':
      return {
        ...initialLessonState,
        lessonId: action.lessonId,
        exercises: action.exercises,
      };

    case 'goTo': {
      const { index } = action;
      if (index === state.exIndex || index < 0 || index >= state.exercises.length) return state;
      return {
        ...state,
        attempts: { ...state.attempts, [state.exIndex]: state.current },
        current: state.attempts[index] ?? emptyAttempt,
        exIndex: index,
        furthest: Math.max(state.furthest, index),
        // A half-finished match tap is mid-gesture state, never worth restoring.
        matchSelLeft: null,
        matchSelRight: null,
        matchWrong: false,
      };
    }

    case 'check': {
      if (!exercise || !isActive(state)) return state;
      const correct = isCorrect(exercise, state.current);
      return {
        ...withCurrent(state, { status: correct ? 'correct' : 'wrong' }),
        score: correct && !exercise.retry ? state.score + 1 : state.score,
        // A wrong answer earns another go at the same exercise, later in the
        // lesson — reshuffled, and flagged so it can never score.
        exercises:
          !correct && !exercise.retry
            ? [...state.exercises, { ...shuffleExerciseOptions(exercise), retry: true }]
            : state.exercises,
      };
    }

    case 'select':
      return isActive(state) ? withCurrent(state, { selected: action.option }) : state;

    case 'typed':
      return isActive(state) ? withCurrent(state, { typedValue: action.value }) : state;

    // `build` and `arrange` share one ordered list of tile indices — the tiles
    // hold letters in one and words in the other, but picking them is the same
    // gesture, so it is the same state and the same two actions.
    case 'tileAdd':
      if (!isActive(state) || state.current.tileSel.includes(action.index)) return state;
      return withCurrent(state, { tileSel: [...state.current.tileSel, action.index] });

    case 'tileRemove':
      if (!isActive(state)) return state;
      return withCurrent(state, {
        tileSel: state.current.tileSel.filter((_, p) => p !== action.position),
      });

    case 'fillAdd': {
      if (!isActive(state) || !exercise) return state;
      if (exercise.type !== 'complete' && exercise.type !== 'fill' && exercise.type !== 'cloze')
        return state;
      const { fillSel } = state.current;
      // No tile twice.
      if (Object.values(fillSel).includes(action.index)) return state;
      // A tapped tile goes into the first blank still empty — which, after a
      // blank is cleared, is that blank rather than the end of the queue.
      const target = exercise.blanks.findIndex((_, position) => fillSel[position] === undefined);
      if (target === -1) return state;
      return withCurrent(state, { fillSel: { ...fillSel, [target]: action.index } });
    }

    case 'fillRemove': {
      if (!isActive(state)) return state;
      // Clear exactly the blank that was tapped; the others stay put.
      const { [action.position]: removed, ...rest } = state.current.fillSel;
      if (removed === undefined) return state;
      return withCurrent(state, { fillSel: rest });
    }

    // `sort` reuses `fillSel`, keyed by item instead of by blank: the shape —
    // a sparse map from slot to choice — is the same, and so is the rule that
    // re-placing an item replaces only that item.
    case 'assign':
      if (!isActive(state)) return state;
      return withCurrent(state, {
        fillSel: { ...state.current.fillSel, [action.item]: action.bucket },
      });

    case 'matchClick': {
      if (!exercise || exercise.type !== 'match' || state.matchWrong) return state;
      const { side, value } = action;

      let left = state.matchSelLeft;
      let right = state.matchSelRight;
      if (side === 'left') {
        if (state.current.matchedKeys.includes(value)) return state;
        left = left === value ? null : value;
      } else {
        const key = Object.keys(exercise.pairs).find((k) => exercise.pairs[k] === value);
        if (key && state.current.matchedKeys.includes(key)) return state;
        right = right === value ? null : value;
      }

      // Nothing to judge until one of each side is picked.
      if (!left || !right) return { ...state, matchSelLeft: left, matchSelRight: right };

      // Wrong picks shake and reset — `match` is intentionally not failable, so
      // this costs nothing but the gesture. `matchReset` clears it on a timer.
      if (exercise.pairs[left] !== right)
        return { ...state, matchSelLeft: left, matchSelRight: right, matchWrong: true };

      const matchedKeys = [...state.current.matchedKeys, left];
      const done = matchedKeys.length === Object.keys(exercise.pairs).length;
      return {
        ...withCurrent(state, { matchedKeys, status: done ? 'correct' : state.current.status }),
        score: done ? state.score + 1 : state.score,
        matchSelLeft: null,
        matchSelRight: null,
      };
    }

    case 'matchReset':
      return { ...state, matchWrong: false, matchSelLeft: null, matchSelRight: null };
  }
}

// ---------------------------------------------------------------- selectors

/** Whether the current answer is complete enough that "Check" would do anything. */
export function canCheck(state: LessonState): boolean {
  const exercise = state.exercises[state.exIndex];
  if (!exercise || state.current.status !== 'active') return false;
  const { typedValue, selected, tileSel, fillSel } = state.current;
  switch (exercise.type) {
    case 'type':
    case 'transcribe':
    case 'write':
      return typedValue.trim().length > 0;
    case 'choice':
    case 'spot':
      return selected != null;
    case 'listen':
      return exercise.options ? selected != null : typedValue.trim().length > 0;
    case 'sort':
      // Every item placed — a half-sorted pile is not an answer.
      return exercise.items.every((_, item) => fillSel[item] !== undefined);
    case 'build':
    case 'arrange':
      return tileSel.length > 0;
    case 'complete':
    case 'fill':
    case 'cloze':
      return Object.keys(fillSel).length === exercise.blanks.length;
    case 'teach':
    case 'match':
      return false;
  }
}

/** True once the current exercise is the last one — continuing ends the lesson. */
export const isLastExercise = (state: LessonState) =>
  state.exIndex + 1 >= state.exercises.length;

/**
 * Progress over *graded* steps only, so the "X / Y" during the lesson matches
 * the "score / Y" on the results screen.
 */
export function lessonProgress(state: LessonState) {
  const total = gradeableCount(state.exercises);
  const before = state.exercises
    .slice(0, state.exIndex)
    .filter((e) => e.type !== 'teach' && !e.retry).length;
  const current = state.exercises[state.exIndex];
  const currentIsGraded = current ? current.type !== 'teach' : false;
  const answered = currentIsGraded && state.current.status !== 'active' ? 1 : 0;
  return {
    total,
    step: Math.min(before + (currentIsGraded ? 1 : 0), total) || (total ? 1 : 0),
    percent: total ? Math.round(((before + answered) / total) * 100) : 0,
  };
}
