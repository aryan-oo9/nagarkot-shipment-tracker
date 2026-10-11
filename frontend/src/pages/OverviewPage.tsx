import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardSummary } from '../types/shipment';
import { apiClient } from '../lib/apiClient';
import { DashboardMetricCards } from '../components/dashboard/DashboardMetricCards';
import { RecentShipmentsPanel } from '../components/dashboard/RecentShipmentsPanel';
import { StatusDonutChart } from '../components/dashboard/StatusDonutChart';
import { Button } from '../components/common/Button';

export const OverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getDashboardSummary(controller.signal);
      setSummary(response.data);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load operational metrics. Please check your connection and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSummary]);

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Heading */}
      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          A clear view of your shipment operations.
        </p>
      </div>

      {/* 2. Error & Retry State */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-status-danger-border bg-status-danger-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-status-danger-text text-sm shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSummary}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* 3. Four Summary Cards */}
      <DashboardMetricCards
        thisMonth={summary?.thisMonth ?? 0}
        thisYear={summary?.thisYear ?? 0}
        domestic={summary?.domestic ?? 0}
        international={summary?.international ?? 0}
        isLoading={isLoading}
      />

      {/* 4. Lower Dashboard: 75% Recent Shipments + 25% Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 75%: Recent Shipments Panel */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <RecentShipmentsPanel
            recentShipments={summary?.recentShipments ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Right 25%: Status Donut Chart */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
          <StatusDonutChart
            statusCounts={
              summary?.statusCounts ?? {
                booked: 0,
                inTransit: 0,
                customsHold: 0,
                delivered: 0,
              }
            }
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
