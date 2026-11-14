import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { AlphabetChart } from '@/components/AlphabetChart';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/Button';
import { lettersFor } from '@/lib/shavian-alphabet';

const PREVIEW_WORDS = [
  { english: 'cat', shavian: '𐑒𐑨𐑑' },
  { english: 'dog', shavian: '𐑛𐑪𐑜' },
  { english: 'sun', shavian: '𐑕𐑳𐑯' },
];

const STEPS = [
  {
    title: 'Meet a few letters',
    body: 'Start with a pair of shapes and the sounds they stand for. There’s no need to memorise a chart.',
  },
  {
    title: 'Try them for yourself',
    body: 'Tap, match and build words. Get feedback as you go, and skip a question whenever you need to.',
  },
  {
    title: 'Watch the words add up',
    body: 'Each lesson builds on what you know, from your first word to reading passages and writing sentences.',
  },
];

const QUESTIONS = [
  {
    question: 'Is Shavian a different language?',
    answer: 'It’s still English, written with a different alphabet. You already know the words; you’re learning a new way to read and write them.',
  },
  {
    question: 'Do I need a special keyboard?',
    answer: 'No. Peep gives you letter tiles and an on-screen Shavian keyboard for writing practice. For English answers, use your usual keyboard.',
  },
  {
    question: 'Where is my progress saved?',
    answer: 'Your progress is saved automatically in this browser, on this device. There’s no account to create. Clearing your browser’s site data will clear your progress too.',
  },
];

