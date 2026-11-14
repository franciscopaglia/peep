import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';
import type { View } from '@/types';
import { GITHUB_URL } from '@/lib/constants';
import { ReportProblem } from '@/components/ReportProblem';
import { siteReport } from '@/lib/report';
import { Button } from '@/components/Button';

const NAV_LINKS: { label: string; view: View; description: string }[] = [
  { label: 'Home', view: 'landing', description: 'Meet Peep' },
  { label: 'Learning', view: 'dashboard', description: 'Your lessons and progress' },
  { label: 'About', view: 'about', description: 'How Shavian works' },
  { label: 'Resources', view: 'resources', description: 'Tools, guides and community' },
];

export function Nav({
  view,
  dark,
  completedCount,
  totalLessons,
  onSetView,
  onStartLearning,
  onToggleDark,
}: {
  view: View;
  dark: boolean;
  completedCount: number;
  totalLessons: number;
  onSetView: (v: View) => void;
  onStartLearning: () => void;
  onToggleDark: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isLearningArea = view === 'dashboard' || view === 'lesson' || view === 'complete';
  const startLabel = completedCount > 0 ? 'Continue learning' : 'Start learning';
  const isActive = (target: View) => target === 'dashboard' ? isLearningArea : target === view;

  function navigate(target: View) {
    setMenuOpen(false);
    onSetView(target);
  }

  function startLearning() {
    setMenuOpen(false);
    onStartLearning();
  }

  useEffect(() => {
    setMenuOpen(false);
  }, [view]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => { if (event.matches) setMenuOpen(false); };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-card" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
    }}>
      <a href="#page-content" className="absolute left-4 top-3 z-50 -translate-y-24 rounded-btn bg-accent px-4 py-3 text-sm font-semibold text-card focus:translate-y-0">Skip to content</a>
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-9">
          <button type="button" aria-label="Peep home" onClick={() => navigate('landing')} className="min-h-11 shrink-0 cursor-pointer rounded-btn text-lg font-extrabold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            𐑐𐑰𐑐 <span className="px-1 text-muted-foreground font-normal">·</span> Peep
          </button>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button key={link.view} type="button" aria-current={isActive(link.view) ? 'page' : undefined} onClick={() => navigate(link.view)} className={`min-h-11 cursor-pointer rounded-btn px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isActive(link.view) ? 'bg-accent-soft text-accent' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}>
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isLearningArea ? (
            <span className="mr-2 hidden text-xs text-muted-foreground lg:inline">{completedCount} / {totalLessons} lessons</span>
          ) : (
            <Button size="sm" onClick={startLearning} className="mr-1 hidden min-h-11 items-center gap-2 lg:inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">{startLabel}<ArrowRight size={16} aria-hidden="true" /></Button>
          )}
          <button type="button" onClick={onToggleDark} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Switch to light theme' : 'Switch to dark theme'} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-btn text-muted-foreground hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <button ref={toggleRef} type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-btn border border-border text-foreground lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-69px)] overflow-y-auto border-b border-border bg-card px-6 pb-5 pt-2 shadow-lg sm:px-8 lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <button key={link.view} type="button" aria-current={isActive(link.view) ? 'page' : undefined} onClick={() => navigate(link.view)} className={`flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-btn px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isActive(link.view) ? 'bg-accent-soft text-accent' : 'text-foreground hover:bg-background'}`}>
                <span><span className="block text-sm font-semibold">{link.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{link.description}</span></span>
                {isActive(link.view) && <span className="text-xs font-medium">You’re here</span>}
              </button>
            ))}
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            {isLearningArea ? <p className="mb-4 text-sm text-muted-foreground">{completedCount} of {totalLessons} lessons completed</p> : <Button onClick={startLearning} className="mb-4 flex min-h-12 w-full items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{startLabel}<ArrowRight size={17} aria-hidden="true" /></Button>}
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 px-1">
              <ReportProblem trigger="link" {...siteReport} />
              <a href={GITHUB_URL} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1.5 rounded-btn text-sm text-muted-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">GitHub<ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
