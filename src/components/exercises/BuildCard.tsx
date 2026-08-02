import type { BuildExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { TilePool } from './TilePool';
import { answerColors, enterAnimation } from '@/lib/exercise-style';

/** Spell a word by tapping its letters, in order, out of a pool. */
export function BuildCard({
  exercise,
  status,
  tileSel,
  onTileAdd,
  onTileRemove,
}: ExerciseProps<BuildExercise>) {
  const lit = answerColors(status);
  return (
    <div className="w-full flex flex-col items-center gap-8" style={enterAnimation}>
      <div className="text-center">
        <div className="text-[26px] font-semibold text-foreground">“{exercise.prompt}”</div>
        <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
      </div>
      <div
        className="flex gap-2.5 items-center justify-center"
        style={{
          minHeight: 66,
          minWidth: 240,
          borderBottom: '2px dashed var(--border)',
          padding: '0 20px 12px',
        }}
      >
        {tileSel.map((tileIdx, pos) => (
          <button
            key={pos}
            onClick={() => onTileRemove(pos)}
            className="w-[54px] h-[54px] rounded-btn font-bold text-2xl flex items-center justify-center"
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
        isUsed={(i) => tileSel.includes(i)}
        variant="letter"
        status={status}
        onPick={onTileAdd}
      />
    </div>
  );
}
