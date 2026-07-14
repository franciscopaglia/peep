import { useEffect, useState } from 'react';
import { Check, Lock, Unlock } from 'lucide-react';
import { CHAPTERS, LESSON_META, type Chapter } from '@/lessons';
import { ComingSoonCard } from '@/components/ComingSoonCard';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/Button';

const PATTERN_GLYPHS = ['𐑐', '𐑑', '𐑒', '𐑚', '𐑤', '𐑯', '𐑮', '𐑳', '𐑦', '𐑧'];

const PATTERN_CELLS = [
  [20, 30],
  [95, 15],
  [150, 60],
  [40, 100],
  [110, 130],
  [10, 170],
  [160, 190],
  [70, 220],
];

function buildPatternSvg(cells: number[][]) {
  const glyphs = cells
    .map(
      ([x, y], i) =>
        `<text x="${x}" y="${y}" font-size="34" font-weight="700" fill="#6d5ef5" fill-opacity="0.06" font-family="sans-serif">${PATTERN_GLYPHS[i % PATTERN_GLYPHS.length]}</text>`
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="240">${glyphs}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const PATTERN_BG = buildPatternSvg(PATTERN_CELLS);
// Lighten the effect on small screens: 25% fewer glyphs per tile.
const PATTERN_BG_MOBILE = buildPatternSvg(
  PATTERN_CELLS.slice(0, Math.round(PATTERN_CELLS.length * 0.75))
);

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);
  return isMobile;
}

function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <SectionLabel className="text-accent">{chapter.title}</SectionLabel>
      <SectionLabel>{chapter.subtitle}</SectionLabel>
    </div>
  );
}

