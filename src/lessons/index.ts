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

export type Chapter = { id: number; title: string; subtitle: string; comingSoon?: boolean };

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Chapter 1', subtitle: 'The Alphabet' },
  { id: 2, title: 'Chapter 2', subtitle: 'Reading Fluency' },
  { id: 3, title: 'Chapter 3', subtitle: 'Coming soon', comingSoon: true },
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shuffleExerciseOptions(exercise: Exercise): Exercise {
  if (exercise.type !== 'choice') return exercise;
  return { ...exercise, options: shuffle(exercise.options) };
}

export function getLessonExercises(id: number): Exercise[] {
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) return [];
  return lesson.exercises.map((exercise) => shuffleExerciseOptions({ ...exercise }));
}

export type { Exercise, LessonMeta, LessonFile } from './types';
