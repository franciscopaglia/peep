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

// Complete a word by filling in its missing letter(s) from a bank of tiles.
export type CompleteExercise = {
  type: 'complete';
  prompt: string; // the English word being completed
  caption?: string;
  word: string[]; // the full target word, letter by letter
  blanks: number[]; // indices into `word` that are blanked out, in reading order
  bank: string[]; // letter options to fill the blanks (correct letters + distractors)
  correctLabel: string;
  retry?: boolean;
};

// Fill a sentence by choosing the missing Shavian words; some words are pre-filled.
export type FillExercise = {
  type: 'fill';
  promptEn: string; // the English sentence
  caption?: string;
  words: string[]; // the full Shavian sentence, word by word
  blanks: number[]; // indices into `words` that are blanked out, in reading order
  bank: string[]; // word options to fill the blanks (correct words + distractors)
  correctLabel: string;
  retry?: boolean;
};

// Read a short passage and fill its blanked-out words from context.
export type ClozeExercise = {
  type: 'cloze';
  caption?: string;
  translation?: string; // optional English meaning, shown as support
  words: string[]; // the passage, word by word
  stops?: number[]; // word indices a sentence ends on (a period is shown after)
  blanks: number[]; // indices into `words` that are blanked out, in reading order
  bank: string[]; // word options to fill the blanks (correct words + distractors)
  correctLabel: string;
  retry?: boolean;
};

export type Exercise =
  | TeachExercise
  | ChoiceExercise
  | TypeExercise
  | MatchExercise
  | BuildExercise
  | ArrangeExercise
  | CompleteExercise
  | FillExercise
  | ClozeExercise;

export type LessonFile = LessonMeta & {
  exercises: Exercise[];
};
