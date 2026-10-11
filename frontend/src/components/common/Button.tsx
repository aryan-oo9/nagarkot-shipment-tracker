import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white shadow-sm border border-transparent focus-visible:ring-brand-700',
  secondary:
    'bg-brand-50 hover:bg-brand-100 active:bg-brand-200 text-brand-900 border border-brand-200 focus-visible:ring-brand-700',
  outline:
    'bg-surface hover:bg-surface-subtle active:bg-brand-50 text-ink-primary border border-border-input hover:border-brand-600 focus-visible:ring-brand-700 shadow-sm',
  danger:
    'bg-status-danger-bg hover:bg-red-100 active:bg-red-200 text-status-danger-text border border-status-danger-border focus-visible:ring-red-600',
  ghost:
    'bg-transparent hover:bg-brand-50 active:bg-brand-100 text-ink-secondary hover:text-ink-primary focus-visible:ring-brand-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded',
  md: 'px-3.5 py-2 text-sm font-medium rounded-md',
  lg: 'px-4 py-2.5 text-base font-medium rounded-md',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-150 ease-in-out
        select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
};
