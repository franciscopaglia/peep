import { describe, it, expect } from 'vitest';
import {
  isCorrect,
  gradeableCount,
  lessonPassed,
  emptyAnswer,
  PASS_THRESHOLD,
} from '@/lib/grading';
import type {
  ChoiceExercise,
  TypeExercise,
  BuildExercise,
  ArrangeExercise,
  CompleteExercise,
  FillExercise,
  ClozeExercise,
  Exercise,
} from '@/lessons/types';

const choice: ChoiceExercise = {
  type: 'choice',
  promptIsGlyph: true,
  prompt: '𐑒𐑨𐑑',
  caption: '',
  optionIsGlyph: false,
  options: ['cat', 'cot', 'kit', 'dog'],
  correct: 'cat',
  correctLabel: 'cat',
};

const typeEx: TypeExercise = {
  type: 'type',
  prompt: '𐑒𐑨𐑑',
  caption: '',
  correct: 'Cat',
  correctLabel: 'cat',
};

const build: BuildExercise = {
  type: 'build',
  prompt: 'sit',
  caption: '',
  tiles: ['𐑕', '𐑦', '𐑑', '𐑛'],
  answer: ['𐑕', '𐑦', '𐑑'],
  correctLabel: '𐑕𐑦𐑑',
};

const arrange: ArrangeExercise = {
  type: 'arrange',
  promptEn: 'the cat sat',
  tiles: ['𐑞', '𐑒𐑨𐑑', '𐑕𐑨𐑑', '𐑛𐑪𐑜'],
  answer: ['𐑞', '𐑒𐑨𐑑', '𐑕𐑨𐑑'],
  correctLabel: '𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑',
};

const complete: CompleteExercise = {
  type: 'complete',
  prompt: 'cat',
  word: ['𐑒', '𐑨', '𐑑'],
  blanks: [1],
  bank: ['𐑨', '𐑦', '𐑪'],
  correctLabel: '𐑒𐑨𐑑',
};

const fill: FillExercise = {
  type: 'fill',
  promptEn: 'the cat sat',
  words: ['𐑞', '𐑒𐑨𐑑', '𐑕𐑨𐑑'],
  blanks: [1, 2],
  bank: ['𐑒𐑨𐑑', '𐑕𐑨𐑑', '𐑛𐑪𐑜'],
  correctLabel: '𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑',
};

const cloze: ClozeExercise = {
  type: 'cloze',
  words: ['𐑞', '𐑛𐑪𐑜', '𐑦𐑟', '𐑒𐑿𐑑'],
  blanks: [1, 3],
  bank: ['𐑛𐑪𐑜', '𐑒𐑿𐑑', '𐑒𐑨𐑑'],
  correctLabel: '𐑞 𐑛𐑪𐑜 𐑦𐑟 𐑒𐑿𐑑',
};

describe('isCorrect', () => {
  it('choice: only the correct option passes', () => {
    expect(isCorrect(choice, { ...emptyAnswer, selected: 'cat' })).toBe(true);
    expect(isCorrect(choice, { ...emptyAnswer, selected: 'cot' })).toBe(false);
    expect(isCorrect(choice, { ...emptyAnswer, selected: null })).toBe(false);
  });

  it('type: trims whitespace and ignores case', () => {
    expect(isCorrect(typeEx, { ...emptyAnswer, typedValue: '  cat ' })).toBe(true);
    expect(isCorrect(typeEx, { ...emptyAnswer, typedValue: 'CAT' })).toBe(true);
    expect(isCorrect(typeEx, { ...emptyAnswer, typedValue: 'dog' })).toBe(false);
    expect(isCorrect(typeEx, { ...emptyAnswer, typedValue: '' })).toBe(false);
  });

  it('build: tiles must be selected in the right order and complete', () => {
    expect(isCorrect(build, { ...emptyAnswer, buildSel: [0, 1, 2] })).toBe(true);
    expect(isCorrect(build, { ...emptyAnswer, buildSel: [1, 0, 2] })).toBe(false);
    expect(isCorrect(build, { ...emptyAnswer, buildSel: [0, 1] })).toBe(false);
    expect(isCorrect(build, { ...emptyAnswer, buildSel: [0, 1, 2, 3] })).toBe(false);
  });

  it('arrange: word-tiles joined with spaces in order', () => {
    expect(isCorrect(arrange, { ...emptyAnswer, arrangeSel: [0, 1, 2] })).toBe(true);
    expect(isCorrect(arrange, { ...emptyAnswer, arrangeSel: [1, 0, 2] })).toBe(false);
  });

  it('complete: fills the blank by bank value', () => {
    expect(isCorrect(complete, { ...emptyAnswer, fillSel: [0] })).toBe(true); // 𐑨
    expect(isCorrect(complete, { ...emptyAnswer, fillSel: [1] })).toBe(false); // 𐑦
    expect(isCorrect(complete, { ...emptyAnswer, fillSel: [] })).toBe(false);
  });

  it('fill: bank words joined by space against the blanks, in order', () => {
    expect(isCorrect(fill, { ...emptyAnswer, fillSel: [0, 1] })).toBe(true);
    expect(isCorrect(fill, { ...emptyAnswer, fillSel: [1, 0] })).toBe(false);
    expect(isCorrect(fill, { ...emptyAnswer, fillSel: [2, 1] })).toBe(false);
  });

  it('cloze: shares the fill logic', () => {
    expect(isCorrect(cloze, { ...emptyAnswer, fillSel: [0, 1] })).toBe(true);
    expect(isCorrect(cloze, { ...emptyAnswer, fillSel: [2, 1] })).toBe(false);
  });

  it('teach and match are never graded here', () => {
    const teach: Exercise = { type: 'teach', title: 't', body: 'b' };
    expect(isCorrect(teach, emptyAnswer)).toBe(false);
  });
});

describe('gradeableCount', () => {
  it('excludes teach cards and retry copies', () => {
    const exercises: Exercise[] = [
      { type: 'teach', title: 't', body: 'b' },
      choice,
      typeEx,
      { ...choice, retry: true },
    ];
    expect(gradeableCount(exercises)).toBe(2);
  });
});

describe('lessonPassed', () => {
  it('needs at least the pass threshold of first-try accuracy', () => {
    expect(PASS_THRESHOLD).toBe(0.6);
    expect(lessonPassed(3, 5)).toBe(true); // 60%
    expect(lessonPassed(2, 5)).toBe(false); // 40%
    expect(lessonPassed(5, 5)).toBe(true);
  });

  it('a lesson with nothing to grade always passes', () => {
    expect(lessonPassed(0, 0)).toBe(true);
  });
});
