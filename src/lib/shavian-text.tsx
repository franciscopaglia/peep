import { Fragment, type ReactNode } from 'react';
import { Chip } from '@/components/Chip';

const SHAVIAN_RUN = /[\u{10450}-\u{1047F}]+/gu;
// `[[ … ]]` wraps a span that should render as ONE chip (e.g. a short phrase)
// rather than one chip per space-separated word. `{{ … }}` wraps a passage
// that renders as a full-width display block — the home for whole sentences
// and dialogue, punctuation and all, instead of chips chopped at every stop.
const MARKUP = /\[\[([^\]]+)\]\]|\{\{([^}]+)\}\}/g;

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
  MARKUP.lastIndex = 0;
  while ((m = MARKUP.exec(text)) !== null) {
    if (m.index > last) out.push(...chipWords(text.slice(last, m.index), `s${n}`));
    if (m[1] !== undefined) {
      // A whole [[…]] span becomes a single, wrappable chip.
      out.push(
        <Chip key={`phrase${n}`} className={`${CHIP_CLASS} max-w-full text-center`}>
          {m[1]}
        </Chip>
      );
    } else {
      // A {{…}} passage becomes a display block, read like a quoted page.
      out.push(
        <div
          key={`block${n}`}
          className="my-3 px-5 py-4 rounded-card border border-border bg-card text-[21px] leading-[1.8] font-semibold text-foreground"
        >
          {m[2].trim()}
        </div>
      );
    }
    last = m.index + m[0].length;
    n++;
  }
  if (last < text.length) out.push(...chipWords(text.slice(last), 'end'));
  return out;
}
