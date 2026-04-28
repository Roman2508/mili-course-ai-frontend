import { cn, formatPercent } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          <span>Прогрес</span>
          <span>{formatPercent(normalizedValue)}</span>
        </div>
      ) : null}
      <div className="h-2 rounded-full bg-ink/8">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-field via-brass to-field transition-all duration-500"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
