export type LessonMeta = {
  id: number;
  title: string;
  glyph: string;
  chapter: number;
  // A branch lesson: optional extra practice that hangs off the main path.
  // It never counts toward course progress or gates the next spine lesson.
  optional?: boolean;
  // For a branch, the spine lesson it branches off of — it becomes available
  // once that lesson is completed, and inherits its taught-letter budget.
  anchor?: number;
};

// Optional visual shown above a teach card's body. Discriminated on `kind` so
// new media types surface as errors wherever media is rendered.
export type TeachMedia =
  // An embedded video (YouTube/Vimeo URLs are embedded; anything else plays
  // through the native <video> player).
  | { kind: 'video'; src: string; caption?: string }
  // The About page's letter cards, for the letters this card introduces.
  | { kind: 'letters'; glyphs: string[] };

export type TeachExercise = {
  type: 'teach';
  title: string;
  body: string;
  media?: TeachMedia;
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
  // Alternate readings also graded correct — for prompts whose Shavian spelling
  // is shared by English homophones (e.g. 𐑑𐑵 is both "too" and "two").
  accept?: string[];
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

// Read a Shavian sentence and tap the word that means the English prompt.
export type SpotExercise = {
  type: 'spot';
  prompt: string; // the English word to find in the sentence
  caption?: string;
  words: string[]; // the sentence, word by word (tapped in place, never shuffled)
  stops?: number[]; // word indices a sentence ends on (a period is shown after)
  correct: number; // index into `words` of the target word
  correctLabel: string;
  retry?: boolean;
};

// Read a real Shavian passage and write out its full English transcription.
export type TranscribeExercise = {
  type: 'transcribe';
  passage: string; // the Shavian text, with its punctuation
  source?: string; // attribution shown under the passage
  caption: string;
  correct: string; // the English transcription
  // Full-sentence alternates also graded correct (spelling variants like
  // traveller/traveler). Comparison is case/punctuation/whitespace-insensitive.
  accept?: string[];
  correctLabel: string;
  retry?: boolean;
};

// Spell an English word in Shavian on the full on-screen Shavian keyboard —
// no pre-picked tiles, all 48 letters available (plus the naming dot).
export type WriteExercise = {
  type: 'write';
  prompt: string; // the English word to spell
  caption: string;
  correct: string; // the Shavian spelling
  accept?: string[]; // alternate valid spellings
  correctLabel: string;
  retry?: boolean;
};

/**
 * Hear an English word read aloud, then tap the Shavian that spells it.
 *
 * **Experimental.** Shavian spells sounds, so going from a heard word to its
 * spelling is the most direct test the alphabet allows — but it depends on the
 * browser's speech synthesis, which varies by platform and is silent where
 * there is no voice. It is deliberately used in one optional branch lesson
 * only, until that holds up in practice.
 *
 * The prompt is audio, so there is nothing to read: `say` is spoken, never
 * shown. Options are Shavian spellings, tapped like a `choice`.
 */
export type ListenExercise = {
  type: 'listen';
  say: string; // the English word spoken aloud — the prompt
  caption?: string;
  /**
   * Shavian spellings to pick from. Omit for **dictation**: the learner spells
   * what they heard on the keyboard instead, with nothing to recognise. Same
   * prompt, no scaffolding — the hardest thing the alphabet can ask.
   */
  options?: string[];
  correct: string;
  /** Alternate spellings also accepted, as `write` does. Dictation only. */
  accept?: string[];
  correctLabel: string;
  retry?: boolean;
};

/**
 * Put each word in the right bucket — the 𐑕 words against the 𐑟 words, the 𐑩
 * endings against the 𐑼 ones.
 *
 * The only exercise that asks about a **rule** rather than an instance. Every
 * other type can be answered by recognising one word; this one is only
 * answerable by knowing what decides, which is what a lesson on endings or the
 * schwa is actually teaching.
 */
export type SortExercise = {
  type: 'sort';
  prompt: string; // what decides the bucket, e.g. "Which ending does each take?"
  caption?: string;
  buckets: string[]; // the bucket labels, in display order
  items: string[]; // the words to place
  answer: number[]; // bucket index for each item, parallel to `items`
  correctLabel: string;
  retry?: boolean;
};

/**
 * Find each word in a long passage — several rounds over one text.
 *
 * `spot` asks for one word in one sentence, which you can answer by reading the
 * sentence. This is a page, and the skill is different: scanning, holding an
 * English word in your head while your eye moves over Shavian looking for its
 * shape. It is the closest thing in the course to using the alphabet rather
 * than studying it.
 *
 * Rounds are answered in order, and each records the word index tapped — by
 * index, not by spelling, because a passage this long repeats words constantly.
 */
export type ScanExercise = {
  type: 'scan';
  caption?: string;
  passage: string[]; // the text, word by word (never shuffled — it is the exercise)
  stops?: number[]; // word indices a sentence ends on
  rounds: { prompt: string; correct: number }[]; // English prompt → index in `passage`
  correctLabel: string;
  retry?: boolean;
};

export type Exercise =
  | TeachExercise
  | ScanExercise
  | ListenExercise
  | SortExercise
  | ChoiceExercise
  | TypeExercise
  | MatchExercise
  | BuildExercise
  | ArrangeExercise
  | CompleteExercise
  | FillExercise
  | ClozeExercise
  | SpotExercise
  | TranscribeExercise
  | WriteExercise;

export type LessonFile = LessonMeta & {
  exercises: Exercise[];
};
