import { describe, it, expect } from 'vitest';
import { loadAllLessons, LESSON_META, SPINE_META, branchesFor, shuffleExerciseOptions } from '@/lessons';
import { isCorrect, emptyAnswer, type AnswerState } from '@/lib/grading';
import { lettersFor } from '@/lib/shavian-alphabet';
import type { Exercise } from '@/lessons/types';

// Lessons are chunked and loaded on demand in the app; the suite wants them
// all, so it awaits them once at module scope and drives `it()` off the result.
const LESSONS = await loadAllLessons();

const sorted = (a: string[]) => [...a].sort();

/** Indices in `pool` whose values spell `wanted`, each used at most once. */
function pickIndices(pool: string[], wanted: string[]): number[] {
  const used = new Set<number>();
  return wanted.map((w) => {
    const idx = pool.findIndex((v, i) => !used.has(i) && v === w);
    if (idx === -1) throw new Error(`"${w}" not available in [${pool.join(', ')}]`);
    used.add(idx);
    return idx;
  });
}

/** Bank indices in blank order, as the sparse map `fillSel` expects. */
function byBlank(indices: number[]): Record<number, number> {
  return Object.fromEntries(indices.map((bankIndex, position) => [position, bankIndex]));
}

/** The answer state that should solve a gradeable, non-match exercise. */
function solve(ex: Exercise): AnswerState {
  switch (ex.type) {
    case 'choice':
    case 'listen':
      return { ...emptyAnswer, selected: ex.correct };
    case 'type':
      return { ...emptyAnswer, typedValue: ex.correct };
    case 'build':
      return { ...emptyAnswer, tileSel: pickIndices(ex.tiles, ex.answer) };
    case 'arrange':
      return { ...emptyAnswer, tileSel: pickIndices(ex.tiles, ex.answer) };
    case 'complete':
      return {
        ...emptyAnswer,
        fillSel: byBlank(pickIndices(ex.bank, ex.blanks.map((b) => ex.word[b]))),
      };
    case 'fill':
    case 'cloze':
      return {
        ...emptyAnswer,
        fillSel: byBlank(pickIndices(ex.bank, ex.blanks.map((b) => ex.words[b]))),
      };
    case 'spot':
      return { ...emptyAnswer, selected: String(ex.correct) };
    case 'transcribe':
    case 'write':
      return { ...emptyAnswer, typedValue: ex.correct };
    default:
      return emptyAnswer;
  }
}

describe('lesson catalogue', () => {
  it('auto-discovers all lessons with unique, ascending ids', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(33);
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort((a, b) => a - b)).toEqual(ids);
  });

  // The app ships meta.json instead of every lesson file, so the dashboard is
  // only as correct as this index. `lesson.mjs meta-index` regenerates it.
  it('meta.json matches the lesson files exactly', () => {
    expect(LESSON_META).toEqual(
      LESSONS.map(({ id, title, glyph, chapter, optional, anchor }) => ({
        id,
        title,
        glyph,
        chapter,
        ...(optional ? { optional, anchor } : {}),
      }))
    );
  });
});

describe('branch (optional) lessons', () => {
  const branches = LESSON_META.filter((l) => l.optional);
  const byId = new Map(LESSON_META.map((l) => [l.id, l]));

  it('SPINE_META is the non-optional lessons only', () => {
    expect(SPINE_META.every((l) => !l.optional)).toBe(true);
    expect(SPINE_META.length + branches.length).toBe(LESSON_META.length);
  });

  it('there is at least one branch to exercise the feature', () => {
    expect(branches.length).toBeGreaterThanOrEqual(1);
  });

  for (const b of branches) {
    it(`branch ${b.id} anchors to an existing spine lesson in the same chapter`, () => {
      const anchor = byId.get(b.anchor as number);
      expect(anchor, `anchor ${b.anchor} exists`).toBeDefined();
      expect(anchor!.optional).toBeFalsy();
      expect(anchor!.chapter).toBe(b.chapter);
    });

    it(`branchesFor(${b.anchor}) includes branch ${b.id}`, () => {
      expect(branchesFor(b.anchor as number).map((l) => l.id)).toContain(b.id);
    });
  }
});

describe('lesson content is well-formed and solvable', () => {
  for (const lesson of LESSONS) {
    for (const [i, ex] of lesson.exercises.entries()) {
      const at = `L${lesson.id} #${i} ${ex.type}`;

      if (ex.type === 'teach') {
        const media = ex.media;
        if (media?.kind === 'letters') {
          it(`${at}: media letters are real Shavian letters`, () => {
            expect(media.glyphs.length).toBeGreaterThan(0);
            expect(lettersFor(media.glyphs).map((l) => l.glyph)).toEqual(media.glyphs);
          });
        }
        if (media?.kind === 'video') {
          it(`${at}: media video has a usable url`, () => {
            expect(() => new URL(media.src)).not.toThrow();
          });
        }
        continue;
      }

      if (ex.type === 'match') {
        it(`${at}: left/right orders match the pairs`, () => {
          expect(sorted(ex.leftOrder)).toEqual(sorted(Object.keys(ex.pairs)));
          expect(sorted(ex.rightOrder)).toEqual(sorted(Object.values(ex.pairs)));
        });
        it(`${at}: pair values are unique`, () => {
          // The right column looks pairs up by value, so a duplicate English
          // word would make two cells indistinguishable.
          const values = Object.values(ex.pairs);
          expect(new Set(values).size).toBe(values.length);
        });
        continue;
      }

      it(`${at}: a correct answer passes`, () => {
        expect(isCorrect(ex, solve(ex))).toBe(true);
      });

      it(`${at}: still solvable after shuffling`, () => {
        const shuffled = shuffleExerciseOptions({ ...ex });
        expect(isCorrect(shuffled, solve(shuffled))).toBe(true);
      });

      if (ex.type === 'choice') {
        it(`${at}: distinct options include the correct one`, () => {
          expect(ex.options).toContain(ex.correct);
          expect(new Set(ex.options).size).toBe(ex.options.length);
        });
      }

      if (ex.type === 'build' || ex.type === 'arrange') {
        it(`${at}: correctLabel matches the joined answer`, () => {
          expect(ex.correctLabel).toBe(ex.answer.join(ex.type === 'build' ? '' : ' '));
        });
      }

      if (ex.type === 'spot') {
        it(`${at}: target index is valid and labelled`, () => {
          expect(ex.correct).toBeGreaterThanOrEqual(0);
          expect(ex.correct).toBeLessThan(ex.words.length);
          expect(ex.correctLabel).toBe(ex.words[ex.correct]);
        });
      }

      if (ex.type === 'complete' || ex.type === 'fill' || ex.type === 'cloze') {
        it(`${at}: blank indices are valid and the bank can fill them`, () => {
          const seq = ex.type === 'complete' ? ex.word : ex.words;
          for (const b of ex.blanks) {
            expect(b).toBeGreaterThanOrEqual(0);
            expect(b).toBeLessThan(seq.length);
          }
          // solve() throws if the bank cannot supply the blanked values.
          expect(() => solve(ex)).not.toThrow();
        });
      }
    }
  }
});
