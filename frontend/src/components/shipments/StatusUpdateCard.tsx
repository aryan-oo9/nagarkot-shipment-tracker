import React, { useState, useEffect } from 'react';
import { ALLOWED_STATUSES, ShipmentStatus } from '../../types/shipment';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export interface StatusUpdateCardProps {
  currentStatus: ShipmentStatus;
  onUpdateStatus: (newStatus: ShipmentStatus, note?: string) => Promise<{ updated: boolean; message: string }>;
  isUpdating: boolean;
}

export const StatusUpdateCard: React.FC<StatusUpdateCardProps> = ({
  currentStatus,
  onUpdateStatus,
  isUpdating,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Sync selected status when currentStatus changes from outside
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      const result = await onUpdateStatus(selectedStatus, note.trim() || undefined);

      if (result.updated) {
        setFeedback({
          type: 'success',
          message: result.message || 'Shipment status updated successfully.',
        });
        setNote(''); // Reset note on successful modification
      } else {
        setFeedback({
          type: 'info',
          message: result.message || 'Status was already current; no update applied.',
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to update shipment status. Please check your connection and try again.';
      setFeedback({
        type: 'error',
        message: errorMessage,
      });
    }
  };


  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-base font-semibold text-ink-primary">
          Update Shipment Status
        </h2>
        <span className="text-xs text-ink-secondary">
          Current status: <span className="font-semibold text-brand-700">{currentStatus}</span>
        </span>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <Alert
          type={feedback.type}
          title={
            feedback.type === 'success'
              ? 'Status Updated'
              : feedback.type === 'info'
              ? 'No Change Applied'
              : 'Update Failed'
          }
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="update-status-select" className="block text-sm font-medium text-ink-primary">
            New Status <span className="text-status-danger-text">*</span>
          </label>
          <select
            id="update-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ShipmentStatus)}
            disabled={isUpdating}
            className="w-full sm:max-w-xs px-3.5 py-2 text-sm bg-surface text-ink-primary rounded-md border border-border-input focus:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors cursor-pointer"
          >
            {ALLOWED_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {selectedStatus === currentStatus && (
            <span className="text-xs text-ink-muted block">
              Notice: Selected status is identical to current status.
            </span>
          )}
        </div>

        {/* Optional Note Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="status-note-input" className="block text-sm font-medium text-ink-primary">
              Operational Note <span className="text-ink-muted font-normal text-xs">(optional)</span>
            </label>
            <span className="text-xs text-ink-muted">{note.length}/1000</span>
          </div>
          <textarea
            id="status-note-input"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isUpdating}
            placeholder="e.g. Consignment cleared custom inspection at Birgunj dry port."
            className="w-full px-3.5 py-2 text-sm bg-surface text-ink-primary rounded-md border border-border-input placeholder:text-ink-muted focus:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors"
          />
        </div>

        {/* Submission Action */}
        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isUpdating}
            disabled={isUpdating}
          >
            Save status update
          </Button>
        </div>
      </form>
    </div>
  );
};
