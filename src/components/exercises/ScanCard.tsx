import type { ScanExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { enterAnimation } from '@/lib/exercise-style';

/**
 * Hunt each word down in a long passage, one round at a time.
 *
 * The passage is the whole card — no prompt above it competing for the eye,
 * just the round strip showing what you are looking for now and what you have
 * already found. Answering advances to the next round; tapping a finished
 * round re-opens it, so a misfire costs one tap rather than the exercise.
 */
export function ScanCard({ exercise, status, fillSel, onAssign }: ExerciseProps<ScanExercise>) {
  const graded = status !== 'active';
  // The round being answered: the first one still empty, unless one was re-opened.
  const current = exercise.rounds.findIndex((_, i) => fillSel[i] === undefined);

  const chosenBy = new Map<number, number>(); // word index → round that picked it
  exercise.rounds.forEach((_, round) => {
    const word = fillSel[round];
    if (word !== undefined) chosenBy.set(word, round);
  });

  return (
    <div className="w-full flex flex-col items-center gap-6" style={enterAnimation}>
      <div className="text-sm text-muted-foreground text-center">
        {exercise.caption ?? 'Find each word in the passage'}
      </div>

      {/* What to find, and what has been found. */}
      <div className="flex flex-wrap gap-2 justify-center max-w-[560px]">
        {exercise.rounds.map((round, i) => {
          const answer = fillSel[i];
          const done = answer !== undefined;
          const right = done && answer === round.correct;
          const colors = !done
            ? i === current
              ? { border: 'var(--accent)', bg: 'var(--accent-soft)', color: 'var(--accent)' }
              : { border: 'var(--border)', bg: 'transparent', color: 'var(--muted-foreground)' }
            : graded
              ? right
                ? { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' }
                : { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' }
              : { border: 'var(--accent-border)', bg: 'var(--accent-soft)', color: 'var(--accent)' };
          return (
            <button
              key={i}
              // Re-open a finished round by clearing it: assigning a word is the
              // only way in, so "un-answer" is a tap on the round itself.
              onClick={() => !graded && done && onAssign(i, -1)}
              disabled={graded || !done}
              className="px-3 py-1.5 rounded-btn text-sm font-semibold"
              style={{
                border: `2px ${done ? 'solid' : 'dashed'} ${colors.border}`,
                background: colors.bg,
                color: colors.color,
                cursor: !graded && done ? 'pointer' : 'default',
              }}
            >
              {round.prompt}
              {done && ' ✓'}
            </button>
          );
        })}
      </div>

      <div className="text-[21px] leading-[1.9] font-semibold text-center max-w-[600px] flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {exercise.passage.map((word, wi) => {
          const round = chosenBy.get(wi);
          const picked = round !== undefined;
          const right = picked && exercise.rounds[round].correct === wi;
          const style = picked
            ? graded
              ? right
                ? { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' }
                : { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' }
              : { border: 'var(--accent)', bg: 'var(--accent-soft)', color: 'var(--accent)' }
            : null;
          return (
            <span key={wi} className="inline-flex items-center">
              <button
                onClick={() => !graded && current !== -1 && onAssign(current, wi)}
                disabled={graded || current === -1}
                className="px-1.5 py-0.5 rounded-btn transition-colors duration-100"
                style={{
                  border: `2px solid ${style ? style.border : 'transparent'}`,
                  background: style ? style.bg : 'transparent',
                  color: style ? style.color : 'var(--foreground)',
                  cursor: !graded && current !== -1 ? 'pointer' : 'default',
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
