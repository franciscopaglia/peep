import type { TypeExercise } from '@/lessons/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ExerciseProps } from './props';
import { answerColors, enterAnimation } from '@/lib/exercise-style';

/** Read the Shavian, type what it says. */
export function TypeCard({
  exercise,
  status,
  typedValue,
  onTypeChange,
}: ExerciseProps<TypeExercise>) {
  const dim = answerColors(status, false);
  // Only on a big screen: on a phone this throws the keyboard up over the
  // prompt before it has been read, and iOS will not reflow around it.
  const autoFocus = !useIsMobile();
  return (
    <div className="w-full flex flex-col items-center gap-7" style={enterAnimation}>
      <div className="text-center">
        <div className="text-[56px] sm:text-[76px] font-bold text-foreground mb-3.5">
          {exercise.prompt}
        </div>
        <div className="text-sm text-muted-foreground">{exercise.caption}</div>
      </div>
      <input
        className="w-[260px] text-center text-[22px] font-semibold p-4 rounded-btn outline-none"
        style={{
          border: `2px solid ${dim.border}`,
          background: status === 'active' ? 'var(--card)' : dim.bg,
          color: 'var(--foreground)',
        }}
        value={typedValue}
        onChange={(e) => onTypeChange(e.target.value)}
        placeholder="type here"
        autoFocus={autoFocus}
      />
    </div>
  );
}
