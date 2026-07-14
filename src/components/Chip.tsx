import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A small inline chip — used to set Shavian glyphs (and the build version) apart. */
export function Chip({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center mx-0.5 px-1.5 py-0.5 rounded-sm bg-muted',
        className
      )}
      {...props}
    />
  );
}
