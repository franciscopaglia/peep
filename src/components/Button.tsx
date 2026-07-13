import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'outline' | 'inverted';
type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  // Filled accent — the default call to action.
  primary: 'bg-accent text-card border-transparent',
  // Bordered, sits on the page background.
  outline: 'bg-card text-foreground border-border',
  // Filled card — for use on top of an accent background.
  inverted: 'bg-card text-accent border-transparent',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-[26px] py-[13px] text-[15px]',
};

/**
 * The app's page-level call-to-action button, styled with the design tokens.
 * (Distinct from the unused shadcn `ui/button`, which follows a different token set.)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        'rounded-btn border font-semibold cursor-pointer',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
