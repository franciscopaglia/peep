import { useState } from 'react';
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
 *
 * …with one escape hatch. A browser voice can be unclear, wrong-accented or
 * missing altogether, and none of that is the learner's fault, so the word can
 * always be shown. It costs nothing: no penalty, nothing recorded, no effect on
 * grading — an exercise you couldn't hear should not be an exercise you fail.
 * Revealing it turns this into a `choice`, which is a fine thing to fall back
 * to and still practises the spelling.
 */
export function ListenCard({
  exercise,
  status,
  selected,
  onSelectOption,
}: ExerciseProps<ListenExercise>) {
  const [revealed, setRevealed] = useState(false);

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

        {/* Reserve the row's height either way, so revealing the word doesn't
            shift the options out from under a finger already reaching down. */}
        <div className="min-h-[34px] flex items-center justify-center">
          {revealed ? (
            <div
              className="text-[22px] font-semibold text-foreground"
              // The word appears after the page has settled, so say it.
              aria-live="polite"
            >
              “{exercise.say}”
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="bg-transparent border-none text-muted-foreground text-[13px] font-medium cursor-pointer underline underline-offset-4"
            >
              Can't hear it? Show the word
            </button>
          )}
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
