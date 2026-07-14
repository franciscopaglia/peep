import { Fragment, type ReactNode } from 'react';
import { Chip } from '@/components/Chip';

const SHAVIAN_RUN = /[\u{10450}-\u{1047F}]+/gu;
// `[[ … ]]` wraps a span that should render as ONE chip (e.g. a whole sentence)
// rather than one chip per space-separated word.
const PHRASE = /\[\[([^\]]+)\]\]/g;

const CHIP_CLASS = 'text-base font-bold text-foreground';

// Chip each run of Shavian letters within a plain stretch of text.
function chipWords(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(SHAVIAN_RUN);
  const glyphs = text.match(SHAVIAN_RUN) ?? [];
  return parts.flatMap((part, i) => {
    const nodes: ReactNode[] = [<Fragment key={`${keyBase}t${i}`}>{part}</Fragment>];
    if (i < glyphs.length) {
      nodes.push(
        <Chip key={`${keyBase}g${i}`} className={CHIP_CLASS}>
          {glyphs[i]}
        </Chip>
      );
    }
    return nodes;
  });
}

export function renderWithGlyphChips(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  PHRASE.lastIndex = 0;
  while ((m = PHRASE.exec(text)) !== null) {
    if (m.index > last) out.push(...chipWords(text.slice(last, m.index), `s${n}`));
    // A whole [[…]] span becomes a single, wrappable chip.
    out.push(
      <Chip key={`phrase${n}`} className={`${CHIP_CLASS} max-w-full text-center`}>
        {m[1]}
      </Chip>
    );
    last = m.index + m[0].length;
    n++;
  }
  if (last < text.length) out.push(...chipWords(text.slice(last), 'end'));
  return out;
}
