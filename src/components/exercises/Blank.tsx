import type { Status } from '@/lib/lesson-machine';
import { answerColors } from '@/lib/exercise-style';

/**
 * A gap waiting for a tile — in a word (`complete`), a sentence (`fill`) or a
 * passage (`cloze`). Dashed while empty, filled in accent, and tapping a filled
 * one puts the tile back. Only the sizing differs between the three, so that
 * comes in as `className`.
 */
export function Blank({
  value,
  filled,
  status,
  className,
  onClear,
}: {
  value: string;
  filled: boolean;
  status: Status;
  className: string;
  onClear: () => void;
}) {
  const lit = answerColors(status);
  const dim = answerColors(status, false);
  return (
    <button
      onClick={() => filled && onClear()}
      className={className}
      style={{
        border: `2px dashed ${filled ? lit.border : dim.border}`,
        background: filled ? lit.bg : 'transparent',
        color: lit.color,
        cursor: filled && status === 'active' ? 'pointer' : 'default',
      }}
    >
      {value}
    </button>
  );
}
