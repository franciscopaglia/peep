import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * An outlined header control (close, step back/forward, report a problem). The
 * outline is what makes an icon read as clickable, so keep it even when the
 * icon seems obvious.
 *
 * Square by default; pass `label` for one that carries text beside its icon —
 * same height, border and hover either way, so a row of them looks like a set.
 * The label hides below `sm`, where the header has no room for it.
 *
 * Icon-only means no accessible name, so always pass an `aria-label`.
 */
export function IconButton({
  label,
  className,
  disabled,
  children,
  ...props
}: ComponentProps<'button'> & { label?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'h-[38px] flex-none box-border inline-flex items-center justify-center',
        'rounded-btn border bg-card transition-colors',
        label ? 'gap-1.5 px-3 text-[13px] font-medium' : 'w-[38px]',
        disabled
          ? 'border-border text-border cursor-default'
          : 'border-border text-muted-foreground cursor-pointer hover:text-accent hover:border-accent-border hover:bg-accent-soft',
        className
      )}
      {...props}
    >
      {children}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
