import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * The small uppercase "eyebrow" label used above sections across the app.
 * Defaults to a <div>; pass `as="h2"` where the label is the section heading.
 */
export function SectionLabel({
  as: Tag = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'h2' }) {
  return (
    <Tag
      className={cn(
        'text-[13px] font-semibold tracking-wide uppercase text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
