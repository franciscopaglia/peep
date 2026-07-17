import { SHAVIAN_ALPHABET, lettersFor, type ShavianLetter } from '@/lib/shavian-alphabet';
import { SpeakButton } from '@/components/SpeakButton';
import { cn } from '@/lib/utils';

/**
 * Highlight the letters of a name that spell the sound ("p" in "peep"). The
 * key sits at full foreground weight while the rest of the name stays muted
 * (the callers set the muted base), so the contrast is dark-vs-grey rather
 * than an extra colour. Weight alone can't carry it — the names are semibold,
 * so bolding was a 600-vs-800 difference in one colour and read as none.
 */
function boldKey(word: string, key: string) {
  const parts = word.split(new RegExp(`(${key})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === key.toLowerCase() ? (
      <strong key={i} className="font-extrabold text-foreground">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// `glyphs` narrows the list to those letters, in the order given; omit for all 48.
function select(glyphs?: string[]): ShavianLetter[] {
  return glyphs ? lettersFor(glyphs) : SHAVIAN_ALPHABET;
}

export function AlphabetChart({ className, glyphs }: { className?: string; glyphs?: string[] }) {
  return (
    <div className={cn('flex gap-3 flex-wrap justify-center', className)}>
      {select(glyphs).map((g) => (
        <div
          key={g.glyph}
          className="flex-none w-20 h-[86px] rounded-btn bg-card border border-border shadow-sm flex flex-col items-center justify-center gap-1"
        >
          <span className="text-[28px] font-bold text-foreground">{g.glyph}</span>
          <span className="font-mono text-[11px] text-muted-foreground px-1 text-center leading-tight flex flex-col items-center">
            <span>{boldKey(g.sound, g.key)}</span>
            <span className="text-[10px]">({g.ipa})</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// `speak` adds a per-letter speaker button that reads the letter's name aloud.
export function AlphabetReferenceTable({
  className,
  glyphs,
  speak = false,
}: {
  className?: string;
  glyphs?: string[];
  speak?: boolean;
}) {
  return (
    <div className={cn('grid gap-2', className)} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
      {select(glyphs).map((g) => (
        <div
          key={g.glyph}
          className="flex items-center gap-3 p-3 rounded-btn bg-card border border-border shadow-sm text-left"
        >
          <span className="flex-none text-[26px] font-bold text-foreground w-10 text-center">
            {g.glyph}
          </span>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Mono, normal-weight base — matches the Landing chart, so the
                extrabold key stands out instead of the whole name reading bold. */}
            <div className="font-mono text-[13px] text-muted-foreground">
              {boldKey(g.sound, g.key)}{' '}
              <span className="text-[11px] font-normal text-muted-foreground">
                ({g.ipa})
              </span>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              <span className="font-semibold text-foreground">{g.example}</span> — {g.exampleEn}
            </div>
          </div>
          {speak && <SpeakButton text={g.sound} label={`Hear “${g.sound}” read aloud`} />}
        </div>
      ))}
    </div>
  );
}
