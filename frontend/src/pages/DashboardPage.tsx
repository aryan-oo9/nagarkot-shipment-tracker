import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { PaginationMeta } from '../types/api';
import { apiClient } from '../lib/apiClient';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { SearchFilterBar } from '../components/shipments/SearchFilterBar';
import { ShipmentTable } from '../components/shipments/ShipmentTable';
import { ShipmentCardList } from '../components/shipments/ShipmentCardList';
import { PaginationControls } from '../components/shipments/PaginationControls';

const DEFAULT_PAGE_LIMIT = 20;

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL search parameters
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = (searchParams.get('status') as ShipmentStatus) || '';
  const currentOffset = parseInt(searchParams.get('offset') || '0', 10);
  const currentLimit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT), 10);

  // Component state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    limit: currentLimit,
    offset: currentOffset,
    hasNextPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Concurrency & stale response protection
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch shipments matching active search/filter/pagination criteria
  const fetchShipments = useCallback(async () => {
    // 1. Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Increment request ID to detect and discard stale out-of-order responses
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.listShipments(
        {
          search: currentSearch || undefined,
          status: currentStatus || undefined,
          limit: currentLimit,
          offset: currentOffset,
        },
        controller.signal
      );

      // 3. Drop response if a newer query has already superseded this one
      if (currentRequestId !== requestIdRef.current) return;

      setShipments(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      if (currentRequestId !== requestIdRef.current) return;

      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Normal request cancellation, ignore
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to load shipments. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentSearch, currentStatus, currentOffset, currentLimit]);

  // Trigger fetch when URL parameters change
  useEffect(() => {
    fetchShipments();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchShipments]);

  // Sync parameter updates to URL query string
  const updateQueryParams = (updates: {
    search?: string;
    status?: string;
    offset?: number;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    // Search update
    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        nextParams.set('search', updates.search.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.delete('offset'); // Reset to first page
    }

    // Status update
    if (updates.status !== undefined) {
      if (updates.status) {
        nextParams.set('status', updates.status);
      } else {
        nextParams.delete('status');
      }
      nextParams.delete('offset'); // Reset to first page
    }

    // Offset update
    if (updates.offset !== undefined) {
      if (updates.offset > 0) {
        nextParams.set('offset', String(updates.offset));
      } else {
        nextParams.delete('offset');
      }
    }

    setSearchParams(nextParams);
  };

  const handleSearchChange = (query: string) => {
    updateQueryParams({ search: query });
  };

  const handleStatusChange = (status: ShipmentStatus | '') => {
    updateQueryParams({ status });
  };

  const handleClearFilters = () => {
    const nextParams = new URLSearchParams();
    setSearchParams(nextParams);
  };

  const handlePageChange = (newOffset: number) => {
    updateQueryParams({ offset: newOffset });
  };

  const isFilterActive = Boolean(currentSearch || currentStatus);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
            Shipments
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Track, search and manage consignment records.
          </p>
        </div>
        <div>
          <Link to="/shipments/new">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              aria-label="Create new shipment"
            >
              New shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Status Filter Bar */}
      <SearchFilterBar
        searchTerm={currentSearch}
        statusFilter={currentStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <section aria-label="Shipment list section" className="relative space-y-4">
        {/* Subtle in-progress indicator when refreshing with existing data */}
        {isLoading && shipments.length > 0 && (
          <div
            aria-live="polite"
            className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-surface/90 text-brand-700 border border-brand-200 rounded shadow-sm backdrop-blur-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span>Updating…</span>
          </div>
        )}

        {/* 1. Error State */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-status-danger-border bg-status-danger-bg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-status-danger-text shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-sm font-semibold text-status-danger-text">
                  We couldn't load shipments
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchShipments}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {/* 2. Initial Loading Skeleton */}
        {isLoading && shipments.length === 0 && !error && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading shipments">
            {/* Desktop Table Skeleton */}
            <div className="hidden md:block bg-surface rounded-lg border border-border-subtle p-4 space-y-3 shadow-sm">
              <Skeleton height={32} className="w-full" />
              <Skeleton height={44} className="w-full" />
              <Skeleton height={44} className="w-full" />
              <Skeleton height={44} className="w-full" />
              <Skeleton height={44} className="w-full" />
            </div>
            {/* Mobile Card Skeleton */}
            <div className="md:hidden space-y-3">
              <Skeleton height={104} className="w-full rounded-lg" />
              <Skeleton height={104} className="w-full rounded-lg" />
              <Skeleton height={104} className="w-full rounded-lg" />
            </div>
          </div>
        )}

        {/* 3. Empty State: Search/Filter returned no matches */}
        {!isLoading && !error && shipments.length === 0 && isFilterActive && (
          <EmptyState
            title="No shipments found"
            description="No consignment records match your current reference search or status filter."
            action={
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            }
          />
        )}

        {/* 4. Empty State: Database has zero shipments */}
        {!isLoading && !error && shipments.length === 0 && !isFilterActive && (
          <EmptyState
            title="No shipments yet"
            description="No shipments have been registered yet in the system."
            action={
              <Link to="/shipments/new">
                <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                  Create your first shipment
                </Button>
              </Link>
            }
          />
        )}

        {/* 5. Populated Results: Desktop Table & Mobile Card List */}
        {!error && shipments.length > 0 && (
          <div className="space-y-4">
            {/* Desktop scannable table (>=768px) */}
            <div className="hidden md:block">
              <ShipmentTable shipments={shipments} />
            </div>

            {/* Mobile responsive card list (<768px) */}
            <div className="md:hidden">
              <ShipmentCardList shipments={shipments} />
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              total={pagination.total}
              limit={pagination.limit}
              offset={pagination.offset}
              hasNextPage={pagination.hasNextPage}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </section>
    </div>
  );
};
