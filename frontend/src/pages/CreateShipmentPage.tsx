import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export const CreateShipmentPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb back to Dashboard */}
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
        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
          Create New Shipment
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Register a new consignment with route and delivery schedule.
        </p>
      </div>

      {/* Placeholder card */}
      <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle text-ink-secondary text-sm">
          <PlusCircle className="w-5 h-5 text-brand-700" />
          <span className="font-medium text-ink-primary">
            Batch 3 Creation Form Placeholder
          </span>
        </div>
        <p className="text-sm text-ink-secondary">
          Form fields, Zod-compatible validation, uppercase normalization, and inline conflict handling will be implemented in Batch 3.
        </p>
        <div className="space-y-4 pt-2">
          <Skeleton height={40} className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton height={40} className="w-full" />
            <Skeleton height={40} className="w-full" />
          </div>
          <Skeleton height={40} className="w-full" />
        </div>
      </div>
    </div>
  );
};
