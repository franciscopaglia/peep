import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Exercise } from '@/lessons';
import type { Status } from '@/lib/lesson-machine';
import { IconButton } from '@/components/IconButton';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { ReportProblem } from '@/components/ReportProblem';
import { lessonIssueUrl } from '@/lib/constants';

/**
 * Distraction-free exercise playback: the progress header, one exercise card at
 * a time, and the check / skip / result footer. The cards themselves live in
 * components/exercises — this view owns only the frame around them.
 */
export function Lesson({
  exercise,
  exIndex,
  exTotal,
  gradedStep,
  gradedTotal,
  progressPct,
  lessonId,
  lessonTitle,
  status,
  canCheck,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onClose,
  onCheckAnswer,
  onSkip,
  onContinueNext,
  ...answer
}: {
  exercise: Exercise;
  exIndex: number;
  exTotal: number;
  gradedStep: number;
  gradedTotal: number;
  progressPct: number;
  lessonId: number;
  lessonTitle: string;
  status: Status;
  /** Whether the answer is complete enough to grade — from the lesson machine. */
  canCheck: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onClose: () => void;
  onCheckAnswer: () => void;
  onSkip: () => void;
  onContinueNext: () => void;
  selected: string | null;
  typedValue: string;
  tileSel: number[];
  fillSel: Record<number, number>;
  matchSelLeft: string | null;
  matchSelRight: string | null;
  matchedKeys: string[];
  matchWrong: boolean;
  onSelectOption: (opt: string) => void;
  onTypeChange: (v: string) => void;
  onTileAdd: (i: number) => void;
  onTileRemove: (pos: number) => void;
  onFillAdd: (i: number) => void;
  onFillRemove: (pos: number) => void;
  onMatchClick: (side: 'left' | 'right', value: string) => void;
  onAssign: (item: number, bucket: number) => void;
}) {
  const isWrong = status === 'wrong';
  const isTeach = exercise.type === 'teach';
  // `match` grades itself as the pairs are found, and a teach card is never
  // graded at all — neither gets a Check button.
  const showCheckButton = status === 'active' && exercise.type !== 'match' && !isTeach;
  const showSkip = status === 'active' && !isTeach;
  const showResultBar = status !== 'active';

  return (
    <div
      className="max-w-[640px] mx-auto px-5 sm:px-6 pt-6 sm:pt-7 pb-10 flex flex-col box-border"
      style={{ minHeight: '100dvh' }}
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-9 sm:mb-11">
        <IconButton onClick={onClose} aria-label="Close lesson">
          <X size={18} />
        </IconButton>
        <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex-none text-[13px] font-semibold text-muted-foreground min-w-[44px] text-right">
          {gradedStep} / {gradedTotal}
        </div>
        {/* Step over ground already seen — answers and results come back with
            you. Forward stops at the furthest exercise reached, so this can
            never jump past one without answering it. */}
        <div className="flex-none flex items-center gap-1.5">
          <IconButton onClick={onGoBack} disabled={!canGoBack} aria-label="Previous exercise">
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton onClick={onGoForward} disabled={!canGoForward} aria-label="Next exercise">
            <ChevronRight size={18} />
          </IconButton>
        </div>
        <ReportProblem
          issueUrl={lessonIssueUrl(lessonId, lessonTitle, Math.min(exIndex + 1, exTotal))}
          tooltip="Report a problem with this exercise"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-9">
        <ExerciseCard
          {...answer}
          exercise={exercise}
          status={status}
          onContinueNext={onContinueNext}
        />
      </div>

      <div className="mt-6">
        {showCheckButton && (
          <button
            className="w-full py-[13px] rounded-btn border-none font-semibold text-sm"
            style={{
              background: canCheck ? 'var(--accent)' : 'var(--border)',
              color: canCheck ? 'var(--card)' : 'var(--muted-foreground)',
              cursor: canCheck ? 'pointer' : 'default',
            }}
            onClick={onCheckAnswer}
            disabled={!canCheck}
          >
            Check
          </button>
        )}
        {showSkip && (
          <button
            className="block mx-auto mt-3.5 bg-transparent border-none text-muted-foreground text-[13px] font-medium cursor-pointer underline underline-offset-4"
            onClick={onSkip}
          >
            Skip this one
          </button>
        )}
        {showResultBar && (
          <div
            className="flex items-center justify-between gap-5 px-5 py-[18px] rounded-card"
            style={{
              background: isWrong ? 'var(--danger-soft)' : 'var(--success-soft)',
              animation: 'shvSlideUp .25s ease',
            }}
          >
            <div className="flex flex-col gap-0.5">
              <div
                className="font-bold text-base"
                style={{ color: isWrong ? 'var(--danger)' : 'var(--success)' }}
              >
                {isWrong ? 'Not quite' : 'Correct!'}
              </div>
              {isWrong && 'correctLabel' in exercise && (
                <div className="text-[13px]" style={{ color: 'var(--danger)' }}>
                  Correct answer: {exercise.correctLabel}
                </div>
              )}
            </div>
            <button
              className="flex-none px-[22px] py-[11px] rounded-btn border-none text-card font-semibold text-sm cursor-pointer"
              style={{ background: isWrong ? 'var(--danger)' : 'var(--success)' }}
              onClick={onContinueNext}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
