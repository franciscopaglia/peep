import type { ChoiceExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { enterAnimation, optionColors } from '@/lib/exercise-style';

/** Pick the right answer from a grid of options. */
export function ChoiceCard({
  exercise,
  status,
  selected,
  onSelectOption,
}: ExerciseProps<ChoiceExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-9" style={enterAnimation}>
      <div className="text-center">
        {exercise.promptIsGlyph ? (
          <div className="text-[56px] sm:text-[72px] font-bold text-foreground mb-3.5">
            {exercise.prompt}
          </div>
        ) : (
          <div className="text-[26px] font-semibold text-foreground max-w-[440px] leading-tight">
            {exercise.prompt}
          </div>
        )}
        {exercise.caption && (
          <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-[420px]">
        {exercise.options.map((opt) => {
          const c = optionColors(status, selected === opt, opt === exercise.correct);
          return (
            <button
              key={opt}
              onClick={() => onSelectOption(opt)}
              className="px-3.5 py-[18px] rounded-btn font-semibold transition-all duration-100"
              style={{
                border: `2px solid ${c.bd}`,
                background: c.bg,
                color: c.col,
                fontSize: exercise.optionIsGlyph ? 30 : 15,
                cursor: status === 'active' ? 'pointer' : 'default',
                animation: c.anim,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
