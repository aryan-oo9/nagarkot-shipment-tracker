import React from 'react';
import { History, MessageSquare } from 'lucide-react';
import { ShipmentHistoryItem } from '../../types/shipment';
import { formatDateTime, getStatusColorConfig } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';

export interface HistoryTimelineProps {
  history: ShipmentHistoryItem[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history }) => {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-ink-primary">
            Shipment History
          </h2>
        </div>
        <span className="text-xs text-ink-secondary">
          {history.length} event{history.length === 1 ? '' : 's'} recorded (Chronological)
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-6">
          No historical transitions recorded for this shipment.
        </p>
      ) : (
        <ol className="relative border-l border-border-subtle ml-3 sm:ml-4 space-y-6" aria-label="Chronological status transition timeline">
          {history.map((event, index) => {
            const config = getStatusColorConfig(event.status);
            const isInitial = index === 0;

            return (
              <li key={event.id} className="relative pl-6 sm:pl-8 group">
                {/* Timeline node dot */}
                <div
                  className={`
                    absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-surface
                    ${config.dot} shadow-xs
                  `}
                  aria-hidden="true"
                />

                {/* Event Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={event.status} size="sm" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      {isInitial ? 'Initial Booking' : `Event #${index + 1}`}
                    </span>
                  </div>
                  <time
                    dateTime={event.changed_at}
                    className="text-xs text-ink-secondary font-mono"
                  >
                    {formatDateTime(event.changed_at)}
                  </time>
                </div>

                {/* Operational Remark / Note */}
                {event.note ? (
                  <div className="mt-2 text-xs sm:text-sm bg-canvas/70 border border-border-subtle rounded-md p-3 text-ink-primary flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="leading-relaxed whitespace-pre-wrap italic">
                      {event.note}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-ink-muted italic block mt-1">
                    No note attached to this transition.
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
