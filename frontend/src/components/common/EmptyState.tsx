import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border-subtle bg-surface ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 mb-3.5">
        {icon || <PackageOpen className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-ink-primary mb-1">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
