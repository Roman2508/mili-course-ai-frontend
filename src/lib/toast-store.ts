export type ToastTone = 'info' | 'success' | 'error' | 'loading';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs?: number;
}

type ToastListener = (toasts: Toast[]) => void;

const listeners = new Set<ToastListener>();
let toasts: Toast[] = [];
let nextToastId = 1;

function emit() {
  for (const listener of listeners) {
    listener(toasts);
  }
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  listener(toasts);

  return () => {
    listeners.delete(listener);
  };
}

export function dismissToast(toastId: number) {
  toasts = toasts.filter((toast) => toast.id !== toastId);
  emit();
}

export function pushToast(input: Omit<Toast, 'id'>) {
  const toast: Toast = {
    id: nextToastId++,
    ...input,
  };

  toasts = [...toasts.slice(-3), toast];
  emit();

  if (toast.durationMs !== 0) {
    window.setTimeout(() => {
      dismissToast(toast.id);
    }, toast.durationMs ?? 5000);
  }

  return toast.id;
}
