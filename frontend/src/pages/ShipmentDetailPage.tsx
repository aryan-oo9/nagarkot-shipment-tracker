import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/shipments"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded p-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipments</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Shipment Record #{id || '—'}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight font-mono mt-1">
          SHIPMENT #{id}
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Detailed consignment status, routing, and chronological audit history.
        </p>
      </div>

      {/* Placeholder card */}
      <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle text-ink-secondary text-sm">
          <Clock className="w-5 h-5 text-brand-700" />
          <span className="font-medium text-ink-primary">
            Batch 4 Details &amp; History Timeline Placeholder
          </span>
        </div>
        <p className="text-sm text-ink-secondary">
          Summary cards, status update transitions (with optional notes), and full append-only audit history will be integrated in Batch 4.
        </p>
        <div className="space-y-4 pt-2">
          <Skeleton height={80} className="w-full" />
          <Skeleton height={120} className="w-full" />
          <Skeleton height={180} className="w-full" />
        </div>
      </div>
    </div>
  );
};
