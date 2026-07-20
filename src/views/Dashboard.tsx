import { useState } from 'react';
import { Check, Lock, Unlock } from 'lucide-react';
import { CHAPTERS, SPINE_META, branchesFor, type Chapter, type LessonMeta } from '@/lessons';
import { ComingSoonCard } from '@/components/ComingSoonCard';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useIsMobile } from '@/hooks/useIsMobile';

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

function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <SectionLabel className="text-accent">{chapter.title}</SectionLabel>
      <SectionLabel>{chapter.subtitle}</SectionLabel>
    </div>
  );
}

type NodeState = 'completed' | 'locked' | 'available';

// Done and available share one treatment — soft fill, mid-tone border, saturated
// mark — so the path reads as one family and only the colour (and mark) differ.
function nodeColors(state: NodeState) {
  if (state === 'completed')
    return { bg: 'var(--success-soft)', border: 'var(--success-border)', color: 'var(--success)' };
  if (state === 'locked')
    return { bg: 'var(--locked-bg)', border: 'var(--border)', color: 'var(--locked-fg)' };
  return { bg: 'var(--accent-soft)', border: 'var(--accent-border)', color: 'var(--accent)' };
}

// One node on the path — shared by spine lessons and branches. A branch is
// smaller and dashed to read as optional; otherwise the states are identical.
function PathNode({
  state,
  glyph,
  size = 74,
  dashed = false,
  isNext = false,
  onClick,
}: {
  state: NodeState;
  glyph: string;
  size?: number;
  dashed?: boolean;
  isNext?: boolean;
  onClick: () => void;
}) {
  const { bg, border, color } = nodeColors(state);
  const locked = state === 'locked';
  return (
    <button
      className="flex items-center justify-center transition-transform duration-100"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${border}`,
        color,
        cursor: locked ? 'default' : 'pointer',
        boxShadow: locked || dashed ? 'none' : `0 2px 0 ${border}`,
        animation: isNext ? 'shvPulseRing 2.2s ease-in-out infinite' : undefined,
      }}
      onClick={onClick}
      disabled={locked}
    >
      {state === 'completed' && <Check size={size * 0.4} strokeWidth={3} />}
      {state === 'available' && (
        <span style={{ fontSize: size * 0.3 }} className="font-bold">
          {glyph}
        </span>
      )}
      {locked && <Lock size={size * 0.3} />}
    </button>
  );
}

// The branch(es) that hang off a spine node, drawn to its right with an elbow
// connector. Vertically centred on the spine node; laid out absolutely so the
// spine stays on the centre line.
function BranchCluster({
  branches,
  completedCount,
  completedBranches,
  onStartLesson,
}: {
  branches: LessonMeta[];
  completedCount: number;
  completedBranches: Set<number>;
  onStartLesson: (id: number) => void;
}) {
  // Offset up by half the 56px node so the node — not the node-plus-label
  // stack — sits on the spine node's centre line, and the connector meets it.
  return (
    <div className="absolute top-1/2 left-full -translate-y-[28px] flex flex-col gap-4 z-10">
      {branches.map((b) => {
        const state: NodeState = completedBranches.has(b.id)
          ? 'completed'
          : (b.anchor ?? Infinity) > completedCount
            ? 'locked'
            : 'available';
        return (
          <div key={b.id} className="flex items-start">
            <div className="mt-[27px] h-px w-6 flex-none bg-border" />
            <div className="flex flex-col items-center gap-2">
              <PathNode
                state={state}
                glyph={b.glyph}
                size={56}
                dashed
                onClick={() => onStartLesson(b.id)}
              />
              <div
                className="text-[11px] font-semibold max-w-[104px] text-center leading-tight"
                style={{ color: state === 'locked' ? 'var(--locked-fg)' : 'var(--muted-foreground)' }}
              >
                {b.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Dashboard({
  completedCount,
  completedBranches,
  onStartLesson,
  onContinueCurrent,
  onUnlockThrough,
}: {
  completedCount: number;
  completedBranches: Set<number>;
  onStartLesson: (id: number) => void;
  onContinueCurrent: () => void;
  onUnlockThrough: (lessonId: number) => void;
}) {
  const current = SPINE_META[Math.min(completedCount, SPINE_META.length - 1)];
  const currentNo = Math.min(completedCount + 1, SPINE_META.length);
  const overallPct = Math.round((completedCount / SPINE_META.length) * 100);
  const isMobile = useIsMobile();
  // The chapter awaiting "unlock all" confirmation, if any.
  const [confirm, setConfirm] = useState<{ title: string; lastId: number } | null>(null);

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
          {/* Progress through the whole course belongs to the course heading —
              inside the lesson card it read as progress through that lesson. */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex-none text-xs font-medium text-muted-foreground">
              {completedCount} of {SPINE_META.length} lessons
            </div>
          </div>
        </div>

        {/* Glyph and title stay a pair; only the button drops below them, and
            it goes full-width there rather than stranding bottom-left. */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-[18px] bg-card border border-border rounded-card shadow-sm">
          <div className="flex-1 min-w-0 flex items-center gap-4">
            <div className="w-14 h-14 flex-none rounded-card bg-accent-soft text-accent flex items-center justify-center text-xl font-bold">
              {current.glyph}
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                Lesson {currentNo} of {SPINE_META.length}
              </div>
              <div className="text-[17px] font-semibold text-foreground leading-tight">
                {current.title}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="flex-none w-full sm:w-auto"
            onClick={onContinueCurrent}
          >
            Continue
          </Button>
        </div>

        {CHAPTERS.map((chapter) => {
          const chapterLessons = SPINE_META.filter((l) => l.chapter === chapter.id);
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
                  const state: NodeState =
                    lesson.id <= completedCount
                      ? 'completed'
                      : lesson.id > completedCount + 1
                        ? 'locked'
                        : 'available';
                  const isNext = lesson.id === completedCount + 1;
                  const branches = branchesFor(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col items-center gap-2.5 relative z-10"
                    >
                      <div className="relative">
                        <PathNode
                          state={state}
                          glyph={lesson.glyph}
                          isNext={isNext}
                          onClick={() => onStartLesson(lesson.id)}
                        />
                        {branches.length > 0 && (
                          <BranchCluster
                            branches={branches}
                            completedCount={completedCount}
                            completedBranches={completedBranches}
                            onStartLesson={onStartLesson}
                          />
                        )}
                      </div>
                      <div
                        className="text-[13px] font-semibold max-w-[160px] text-center leading-tight bg-background px-2.5"
                        style={{ color: state === 'locked' ? 'var(--locked-fg)' : 'var(--foreground)' }}
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
        <Modal label={`Unlock ${confirm.title}`} onClose={() => setConfirm(null)}>
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
        </Modal>
      )}
    </div>
  );
}
