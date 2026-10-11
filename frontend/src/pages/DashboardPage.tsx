import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, SlidersHorizontal, Table } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
            Shipment Operations Dashboard
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Track and monitor consignment statuses across origin and destination hubs.
          </p>
        </div>
        <div>
          <Link to="/shipments/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Batch 1 Foundation Demonstration Placeholder */}
      <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-ink-secondary text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4 text-brand-700" />
            <span>Search &amp; Filter Foundation Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="Booked" size="sm" />
            <StatusBadge status="In Transit" size="sm" />
            <StatusBadge status="Customs Hold" size="sm" />
            <StatusBadge status="Delivered" size="sm" />
          </div>
        </div>

        <div className="py-8 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 mx-auto">
            <Table className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-ink-primary">
            Batch 1 Foundation Loaded
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Project configuration, tokens, routing skeleton, and shared shell are active.
            The shipment table, search, filters, and pagination will be integrated in Batch 2.
          </p>
        </div>

        {/* Skeleton Preview */}
        <div className="space-y-3 pt-4 border-t border-border-subtle">
          <Skeleton height={36} className="w-full" />
          <Skeleton height={48} className="w-full" />
          <Skeleton height={48} className="w-full" />
        </div>
      </div>
    </div>
  );
};
