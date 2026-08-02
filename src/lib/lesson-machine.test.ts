import { describe, it, expect } from 'vitest';
import {
  lessonReducer,
  initialLessonState,
  canCheck,
  lessonProgress,
  isLastExercise,
  type LessonState,
  type LessonAction,
} from '@/lib/lesson-machine';
import type { Exercise } from '@/lessons/types';

const teach: Exercise = { type: 'teach', title: 'Letters', body: '𐑐 is p.' };

const choice: Exercise = {
  type: 'choice',
  promptIsGlyph: true,
  prompt: '𐑒𐑨𐑑',
  caption: '',
  optionIsGlyph: false,
  options: ['cat', 'cot'],
  correct: 'cat',
  correctLabel: 'cat',
};

const typed: Exercise = {
  type: 'type',
  prompt: '𐑛𐑪𐑜',
  caption: '',
  correct: 'dog',
  correctLabel: 'dog',
};

const match: Exercise = {
  type: 'match',
  pairs: { '𐑞': 'the', '𐑯': 'and' },
  leftOrder: ['𐑞', '𐑯'],
  rightOrder: ['the', 'and'],
};

const fill: Exercise = {
  type: 'fill',
  promptEn: 'the cat',
  words: ['𐑞', '𐑒𐑨𐑑'],
  blanks: [1],
  bank: ['𐑒𐑨𐑑', '𐑛𐑪𐑜'],
  correctLabel: '𐑞 𐑒𐑨𐑑',
};

/** Start a lesson, then apply actions in order. */
function run(exercises: Exercise[], ...actions: LessonAction[]): LessonState {
  const start = lessonReducer(initialLessonState, { type: 'start', lessonId: 7, exercises });
  return actions.reduce(lessonReducer, start);
}

describe('start', () => {
  it('resets everything but keeps the lesson and its exercises', () => {
    const dirty = run([choice], { type: 'select', option: 'cat' }, { type: 'check' });
    const fresh = lessonReducer(dirty, { type: 'start', lessonId: 9, exercises: [typed] });
    expect(fresh).toMatchObject({
      lessonId: 9,
      exercises: [typed],
      exIndex: 0,
      furthest: 0,
      score: 0,
      attempts: {},
      current: initialLessonState.current,
    });
  });
});

describe('scoring', () => {
  it('awards a point for a correct answer', () => {
    const state = run([choice], { type: 'select', option: 'cat' }, { type: 'check' });
    expect(state.score).toBe(1);
    expect(state.current.status).toBe('correct');
  });

  it('awards no point for a wrong answer, and queues a retry', () => {
    const state = run([choice], { type: 'select', option: 'cot' }, { type: 'check' });
    expect(state.score).toBe(0);
    expect(state.current.status).toBe('wrong');
    expect(state.exercises).toHaveLength(2);
    expect(state.exercises[1]).toMatchObject({ type: 'choice', retry: true });
  });

  it('never scores a retry, even when it is answered correctly', () => {
    const state = run(
      [choice],
      { type: 'select', option: 'cot' },
      { type: 'check' }, // wrong — appends the retry
      { type: 'goTo', index: 1 },
      { type: 'select', option: 'cat' },
      { type: 'check' }
    );
    expect(state.current.status).toBe('correct');
    expect(state.score).toBe(0);
  });

  it('scores an exercise once, however often it is revisited', () => {
    const state = run(
      [choice, teach],
      { type: 'select', option: 'cat' },
      { type: 'check' },
      { type: 'goTo', index: 1 },
      { type: 'goTo', index: 0 },
      // Back on a graded exercise: every input is inert, and re-checking is too.
      { type: 'select', option: 'cot' },
      { type: 'check' },
      { type: 'check' }
    );
    expect(state.score).toBe(1);
    expect(state.current.selected).toBe('cat');
    expect(state.current.status).toBe('correct');
  });
});

