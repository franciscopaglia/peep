import { BookOpen, Keyboard, Users, Zap, ExternalLink, Landmark, Mic2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { SectionLabel } from '@/components/SectionLabel';

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
        url: 'https://www.shavian.info',
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
        url: 'https://readlex.pw',
        icon: BookOpen,
      },
      {
        title: 'Type in Shavian',
        desc: 'Keyboard layouts and input tools for writing Shavian on your own devices.',
        url: 'https://www.dechifro.org/shavian/',
        icon: Keyboard,
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

export function Resources() {
  return (
    <div className="max-w-[720px] mx-auto px-6 pt-[72px] pb-24 flex flex-col gap-4">
      <h1 className="text-[40px] font-extrabold tracking-tight text-foreground m-0">
        Resources
      </h1>
      <p className="text-lg leading-relaxed text-muted-foreground m-0 mb-3">
        Handpicked places to go deeper — communities, references and tools for reading
        and writing Shavian.
      </p>
      {RESOURCE_GROUPS.map((group) => (
        <div key={group.label} id={group.id} className="mt-4 scroll-mt-24">
          <SectionLabel as="h2" className="mb-3">
            {group.label}
          </SectionLabel>
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
          >
            {group.items.map((r) => (
              <a
                key={r.title}
                href={r.url}
                target="_blank"
                rel="noopener"
                className="flex gap-4 items-start p-[22px] rounded-card bg-card border border-border shadow-sm no-underline"
              >
                <div className="w-11 h-11 flex-none rounded-btn bg-accent-soft text-accent flex items-center justify-center">
                  <r.icon size={22} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="text-base font-semibold text-foreground">{r.title}</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{r.desc}</div>
                </div>
                <div className="text-muted-foreground flex-none mt-0.5">
                  <ExternalLink size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
