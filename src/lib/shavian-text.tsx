import { Fragment } from 'react';
import { Kbd } from '@/components/ui/kbd';

const SHAVIAN_RUN = /[\u{10450}-\u{1047F}]+/gu;

export function renderWithGlyphChips(text: string) {
  const parts = text.split(SHAVIAN_RUN);
  const glyphs = text.match(SHAVIAN_RUN) ?? [];

  return parts.flatMap((part, i) => {
    const nodes = [<Fragment key={`t${i}`}>{part}</Fragment>];
    if (i < glyphs.length) {
      nodes.push(
        <Kbd key={`g${i}`} className="mx-0.5 h-auto min-w-0 px-1.5 py-0.5 text-base font-bold text-foreground">
          {glyphs[i]}
        </Kbd>
      );
    }
    return nodes;
  });
}
