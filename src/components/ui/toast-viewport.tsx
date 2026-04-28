import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { subscribeToToasts, dismissToast, type Toast } from "@/lib/toast-store";

const toneStyles: Record<Toast["tone"], string> = {
  info: "border-ink/10 bg-white text-ink",
  success: "border-field/20 bg-[#EDF0ED] text-field",
  error: "border-signal/20 bg-[#FCEFEC] text-signal",
  loading: "border-ink/10 bg-white text-ink",
  // success: 'border-field/20 bg-field/10 text-field',
  // error: 'border-signal/20 bg-signal/10 text-signal',
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  loading: Info,
} satisfies Record<Toast["tone"], typeof Info>;

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToToasts(setToasts);
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toneIcons[toast.tone];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-[24px] border px-4 py-4 ${toneStyles[toast.tone]}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-white p-2">
                {toast.tone === "loading" ? (
                  <Spinner className="size-4 text-ink" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6">{toast.description}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                className="size-9 rounded-2xl p-0"
                onClick={() => dismissToast(toast.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
