import { Fragment } from 'react';
import { Chip } from '@/components/Chip';

const SHAVIAN_RUN = /[\u{10450}-\u{1047F}]+/gu;

export function renderWithGlyphChips(text: string) {
  const parts = text.split(SHAVIAN_RUN);
  const glyphs = text.match(SHAVIAN_RUN) ?? [];

  return parts.flatMap((part, i) => {
    const nodes = [<Fragment key={`t${i}`}>{part}</Fragment>];
    if (i < glyphs.length) {
      nodes.push(
        <Chip key={`g${i}`} className="text-base font-bold text-foreground">
          {glyphs[i]}
        </Chip>
      );
    }
    return nodes;
  });
}
