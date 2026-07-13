import { Sun, Moon, GitBranch } from 'lucide-react';
import type { View } from '@/types';
import { GITHUB_URL, GITHUB_ISSUES_URL } from '@/lib/constants';
import { ReportProblem } from '@/components/ReportProblem';

type NavLink = { label: string; view: View };

const NAV_LINKS: NavLink[] = [
  { label: 'Home', view: 'landing' },
  { label: 'Learning Path', view: 'dashboard' },
  { label: 'About', view: 'about' },
  { label: 'Resources', view: 'resources' },
];

export function Nav({
  view,
  dark,
  completedCount,
  totalLessons,
  onSetView,
  onToggleDark,
}: {
  view: View;
  dark: boolean;
  completedCount: number;
  totalLessons: number;
  onSetView: (v: View) => void;
  onToggleDark: () => void;
}) {
  const isLanding = view === 'landing';
  const isDashboardArea = view === 'dashboard' || view === 'lesson' || view === 'complete';

  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
      <div className="flex items-center gap-8">
        <button
          className="bg-transparent border-none p-0 cursor-pointer font-extrabold text-xl tracking-tight text-foreground"
          onClick={() => onSetView('landing')}
        >
          𐑐𐑰𐑐 · Peep
        </button>
        <div className="hidden sm:flex items-center gap-5">
          {NAV_LINKS.map((link) => {
            const active =
              link.view === 'dashboard' ? isDashboardArea : view === link.view;
            return (
              <button
                key={link.label}
                onClick={() => onSetView(link.view)}
                className="bg-transparent border-none cursor-pointer py-1.5 px-0.5 text-sm"
                style={{
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        {isLanding && (
          <button
            className="h-[38px] box-border inline-flex items-center px-[18px] rounded-btn border-none bg-accent text-card text-[13px] font-semibold cursor-pointer"
            onClick={() => onSetView('dashboard')}
          >
            Start learning
          </button>
        )}
        {isDashboardArea && !isLanding && (
          <div className="h-[38px] box-border inline-flex items-center text-[13px] font-semibold text-muted-foreground bg-accent-soft px-3.5 rounded-btn">
            {completedCount} / {totalLessons} lessons
          </div>
        )}
        <ReportProblem
          issueUrl={GITHUB_ISSUES_URL}
          trigger="icon"
          tooltip="Report an issue — did you find something wrong?"
          heading="Did you find something wrong?"
          body={
            <>
              Thanks for helping make Peep better! Tapping{' '}
              <span className="font-semibold text-foreground">Continue</span> opens a short
              form on <span className="font-semibold text-foreground">GitHub</span> where
              you can describe the problem. You'll need a free GitHub account to send it —
              it only takes a moment.
            </>
          }
        />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener"
          className="h-[38px] w-[38px] box-border inline-flex items-center justify-center border border-border bg-card text-muted-foreground rounded-btn cursor-pointer no-underline"
        >
          <GitBranch size={18} />
        </a>
        <button
          className="h-[38px] box-border inline-flex items-center border border-border bg-card text-muted-foreground text-[13px] font-semibold px-[15px] rounded-btn cursor-pointer"
          onClick={onToggleDark}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span className="ml-[7px]">{dark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
}
