import { useEffect, useState } from 'react';
import { Sun, Moon, GitBranch, Menu, X } from 'lucide-react';
import type { View } from '@/types';
import { GITHUB_URL } from '@/lib/constants';
import { ReportProblem } from '@/components/ReportProblem';
import { siteReport } from '@/lib/report';

type NavLink = { label: string; view: View };

const NAV_LINKS: NavLink[] = [
  { label: 'Home', view: 'landing' },
  { label: 'Learning', view: 'dashboard' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = view === 'landing';
  const isDashboardArea = view === 'dashboard' || view === 'lesson' || view === 'complete';

  const isActive = (link: NavLink) =>
    link.view === 'dashboard' ? isDashboardArea : view === link.view;

  // Close the mobile menu whenever the view changes or Escape is pressed.
  useEffect(() => {
    setMenuOpen(false);
  }, [view]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="relative border-b border-border bg-card">
      <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-8">
          <button
            className="bg-transparent border-none p-0 cursor-pointer font-extrabold text-lg sm:text-xl tracking-tight text-foreground"
            onClick={() => onSetView('landing')}
          >
            𐑐𐑰𐑐 · Peep
          </button>
          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
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

        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {isLanding && (
            <button
              className="hidden md:inline-flex h-[38px] box-border items-center px-[18px] rounded-btn border-none bg-accent text-card text-[13px] font-semibold cursor-pointer"
              onClick={() => onSetView('dashboard')}
            >
              Start learning
            </button>
          )}
          {isDashboardArea && !isLanding && (
            <div className="hidden md:inline-flex h-[38px] box-border items-center text-[13px] font-semibold text-muted-foreground bg-accent-soft px-3.5 rounded-btn">
              {completedCount} / {totalLessons} lessons
            </div>
          )}
          <ReportProblem trigger="icon" {...siteReport} />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener"
            className="hidden md:inline-flex h-[38px] w-[38px] box-border items-center justify-center border border-border bg-card text-muted-foreground rounded-btn cursor-pointer no-underline"
          >
            <GitBranch size={18} />
          </a>
          <button
            className="h-[38px] box-border inline-flex items-center border border-border bg-card text-muted-foreground text-[13px] font-semibold px-[11px] sm:px-[15px] rounded-btn cursor-pointer"
            onClick={onToggleDark}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span className="hidden md:inline ml-[7px]">{dark ? 'Light' : 'Dark'}</span>
          </button>
          <button
            className="md:hidden h-[38px] w-[38px] box-border inline-flex items-center justify-center border border-border bg-card text-muted-foreground rounded-btn cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full z-40 border-b border-border bg-card shadow-lg">
          <nav className="flex flex-col px-5 py-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <button
                  key={link.label}
                  onClick={() => onSetView(link.view)}
                  className="text-left py-3 text-[15px] border-b border-border last:border-b-0"
                  style={{
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 px-5 pb-4 pt-1">
            {isLanding && (
              <button
                className="flex-1 h-[42px] inline-flex items-center justify-center rounded-btn border-none bg-accent text-card text-sm font-semibold cursor-pointer"
                onClick={() => onSetView('dashboard')}
              >
                Start learning
              </button>
            )}
            {isDashboardArea && !isLanding && (
              <div className="flex-1 h-[42px] inline-flex items-center justify-center text-sm font-semibold text-muted-foreground bg-accent-soft rounded-btn">
                {completedCount} / {totalLessons} lessons
              </div>
            )}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener"
              className="h-[42px] w-[42px] inline-flex items-center justify-center border border-border bg-card text-muted-foreground rounded-btn no-underline"
              aria-label="View source on GitHub"
            >
              <GitBranch size={18} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
