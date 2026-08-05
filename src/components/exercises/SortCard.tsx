import { useState } from 'react';
import type { SortExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { answerColors, enterAnimation, poolTileStyle } from '@/lib/exercise-style';

/**
 * Put each word in the right bucket.
 *
 * Two taps, like `match`: pick a word, then pick where it goes. The picked word
 * is local state because it is mid-gesture — nothing outside this card cares
 * which tile is half-chosen, and the placement itself lives in the lesson
 * machine, keyed by item.
 *
 * A placed word can be picked up again and moved: this is a sorting task, and
 * changing your mind about one word should not cost you the others.
 */
export function SortCard({
  exercise,
  status,
  fillSel,
  onAssign,
}: ExerciseProps<SortExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  const lit = answerColors(status);
  const graded = status !== 'active';

  const place = (bucket: number) => {
    if (picked === null || graded) return;
    onAssign(picked, bucket);
    setPicked(null);
  };

  const unplaced = exercise.items.map((_, i) => i).filter((i) => fillSel[i] === undefined);

  return (
    <div className="w-full flex flex-col items-center gap-6" style={enterAnimation}>
      <div className="text-center">
        <div className="text-[22px] font-semibold text-foreground max-w-[460px]">
          {exercise.prompt}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {exercise.caption ?? 'Tap a word, then tap where it belongs'}
        </div>
      </div>

      {/* The pool of words still to place. Keeps its height so the buckets
          don't jump up the screen as it empties. */}
      <div className="flex flex-wrap gap-2.5 justify-center min-h-[52px] items-center max-w-[520px]">
        {unplaced.map((i) => (
          <button
            key={i}
            onClick={() => setPicked(picked === i ? null : i)}
            disabled={graded}
            className="px-4 py-2.5 rounded-btn font-bold text-xl"
            style={
              picked === i
                ? {
                    border: '2px solid var(--accent)',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                  }
                : poolTileStyle(false, status)
            }
          >
            {exercise.items[i]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 w-full max-w-[520px]" style={{ gridTemplateColumns: `repeat(${exercise.buckets.length}, minmax(0, 1fr))` }}>
        {exercise.buckets.map((label, bucket) => {
          const placed = exercise.items
            .map((_, i) => i)
            .filter((i) => fillSel[i] === bucket);
          return (
            <button
              key={label}
              onClick={() => place(bucket)}
              disabled={graded || picked === null}
              // Read on its own, a bucket is just a glyph — say what it is for.
              aria-label={`Put in ${label}`}
              className="flex flex-col items-center gap-2 p-3 rounded-card min-h-[132px]"
              style={{
                border: `2px dashed ${picked !== null && !graded ? 'var(--accent)' : 'var(--border)'}`,
                background: 'var(--card)',
                cursor: picked !== null && !graded ? 'pointer' : 'default',
              }}
            >
              <div className="text-lg font-bold text-foreground">{label}</div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {placed.map((i) => {
                  // Once graded, each word says whether it landed right.
                  const right = exercise.answer[i] === bucket;
                  const colors = graded
                    ? right
                      ? { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' }
                      : { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' }
                    : lit;
                  return (
                    <span
                      key={i}
                      onClick={(e) => {
                        // A placed word can be picked up again — but only when
                        // your hands are empty. While you are holding a word,
                        // the whole bucket is a target, including the words
                        // already in it; otherwise tapping a full bucket would
                        // swap what you were carrying instead of placing it.
                        if (graded || picked !== null) return;
                        e.stopPropagation();
                        setPicked(i);
                      }}
                      className="px-2.5 py-1 rounded-btn font-bold text-base"
                      style={{
                        border: `2px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.color,
                        cursor: graded ? 'default' : 'pointer',
                      }}
                    >
                      {exercise.items[i]}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