describe('navigation', () => {
  it('saves the current work and restores the target exercise', () => {
    const state = run(
      [typed, typed],
      { type: 'typed', value: 'dog' },
      { type: 'goTo', index: 1 },
      { type: 'typed', value: 'cat' },
      { type: 'goTo', index: 0 }
    );
    expect(state.current.typedValue).toBe('dog');
    expect(state.attempts[1].typedValue).toBe('cat');
  });

  it('refuses to move out of bounds or onto itself', () => {
    const state = run([choice, typed]);
    for (const index of [-1, 0, 2, 99]) {
      expect(lessonReducer(state, { type: 'goTo', index })).toBe(state);
    }
  });

  it('remembers the furthest exercise reached', () => {
    const state = run(
      [choice, typed, teach],
      { type: 'goTo', index: 1 },
      { type: 'goTo', index: 2 },
      { type: 'goTo', index: 0 }
    );
    expect(state.exIndex).toBe(0);
    expect(state.furthest).toBe(2);
  });

  it('leaves a skipped exercise answerable when stepped back to', () => {
    // Skipping is just moving on: no answer, no grade, nothing saved.
    const state = run(
      [choice, typed],
      { type: 'goTo', index: 1 },
      { type: 'goTo', index: 0 },
      { type: 'select', option: 'cat' },
      { type: 'check' }
    );
    expect(state.score).toBe(1);
  });
});

describe('input guards', () => {
  const graded = run([choice], { type: 'select', option: 'cat' }, { type: 'check' });

  it.each<LessonAction>([
    { type: 'select', option: 'cot' },
    { type: 'typed', value: 'x' },
    { type: 'tileAdd', index: 0 },
    { type: 'tileRemove', position: 0 },
    { type: 'fillAdd', index: 0 },
    { type: 'fillRemove', position: 0 },
  ])('ignores $type once the exercise is graded', (action) => {
    expect(lessonReducer(graded, action)).toBe(graded);
  });

  it('takes one bank tile per blank, and no tile twice', () => {
    const state = run(
      [fill],
      { type: 'fillAdd', index: 0 },
      { type: 'fillAdd', index: 0 },
      { type: 'fillAdd', index: 1 }
    );
    // `fill` above has one blank: the repeat is refused, and so is the second
    // tile, because there is nowhere left to put it.
    expect(state.current.fillSel).toEqual({ 0: 0 });
  });

  it('does not add the same tile twice', () => {
    const state = run([choice], { type: 'tileAdd', index: 2 }, { type: 'tileAdd', index: 2 });
    expect(state.current.tileSel).toEqual([2]);
  });
});

describe('blanks', () => {
  // A two-blank sentence: 𐑞 _ 𐑦𐑟 _ .
  const twoBlanks: Exercise = {
    type: 'fill',
    promptEn: 'the cat is big',
    words: ['𐑞', '𐑒𐑨𐑑', '𐑦𐑟', '𐑚𐑦𐑜'],
    blanks: [1, 3],
    bank: ['𐑒𐑨𐑑', '𐑚𐑦𐑜', '𐑛𐑪𐑜'],
    correctLabel: '𐑞 𐑒𐑨𐑑 𐑦𐑟 𐑚𐑦𐑜',
  };

  it('fills the first empty blank, in order', () => {
    const state = run([twoBlanks], { type: 'fillAdd', index: 0 }, { type: 'fillAdd', index: 1 });
    expect(state.current.fillSel).toEqual({ 0: 0, 1: 1 });
  });

  it('clearing a blank leaves the others where they are', () => {
    // The bug this replaced: with both blanks filled, clearing the first slid
    // the second answer into it and emptied the second.
    const state = run(
      [twoBlanks],
      { type: 'fillAdd', index: 0 },
      { type: 'fillAdd', index: 1 },
      { type: 'fillRemove', position: 0 }
    );
    expect(state.current.fillSel).toEqual({ 1: 1 });
  });

  it('refills the blank that was cleared, not the end of the queue', () => {
    const state = run(
      [twoBlanks],
      { type: 'fillAdd', index: 0 },
      { type: 'fillAdd', index: 1 },
      { type: 'fillRemove', position: 0 },
      { type: 'fillAdd', index: 2 }
    );
    expect(state.current.fillSel).toEqual({ 0: 2, 1: 1 });
  });

  it('ignores clearing a blank that is already empty', () => {
    const state = run([twoBlanks], { type: 'fillAdd', index: 0 });
    expect(lessonReducer(state, { type: 'fillRemove', position: 1 })).toBe(state);
  });
});

