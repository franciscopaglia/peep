import type { FillExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { Blank } from './Blank';
import { TilePool } from './TilePool';
import { enterAnimation } from '@/lib/exercise-style';

/** Fill a sentence's missing words from a bank. */
export function FillCard({
  exercise,
  status,
  fillSel,
  onFillAdd,
  onFillRemove,
}: ExerciseProps<FillExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-8" style={enterAnimation}>
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">Fill in the sentence:</div>
        <div className="text-2xl font-semibold text-foreground max-w-[480px]">
          “{exercise.promptEn}”
        </div>
      </div>
      <div className="flex gap-2.5 items-center justify-center flex-wrap max-w-[520px]">
        {exercise.words.map((word, wi) => {
          const blankPos = exercise.blanks.indexOf(wi);
          if (blankPos === -1) {
            return (
              <div
                key={wi}
                className="px-4 py-2.5 rounded-btn border-2 border-border bg-card font-bold text-xl text-foreground"
              >
                {word}
              </div>
            );
          }
          const filled = blankPos < fillSel.length;
          return (
            <Blank
              key={wi}
              filled={filled}
              value={filled ? exercise.bank[fillSel[blankPos]] : ' '}
              status={status}
              className="min-w-[64px] px-4 py-2.5 rounded-btn font-bold text-xl flex items-center justify-center"
              onClear={() => onFillRemove(blankPos)}
            />
          );
        })}
      </div>
      <TilePool
        tiles={exercise.bank}
        isUsed={(i) => fillSel.includes(i)}
        variant="word"
        maxWidth={520}
        status={status}
        onPick={onFillAdd}
      />
    </div>
  );
}
