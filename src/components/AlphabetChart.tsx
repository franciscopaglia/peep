import { cn } from '@/lib/utils';

const SHAVIAN_ALPHABET = [
  { glyph: '𐑐', sound: 'peep', key: 'p', ipa: 'p', example: '𐑐𐑧𐑯', exampleEn: 'pen' },
  { glyph: '𐑑', sound: 'tot', key: 't', ipa: 't', example: '𐑑𐑧𐑯', exampleEn: 'ten' },
  { glyph: '𐑒', sound: 'kick', key: 'k', ipa: 'k', example: '𐑒𐑨𐑑', exampleEn: 'cat' },
  { glyph: '𐑓', sound: 'fee', key: 'f', ipa: 'f', example: '𐑓𐑳𐑯', exampleEn: 'fun' },
  { glyph: '𐑔', sound: 'thigh', key: 'th', ipa: 'θ', example: '𐑔𐑦𐑯', exampleEn: 'thin' },
  { glyph: '𐑕', sound: 'so', key: 's', ipa: 's', example: '𐑕𐑳𐑯', exampleEn: 'sun' },
  { glyph: '𐑖', sound: 'sure', key: 's', ipa: 'ʃ', example: '𐑖𐑪𐑐', exampleEn: 'shop' },
  { glyph: '𐑗', sound: 'church', key: 'ch', ipa: 'tʃ', example: '𐑗𐑦𐑐', exampleEn: 'chip' },
  { glyph: '𐑘', sound: 'yea', key: 'y', ipa: 'j', example: '𐑘𐑧𐑕', exampleEn: 'yes' },
  { glyph: '𐑙', sound: 'hung', key: 'ng', ipa: 'ŋ', example: '𐑕𐑦𐑙', exampleEn: 'sing' },
  { glyph: '𐑚', sound: 'bib', key: 'b', ipa: 'b', example: '𐑚𐑧𐑛', exampleEn: 'bed' },
  { glyph: '𐑛', sound: 'dead', key: 'd', ipa: 'd', example: '𐑛𐑪𐑜', exampleEn: 'dog' },
  { glyph: '𐑜', sound: 'gag', key: 'g', ipa: 'ɡ', example: '𐑜𐑨𐑐', exampleEn: 'gap' },
  { glyph: '𐑝', sound: 'vow', key: 'v', ipa: 'v', example: '𐑝𐑨𐑯', exampleEn: 'van' },
  { glyph: '𐑞', sound: 'they', key: 'th', ipa: 'ð', example: '𐑞𐑦𐑕', exampleEn: 'this' },
  { glyph: '𐑟', sound: 'zoo', key: 'z', ipa: 'z', example: '𐑟𐑦𐑐', exampleEn: 'zip' },
  { glyph: '𐑠', sound: 'measure', key: 's', ipa: 'ʒ', example: '𐑝𐑦𐑠𐑩𐑯', exampleEn: 'vision' },
  { glyph: '𐑡', sound: 'judge', key: 'j', ipa: 'dʒ', example: '𐑡𐑨𐑥', exampleEn: 'jam' },
  { glyph: '𐑢', sound: 'woe', key: 'w', ipa: 'w', example: '𐑢𐑦𐑯', exampleEn: 'win' },
  { glyph: '𐑣', sound: 'ha-ha', key: 'h', ipa: 'h', example: '𐑣𐑨𐑑', exampleEn: 'hat' },
  { glyph: '𐑤', sound: 'lull', key: 'l', ipa: 'l', example: '𐑤𐑧𐑜', exampleEn: 'leg' },
  { glyph: '𐑥', sound: 'mime', key: 'm', ipa: 'm', example: '𐑥𐑨𐑯', exampleEn: 'man' },
  { glyph: '𐑦', sound: 'if', key: 'i', ipa: 'ɪ', example: '𐑐𐑦𐑯', exampleEn: 'pin' },
  { glyph: '𐑧', sound: 'egg', key: 'e', ipa: 'ɛ', example: '𐑜𐑧𐑑', exampleEn: 'get' },
  { glyph: '𐑨', sound: 'ash', key: 'a', ipa: 'æ', example: '𐑚𐑨𐑜', exampleEn: 'bag' },
  { glyph: '𐑩', sound: 'ado', key: 'a', ipa: 'ə', example: '𐑩𐑚𐑬𐑑', exampleEn: 'about' },
  { glyph: '𐑪', sound: 'on', key: 'o', ipa: 'ɒ', example: '𐑣𐑪𐑑', exampleEn: 'hot' },
  { glyph: '𐑫', sound: 'wool', key: 'oo', ipa: 'ʊ', example: '𐑚𐑫𐑒', exampleEn: 'book' },
  { glyph: '𐑬', sound: 'out', key: 'ou', ipa: 'aʊ', example: '𐑒𐑬', exampleEn: 'cow' },
  { glyph: '𐑭', sound: 'ah', key: 'a', ipa: 'ɑː', example: '𐑐𐑭𐑥', exampleEn: 'palm' },
  { glyph: '𐑮', sound: 'roar', key: 'r', ipa: 'r', example: '𐑮𐑳𐑯', exampleEn: 'run' },
  { glyph: '𐑯', sound: 'nun', key: 'n', ipa: 'n', example: '𐑯𐑧𐑑', exampleEn: 'net' },
  { glyph: '𐑰', sound: 'eat', key: 'ea', ipa: 'iː', example: '𐑕𐑰', exampleEn: 'see' },
  { glyph: '𐑱', sound: 'age', key: 'a', ipa: 'eɪ', example: '𐑛𐑱', exampleEn: 'day' },
  { glyph: '𐑲', sound: 'ice', key: 'i', ipa: 'aɪ', example: '𐑑𐑲𐑥', exampleEn: 'time' },
  { glyph: '𐑳', sound: 'up', key: 'u', ipa: 'ʌ', example: '𐑒𐑳𐑐', exampleEn: 'cup' },
  { glyph: '𐑴', sound: 'oak', key: 'oa', ipa: 'oʊ', example: '𐑜𐑴', exampleEn: 'go' },
  { glyph: '𐑵', sound: 'ooze', key: 'oo', ipa: 'uː', example: '𐑑𐑵', exampleEn: 'two' },
  { glyph: '𐑶', sound: 'oil', key: 'oi', ipa: 'ɔɪ', example: '𐑚𐑶', exampleEn: 'boy' },
  { glyph: '𐑷', sound: 'awe', key: 'aw', ipa: 'ɔː', example: '𐑤𐑷', exampleEn: 'law' },
  { glyph: '𐑸', sound: 'are', key: 'ar', ipa: 'ɑːr', example: '𐑒𐑸', exampleEn: 'car' },
  { glyph: '𐑹', sound: 'or', key: 'or', ipa: 'ɔːr', example: '𐑓𐑹', exampleEn: 'for' },
  { glyph: '𐑺', sound: 'air', key: 'ai', ipa: 'ɛər', example: '𐑣𐑺', exampleEn: 'hair' },
  { glyph: '𐑻', sound: 'err', key: 'er', ipa: 'ɜːr', example: '𐑣𐑻', exampleEn: 'her' },
  { glyph: '𐑼', sound: 'array', key: 'a', ipa: 'ər', example: '𐑚𐑧𐑑𐑼', exampleEn: 'better' },
  { glyph: '𐑽', sound: 'ear', key: 'ea', ipa: 'ɪər', example: '𐑣𐑽', exampleEn: 'here' },
  { glyph: '𐑾', sound: 'ian', key: 'ia', ipa: 'jə', example: '𐑳𐑯𐑾𐑯', exampleEn: 'onion' },
  { glyph: '𐑿', sound: 'yew', key: 'yew', ipa: 'juː', example: '𐑓𐑿', exampleEn: 'few' },
];

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

export function AlphabetChart({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3 flex-wrap justify-center', className)}>
      {SHAVIAN_ALPHABET.map((g) => (
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

export function AlphabetReferenceTable({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-2', className)} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
      {SHAVIAN_ALPHABET.map((g) => (
        <div
          key={g.glyph}
          className="flex items-center gap-3 p-3 rounded-btn bg-card border border-border shadow-sm"
        >
          <span className="flex-none text-[26px] font-bold text-foreground w-10 text-center">
            {g.glyph}
          </span>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="text-[13px] font-semibold text-foreground">
              {boldKey(g.sound, g.key)}{' '}
              <span className="font-mono text-[11px] font-normal text-muted-foreground">
                ({g.ipa})
              </span>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              <span className="font-semibold text-foreground">{g.example}</span> — {g.exampleEn}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