function WordPreview() {
  const [wordIndex, setWordIndex] = useState(0);
  const word = PREVIEW_WORDS[wordIndex];
  const letters = lettersFor(Array.from(word.shavian));

  return (
    <div className="relative w-full max-w-[440px] justify-self-center lg:justify-self-end">
      <div aria-hidden="true" className="absolute -inset-3 rotate-3 rounded-[24px] border border-accent-border bg-accent-soft" />
      <div className="relative rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
          <SectionLabel>A little preview</SectionLabel>
          <span className="text-xs text-muted-foreground">English → Shavian</span>
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">You already know the sounds.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pick a word. Meet its new letters.</p>
        <div role="group" aria-label="Choose a preview word" className="mt-5 flex gap-2">
          {PREVIEW_WORDS.map((item, index) => (
            <button
              key={item.english}
              type="button"
              aria-pressed={index === wordIndex}
              onClick={() => setWordIndex(index)}
              className={`min-h-11 flex-1 rounded-btn border px-3 text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${index === wordIndex ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-card text-muted-foreground hover:border-accent-border hover:text-foreground'}`}
            >
              {item.english}
            </button>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true" className="mt-6">
          <div role="img" aria-label={`${word.english} in Shavian: ${word.shavian}`} className="grid grid-cols-3 gap-3">
            {letters.map((letter, index) => (
              <div key={index} className="flex flex-col items-center rounded-xl border border-border bg-background py-5 sm:py-6">
                <span aria-hidden="true" className="text-5xl sm:text-6xl leading-none text-foreground">{letter.glyph}</span>
                <span className="mt-4 text-sm text-muted-foreground">{letter.key}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-lg text-foreground">
            <span className="font-semibold">{word.shavian}</span>
            <span className="px-3 text-muted-foreground">=</span>
            {word.english}
          </p>
        </div>
        <p className="mt-5 border-t border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">Three sounds. Three letters. That’s the idea.</p>
      </div>
    </div>
  );
}

export function Landing({
  hasProgress,
  onStartLearning,
  onOpenApp,
  onOpenAbout,
}: {
  hasProgress: boolean;
  onStartLearning: () => void;
  onOpenApp: () => void;
  onOpenAbout: () => void;
}) {
  const startLabel = hasProgress ? 'Continue learning' : 'Try the first lesson';

  return (
    <main>
      <section aria-labelledby="welcome-title" className="relative overflow-hidden border-b border-border bg-[image:var(--hero-bg)]">
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-6 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <SectionLabel className="text-accent">A fresh way to write English</SectionLabel>
            <h1 id="welcome-title" className="mt-5 max-w-[620px] text-[40px] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-[56px] lg:text-[60px] text-balance">
              Familiar sounds.<br />
              <span className="text-accent">A whole new alphabet.</span>
            </h1>
            <p className="mt-6 max-w-[470px] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Shavian is an alphabet for English, built around sounds.
              Peep helps you learn to read and write it, one short lesson at a time.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 min-[400px]:flex-row min-[400px]:items-center">
              <Button onClick={onStartLearning} className="inline-flex min-h-12 items-center justify-center gap-3 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                {startLabel}<ArrowRight size={18} aria-hidden="true" />
              </Button>
              <button onClick={onOpenApp} className="min-h-12 cursor-pointer rounded-btn px-3 text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                Explore the lessons
              </button>
            </div>
            {hasProgress && <p className="mt-3 text-sm text-accent">Welcome back. Your progress is saved on this device.</p>}
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-[13px]" aria-label="Learning with Peep">
              {['Free to learn', 'No account needed', 'At your own pace'].map((item) => (
                <li key={item} className="flex items-center gap-1.5"><Check size={14} className="text-accent" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <WordPreview />
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-6 sm:px-8">
        <section aria-labelledby="how-title" className="py-14 sm:py-20">
          <SectionLabel>The learning path</SectionLabel>
          <h2 id="how-title" className="mt-3 max-w-[550px] text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl text-balance">A small beginning.<br />A little more with every lesson.</h2>
          <ol className="mt-9 grid gap-8 sm:grid-cols-3 sm:gap-7">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t border-border pt-5">
                <span aria-hidden="true" className="font-mono text-sm text-accent">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 max-w-[340px] text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 rounded-xl bg-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
            <h3 className="shrink-0 text-base font-semibold text-foreground">Room to learn at your own pace.</h3>
            <p className="max-w-[630px] text-sm leading-relaxed text-muted-foreground">No streaks, scores to compete over or catching up. Take a lesson, come back when you like, and pick up where you left off.</p>
          </div>
        </section>

        <section aria-labelledby="alphabet-title" className="border-t border-border py-14 sm:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <SectionLabel>Meet the alphabet</SectionLabel>
              <h2 id="alphabet-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">48 letters.<br />One pair at a time.</h2>
              <p className="mt-4 max-w-[410px] text-sm leading-relaxed text-muted-foreground">New shapes, familiar sounds. The highlighted part of each letter’s name tells you its sound. You’ll meet these first.</p>
              <button onClick={onOpenAbout} className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-btn text-sm font-semibold text-accent hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                More about Shavian<ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
            <AlphabetChart glyphs={['𐑐', '𐑚', '𐑑', '𐑛', '𐑒', '𐑜']} className="mx-auto grid grid-flow-col grid-rows-2 gap-3" />
          </div>
          <details className="group mt-8 rounded-xl border border-border bg-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              Explore all 48 letters
              <ChevronDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="border-t border-border px-3 py-6 sm:px-6"><AlphabetChart /></div>
          </details>
        </section>

        <section aria-labelledby="questions-title" className="grid gap-6 border-t border-border py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionLabel>Before you begin</SectionLabel>
            <h2 id="questions-title" className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A few good questions.</h2>
          </div>
          <div>
            {QUESTIONS.map((item) => (
              <details key={item.question} className="group border-b border-border first:border-t">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                  {item.question}<ChevronDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-5 pr-5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="start-title" className="mb-14 flex flex-col items-start justify-between gap-6 rounded-[20px] border border-accent-border bg-accent-soft p-7 sm:mb-20 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 id="start-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{hasProgress ? 'Your next small step is waiting.' : 'Your first two letters are waiting.'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{hasProgress ? 'Come back to your learning path, just where you left it.' : 'No preparation needed. Just a little curiosity.'}</p>
          </div>
          <Button onClick={onStartLearning} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            {startLabel}<ArrowRight size={18} aria-hidden="true" />
          </Button>
        </section>
      </div>
    </main>
  );
}
