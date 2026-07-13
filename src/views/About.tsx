import { Landmark } from 'lucide-react';
import { AlphabetReferenceTable } from '@/components/AlphabetChart';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/Button';

const ABOUT_SECTIONS = [
  {
    id: 'what-is-shavian',
    h: 'What is Shavian?',
    p: 'Shavian is an alphabet for writing English by sound rather than by traditional spelling. Each letter stands for a single sound, so words are written the way they are spoken — no silent letters, no puzzling exceptions.',
  },
  {
    id: 'one-sound-one-symbol',
    h: 'One sound, one symbol',
    p: 'The alphabet has 48 letters, grouped into tall, deep and short letters by their shape. There are no capital letters and no joined-up writing; a small dot marks proper names instead.',
  },
  {
    id: 'where-it-came-from',
    h: 'Where it came from',
    p: 'George Bernard Shaw spent much of his life arguing that English spelling wasted time and taught pronunciation badly. His will asked for a new alphabet of at least 40 letters, one symbol per sound, with no letter combinations or diacritics allowed. A worldwide competition followed, and the winning design — refined by Kingsley Read — was first published in 1962 in a special edition of Shaw’s play “Androcles and the Lion”.',
  },
  {
    id: 'why-learn-it',
    h: 'Why learn it?',
    p: 'Learning Shavian is a playful way to think about the real sounds of English, to write quickly and compactly, and to read and share notes with fellow enthusiasts. This site takes you from your very first letter to whole sentences.',
  },
];

const TOC = [
  ...ABOUT_SECTIONS.map((s) => ({ id: s.id, label: s.h })),
  { id: 'three-shapes', label: 'The three shapes' },
  { id: 'history', label: 'A short history' },
  { id: 'spelling', label: 'How spelling works' },
  { id: 'accents', label: 'One alphabet, many accents' },
  { id: 'alphabet-reference', label: 'The full alphabet, with examples' },
  { id: 'sentences', label: 'Sentences in Shavian' },
];

const LETTER_GROUPS = [
  { label: 'Tall', glyphs: '𐑐 𐑑 𐑒 𐑓', note: 'Rise above the line — the voiceless sounds' },
  { label: 'Deep', glyphs: '𐑚 𐑛 𐑜 𐑝', note: 'Drop below the line — their voiced partners' },
  { label: 'Short', glyphs: '𐑨 𐑦 𐑪 𐑳', note: 'Compact letters — mostly the vowels' },
];

const TIMELINE = [
  {
    year: '1950',
    text: 'George Bernard Shaw dies, leaving money in his will for a "Proposed British Alphabet" of at least 40 phonetic letters.',
  },
  {
    year: '1957',
    text: 'After legal challenges from the British Museum and RADA, a settlement finally releases funds — about £8,300 — for the project.',
  },
  {
    year: '1958',
    text: 'A worldwide design competition draws 467 entries; the £500 prize is split between four entrants, including Kingsley Read.',
  },
  {
    year: '1960',
    text: 'Kingsley Read completes the refined alphabet on 18 August, working with phonetician Peter MacCarthy.',
  },
  {
    year: '1962',
    text: 'The alphabet debuts publicly in a special Shavian edition of “Androcles and the Lion”, alongside the ordinary spelling.',
  },
  {
    year: 'Today',
    text: 'A small but active community keeps reading, writing and typing in Shavian — this app is part of that tradition.',
  },
];

const SENTENCE_EXAMPLES = [
  { glyph: '𐑞 𐑒𐑨𐑑 𐑕𐑨𐑑', en: 'the cat sat' },
  { glyph: '𐑲 𐑕𐑰 𐑞 𐑛𐑪𐑜', en: 'I see the dog' },
  { glyph: '𐑖𐑰 𐑣𐑨𐑟 𐑩 𐑚𐑦𐑜 𐑒𐑨𐑑', en: 'she has a big cat' },
  { glyph: '·𐑕𐑨𐑥 𐑦𐑟 𐑣𐑽', en: 'Sam is here' },
];

const SPELLING_NOTES = [
  {
    h: 'A handful of fixed spellings',
    p: 'Sound-by-sound spelling has a few practical exceptions: the, of, and, to and for are so common they get their own fixed shorthand forms, and a/an are always written with the unstressed schwa 𐑩, never spelled out in full.',
  },
  {
    h: 'Stress changes the vowel',
    p: 'Shavian writes what you actually say, so the same word can shift letters with stress — "únnatural" takes the full 𐑳, while the unstressed prefix in "untíl" takes the light 𐑩. Pairs like Mary/merry/marry or cot/caught are kept distinct on purpose.',
  },
  {
    h: 'No apostrophes needed',
    p: 'Possessives and contractions drop the apostrophe entirely, since it never stood for a sound — "didn’t" is simply written as it’s spoken, letter for letter.',
  },
];

const ACCENT_NOTES = [
  'Shavian isn’t built around one "correct" accent. Standard spelling keeps the same vowel count as British RP, while also preserving rhoticity — the pronounced final R — found in most North American, Irish and Scottish speech.',
  'A word like are is always spelled with 𐑸, whether or not a reader pronounces the final R. Rhotic and non-rhotic speakers read the same letters back in their own accent, without needing separate spellings.',
  'Even accents that diverge sharply — American English lacks the short-O vowel RP has, and Australian and English speakers don’t quite agree on the STRUT vowel — still share the same 48 letters and the same spellings.',
];

