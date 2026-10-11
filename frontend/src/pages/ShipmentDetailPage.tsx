import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, FileQuestion } from 'lucide-react';
import { Shipment, ShipmentHistoryItem, ShipmentStatus } from '../types/shipment';
import { ApiError } from '../types/api';
import { apiClient } from '../lib/apiClient';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Skeleton } from '../components/common/Skeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import { CopyReferenceButton } from '../components/shipments/CopyReferenceButton';
import { ShipmentSummaryCard } from '../components/shipments/ShipmentSummaryCard';
import { StatusUpdateCard } from '../components/shipments/StatusUpdateCard';
import { HistoryTimeline } from '../components/shipments/HistoryTimeline';

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // State
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(
    (location.state as { flashMessage?: string } | null)?.flashMessage || null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Validate ID parameter
  const numericId = id && /^\d+$/.test(id) ? parseInt(id, 10) : null;

  const loadShipmentData = useCallback(async () => {
    if (!numericId || numericId <= 0) {
      setError({
        status: 400,
        message: 'Invalid shipment identifier in URL. Expected a positive integer ID.',
      });
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const [shipmentRes, historyRes] = await Promise.all([
        apiClient.getShipment(numericId, controller.signal),
        apiClient.getShipmentHistory(numericId, controller.signal),
      ]);

      setShipment(shipmentRes.data);
      setHistory(historyRes.history);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;

      if (err instanceof ApiError) {
        setError({
          status: err.status,
          message:
            err.status === 404
              ? `Shipment #${numericId} was not found in the consignment database.`
              : err.message,
        });
      } else {
        setError({
          status: 0,
          message: 'Unable to connect to the shipment server. Please check your connection.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    loadShipmentData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadShipmentData]);

  // Handle status update submission
  const handleUpdateStatus = async (
    newStatus: ShipmentStatus,
    note?: string
  ): Promise<{ updated: boolean; message: string }> => {
    if (!numericId) {
      throw new Error('Invalid shipment ID.');
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.updateShipmentStatus(numericId, {
        status: newStatus,
        note,
      });

      // Update parent shipment record
      setShipment(response.data);

      // Re-fetch history timeline to include the newly appended audit entry
      try {
        const historyRes = await apiClient.getShipmentHistory(numericId);
        setHistory(historyRes.history);
      } catch {
        // Retain existing history if refresh fails
      }

      const isNoOp =
        response.message.toLowerCase().includes('already current') ||
        response.message.toLowerCase().includes('no update applied');

      return {
        updated: !isNoOp,
        message: response.message,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Invalid ID parameter view
  if (!numericId || numericId <= 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-status-danger-bg text-status-danger-text flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-ink-primary">Invalid Shipment Identifier</h1>
        <p className="text-sm text-ink-secondary">
          The requested URL path does not contain a valid numeric shipment record ID.
        </p>
        <Link to="/shipments">
          <Button variant="primary">Return to Shipments Dashboard</Button>
        </Link>
      </div>
    );
  }

  // 2. 404 Not Found View
  if (!isLoading && error?.status === 404) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-ink-primary">We couldn't find this shipment</h1>
        <p className="text-sm text-ink-secondary max-w-sm mx-auto">
          Consignment record #{numericId} does not exist in the database or may have been deleted.
        </p>
        <Link to="/shipments">
          <Button variant="primary">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  // 3. Generic Network / Server Error View
  if (!isLoading && error && error.status !== 404) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        <Alert type="error" title="We couldn't load shipment details">
          {error.message}
        </Alert>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadShipmentData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
          <Link to="/shipments">
            <Button variant="ghost">Back to Shipments</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Loading Skeletons
  if (isLoading || !shipment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" aria-busy="true" aria-label="Loading consignment record">
        <div className="space-y-2">
          <Skeleton height={20} className="w-48" />
          <Skeleton height={36} className="w-72" />
        </div>
        <Skeleton height={180} className="w-full rounded-lg" />
        <Skeleton height={220} className="w-full rounded-lg" />
        <Skeleton height={260} className="w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Flash Alert from creation redirect */}
      {flashMessage && (
        <Alert type="success" title="Success" onClose={() => setFlashMessage(null)}>
          {flashMessage}
        </Alert>
      )}

      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/shipments"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded p-0.5 transition-colors"
          aria-label="Return to shipments dashboard"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Shipments / {shipment.reference_number}</span>
        </Link>
      </div>

      {/* Header: Prominent Monospace Reference + Status Badge + Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Consignment Tracking ID
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-ink-primary tracking-tight">
              {shipment.reference_number}
            </h1>
            <StatusBadge status={shipment.current_status} size="md" />
            <CopyReferenceButton referenceNumber={shipment.reference_number} />
          </div>
        </div>
      </div>

      {/* Section 1: Overview Summary Card */}
      <section aria-label="Consignment overview">
        <ShipmentSummaryCard shipment={shipment} />
      </section>

      {/* Section 2: Update Status Card */}
      <section aria-label="Update consignment status">
        <StatusUpdateCard
          currentStatus={shipment.current_status}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      </section>

      {/* Section 3: Chronological History Timeline */}
      <section aria-label="Shipment status audit history">
        <HistoryTimeline history={history} />
      </section>
    </div>
  );
};
