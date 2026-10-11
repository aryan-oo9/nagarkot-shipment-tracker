import React from 'react';
import { ShipmentStatus } from '../../types/shipment';
import { getStatusColorConfig } from '../../lib/formatters';

export interface StatusBadgeProps {
  status: ShipmentStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const config = getStatusColorConfig(status);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1.5'
      : 'px-2.5 py-1 text-xs font-semibold gap-2';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses}
        ${className}
      `}
      aria-label={`Status: ${status}`}
    >
      <span
        className={`${dotSize} rounded-full shrink-0 ${config.dot}`}
        aria-hidden="true"
      />
      <span className="truncate">{status}</span>
    </span>
  );
};
