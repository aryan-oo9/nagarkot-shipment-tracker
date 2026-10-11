import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Shipment } from '../../types/shipment';
import { formatCalendarDate } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';

export interface ShipmentTableProps {
  shipments: Shipment[];
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({ shipments }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <caption className="sr-only">List of registered shipments and consignment statuses</caption>
        <thead>
          <tr className="border-b border-border-subtle bg-canvas/70 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-4">
              Reference
            </th>
            <th scope="col" className="py-3.5 px-4">
              Route
            </th>
            <th scope="col" className="py-3.5 px-4">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4">
              Expected Delivery
            </th>
            <th scope="col" className="py-3.5 pr-4 sm:pr-6 pl-4 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {shipments.map((shipment) => (
            <tr
              key={shipment.id}
              className="hover:bg-brand-50/40 transition-colors group"
            >
              {/* Reference Number & Type */}
              <td className="py-4 pl-4 sm:pl-6 pr-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/shipments/${shipment.id}`}
                    className="font-mono font-semibold text-brand-700 hover:text-brand-900 group-hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-1 -mx-1"
                    aria-label={`View shipment ${shipment.reference_number}`}
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
              </td>

              {/* Route */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-1.5 text-ink-primary font-medium">
                  <span className="truncate max-w-[140px] sm:max-w-[180px]" title={shipment.origin}>
                    {shipment.origin}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[140px] sm:max-w-[180px]" title={shipment.destination}>
                    {shipment.destination}
                  </span>
                </div>
              </td>

              {/* Status Badge */}
              <td className="py-4 px-4 whitespace-nowrap">
                <StatusBadge status={shipment.current_status} />
              </td>

              {/* Expected Delivery Date */}
              <td className="py-4 px-4 whitespace-nowrap text-ink-secondary">
                {formatCalendarDate(shipment.expected_delivery_date)}
              </td>

              {/* View Action Link */}
              <td className="py-4 pr-4 sm:pr-6 pl-4 whitespace-nowrap text-right">
                <Link
                  to={`/shipments/${shipment.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-2.5 py-1.5 hover:bg-brand-50 transition-colors"
                >
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
