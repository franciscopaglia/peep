import type { ClozeExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { Blank } from './Blank';
import { TilePool } from './TilePool';
import { enterAnimation } from '@/lib/exercise-style';

/** Read a passage and fill its blanked-out words from context. */
export function ClozeCard({
  exercise,
  status,
  fillSel,
  onFillAdd,
  onFillRemove,
}: ExerciseProps<ClozeExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-7" style={enterAnimation}>
      <div className="text-sm text-muted-foreground">
        {exercise.caption ?? 'Read the passage and fill the gaps'}
      </div>
      <div className="text-[26px] leading-[1.7] font-semibold text-foreground text-center max-w-[560px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        {exercise.words.map((word, wi) => {
          const blankPos = exercise.blanks.indexOf(wi);
          const filled = blankPos !== -1 && fillSel[blankPos] !== undefined;
          return (
            <span key={wi} className="inline-flex items-center">
              {blankPos === -1 ? (
                <span>{word}</span>
              ) : (
                <Blank
                  filled={filled}
                  value={filled ? exercise.bank[fillSel[blankPos]] : ' '}
                  status={status}
                  className="inline-flex items-center justify-center h-[42px] min-w-[64px] px-2 rounded-btn align-middle"
                  onClear={() => onFillRemove(blankPos)}
                />
              )}
              {exercise.stops?.includes(wi) && <span>.</span>}
            </span>
          );
        })}
      </div>
      {exercise.translation && (
        <div className="text-sm italic text-muted-foreground max-w-[440px]">
          “{exercise.translation}”
        </div>
      )}
      <TilePool
        tiles={exercise.bank}
        isUsed={(i) => Object.values(fillSel).includes(i)}
        variant="word"
        maxWidth={520}
        status={status}
        onPick={onFillAdd}
      />
    </div>
  );
}
