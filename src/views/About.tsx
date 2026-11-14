import { ArrowRight, ArrowDown, ChevronDown } from 'lucide-react';
import { AlphabetExplorer } from '@/components/AlphabetExplorer';
import { PageIntro } from '@/components/PageIntro';
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

function Contents() {
  return (
    <nav aria-label="About page sections">
      <ul className="grid gap-1">
        {TOC.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded-btn px-3 py-2.5 text-sm leading-snug text-muted-foreground hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function About({ onOpenApp }: { onOpenApp: () => void }) {
  return (
    <main>
      <PageIntro eyebrow="A guide to the alphabet" title="About Shavian" actions={
        <>
          <a href="#alphabet-reference" className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-accent-border bg-card px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Find a letter<ArrowDown size={16} aria-hidden="true" /></a>
          <a href="#spelling" className="inline-flex min-h-11 items-center rounded-btn px-3 text-sm font-semibold text-foreground hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">How spelling works</a>
        </>
      }>
        The same English, a different alphabet. Get to know the shapes, explore its story,
        or look up a letter whenever you need a reminder.
      </PageIntro>

      <div className="mx-auto grid max-w-[1120px] items-start gap-10 px-6 py-8 sm:px-8 sm:py-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <SectionLabel className="mb-3 px-3">On this page</SectionLabel>
          <Contents />
        </aside>
        <div className="min-w-0">
          <details className="group mb-10 rounded-xl border border-border bg-card lg:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">On this page<ChevronDown size={17} aria-hidden="true" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
            <div className="border-t border-border p-2"><Contents /></div>
          </details>

          <div className="grid gap-9">
            {ABOUT_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{section.h}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{section.p}</p>
              </section>
            ))}
          </div>

          <section id="three-shapes" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">The three shapes</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {LETTER_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wide text-accent">{group.label}</div>
                  <div className="text-[32px] text-foreground">{group.glyphs}</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{group.note}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Kingsley Read gave each word a distinctive silhouette, so that with practice you recognize shapes on sight instead of sounding out every letter — and the whole system reads in roughly two-thirds the space traditional English spelling takes.</p>
            <SourceNote href="https://shavian.info/alphabet/" label="shavian.info/alphabet" />
          </section>

          <section id="history" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">A short history</h2>
            <ol className="ml-2 border-l border-accent-border">
              {TIMELINE.map((item) => (
                <li key={item.year} className="relative pb-6 pl-6 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-accent bg-background" />
                  <div className="font-mono text-sm font-semibold text-accent">{item.year}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ol>
            <SourceNote href="https://shavian.info/" label="shavian.info" />
          </section>

          <section id="spelling" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">How spelling works</h2>
            <div className="grid gap-6">
              {SPELLING_NOTES.map((note) => (
                <div key={note.h}>
                  <h3 className="text-base font-semibold text-foreground">{note.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.p}</p>
                </div>
              ))}
            </div>
            <SourceNote href="https://shavian.info/spelling/" label="shavian.info/spelling" />
          </section>

          <section id="accents" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">One alphabet, many accents</h2>
            <div className="grid gap-3">
              {ACCENT_NOTES.map((paragraph) => <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">{paragraph}</p>)}
            </div>
            <SourceNote href="https://shavian.info/accents/" label="shavian.info/accents" />
          </section>

          <section id="alphabet-reference" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">The full alphabet, with examples</h2>
            <p className="mb-6 mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">All 48 letters, with their naming words, IPA sounds and example words. The highlighted part of each name tells you the letter’s sound.</p>
            <AlphabetExplorer />
          </section>

          <section id="sentences" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sentences in Shavian</h2>
            <p className="mb-5 mt-3 text-sm leading-relaxed text-muted-foreground">Sentences read left to right, word by word, spelled exactly as they sound. A small dot before a word — like ·Sam — marks it as a name in place of a capital letter.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SENTENCE_EXAMPLES.map((sentence) => (
                <div key={sentence.en} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-2xl leading-relaxed text-foreground">{sentence.glyph}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{sentence.en}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mb-4 mt-12 rounded-xl border border-accent-border bg-accent-soft p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Put a few letters into practice.</h2>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">The lessons introduce a little at a time. You can return to this reference whenever you like.</p>
            <Button onClick={onOpenApp} className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Explore the lessons<ArrowRight size={17} aria-hidden="true" /></Button>
          </div>
        </div>
      </div>
    </main>
  );
}
