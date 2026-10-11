import React from 'react';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Shipment } from '../../types/shipment';
import { formatCalendarDate, formatDateTime } from '../../lib/formatters';

export interface ShipmentSummaryCardProps {
  shipment: Shipment;
}

export const ShipmentSummaryCard: React.FC<ShipmentSummaryCardProps> = ({ shipment }) => {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-base font-semibold text-ink-primary">
          Consignment Overview
        </h2>
        <div className="flex items-center gap-2">
          {shipment.shipment_type && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase ${
                shipment.shipment_type === 'International'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                  : 'bg-purple-50 text-purple-800 border border-purple-200/60'
              }`}
            >
              {shipment.shipment_type}
            </span>
          )}
          <span className="text-xs text-ink-muted">
            Record ID #{shipment.id}
          </span>
        </div>
      </div>

      {/* Grid of Key Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route Details */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />
            Route Information
          </span>
          <div className="bg-canvas/80 rounded-md border border-border-subtle p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs text-ink-muted block">Origin</span>
              <span className="font-semibold text-sm text-ink-primary truncate block" title={shipment.origin}>
                {shipment.origin}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-700 shrink-0" aria-hidden="true" />
            <div className="min-w-0 text-right">
              <span className="text-xs text-ink-muted block">Destination</span>
              <span className="font-semibold text-sm text-ink-primary truncate block" title={shipment.destination}>
                {shipment.destination}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Delivery */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />
            Expected Delivery
          </span>
          <div className="bg-canvas/80 rounded-md border border-border-subtle p-3.5">
            <span className="text-xs text-ink-muted block">Target Schedule</span>
            <span className="font-semibold text-sm text-ink-primary block">
              {formatCalendarDate(shipment.expected_delivery_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Timestamps */}
      <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-ink-secondary">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
          <span>Registered: {formatDateTime(shipment.created_at)}</span>
        </div>
        <div className="text-ink-muted">
          <span>Last modified: {formatDateTime(shipment.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};