describe('match', () => {
  it('scores once every pair is found', () => {
    const state = run(
      [match],
      { type: 'matchClick', side: 'left', value: '𐑞' },
      { type: 'matchClick', side: 'right', value: 'the' },
      { type: 'matchClick', side: 'left', value: '𐑯' },
      { type: 'matchClick', side: 'right', value: 'and' }
    );
    expect(state.current.status).toBe('correct');
    expect(state.score).toBe(1);
  });

  it('is not failable — a wrong pick only shakes', () => {
    const wrong = run(
      [match],
      { type: 'matchClick', side: 'left', value: '𐑞' },
      { type: 'matchClick', side: 'right', value: 'and' }
    );
    expect(wrong.matchWrong).toBe(true);
    expect(wrong.current.status).toBe('active');
    expect(wrong.current.matchedKeys).toEqual([]);

    // …and clearing it leaves the exercise exactly as answerable as before.
    const cleared = lessonReducer(wrong, { type: 'matchReset' });
    expect(cleared).toMatchObject({ matchWrong: false, matchSelLeft: null, matchSelRight: null });
  });

  it('ignores taps while a wrong pair is still showing', () => {
    const wrong = run(
      [match],
      { type: 'matchClick', side: 'left', value: '𐑞' },
      { type: 'matchClick', side: 'right', value: 'and' }
    );
    expect(lessonReducer(wrong, { type: 'matchClick', side: 'left', value: '𐑯' })).toBe(wrong);
  });

  it('ignores an already-matched pair', () => {
    const one = run(
      [match],
      { type: 'matchClick', side: 'left', value: '𐑞' },
      { type: 'matchClick', side: 'right', value: 'the' }
    );
    expect(lessonReducer(one, { type: 'matchClick', side: 'left', value: '𐑞' })).toBe(one);
    expect(lessonReducer(one, { type: 'matchClick', side: 'right', value: 'the' })).toBe(one);
  });

  it('deselects a side when it is tapped again', () => {
    const state = run([match], { type: 'matchClick', side: 'left', value: '𐑞' }, {
      type: 'matchClick',
      side: 'left',
      value: '𐑞',
    });
    expect(state.matchSelLeft).toBeNull();
  });
});

describe('canCheck', () => {
  it('needs a selection, some text, or every blank filled', () => {
    expect(canCheck(run([choice]))).toBe(false);
    expect(canCheck(run([choice], { type: 'select', option: 'cat' }))).toBe(true);

    expect(canCheck(run([typed], { type: 'typed', value: '   ' }))).toBe(false);
    expect(canCheck(run([typed], { type: 'typed', value: 'dog' }))).toBe(true);

    expect(canCheck(run([fill]))).toBe(false);
    expect(canCheck(run([fill], { type: 'fillAdd', index: 0 }))).toBe(true);
  });

  it('is false for the types that are never checked', () => {
    expect(canCheck(run([teach]))).toBe(false);
    expect(canCheck(run([match]))).toBe(false);
  });

  it('is false once the exercise has been graded', () => {
    expect(canCheck(run([choice], { type: 'select', option: 'cat' }, { type: 'check' }))).toBe(false);
  });
});

describe('progress', () => {
  it('counts graded steps only, so it matches the final score line', () => {
    const state = run([teach, choice, typed]);
    expect(lessonProgress(state).total).toBe(2);
    expect(lessonProgress(state).step).toBe(1);
    expect(lessonProgress(state).percent).toBe(0);

    const answered = run(
      [teach, choice, typed],
      { type: 'goTo', index: 1 },
      { type: 'select', option: 'cat' },
      { type: 'check' }
    );
    expect(lessonProgress(answered).percent).toBe(50);
  });

  it('knows when continuing would end the lesson', () => {
    expect(isLastExercise(run([choice, typed]))).toBe(false);
    expect(isLastExercise(run([choice, typed], { type: 'goTo', index: 1 }))).toBe(true);
  });
});
