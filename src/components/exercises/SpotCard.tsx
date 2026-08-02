import type { SpotExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { enterAnimation, optionColors } from '@/lib/exercise-style';

/**
 * Tap the word in a sentence that means the English prompt. Graded by word
 * *index*, since a sentence can repeat a word.
 */
export function SpotCard({
  exercise,
  status,
  selected,
  onSelectOption,
}: ExerciseProps<SpotExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-8" style={enterAnimation}>
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">
          {exercise.caption ?? 'Tap the word that says:'}
        </div>
        <div className="text-[26px] font-semibold text-foreground max-w-[440px]">
          “{exercise.prompt}”
        </div>
      </div>
      <div className="text-[26px] leading-[1.7] font-semibold text-center max-w-[560px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
        {exercise.words.map((word, wi) => {
          const c = optionColors(status, selected === String(wi), wi === exercise.correct);
          return (
            <span key={wi} className="inline-flex items-center gap-x-2.5">
              <button
                onClick={() => onSelectOption(String(wi))}
                className="px-3.5 py-2 rounded-btn font-bold transition-all duration-100"
                style={{
                  border: `2px solid ${c.bd}`,
                  background: c.bg,
                  color: c.col,
                  cursor: status === 'active' ? 'pointer' : 'default',
                  animation: c.anim,
                }}
              >
                {word}
              </button>
              {exercise.stops?.includes(wi) && <span className="text-foreground">.</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
