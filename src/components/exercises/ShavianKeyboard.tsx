import { Delete } from 'lucide-react';
import type { Status } from '@/lib/lesson-machine';
import { answerColors, poolTileStyle } from '@/lib/exercise-style';
import { keyboardRows, NAMING_DOT, PUNCTUATION_KEYS, SPACE_KEY } from '@/lib/shavian-keyboard';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * The on-screen Shavian keyboard, with the answer written above it — shared by
 * `write` (spell the English prompt) and `listen` dictation (spell what you
 * heard). The only difference between those is what the learner is given; the
 * typing is identical, so it lives here once.
 *
 * The 48 letters are always there, but the space, the naming dot and the
 * borrowed punctuation appear only for an answer that uses them. A learner
 * meeting the keyboard for the first time in lesson 46 is spelling single
 * words, and five keys they have no use for are five keys in the way; the
 * space arrives in lesson 49 with the first phrase, and the stops in 54 with
 * the first sentence, which is exactly the story those lessons tell.
 *
 * Derived from `answers` rather than authored, so it cannot drift from the
 * content — and seeing a space key is a fair hint that the answer has two
 * words, which the prompt already said.
 */
export function ShavianKeyboard({
  answers,
  typedValue,
  status,
  onTypeChange,
}: {
  /** Every spelling accepted, so an alternate that needs a key still gets one. */
  answers: string[];
  typedValue: string;
  status: Status;
  onTypeChange: (value: string) => void;
}) {
  // On narrow screens the keyboard splits its 12-key rows into interleaved
  // half-rows of 6 (pairing preserved) so keys stay tappable.
  const isMobile = useIsMobile();
  const lit = answerColors(status);
  const dim = answerColors(status, false);
  const keyStyle = poolTileStyle(false, status);
  const append = (glyph: string) => onTypeChange(typedValue + glyph);

  const needsSpace = answers.some((answer) => answer.trim().includes(' '));
  const extraKeys = [NAMING_DOT, ...PUNCTUATION_KEYS].filter((key) =>
    answers.some((answer) => answer.includes(key.glyph))
  );

  return (
    <>
      <div
        className="flex items-center justify-center text-[26px] sm:text-[32px] font-bold tracking-wide min-h-[44px] sm:min-h-[58px]"
        style={{
          minWidth: 220,
          borderBottom: `2px dashed ${typedValue ? lit.border : dim.border}`,
          color: typedValue ? lit.color : 'var(--muted-foreground)',
          padding: '0 20px 6px',
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
            English, shown only when this answer uses them. */}
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
    </>
  );
}
