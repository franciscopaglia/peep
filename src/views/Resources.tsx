import { BookOpen, Keyboard, Users, Zap, Landmark, Mic2, ArrowUpRight } from 'lucide-react';
import type { ComponentType } from 'react';
import { SectionLabel } from '@/components/SectionLabel';
import { PageIntro } from '@/components/PageIntro';

type Resource = {
  title: string;
  desc: string;
  url: string;
  icon: ComponentType<{ size?: number }>;
};

const RESOURCE_GROUPS: { id: string; label: string; items: Resource[] }[] = [
  {
    id: 'learn-more',
    label: 'Learn more',
    items: [
      {
        title: 'Shavian.info',
        desc: 'The community reference hub — history, rules and design notes for the alphabet.',
        url: 'https://shavian.info/',
        icon: Landmark,
      },
      {
        title: 'Spelling guide',
        desc: 'The finer points of Shavian spelling: fixed words, stress, apostrophes and more.',
        url: 'https://shavian.info/spelling/',
        icon: BookOpen,
      },
      {
        title: 'Accents & pronunciation',
        desc: 'How one spelling stays readable across RP, American, Irish and other accents.',
        url: 'https://shavian.info/accents/',
        icon: Mic2,
      },
      {
        title: 'Letter design',
        desc: 'Why the letters are shaped the way they are — tall, deep and short forms.',
        url: 'https://shavian.info/alphabet/',
        icon: Zap,
      },
      {
        title: 'Shavian on Wikipedia',
        desc: 'A thorough overview of the alphabet’s history, letters and everyday usage.',
        url: 'https://en.wikipedia.org/wiki/Shavian_alphabet',
        icon: BookOpen,
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      {
        title: 'ReadLex dictionary',
        desc: 'Look up how any English word is spelled in Shavian, with pronunciation variants.',
        url: 'https://readlex.pythonanywhere.com/',
        icon: BookOpen,
      },
      {
        title: 'Type in Shavian',
        desc: 'Keyboard layouts for computer and phone — Shaw JAFL, QWERTY and Imperial.',
        url: 'https://shavian.info/keyboards/',
        icon: Keyboard,
      },
      {
        title: 'Shavian transliterator',
        desc: 'Paste in English and get it back in Shavian — also IPA and other phonemic scripts.',
        // No "www." — that host's TLS certificate doesn't cover it.
        url: 'https://dechifro.org/shavian/',
        icon: Zap,
      },
      {
        title: 'Noto Sans Shavian',
        desc: 'A free Google font covering the full Shavian block, for your own documents.',
        url: 'https://fonts.google.com/noto/specimen/Noto+Sans+Shavian',
        icon: Zap,
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      {
        title: 'r/shavian',
        desc: 'A friendly subreddit for learners and enthusiasts to practise and ask questions.',
        url: 'https://www.reddit.com/r/shavian/',
        icon: Users,
      },
    ],
  },
];

const STARTING_POINTS = [
  { title: 'Look up a word', resourceTitle: 'ReadLex dictionary', note: 'Check a spelling or explore a pronunciation.' },
  { title: 'Set up your keyboard', resourceTitle: 'Type in Shavian', note: 'Take Shavian beyond the lessons.' },
  { title: 'Find fellow learners', resourceTitle: 'r/shavian', note: 'Ask a question or share a little practice.' },
];

const GROUP_DESCRIPTIONS: Record<string, string> = {
  'learn-more': 'Understand the spelling, sounds and story behind the alphabet.',
  tools: 'Look up spellings, type your own words and find a font.',
  community: 'Make room for Shavian in everyday conversation.',
};

const RESOURCES = RESOURCE_GROUPS.flatMap((group) => group.items);

function ResourceLink({ resource }: { resource: Resource }) {
  return (
    <a href={resource.url} target="_blank" rel="noopener" className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-5 no-underline transition-colors hover:border-accent-border hover:bg-accent-soft/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-accent-soft text-accent"><resource.icon size={19} /></div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-foreground group-hover:text-accent">{resource.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{resource.desc}</p>
        <p className="mt-3 break-words text-xs text-muted-foreground">{new URL(resource.url).hostname.replace(/^www\./, '')}</p>
      </div>
      <ArrowUpRight size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-accent" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Resources() {
  return (
    <main>
      <PageIntro eyebrow="Keep exploring" title="Resources">
        A few good places to go next. Find a word, start typing, or meet the people
        keeping Shavian in everyday use.
      </PageIntro>
      <div className="mx-auto max-w-[1120px] px-6 py-10 sm:px-8 sm:py-12">
        <nav aria-label="Resource categories" className="mb-8 flex flex-wrap gap-2 border-y border-border py-4">
          {RESOURCE_GROUPS.map((group) => <a key={group.id} href={`#${group.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-btn px-4 text-sm font-semibold text-muted-foreground hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{group.label}<span className="text-xs font-normal">{group.items.length}</span></a>)}
        </nav>
        <section aria-labelledby="starting-points-title" className="mb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <SectionLabel as="h2" id="starting-points-title">A useful place to start</SectionLabel>
            <p className="text-xs text-muted-foreground">External links open in a new tab.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STARTING_POINTS.map((item) => {
              const resource = RESOURCES.find((entry) => entry.title === item.resourceTitle)!;
              return (
                <a key={item.title} href={resource.url} target="_blank" rel="noopener" className="group rounded-xl border border-accent-border bg-accent-soft p-5 no-underline hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-6">
                  <div className="flex items-start justify-between gap-3"><resource.icon size={22} /><ArrowUpRight size={18} aria-hidden="true" className="text-accent" /></div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
                  <p className="mt-4 text-xs font-semibold text-accent">{resource.title}</p>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              );
            })}
          </div>
        </section>

        <div className="grid gap-12 pb-6 sm:pb-10">
          {RESOURCE_GROUPS.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="grid scroll-mt-24 items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
              <div>
                <h2 id={`${group.id}-title`} className="text-2xl font-bold tracking-tight text-foreground">{group.label}</h2>
                <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-muted-foreground">{GROUP_DESCRIPTIONS[group.id]}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((resource) => <ResourceLink key={resource.title} resource={resource} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
