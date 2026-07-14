import type { Exercise, LessonFile, LessonMeta } from './types';

const modules = import.meta.glob('./*.json', { eager: true }) as Record<
  string,
  { default: LessonFile }
>;

export const LESSONS: LessonFile[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.id - b.id);

export const LESSON_META: LessonMeta[] = LESSONS.map(({ id, title, glyph, chapter }) => ({
  id,
  title,
  glyph,
  chapter,
}));

export type Chapter = {
  id: number;
  title: string;
  subtitle: string;
  comingSoon?: boolean;
  blurb?: string;
};

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Chapter 1', subtitle: 'The Alphabet' },
  { id: 2, title: 'Chapter 2', subtitle: 'Reading Fluency' },
  {
    id: 3,
    title: 'Chapter 3',
    subtitle: 'Reading in the Wild',
    comingSoon: true,
    blurb: 'Longer passages and dialogue, plus the ligatures and shorthand words that make real Shavian text tick.',
  },
  {
    id: 4,
    title: 'Chapter 4',
    subtitle: 'Writing Shavian',
    comingSoon: true,
    blurb: 'Turn it around — spell English in Shavian, with the rules that writing needs.',
  },
  {
    id: 5,
    title: 'Chapter 5',
    subtitle: 'Fluency & Beyond',
    comingSoon: true,
    blurb: 'Speed, longer stories, accents, and free writing — putting it all together.',
  },
];

function shuffle<T>(items: T[]): T[] {
  if (items.length < 2) return [...items];
  // Fisher-Yates, re-rolled until the order actually changes, so tiles and
  // options never render in their authored order (where the answer, always
  // listed first, could just be tapped straight through). Capped so a set of
  // otherwise-identical items can't loop forever.
  let result = [...items];
  for (let attempt = 0; attempt < 20; attempt++) {
    result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (result.some((value, i) => value !== items[i])) break;
  }
  return result;
}

export function shuffleExerciseOptions(exercise: Exercise): Exercise {
  if (exercise.type === 'choice') {
    return { ...exercise, options: shuffle(exercise.options) };
  }
  if (exercise.type === 'build' || exercise.type === 'arrange') {
    return { ...exercise, tiles: shuffle(exercise.tiles) };
  }
  if (
    exercise.type === 'complete' ||
    exercise.type === 'fill' ||
    exercise.type === 'cloze'
  ) {
    return { ...exercise, bank: shuffle(exercise.bank) };
  }
  if (exercise.type === 'match') {
    // Shuffle each column independently so pairs never line up row-to-row.
    return {
      ...exercise,
      leftOrder: shuffle(exercise.leftOrder),
      rightOrder: shuffle(exercise.rightOrder),
    };
  }
  return exercise;
}

export function getLessonExercises(id: number): Exercise[] {
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) return [];
  return lesson.exercises.map((exercise) => shuffleExerciseOptions({ ...exercise }));
}

export type { Exercise, LessonMeta, LessonFile } from './types';
