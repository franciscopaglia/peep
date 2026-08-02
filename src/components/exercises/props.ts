import type { Exercise } from '@/lessons/types';
import type { Status } from '@/lib/lesson-machine';

/**
 * What every exercise card is handed: the exercise (narrowed to its own type),
 * the learner's live answer, and the handlers that change it.
 *
 * One shared shape rather than per-type prop lists, so `Lesson` spreads the
 * same object into whichever card the exercise selects. Cards use only the
 * slice they need — a `teach` card reads none of it but `onContinueNext`.
 */
export type ExerciseProps<E extends Exercise = Exercise> = {
  exercise: E;
  status: Status;

  selected: string | null;
  typedValue: string;
  /** Tile indices in tap order — `build` and `arrange`. */
  tileSel: number[];
  /** Bank index per blank position — `complete`, `fill`, `cloze`. Sparse. */
  fillSel: Record<number, number>;
  matchSelLeft: string | null;
  matchSelRight: string | null;
  matchedKeys: string[];
  matchWrong: boolean;

  onSelectOption: (opt: string) => void;
  onTypeChange: (v: string) => void;
  onContinueNext: () => void;
  onTileAdd: (i: number) => void;
  onTileRemove: (pos: number) => void;
  onFillAdd: (i: number) => void;
  onFillRemove: (pos: number) => void;
  onMatchClick: (side: 'left' | 'right', value: string) => void;
};
