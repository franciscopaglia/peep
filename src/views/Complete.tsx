import { Button } from '@/components/Button';

export function Complete({
  score,
  total,
  passed,
  passThresholdPct,
  onBack,
  onRetry,
}: {
  score: number;
  total: number;
  passed: boolean;
  passThresholdPct: number;
  onBack: () => void;
  onRetry: () => void;
}) {
  const perfect = score === total;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const heading = !passed
    ? 'Lesson not passed'
    : perfect
      ? 'Perfect lesson!'
      : 'Lesson complete';

  return (
    <div
      className="max-w-[440px] mx-auto px-6 py-[100px] flex flex-col items-center gap-7 text-center"
      style={{ animation: 'shvSlideUp .35s ease' }}
    >
      <div
        className="text-[15px] font-semibold tracking-wide uppercase"
        style={{ color: passed ? 'var(--accent)' : 'var(--danger)' }}
      >
        {heading}
      </div>
      <div className="text-[44px] font-extrabold text-foreground">
        {score} / {total}
      </div>
      <div className="text-[15px] text-muted-foreground">
        first-try correct · {total ? `${accuracy}% accuracy` : ''}
      </div>
      {!passed && (
        <div className="text-sm leading-relaxed text-muted-foreground max-w-[320px]">
          You need {passThresholdPct}% to move on. Give it another go — practice is
          how it sticks.
        </div>
      )}
      {passed ? (
        <Button size="sm" className="w-full py-3.5" onClick={onBack}>
          Back to path
        </Button>
      ) : (
        <div className="flex flex-col gap-2.5 w-full">
          <Button size="sm" className="w-full py-3.5" onClick={onRetry}>
            Try again
          </Button>
          <Button variant="outline" size="sm" className="w-full py-3.5" onClick={onBack}>
            Back to path
          </Button>
        </div>
      )}
    </div>
  );
}
