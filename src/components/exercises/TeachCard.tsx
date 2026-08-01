import type { TeachExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { renderWithGlyphChips } from '@/lib/shavian-text';
import { TeachMedia } from '@/components/TeachMedia';

/** The one card that isn't answered: read it, then continue. */
export function TeachCard({ exercise, onContinueNext }: ExerciseProps<TeachExercise>) {
  return (
    <div className="w-full max-w-[420px] flex flex-col gap-5 items-center text-center">
      <div className="text-[22px] font-bold text-foreground">{exercise.title}</div>
      {exercise.media && (
        <div className="w-full my-2">
          <TeachMedia media={exercise.media} />
        </div>
      )}
      <div className="text-[15px] leading-relaxed text-muted-foreground text-left">
        {renderWithGlyphChips(exercise.body)}
      </div>
      <button
        className="px-7 py-3 rounded-btn border-none bg-accent text-card font-semibold text-sm cursor-pointer mt-2"
        onClick={onContinueNext}
      >
        Continue
      </button>
    </div>
  );
}
