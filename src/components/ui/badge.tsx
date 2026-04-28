import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  tone?: 'neutral' | 'field' | 'warning' | 'signal';
  className?: string;
}

const toneClasses = {
  neutral: 'bg-ink/5 text-ink',
  field: 'bg-field/10 text-field',
  warning: 'bg-brass/15 text-brass',
  signal: 'bg-signal/10 text-signal',
};

export function Badge({ children, className, tone = 'neutral' }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
