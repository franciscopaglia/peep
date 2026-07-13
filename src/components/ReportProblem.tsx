import { useEffect, useState, type ReactNode } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/Button';

/**
 * A friendly "Report a problem" control. Rather than sending people straight to
 * GitHub's issue form (which is jargon-heavy and needs an account), it first
 * shows a short, plain-language explanation of what will happen.
 *
 * Used in two places: an inline pill inside lessons (with the exercise
 * pre-filled), and an icon-only button in the header for anything else.
 */
export function ReportProblem({
  issueUrl,
  trigger = 'pill',
  heading = 'Spotted a mistake?',
  body = (
    <>
      Thank you for helping make the lessons better! Tapping{' '}
      <span className="font-semibold text-foreground">Continue</span> opens a short form on{' '}
      <span className="font-semibold text-foreground">GitHub</span> where you can describe
      what looked wrong. You'll need a free GitHub account to send it — it only takes a
      moment.
    </>
  ),
  tooltip = 'Report a problem',
}: {
  issueUrl: string;
  trigger?: 'pill' | 'icon';
  heading?: string;
  body?: ReactNode;
  tooltip?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function submit() {
    window.open(issueUrl, '_blank', 'noopener');
    setOpen(false);
  }

  return (
    <>
      {trigger === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={tooltip}
          aria-label={tooltip}
          className="h-[38px] w-[38px] flex-none box-border inline-flex items-center justify-center border border-border bg-card text-muted-foreground rounded-btn cursor-pointer transition-colors hover:text-accent hover:border-accent-border hover:bg-accent-soft"
        >
          <Flag size={17} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={tooltip}
          className="flex-none inline-flex items-center gap-1.5 h-8 px-3 rounded-btn border border-border bg-card text-[13px] font-medium text-muted-foreground transition-colors hover:text-accent hover:border-accent-border hover:bg-accent-soft"
        >
          <Flag size={14} />
          <span className="hidden sm:inline">Report a problem</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'color-mix(in srgb, var(--foreground) 45%, transparent)' }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Report a problem"
        >
          <div
            className="w-full max-w-[400px] rounded-card bg-card border border-border shadow-lg p-7 flex flex-col items-center gap-4 text-center"
            style={{ animation: 'shvPop .2s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <Flag size={22} />
            </div>
            <h2 className="text-lg font-bold text-foreground m-0">{heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground m-0">{body}</p>
            <div className="flex gap-3 w-full mt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={submit}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
