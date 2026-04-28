import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  tone?: "default" | "inverse";
  className?: string;
}

export function Field({
  label,
  hint,
  tone = "default",
  className = "",
  children,
}: PropsWithChildren<FieldProps>) {
  const labelClassName = tone === "inverse" ? "text-white" : "text-ink";
  const hintClassName = tone === "inverse" ? "text-white/65" : "text-slate";

  return (
    <label className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <span className={`block text-sm font-semibold ${labelClassName}`}>
          {label}
        </span>
        {hint ? <p className={`text-xs ${hintClassName}`}>{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}
