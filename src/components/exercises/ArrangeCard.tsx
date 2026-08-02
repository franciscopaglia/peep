import type { ArrangeExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { TilePool } from './TilePool';
import { answerColors, enterAnimation } from '@/lib/exercise-style';

/** Build a sentence by tapping its words into order. */
export function ArrangeCard({
  exercise,
  status,
  arrangeSel,
  onArrangeAdd,
  onArrangeRemove,
}: ExerciseProps<ArrangeExercise>) {
  const lit = answerColors(status);
  return (
    <div className="w-full flex flex-col items-center gap-8" style={enterAnimation}>
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">Arrange the words to say:</div>
        <div className="text-2xl font-semibold text-foreground max-w-[480px]">
          “{exercise.promptEn}”
        </div>
      </div>
      <div
        className="flex flex-wrap gap-2.5 items-center justify-center w-full max-w-[500px]"
        style={{
          minHeight: 60,
          borderBottom: '2px dashed var(--border)',
          padding: '0 16px 12px',
        }}
      >
        {arrangeSel.map((tileIdx, pos) => (
          <button
            key={pos}
            onClick={() => onArrangeRemove(pos)}
            className="px-4 py-2.5 rounded-btn font-bold text-xl"
            style={{
              border: `2px solid ${lit.border}`,
              background: lit.bg,
              color: lit.color,
              cursor: status === 'active' ? 'pointer' : 'default',
            }}
          >
            {exercise.tiles[tileIdx]}
          </button>
        ))}
      </div>
      <TilePool
        tiles={exercise.tiles}
        isUsed={(i) => arrangeSel.includes(i)}
        variant="word"
        maxWidth={500}
        status={status}
        onPick={onArrangeAdd}
      />
    </div>
  );
}
