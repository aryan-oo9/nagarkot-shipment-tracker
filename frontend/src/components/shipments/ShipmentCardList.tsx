import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import { Shipment } from '../../types/shipment';
import { formatCalendarDate } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';

export interface ShipmentCardListProps {
  shipments: Shipment[];
}

export const ShipmentCardList: React.FC<ShipmentCardListProps> = ({ shipments }) => {
  return (
    <ul role="list" className="space-y-3" aria-label="Shipment consignment cards">
      {shipments.map((shipment) => (
        <li
          key={shipment.id}
          className="bg-surface rounded-lg border border-border-subtle p-4 shadow-sm hover:border-brand-300 transition-colors"
        >
          {/* Header: Reference + Status */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <Link
              to={`/shipments/${shipment.id}`}
              className="font-mono font-bold text-base text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-1 -mx-1"
            >
              {shipment.reference_number}
            </Link>
            <StatusBadge status={shipment.current_status} size="sm" />
          </div>

          {/* Route details */}
          <div className="py-3 flex items-center gap-2 text-sm text-ink-primary font-medium">
            <span className="truncate">{shipment.origin}</span>
            <ArrowRight className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="truncate">{shipment.destination}</span>
          </div>

          {/* Footer: Expected Delivery + View Details */}
          <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-ink-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Due {formatCalendarDate(shipment.expected_delivery_date)}</span>
            </div>
            <Link
              to={`/shipments/${shipment.id}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-2 py-1"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};
