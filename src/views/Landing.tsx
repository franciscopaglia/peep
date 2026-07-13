import { BookOpen, Zap, Route } from 'lucide-react';
import { useHeroCanvas } from '@/hooks/useHeroCanvas';
import { AlphabetChart } from '@/components/AlphabetChart';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/Button';

const FEATURE_CARDS = [
  {
    title: 'Spelling that never lies',
    body: '48 letters, each standing for exactly one English sound. No capitals, no silent letters, no exceptions.',
    icon: BookOpen,
  },
  {
    title: 'Bite-sized lessons',
    body: 'Five-minute exercises with instant feedback — and a skip button when you get stuck.',
    icon: Zap,
  },
  {
    title: 'Calm by design',
    body: 'No streaks, no leaderboards, no pressure. Just a clear path that unlocks as you learn.',
    icon: Route,
  },
];

const STEP_CARDS = [
  {
    n: '1',
    title: 'Meet the letters',
    body: 'Start with six consonants and see how each shape maps to a single sound.',
  },
  {
    n: '2',
    title: 'Practice as you go',
    body: 'Every lesson mixes tapping, matching and typing, so recall sticks without drilling.',
  },
  {
    n: '3',
    title: 'Read real words',
    body: 'Combine what you know into everyday words and, before long, whole sentences.',
  },
];

const SHOWCASE_WORDS = [
  { glyph: '𐑞', en: 'the' },
  { glyph: '𐑒𐑨𐑑', en: 'cat' },
  { glyph: '𐑨𐑯𐑛', en: 'and' },
  { glyph: '𐑞', en: 'the' },
  { glyph: '𐑛𐑪𐑜', en: 'dog' },
];

export function Landing({
  dark,
  onOpenApp,
  onOpenAbout,
}: {
  dark: boolean;
  onOpenApp: () => void;
  onOpenAbout: () => void;
}) {
  const canvasRef = useHeroCanvas(true, dark);

  return (
    <div>
      <div className="relative overflow-hidden" style={{ background: 'var(--hero-bg)' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            zIndex: 5,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
            background: 'linear-gradient(to bottom, transparent, var(--background))',
          }}
        />
        <div className="relative z-10 max-w-[960px] mx-auto px-6 pt-14 sm:pt-[88px] pb-16 sm:pb-20 flex flex-col items-center text-center gap-6">
          <div className="text-[13px] font-semibold tracking-wide uppercase text-accent bg-accent-soft px-3.5 py-1.5 rounded-full">
            A phonetic alphabet for English
          </div>
          <h1 className="text-[34px] sm:text-[52px] leading-[1.08] sm:leading-[1.05] font-extrabold tracking-tight text-foreground m-0 max-w-[720px] text-balance">
            Read &amp; write English in Shavian
          </h1>
          <p className="text-lg leading-snug text-muted-foreground m-0 max-w-[560px]">
            One symbol per sound. Learn the alphabet Bernard Shaw dreamed of — through
            short, interactive lessons that actually stick.
          </p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Button onClick={onOpenApp}>Start learning</Button>
            <Button variant="outline" onClick={onOpenAbout}>
              About Shavian
            </Button>
          </div>
          <div
            className="mt-7 w-full max-w-[560px] p-6 sm:p-10 rounded-card border flex flex-col items-center gap-4"
            style={{
              background: 'color-mix(in srgb, var(--card) 55%, transparent)',
              borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px color-mix(in srgb, var(--foreground) 8%, transparent)',
            }}
          >
            <SectionLabel>See it in Shavian</SectionLabel>
            <div className="flex gap-4 sm:gap-5 flex-wrap justify-center items-end">
              {SHOWCASE_WORDS.map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[34px] sm:text-[44px] font-bold text-foreground">{w.glyph}</span>
                  <span className="font-mono text-[13px] text-muted-foreground">{w.en}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              “the cat and the dog” — five short words, spelled exactly as they sound.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6">
        <SectionLabel className="pt-16 sm:pt-20 text-center">About Shavian & Peep</SectionLabel>
        <div className="flex gap-4 pt-7 flex-wrap justify-center">
          {FEATURE_CARDS.map((f) => (
            <div
              key={f.title}
              className="flex-1 min-w-[240px] p-6 rounded-card bg-card border border-border shadow-sm flex flex-col items-center text-center gap-2.5"
            >
              <div className="w-11 h-11 flex-none rounded-btn bg-accent-soft text-accent flex items-center justify-center mb-1">
                <f.icon size={22} />
              </div>
              <div className="text-[17px] font-semibold text-foreground">{f.title}</div>
              <div className="text-sm leading-relaxed text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>

        <div className="pt-16 sm:pt-[88px] flex flex-col items-center text-center">
          <SectionLabel className="mb-7">How it works</SectionLabel>
          <div className="flex gap-4 flex-wrap justify-center">
            {STEP_CARDS.map((s) => (
              <div key={s.n} className="flex-1 min-w-[220px] flex flex-col items-center gap-3">
                <div className="w-9 h-9 flex-none rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-base">
                  {s.n}
                </div>
                <div className="text-base font-semibold text-foreground">{s.title}</div>
                <div className="text-sm leading-relaxed text-muted-foreground">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-16 sm:pt-[88px] flex flex-col items-center text-center">
          <SectionLabel className="mb-7">Meet the letters</SectionLabel>
          <AlphabetChart />
        </div>

        <div className="pt-16 sm:pt-[88px] flex flex-col items-center text-center gap-[18px]">
          <div className="text-[64px] font-bold text-accent leading-none">𐑖</div>
          <blockquote className="text-2xl leading-snug font-semibold tracking-tight text-foreground m-0 max-w-[640px] text-balance">
            “The English have no respect for their language, and will not teach their
            children to speak it.”
          </blockquote>
          <div className="text-sm text-muted-foreground">
            George Bernard Shaw — whose will paid for this alphabet
          </div>
        </div>

        <div className="pt-16 sm:pt-[88px] pb-24">
          <div className="bg-accent rounded-card p-8 sm:p-14 flex flex-col items-center gap-5 text-center">
            <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-card m-0 max-w-[520px] text-balance">
              Ready to read your first Shavian word?
            </h2>
            <Button variant="inverted" onClick={onOpenApp}>
              Start learning
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
