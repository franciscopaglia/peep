import type { ListenExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { SpeakButton } from '@/components/SpeakButton';
import { enterAnimation, optionColors } from '@/lib/exercise-style';

/**
 * Hear a word, tap the Shavian that spells it. **Experimental** — see
 * `ListenExercise`.
 *
 * The prompt is deliberately not written anywhere: reading it would make the
 * exercise a `choice`. The speaker is large and central because it *is* the
 * prompt, and it re-reads on every tap (slow on the second, per `SpeakButton`),
 * since a learner will want to hear a word more than once.
 */
export function ListenCard({
  exercise,
  status,
  selected,
  onSelectOption,
}: ExerciseProps<ListenExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-9" style={enterAnimation}>
      <div className="flex flex-col items-center gap-3 text-center">
        <SpeakButton
          text={exercise.say}
          label="Play the word"
          className="w-20 h-20 rounded-full border-2 border-accent-border bg-accent-soft text-accent hover:text-accent [&>svg]:w-8 [&>svg]:h-8"
        />
        <div className="text-sm text-muted-foreground">
          {exercise.caption ?? 'Listen, then tap the Shavian that spells it'}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-[420px]">
        {exercise.options.map((opt) => {
          const c = optionColors(status, selected === opt, opt === exercise.correct);
          return (
            <button
              key={opt}
              onClick={() => onSelectOption(opt)}
              className="px-3.5 py-[18px] rounded-btn font-semibold text-3xl transition-all duration-100"
              style={{
                border: `2px solid ${c.bd}`,
                background: c.bg,
                color: c.col,
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
