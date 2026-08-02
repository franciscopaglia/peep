import { Delete } from 'lucide-react';
import type { WriteExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { answerColors, enterAnimation, poolTileStyle } from '@/lib/exercise-style';
import { keyboardRows, NAMING_DOT, PUNCTUATION_KEYS, SPACE_KEY } from '@/lib/shavian-keyboard';
import { useIsMobile } from '@/hooks/useIsMobile';

/** Spell the prompt in Shavian on the full on-screen keyboard. */
export function WriteCard({
  exercise,
  status,
  typedValue,
  onTypeChange,
}: ExerciseProps<WriteExercise>) {
  // On narrow screens the keyboard splits its 12-key rows into interleaved
  // half-rows of 6 (pairing preserved) so keys stay tappable.
  const isMobile = useIsMobile();
  const lit = answerColors(status);
  const dim = answerColors(status, false);
  const keyStyle = poolTileStyle(false, status);
  const append = (glyph: string) => onTypeChange(typedValue + glyph);

  return (
    <div className="w-full flex flex-col items-center gap-6" style={enterAnimation}>
      <div className="text-center">
        <div className="text-[26px] font-semibold text-foreground">“{exercise.prompt}”</div>
        <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
      </div>
      <div
        className="flex items-center justify-center text-[32px] font-bold tracking-wide"
        style={{
          minHeight: 58,
          minWidth: 220,
          borderBottom: `2px dashed ${typedValue ? lit.border : dim.border}`,
          color: typedValue ? lit.color : 'var(--muted-foreground)',
          padding: '0 20px 8px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {typedValue || ' '}
      </div>
      <div className="w-full max-w-[520px] flex flex-col gap-1.5">
        {keyboardRows(isMobile).map((row, ri) => (
          <div key={ri} className={`grid gap-1.5 ${isMobile ? 'grid-cols-6' : 'grid-cols-12'}`}>
            {row.map((key) => (
              <button
                key={key.glyph}
                onClick={() => append(key.glyph)}
                disabled={status !== 'active'}
                aria-label={key.name}
                title={key.name}
                className="h-10 sm:h-11 rounded-md font-bold text-xl flex items-center justify-center"
                style={keyStyle}
              >
                {key.glyph}
              </button>
            ))}
          </div>
        ))}
        {/* The naming dot and the punctuation Shavian borrows unchanged
            from English — needed once prompts are whole sentences. */}
        <div className="flex justify-center gap-1.5">
          {[NAMING_DOT, ...PUNCTUATION_KEYS].map((key) => (
            <button
              key={key.glyph}
              onClick={() => append(key.glyph)}
              disabled={status !== 'active'}
              aria-label={key.name}
              title={key.name}
              className="h-10 sm:h-11 flex-1 max-w-[70px] rounded-md font-bold text-xl flex items-center justify-center"
              style={{
                ...keyStyle,
                // The naming dot and the full stop are the same mark at
                // different heights — gap them so they don't read as one
                // pair of near-identical keys.
                ...(key === NAMING_DOT ? { marginRight: 14 } : null),
              }}
            >
              {key.glyph}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          <button
            onClick={() => append(SPACE_KEY.glyph)}
            disabled={status !== 'active' || typedValue.length === 0}
            aria-label={SPACE_KEY.name}
            title={SPACE_KEY.name}
            className="h-10 sm:h-11 flex-1 rounded-md text-xs font-medium tracking-wide flex items-center justify-center"
            style={keyStyle}
          >
            {SPACE_KEY.name}
          </button>
          <button
            onClick={() => onTypeChange([...typedValue].slice(0, -1).join(''))}
            disabled={status !== 'active' || typedValue.length === 0}
            aria-label="delete last letter"
            title="delete last letter"
            className="h-10 sm:h-11 w-[28%] rounded-md flex items-center justify-center"
            style={keyStyle}
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