export function Dashboard({
  completedCount,
  onStartLesson,
  onContinueCurrent,
  onUnlockThrough,
}: {
  completedCount: number;
  onStartLesson: (id: number) => void;
  onContinueCurrent: () => void;
  onUnlockThrough: (lessonId: number) => void;
}) {
  const current = LESSON_META[Math.min(completedCount, LESSON_META.length - 1)];
  const currentNo = Math.min(completedCount + 1, LESSON_META.length);
  const overallPct = Math.round((completedCount / LESSON_META.length) * 100);
  const isMobile = useIsMobile();
  // The chapter awaiting "unlock all" confirmation, if any.
  const [confirm, setConfirm] = useState<{ title: string; lastId: number } | null>(null);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirm(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm]);

  return (
    <div className="relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isMobile ? PATTERN_BG_MOBILE : PATTERN_BG,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 240px',
          animation: 'shvDrift 90s linear infinite',
        }}
      />
      <div className="relative max-w-[640px] mx-auto px-6 pt-12 pb-[100px] flex flex-col gap-7">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground m-0 mb-1.5">
            Your path
          </h1>
          <p className="text-[15px] text-muted-foreground m-0">
            Learn the Shavian alphabet, one lesson at a time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-[18px] bg-card border border-border rounded-card shadow-sm">
          <div className="w-14 h-14 flex-none rounded-card bg-accent-soft text-accent flex items-center justify-center text-xl font-bold">
            {current.glyph}
          </div>
          <div className="flex-1 min-w-[160px] flex flex-col gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Lesson {currentNo} of {LESSON_META.length}
            </div>
            <div className="text-[17px] font-semibold text-foreground leading-tight">
              {current.title}
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
          <Button size="sm" className="flex-none" onClick={onContinueCurrent}>
            Continue
          </Button>
        </div>

        {CHAPTERS.map((chapter) => {
          const chapterLessons = LESSON_META.filter((l) => l.chapter === chapter.id);
          if (chapterLessons.length === 0 && !chapter.comingSoon) return null;

          if (chapter.comingSoon) {
            return (
              <div key={chapter.id} className="flex flex-col gap-4 mt-1.5">
                <ChapterHeader chapter={chapter} />
                <ComingSoonCard
                  body={chapter.blurb ?? 'More lessons are on the way — check back soon.'}
                />
              </div>
            );
          }

          const lastId = Math.max(...chapterLessons.map((l) => l.id));
          const chapterDone = completedCount >= lastId;

          return (
            <div key={chapter.id} className="flex flex-col gap-7 mt-1.5">
              <div className="flex items-center justify-between gap-3">
                <ChapterHeader chapter={chapter} />
                {!chapterDone && (
                  <button
                    onClick={() => setConfirm({ title: chapter.title, lastId })}
                    title="Unlock this chapter"
                    aria-label={`Unlock all lessons in ${chapter.title}`}
                    className="flex-none inline-flex items-center justify-center h-8 w-8 rounded-btn border border-border bg-card text-muted-foreground transition-colors hover:text-accent hover:border-accent-border hover:bg-accent-soft"
                  >
                    <Unlock size={15} />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-11 relative pt-2">
                <div className="absolute top-[45px] bottom-[60px] left-1/2 w-1 -translate-x-1/2 bg-border rounded-full z-0" />
                {chapterLessons.map((lesson) => {
                  const locked = lesson.id > completedCount + 1;
                  const completed = lesson.id <= completedCount;
                  const showGlyph = !completed && !locked;
                  const showLock = locked && !completed;
                  const isNext = lesson.id === completedCount + 1;

                  let nodeBg = 'var(--card)';
                  let nodeBorder = 'var(--border)';
                  let nodeColor = 'var(--foreground)';
                  if (completed) {
                    nodeBg = 'var(--success)';
                    nodeBorder = 'var(--success)';
                    nodeColor = 'var(--card)';
                  } else if (locked) {
                    nodeBg = 'var(--locked-bg)';
                    nodeBorder = 'var(--border)';
                    nodeColor = 'var(--locked-fg)';
                  } else {
                    nodeBg = 'var(--accent-soft)';
                    nodeBorder = 'var(--accent-border)';
                    nodeColor = 'var(--accent)';
                  }

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col items-center gap-2.5 relative z-10"
                    >
                      <button
                        className="w-[74px] h-[74px] flex items-center justify-center transition-transform duration-100"
                        style={{
                          borderRadius: 999,
                          background: nodeBg,
                          border: `2px solid ${nodeBorder}`,
                          color: nodeColor,
                          cursor: locked ? 'default' : 'pointer',
                          boxShadow: locked ? 'none' : `0 2px 0 ${nodeBorder}`,
                          animation: isNext ? 'shvPulseRing 2.2s ease-in-out infinite' : undefined,
                        }}
                        onClick={() => onStartLesson(lesson.id)}
                        disabled={locked}
                      >
                        {completed && <Check size={30} strokeWidth={3} />}
                        {showGlyph && (
                          <span className="text-[22px] font-bold">{lesson.glyph}</span>
                        )}
                        {showLock && <Lock size={22} />}
                      </button>
                      <div
                        className="text-[13px] font-semibold max-w-[160px] text-center leading-tight bg-background px-2.5"
                        style={{ color: locked ? 'var(--locked-fg)' : 'var(--foreground)' }}
                      >
                        {lesson.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'color-mix(in srgb, var(--foreground) 45%, transparent)' }}
          onClick={() => setConfirm(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Unlock ${confirm.title}`}
        >
          <div
            className="w-full max-w-[400px] rounded-card bg-card border border-border shadow-lg p-7 flex flex-col items-center gap-4 text-center"
            style={{ animation: 'shvPop .2s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <Unlock size={22} />
            </div>
            <h2 className="text-lg font-bold text-foreground m-0">
              Unlock all of {confirm.title}?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground m-0">
              This marks every lesson in {confirm.title} as complete and skips the
              practice — and honestly, earning it is half the fun.
              <br />
              <br />
              That said, an app update can occasionally reset your progress, so if
              you're just restoring where you already were, go right ahead.
            </p>
            <div className="flex gap-3 w-full mt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  onUnlockThrough(confirm.lastId);
                  setConfirm(null);
                }}
              >
                Unlock anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