function SourceNote({ href, label }: { href: string; label: string }) {
  return (
    <p className="text-xs text-muted-foreground mt-4">
      Source:{' '}
      <a href={href} target="_blank" rel="noopener" className="text-accent underline">
        {label}
      </a>
      , the Shavian community reference.
    </p>
  );
}

export function About({ onOpenApp }: { onOpenApp: () => void }) {
  return (
    <div className="max-w-[960px] mx-auto px-6 pt-[72px] pb-24 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] flex-none rounded-btn bg-accent-soft text-accent flex items-center justify-center">
          <Landmark size={26} />
        </div>
        <h1 className="text-[40px] font-extrabold tracking-tight text-foreground m-0">
          About Shavian
        </h1>
      </div>
      <p className="text-lg leading-relaxed text-muted-foreground m-0 max-w-[720px]">
        A brief introduction to the alphabet you are learning — where it comes from, how
        it works, and a full reference to come back to any time.
      </p>

      <nav className="mt-4 p-5 rounded-card bg-card border border-border shadow-sm max-w-[720px]">
        <SectionLabel className="mb-3">On this page</SectionLabel>
        <ul className="m-0 p-0 list-none flex flex-wrap gap-x-5 gap-y-2">
          {TOC.map((t) => (
            <li key={t.id} className="whitespace-nowrap">
              <a href={`#${t.id}`} className="text-sm text-accent hover:underline">
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-9 mt-6 max-w-[720px]">
        {ABOUT_SECTIONS.map((s) => (
          <div key={s.h} id={s.id} className="flex flex-col gap-2.5 scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight text-foreground m-0">{s.h}</h2>
            <p className="text-base leading-loose text-muted-foreground m-0">{s.p}</p>
          </div>
        ))}
      </div>

      <div id="three-shapes" className="mt-7 max-w-[720px] scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          The three shapes
        </h2>
        <div className="flex gap-3.5 flex-wrap">
          {LETTER_GROUPS.map((g) => (
            <div
              key={g.label}
              className="flex-1 min-w-[180px] p-5 rounded-card bg-card border border-border shadow-sm flex flex-col gap-2 items-center text-center"
            >
              <div className="text-xs font-semibold tracking-wide uppercase text-accent">
                {g.label}
              </div>
              <div className="text-[32px] font-bold text-foreground">{g.glyphs}</div>
              <div className="text-[13px] leading-relaxed text-muted-foreground">
                {g.note}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground mt-4">
          Kingsley Read gave each word a distinctive silhouette, so that with practice you
          recognize shapes on sight instead of sounding out every letter — and the whole
          system reads in roughly two-thirds the space traditional English spelling takes.
        </p>
        <SourceNote href="https://shavian.info/alphabet/" label="shavian.info/alphabet" />
      </div>

      <div id="history" className="mt-7 max-w-[720px] scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          A short history
        </h2>
        <div className="flex flex-col gap-[18px]">
          {TIMELINE.map((t) => (
            <div key={t.year} className="flex gap-4 items-start">
              <div className="flex-none font-mono text-[13px] font-semibold text-accent bg-accent-soft px-2.5 py-1.5 rounded-btn">
                {t.year}
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground pt-[3px]">
                {t.text}
              </div>
            </div>
          ))}
        </div>
        <SourceNote href="https://shavian.info/" label="shavian.info" />
      </div>

      <div id="spelling" className="mt-7 max-w-[720px] scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          How spelling works
        </h2>
        <div className="flex flex-col gap-6">
          {SPELLING_NOTES.map((s) => (
            <div key={s.h} className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-foreground m-0">{s.h}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground m-0">{s.p}</p>
            </div>
          ))}
        </div>
        <SourceNote href="https://shavian.info/spelling/" label="shavian.info/spelling" />
      </div>

      <div id="accents" className="mt-7 max-w-[720px] scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          One alphabet, many accents
        </h2>
        <div className="flex flex-col gap-3">
          {ACCENT_NOTES.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground m-0">
              {p}
            </p>
          ))}
        </div>
        <SourceNote href="https://shavian.info/accents/" label="shavian.info/accents" />
      </div>

      <div id="alphabet-reference" className="mt-7 scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          The full alphabet, with examples
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-[560px] mb-7">
          All 48 letters, each with its naming word, IPA value and a short example word
          spelled in Shavian — the place to come back to when a sound slips your mind.
        </p>
        <AlphabetReferenceTable className="w-full" />
      </div>

      <div id="sentences" className="mt-7 max-w-[720px] scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          Sentences in Shavian
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          Sentences read left to right, word by word, spelled exactly as they sound. A
          small dot before a word — like ·Sam — marks it as a name in place of a capital
          letter.
        </p>
        <div className="flex flex-col gap-3">
          {SENTENCE_EXAMPLES.map((s, i) => (
            <div
              key={i}
              className="p-5 rounded-card bg-card border border-border shadow-sm flex flex-col gap-1.5"
            >
              <span className="text-2xl font-bold text-foreground">{s.glyph}</span>
              <span className="text-sm text-muted-foreground">“{s.en}”</span>
            </div>
          ))}
        </div>
      </div>

      <Button className="self-start mt-4" onClick={onOpenApp}>
        Start learning
      </Button>
    </div>
  );
}
