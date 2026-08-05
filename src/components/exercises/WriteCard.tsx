import { Delete } from 'lucide-react';
import type { WriteExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { answerColors, enterAnimation, poolTileStyle } from '@/lib/exercise-style';
import { keyboardRows, NAMING_DOT, PUNCTUATION_KEYS, SPACE_KEY } from '@/lib/shavian-keyboard';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * Spell the prompt in Shavian on the on-screen keyboard.
 *
 * The 48 letters are always there, but the space, the naming dot and the
 * borrowed punctuation appear only for an answer that uses them. A learner
 * meeting the keyboard for the first time in lesson 46 is spelling single
 * words, and five keys they have no use for are five keys in the way; the
 * space arrives in lesson 49 with the first phrase, and the stops in 52 with
 * the first sentence, which is exactly the story those lessons tell.
 *
 * Derived from the answer rather than authored, so it cannot drift from the
 * content — and seeing a space key is a fair hint that the answer has two
 * words, which the English prompt already said.
 */
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

  // Every spelling this exercise accepts, so an alternate that needs a key
  // still gets one. Joined with nothing, or the join itself would look like a
  // space every answer needed.
  const answers = [exercise.correct, ...(exercise.accept ?? [])];
  const needsSpace = answers.some((answer) => answer.trim().includes(' '));
  const extraKeys = [NAMING_DOT, ...PUNCTUATION_KEYS].filter((key) =>
    answers.some((answer) => answer.includes(key.glyph))
  );

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
        {/* The naming dot and the punctuation Shavian borrows unchanged from
            English, shown only when this answer uses them — see `extraKeys`. */}
        {extraKeys.length > 0 && (
          <div className="flex justify-center gap-1.5">
            {extraKeys.map((key) => (
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
                  ...(key === NAMING_DOT && extraKeys.length > 1 ? { marginRight: 14 } : null),
                }}
              >
                {key.glyph}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-1.5">
          {needsSpace && (
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
          )}
          <button
            onClick={() => onTypeChange([...typedValue].slice(0, -1).join(''))}
            disabled={status !== 'active' || typedValue.length === 0}
            aria-label="delete last letter"
            title="delete last letter"
            className={`h-10 sm:h-11 rounded-md flex items-center justify-center ${
              needsSpace ? 'w-[28%]' : 'flex-1'
            }`}
            style={keyStyle}
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
