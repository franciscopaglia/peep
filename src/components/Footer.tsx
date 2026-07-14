import type { ReactNode } from 'react';
import type { View } from '@/types';
import { GITHUB_URL, AUTHOR_GITHUB_URL } from '@/lib/constants';
import { ReportProblem } from '@/components/ReportProblem';
import { siteReport } from '@/lib/report';
import { Chip } from '@/components/Chip';

type FooterItem = { label: string; onClick?: () => void; node?: ReactNode };
type FooterCol = { heading: string; items: FooterItem[] };

export function Footer({ onSetView }: { onSetView: (v: View) => void }) {
  function goTo(view: View, anchorId?: string) {
    onSetView(view);
    if (!anchorId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  const cols: FooterCol[] = [
    {
      heading: 'Learn',
      items: [
        { label: 'Home', onClick: () => onSetView('landing') },
        { label: 'Learning', onClick: () => onSetView('dashboard') },
        {
          label: 'Report a problem',
          node: <ReportProblem trigger="link" label="Report a problem" {...siteReport} />,
        },
      ],
    },
    {
      heading: 'About',
      items: [
        { label: 'What is Shavian', onClick: () => goTo('about', 'what-is-shavian') },
        { label: 'A short history', onClick: () => goTo('about', 'history') },
        { label: 'The three shapes', onClick: () => goTo('about', 'three-shapes') },
      ],
    },
    {
      heading: 'Resources',
      items: [
        { label: 'Learn more', onClick: () => goTo('resources', 'learn-more') },
        { label: 'Tools', onClick: () => goTo('resources', 'tools') },
        {
          label: 'GitHub',
          onClick: () => window.open(GITHUB_URL, '_blank'),
        },
      ],
    },
  ];

  return (
    <div className="bg-footer-bg border-t border-border mt-2">
      <div className="max-w-[960px] mx-auto px-6 py-12 sm:py-14 flex gap-x-10 gap-y-9 flex-wrap">
        <div className="w-full sm:w-auto sm:max-w-[280px] sm:mr-auto flex flex-col gap-2.5">
          <button
            className="bg-transparent border-none p-0 cursor-pointer font-extrabold text-xl tracking-tight text-foreground text-left"
            onClick={() => onSetView('landing')}
          >
            𐑐𐑰𐑐 · Peep
          </button>
          <div className="text-sm leading-relaxed text-muted-foreground">
            Learn to read and write English in the Shavian alphabet, one lesson at a time.
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <div className="text-[13px] font-semibold text-foreground">{col.heading}</div>
            {col.items.map((item) =>
              item.node ? (
                <div key={item.label}>{item.node}</div>
              ) : (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="text-sm text-muted-foreground bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        ))}
      </div>
      <div className="max-w-[960px] mx-auto px-6 pt-0 pb-10 text-[13px] text-muted-foreground">
        © 2026 Peep ·{' '}
        <Chip className="font-mono text-[13px] font-medium text-muted-foreground">
          v{__COMMIT_HASH__}
        </Chip>{' '}
        · A learning project by{' '}
        <a
          href={AUTHOR_GITHUB_URL}
          target="_blank"
          rel="noopener"
          className="text-accent hover:underline"
        >
          Francisco Paglia
        </a>
        . Not affiliated with any estate.
      </div>
    </div>
  );
}
