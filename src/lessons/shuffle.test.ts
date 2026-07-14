import { describe, it, expect } from 'vitest';
import { shuffleExerciseOptions } from '@/lessons';
import type {
  ChoiceExercise,
  BuildExercise,
  FillExercise,
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

const build: BuildExercise = {
  type: 'build',
  prompt: 'sit',
  caption: '',
  tiles: ['𐑕', '𐑦', '𐑑', '𐑛', '𐑨'],
  answer: ['𐑕', '𐑦', '𐑑'],
  correctLabel: '𐑕𐑦𐑑',
};

const fill: FillExercise = {
  type: 'fill',
  promptEn: 'the cat sat',
  words: ['𐑞', '𐑒𐑨𐑑', '𐑕𐑨𐑑'],
  blanks: [1, 2],
  bank: ['𐑒𐑨𐑑', '𐑕𐑨𐑑', '𐑛𐑪𐑜'],
  correctLabel: '𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑',
};

const sorted = (a: string[]) => [...a].sort();

describe('shuffleExerciseOptions', () => {
  it('choice: preserves the option set and keeps the correct answer present', () => {
    for (let k = 0; k < 200; k++) {
      const r = shuffleExerciseOptions(choice) as ChoiceExercise;
      expect(sorted(r.options)).toEqual(sorted(choice.options));
      expect(r.options).toContain(choice.correct);
    }
  });

  it('never returns the authored order (non-identity guarantee)', () => {
    let identity = 0;
    for (let k = 0; k < 300; k++) {
      const r = shuffleExerciseOptions(choice) as ChoiceExercise;
      if (r.options.join('|') === choice.options.join('|')) identity++;
    }
    expect(identity).toBe(0);
  });

  it('distributes the correct answer across all positions', () => {
    const counts = [0, 0, 0, 0];
    for (let k = 0; k < 4000; k++) {
      const r = shuffleExerciseOptions(choice) as ChoiceExercise;
      counts[r.options.indexOf(choice.correct)]++;
    }
    // With non-identity shuffling each slot should still get a healthy share.
    for (const c of counts) expect(c).toBeGreaterThan(4000 * 0.15);
  });

  it('build: shuffles tiles, preserving the multiset', () => {
    for (let k = 0; k < 100; k++) {
      const r = shuffleExerciseOptions(build) as BuildExercise;
      expect(sorted(r.tiles)).toEqual(sorted(build.tiles));
    }
  });

  it('fill: shuffles the word bank, preserving the multiset', () => {
    for (let k = 0; k < 100; k++) {
      const r = shuffleExerciseOptions(fill) as FillExercise;
      expect(sorted(r.bank)).toEqual(sorted(fill.bank));
    }
  });

  it('does not mutate the original exercise', () => {
    const before = choice.options.join('|');
    shuffleExerciseOptions(choice);
    expect(choice.options.join('|')).toBe(before);
  });
});
