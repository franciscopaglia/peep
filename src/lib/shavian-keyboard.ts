// The on-screen Shavian keyboard used by `write` exercises.
//
// Real-world Shavian layouts (Shaw JAFL, Shaw QWERTY, Shaw Imperial) are
// optimized for typists; learners hunt letters by sound family instead. So
// this keyboard uses the official reading-key chart arrangement the lessons
// teach: each tall letter sits directly above its deep partner, and each
// short vowel directly above its long partner.
export type ShavianKey = { glyph: string; name: string };

const k = (glyph: string, name: string): ShavianKey => ({ glyph, name });

export const SHAVIAN_KEY_ROWS: ShavianKey[][] = [
  [
    k('𐑐', 'peep'), k('𐑑', 'tot'), k('𐑒', 'kick'), k('𐑓', 'fee'),
    k('𐑔', 'thigh'), k('𐑕', 'so'), k('𐑖', 'sure'), k('𐑗', 'church'),
    k('𐑘', 'yea'), k('𐑙', 'hung'), k('𐑤', 'lull'), k('𐑥', 'mime'),
  ],
  [
    k('𐑚', 'bib'), k('𐑛', 'dead'), k('𐑜', 'gag'), k('𐑝', 'vow'),
    k('𐑞', 'they'), k('𐑟', 'zoo'), k('𐑠', 'measure'), k('𐑡', 'judge'),
    k('𐑢', 'woe'), k('𐑣', 'ha-ha'), k('𐑮', 'roar'), k('𐑯', 'nun'),
  ],
  [
    k('𐑦', 'if'), k('𐑧', 'egg'), k('𐑨', 'ash'), k('𐑩', 'ado'),
    k('𐑪', 'on'), k('𐑫', 'wool'), k('𐑬', 'out'), k('𐑭', 'ah'),
    k('𐑸', 'are'), k('𐑺', 'air'), k('𐑼', 'array'), k('𐑾', 'ian'),
  ],
  [
    k('𐑰', 'eat'), k('𐑱', 'age'), k('𐑲', 'ice'), k('𐑳', 'up'),
    k('𐑴', 'oak'), k('𐑵', 'ooze'), k('𐑶', 'oil'), k('𐑷', 'awe'),
    k('𐑹', 'or'), k('𐑻', 'err'), k('𐑽', 'ear'), k('𐑿', 'yew'),
  ],
];

export const NAMING_DOT: ShavianKey = { glyph: '·', name: 'naming dot' };

/**
 * The rows to render at the given width. On narrow screens each 12-key row
 * splits in two — but interleaved by row *pair*, so every deep letter stays
 * directly under its tall partner and every long vowel under its short one.
 */
export function keyboardRows(split: boolean): ShavianKey[][] {
  if (!split) return SHAVIAN_KEY_ROWS;
  const half = SHAVIAN_KEY_ROWS[0].length / 2;
  const rows: ShavianKey[][] = [];
  for (let pair = 0; pair < SHAVIAN_KEY_ROWS.length; pair += 2) {
    const [top, bottom] = [SHAVIAN_KEY_ROWS[pair], SHAVIAN_KEY_ROWS[pair + 1]];
    rows.push(top.slice(0, half), bottom.slice(0, half));
    rows.push(top.slice(half), bottom.slice(half));
  }
  return rows;
}
