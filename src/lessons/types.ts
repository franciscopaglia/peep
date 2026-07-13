export type LessonMeta = {
  id: number;
  title: string;
  glyph: string;
  chapter: number;
};

export type TeachExercise = {
  type: 'teach';
  title: string;
  body: string;
  media?: string;
  retry?: boolean;
};

export type ChoiceExercise = {
  type: 'choice';
  promptIsGlyph: boolean;
  prompt: string;
  caption: string;
  optionIsGlyph: boolean;
  options: string[];
  correct: string;
  correctLabel: string;
  retry?: boolean;
};

export type TypeExercise = {
  type: 'type';
  prompt: string;
  caption: string;
  correct: string;
  correctLabel: string;
  retry?: boolean;
};

export type MatchExercise = {
  type: 'match';
  pairs: Record<string, string>;
  leftOrder: string[];
  rightOrder: string[];
  retry?: boolean;
};

export type BuildExercise = {
  type: 'build';
  prompt: string;
  caption: string;
  tiles: string[];
  answer: string[];
  correctLabel: string;
  retry?: boolean;
};

export type ArrangeExercise = {
  type: 'arrange';
  promptEn: string;
  tiles: string[];
  answer: string[];
  correctLabel: string;
  retry?: boolean;
};

export type Exercise =
  | TeachExercise
  | ChoiceExercise
  | TypeExercise
  | MatchExercise
  | BuildExercise
  | ArrangeExercise;

export type LessonFile = LessonMeta & {
  exercises: Exercise[];
};
