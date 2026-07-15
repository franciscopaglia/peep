import { useEffect, type ReactNode } from 'react';

/**
 * Centered dialog over a dimmed backdrop. Closes on Escape and backdrop
 * click; clicks inside the card don't propagate out.
 */
export function Modal({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'color-mix(in srgb, var(--foreground) 45%, transparent)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="w-full max-w-[400px] rounded-card bg-card border border-border shadow-lg p-7 flex flex-col items-center gap-4 text-center"
        style={{ animation: 'shvPop .2s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
