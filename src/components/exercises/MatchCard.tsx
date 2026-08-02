import type { MatchExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { enterAnimation, matchCellColors } from '@/lib/exercise-style';

/**
 * Pair each Shavian symbol with the word it means. Intentionally not failable —
 * a wrong pick shakes and resets, and finishing always scores the point.
 */
export function MatchCard({
  exercise,
  matchSelLeft,
  matchSelRight,
  matchedKeys,
  matchWrong,
  onMatchClick,
}: ExerciseProps<MatchExercise>) {
  const cell = (matched: boolean, sel: boolean) => {
    const wrong = matchWrong && sel;
    const c = matchCellColors(matched, wrong, sel);
    return {
      border: `2px solid ${c.border}`,
      background: c.bg,
      color: c.color,
      cursor: matched ? ('default' as const) : ('pointer' as const),
      animation: wrong ? 'shvShake .3s ease' : 'none',
    };
  };

  return (
    <div className="w-full flex flex-col items-center gap-6" style={enterAnimation}>
      <div className="text-[15px] text-muted-foreground font-medium">
        Match each symbol to its word
      </div>
      <div className="flex gap-5 sm:gap-9 w-full max-w-[420px] justify-center">
        <div className="flex flex-col gap-3">
          {exercise.leftOrder.map((v) => (
            <button
              key={v}
              onClick={() => onMatchClick('left', v)}
              className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-bold text-2xl"
              style={cell(matchedKeys.includes(v), matchSelLeft === v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {exercise.rightOrder.map((v) => {
            const key = Object.keys(exercise.pairs).find((k) => exercise.pairs[k] === v);
            return (
              <button
                key={v}
                onClick={() => onMatchClick('right', v)}
                className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-semibold text-base"
                style={cell(key != null && matchedKeys.includes(key), matchSelRight === v)}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
