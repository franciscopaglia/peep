import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/SectionLabel';

export function PageIntro({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-[image:var(--hero-bg)]">
      <div className="mx-auto max-w-[1120px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionLabel className="text-accent">{eyebrow}</SectionLabel>
        <h1 className="mt-3 text-[36px] font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-[640px] text-base leading-relaxed text-muted-foreground sm:text-lg">{children}</p>
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
