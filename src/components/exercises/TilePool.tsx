import type { Status } from '@/lib/lesson-machine';
import { poolTileStyle } from '@/lib/exercise-style';

/**
 * The pool of tiles an exercise draws from — letters for `build`/`complete`,
 * whole words for `arrange`/`fill`/`cloze`. A used tile stays in place but
 * greys out, so the pool never reflows under the tapping finger.
 */
export function TilePool({
  tiles,
  isUsed,
  variant,
  maxWidth,
  status,
  onPick,
}: {
  tiles: string[];
  isUsed: (index: number) => boolean;
  variant: 'letter' | 'word';
  maxWidth?: number;
  status: Status;
  onPick: (index: number) => void;
}) {
  const letters = variant === 'letter';
  return (
    <div
      className={`flex flex-wrap justify-center ${letters ? 'gap-3' : 'gap-2.5'}`}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {tiles.map((tile, i) => {
        const used = isUsed(i);
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            disabled={used || status !== 'active'}
            className={
              letters
                ? 'w-[58px] h-[58px] rounded-btn font-bold text-2xl flex items-center justify-center'
                : 'px-4 py-2.5 rounded-btn font-bold text-xl'
            }
            style={poolTileStyle(used, status)}
          >
            {tile}
          </button>
        );
      })}
    </div>
  );
}
