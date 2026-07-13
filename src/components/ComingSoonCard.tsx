import { Lock } from 'lucide-react';

export function ComingSoonCard({
  title = 'More lessons on the way',
  body,
}: {
  title?: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 rounded-card border border-dashed border-border text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
        style={{ background: 'var(--locked-bg)', color: 'var(--locked-fg)' }}
      >
        <Lock size={22} />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="text-[13px] text-muted-foreground max-w-[280px]">{body}</div>
    </div>
  );
}
