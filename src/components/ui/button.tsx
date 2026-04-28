import { cloneElement, isValidElement, type ButtonHTMLAttributes, type PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-white shadow-[0_12px_24px_rgba(23,33,45,0.18)] hover:bg-slate active:translate-y-px',
  secondary: 'bg-field text-white hover:bg-field/90 active:translate-y-px',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  danger: 'bg-signal text-white hover:bg-signal/90',
};

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  asChild = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    fullWidth && 'w-full',
    className,
  );

  if (asChild && isValidElement(children)) {
    const childProps = children.props as { className?: string };

    return cloneElement(children, {
      ...props,
      className: cn(classes, childProps.className),
    });
  }

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
