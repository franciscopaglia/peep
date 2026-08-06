import type { TranscribeExercise } from '@/lessons/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ExerciseProps } from './props';
import { answerColors, enterAnimation } from '@/lib/exercise-style';

/** Read a real Shavian passage and write out its full English. */
export function TranscribeCard({
  exercise,
  status,
  typedValue,
  onTypeChange,
}: ExerciseProps<TranscribeExercise>) {
  const dim = answerColors(status, false);
  const autoFocus = !useIsMobile();
  return (
    <div className="w-full flex flex-col gap-4" style={enterAnimation}>
      <div className="text-sm text-muted-foreground">{exercise.caption}</div>
      {/* One child per column, so the passage and the answer box are the
          same height: any label stacked beside a box would eat into it. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
        <figure className="m-0 flex flex-col p-5 rounded-card border border-border bg-card">
          <div className="flex-1 text-[24px] leading-[1.75] font-semibold text-foreground">
            {exercise.passage}
          </div>
          {exercise.source && (
            <figcaption className="mt-3 text-xs italic text-muted-foreground">
              — {exercise.source}
            </figcaption>
          )}
        </figure>
        <textarea
          className="w-full min-h-[140px] p-4 rounded-btn outline-none text-base font-medium leading-relaxed resize-none box-border"
          style={{
            border: `2px solid ${dim.border}`,
            background: status === 'active' ? 'var(--card)' : dim.bg,
            color: 'var(--foreground)',
          }}
          value={typedValue}
          onChange={(e) => onTypeChange(e.target.value)}
          placeholder="write the English here"
          autoFocus={autoFocus}
        />
      </div>
      <div className="text-xs italic text-muted-foreground">
        Spelling doesn't have to be perfect — a slip of a letter or two still counts. I'm still
        working on this one!
      </div>
    </div>
  );
}
