import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  { container: string; iconClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  info: {
    container: 'bg-brand-50 border-brand-200 text-brand-900',
    iconClass: 'text-brand-700',
    Icon: Info,
  },
  success: {
    container: 'bg-status-delivered-bg border-status-delivered-border text-status-delivered-text',
    iconClass: 'text-status-delivered-text',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-status-hold-bg border-status-hold-border text-status-hold-text',
    iconClass: 'text-status-hold-text',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-status-danger-bg border-status-danger-border text-status-danger-text',
    iconClass: 'text-status-danger-text',
    Icon: AlertCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const { container, iconClass, Icon } = alertConfig[type];

  return (
    <div
      role="alert"
      className={`rounded-md border p-3.5 flex items-start gap-3 text-sm ${container} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-black/5 active:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 text-current" />
        </button>
      )}
    </div>
  );
};
