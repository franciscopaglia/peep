import { Button } from '@/components/Button';

export function Complete({
  score,
  total,
  onBack,
}: {
  score: number;
  total: number;
  onBack: () => void;
}) {
  const perfect = score === total;
  const accuracy = total ? Math.round((score / total) * 100) : 0;

  return (
    <div
      className="max-w-[440px] mx-auto px-6 py-[100px] flex flex-col items-center gap-7 text-center"
      style={{ animation: 'shvSlideUp .35s ease' }}
    >
      <div className="text-[15px] font-semibold tracking-wide uppercase text-accent">
        {perfect ? 'Perfect lesson!' : 'Lesson complete'}
      </div>
      <div className="text-[44px] font-extrabold text-foreground">
        {score} / {total}
      </div>
      <div className="text-[15px] text-muted-foreground">
        first-try correct · {total ? `${accuracy}% accuracy` : ''}
      </div>
      <Button size="sm" className="w-full py-3.5" onClick={onBack}>
        Back to path
      </Button>
    </div>
  );
}
