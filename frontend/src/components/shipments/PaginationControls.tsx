import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

export interface PaginationControlsProps {
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  onPageChange: (newOffset: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  total,
  limit,
  offset,
  hasNextPage,
  onPageChange,
  isLoading = false,
}) => {
  if (total === 0) return null;

  const startRecord = offset + 1;
  const endRecord = Math.min(offset + limit, total);
  const canGoPrevious = offset > 0;
  const canGoNext = hasNextPage && endRecord < total;

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle"
      aria-label="Shipment list pagination"
    >
      {/* Summary readout */}
      <div className="text-xs sm:text-sm text-ink-secondary" aria-live="polite">
        Showing <span className="font-semibold text-ink-primary">{startRecord}</span>–
        <span className="font-semibold text-ink-primary">{endRecord}</span> of{' '}
        <span className="font-semibold text-ink-primary">{total}</span> shipments
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!canGoPrevious || isLoading}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(offset + limit)}
          disabled={!canGoNext || isLoading}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
