import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Clock, Plus } from 'lucide-react';
import { Shipment } from '../../types/shipment';
import { formatCalendarDate, formatDateTime } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { Skeleton } from '../common/Skeleton';

export interface RecentShipmentsPanelProps {
  recentShipments: Shipment[];
  isLoading?: boolean;
}

export const RecentShipmentsPanel: React.FC<RecentShipmentsPanelProps> = ({
  recentShipments,
  isLoading = false,
}) => {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink-primary">
            Recent shipments
          </h2>
          <span className="text-xs text-ink-muted">
            Latest 5 records
          </span>
        </div>
        <Link
          to="/shipments"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-1.5 py-0.5 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 py-1">
        {isLoading ? (
          <div className="divide-y divide-border-subtle" aria-busy="true" aria-label="Loading recent shipments">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                  <Skeleton className="w-48 h-3 rounded" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="w-20 h-5 rounded-full ml-auto" />
                  <Skeleton className="w-16 h-3 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : recentShipments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-ink-muted">
              No shipment records found in the system yet.
            </p>
            <Link
              to="/shipments/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first shipment</span>
            </Link>
          </div>
        ) : (
          <ul
            className="divide-y divide-border-subtle"
            aria-label="List of latest 5 updated shipments"
          >
            {recentShipments.map((shipment) => (
              <li
                key={shipment.id}
                className="py-3 sm:py-3.5 hover:bg-canvas/60 rounded px-2 -mx-2 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left col: Reference, Type, and Route */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="font-mono font-bold text-sm text-brand-700 hover:text-brand-900 group-hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-0.5"
                    >
                      {shipment.reference_number}
                    </Link>
                    {shipment.shipment_type && (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${
                          shipment.shipment_type === 'International'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-purple-50 text-purple-800 border border-purple-200/60'
                        }`}
                      >
                        {shipment.shipment_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-secondary truncate">
                    <span className="font-medium text-ink-primary truncate max-w-[120px] sm:max-w-[160px]" title={shipment.origin}>
                      {shipment.origin}
                    </span>
                    <ArrowRight className="w-3 h-3 text-ink-muted shrink-0" aria-hidden="true" />
                    <span className="font-medium text-ink-primary truncate max-w-[120px] sm:max-w-[160px]" title={shipment.destination}>
                      {shipment.destination}
                    </span>
                  </div>
                </div>

                {/* Right col: Status badge, due date, update time, and view action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                  <div className="text-left sm:text-right space-y-0.5">
                    <StatusBadge status={shipment.current_status} size="sm" />
                    <div className="text-[11px] text-ink-muted">
                      Due {formatCalendarDate(shipment.expected_delivery_date)}
                    </div>
                  </div>

                  {shipment.updated_at && (
                    <div className="hidden md:flex flex-col text-right text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>Updated</span>
                      </span>
                      <span>{formatDateTime(shipment.updated_at)}</span>
                    </div>
                  )}

                  <Link
                    to={`/shipments/${shipment.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 hover:text-brand-900 group-hover:translate-x-0.5 transition-all p-1"
                    aria-label={`View details for ${shipment.reference_number}`}
                  >
                    <span className="hidden sm:inline">Details</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
