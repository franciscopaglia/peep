import { useState, type ReactNode } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Modal } from '@/components/Modal';

/**
 * A friendly "Report a problem" control. Rather than sending people straight to
 * GitHub's issue form (which is jargon-heavy and needs an account), it first
 * shows a short, plain-language explanation of what will happen.
 *
 * Used in a few places: a labelled button in the lesson header (with the
 * exercise pre-filled), an icon-only one in the nav, and a plain text link in
 * the footer — all opening the same modal.
 */
export function ReportProblem({
  issueUrl,
  trigger = 'pill',
  label = 'Report a problem',
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
  trigger?: 'pill' | 'icon' | 'link';
  label?: string;
  heading?: string;
  body?: ReactNode;
  tooltip?: string;
}) {
  const [open, setOpen] = useState(false);

  function submit() {
    window.open(issueUrl, '_blank', 'noopener');
    setOpen(false);
  }

  return (
    <>
      {trigger === 'link' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-muted-foreground bg-transparent border-none p-0 cursor-pointer text-left transition-colors hover:text-accent"
        >
          {label}
        </button>
      ) : (
        <IconButton
          onClick={() => setOpen(true)}
          title={tooltip}
          aria-label={tooltip}
          label={trigger === 'pill' ? label : undefined}
        >
          <Flag size={trigger === 'pill' ? 15 : 17} />
        </IconButton>
      )}

      {open && (
        <Modal label="Report a problem" onClose={() => setOpen(false)}>
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
        </Modal>
      )}
    </>
  );
}
