import type { CompleteExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { Blank } from './Blank';
import { TilePool } from './TilePool';
import { enterAnimation } from '@/lib/exercise-style';

/** Fill a word's missing letters from a bank. */
export function CompleteCard({
  exercise,
  status,
  fillSel,
  onFillAdd,
  onFillRemove,
}: ExerciseProps<CompleteExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-8" style={enterAnimation}>
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">Complete the word:</div>
        <div className="text-[26px] font-semibold text-foreground">“{exercise.prompt}”</div>
        {exercise.caption && (
          <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
        )}
      </div>
      <div className="flex gap-2.5 items-center justify-center flex-wrap">
        {exercise.word.map((ch, wi) => {
          const blankPos = exercise.blanks.indexOf(wi);
          if (blankPos === -1) {
            return (
              <div
                key={wi}
                className="w-[54px] h-[54px] rounded-btn border-2 border-border bg-card flex items-center justify-center font-bold text-2xl text-foreground"
              >
                {ch}
              </div>
            );
          }
          const filled = blankPos < fillSel.length;
          return (
            <Blank
              key={wi}
              filled={filled}
              value={filled ? exercise.bank[fillSel[blankPos]] : ''}
              status={status}
              className="w-[54px] h-[54px] rounded-btn font-bold text-2xl flex items-center justify-center"
              onClear={() => onFillRemove(blankPos)}
            />
          );
        })}
      </div>
      <TilePool
        tiles={exercise.bank}
        isUsed={(i) => fillSel.includes(i)}
        variant="letter"
        status={status}
        onPick={onFillAdd}
      />
    </div>
  );
}
