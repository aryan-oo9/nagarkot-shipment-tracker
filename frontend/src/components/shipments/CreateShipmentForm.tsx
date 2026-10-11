import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALLOWED_STATUSES, CreateShipmentFormData, ShipmentStatus } from '../../types/shipment';
import { isValidCalendarDate, normalizeReferenceNumber } from '../../lib/formatters';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export interface CreateShipmentFormProps {
  onSubmit: (formData: CreateShipmentFormData) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
  serverFieldErrors: Record<string, string>;
  onClearServerError?: () => void;
}

export const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({
  onSubmit,
  isSubmitting,
  serverError,
  serverFieldErrors,
  onClearServerError,
}) => {
  // Form input states
  const [referenceNumber, setReferenceNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus>('Booked');

  // Client-side validation error state
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const hasError = (field: string): boolean => {
    return Boolean(serverFieldErrors[field] || (touched[field] && clientErrors[field]));
  };

  const getErrorMessage = (field: string): string | undefined => {
    if (serverFieldErrors[field]) return serverFieldErrors[field];
    if (touched[field] && clientErrors[field]) return clientErrors[field];
    return undefined;
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'referenceNumber': {
        const trimmed = value.trim();
        if (!trimmed) return 'Reference number is required';
        if (trimmed.length > 64) return 'Reference number cannot exceed 64 characters';
        return '';
      }
      case 'origin': {
        const trimmed = value.trim();
        if (!trimmed) return 'Origin is required';
        if (trimmed.length > 255) return 'Origin cannot exceed 255 characters';
        return '';
      }
      case 'destination': {
        const trimmed = value.trim();
        if (!trimmed) return 'Destination is required';
        if (trimmed.length > 255) return 'Destination cannot exceed 255 characters';
        return '';
      }
      case 'expectedDeliveryDate': {
        const trimmed = value.trim();
        if (!trimmed) return 'Expected delivery date is required';
        if (!isValidCalendarDate(trimmed)) {
          return 'Expected delivery date must be a valid calendar date in YYYY-MM-DD format';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, value);
    setClientErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      referenceNumber: true,
      origin: true,
      destination: true,
      expectedDeliveryDate: true,
      currentStatus: true,
    });

    const refError = validateField('referenceNumber', referenceNumber);
    const originError = validateField('origin', origin);
    const destError = validateField('destination', destination);
    const dateError = validateField('expectedDeliveryDate', expectedDeliveryDate);

    const validationErrors: Record<string, string> = {};
    if (refError) validationErrors.referenceNumber = refError;
    if (originError) validationErrors.origin = originError;
    if (destError) validationErrors.destination = destError;
    if (dateError) validationErrors.expectedDeliveryDate = dateError;

    setClientErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first erroneous input for accessibility
      const firstField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstField);
      if (element) element.focus();
      return;
    }

    const payload: CreateShipmentFormData = {
      referenceNumber: normalizeReferenceNumber(referenceNumber),
      origin: origin.trim(),
      destination: destination.trim(),
      expectedDeliveryDate: expectedDeliveryDate.trim(),
      currentStatus,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-7 shadow-sm space-y-5"
      aria-label="Create new consignment form"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs text-ink-secondary">
        <span>Register shipment details</span>
        <span>
          Fields marked with <span className="text-status-danger-text font-bold">*</span> are required
        </span>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <Alert type="error" title="We couldn't create the shipment" onClose={onClearServerError}>
          {serverError}
        </Alert>
      )}

      {/* 1. Reference Number */}
      <div className="space-y-1.5">
        <label htmlFor="referenceNumber" className="block text-sm font-medium text-ink-primary">
          Reference Number <span className="text-status-danger-text">*</span>
        </label>
        <input
          id="referenceNumber"
          name="referenceNumber"
          type="text"
          value={referenceNumber}
          onChange={(e) => {
            setReferenceNumber(e.target.value);
            if (clientErrors.referenceNumber) {
              setClientErrors((prev) => {
                const next = { ...prev };
                delete next.referenceNumber;
                return next;
              });
            }
          }}
          onBlur={(e) => handleBlur('referenceNumber', e.target.value)}
          placeholder="e.g. NGK-1004"
          maxLength={64}
          autoComplete="off"
          spellCheck="false"
          aria-required="true"
          aria-invalid={hasError('referenceNumber')}
          aria-describedby={
            hasError('referenceNumber')
              ? 'referenceNumber-error'
              : 'referenceNumber-hint'
          }
          className={`
            w-full px-3.5 py-2.5 text-sm font-mono bg-surface text-ink-primary rounded-md border
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors
            ${
              hasError('referenceNumber')
                ? 'border-status-danger-border ring-1 ring-status-danger-border'
                : 'border-border-input focus:border-brand-700'
            }
          `}
        />
        <div className="flex items-center justify-between text-xs">
          <span id="referenceNumber-hint" className="text-ink-muted">
            Unique shipment identifier (will be saved in uppercase).
          </span>
        </div>
        {hasError('referenceNumber') && (
          <p id="referenceNumber-error" role="alert" className="text-xs text-status-danger-text font-medium mt-1">
            {getErrorMessage('referenceNumber')}
          </p>
        )}
      </div>

      {/* 2. Route: Origin & Destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Origin */}
        <div className="space-y-1.5">
          <label htmlFor="origin" className="block text-sm font-medium text-ink-primary">
            Origin <span className="text-status-danger-text">*</span>
          </label>
          <input
            id="origin"
            name="origin"
            type="text"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              if (clientErrors.origin) {
                setClientErrors((prev) => {
                  const next = { ...prev };
                  delete next.origin;
                  return next;
                });
              }
            }}
            onBlur={(e) => handleBlur('origin', e.target.value)}
            placeholder="e.g. New Delhi, India"
            maxLength={255}
            aria-required="true"
            aria-invalid={hasError('origin')}
            aria-describedby={hasError('origin') ? 'origin-error' : undefined}
            className={`
              w-full px-3.5 py-2.5 text-sm bg-surface text-ink-primary rounded-md border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors
              ${
                hasError('origin')
                  ? 'border-status-danger-border ring-1 ring-status-danger-border'
                  : 'border-border-input focus:border-brand-700'
              }
            `}
          />
          {hasError('origin') && (
            <p id="origin-error" role="alert" className="text-xs text-status-danger-text font-medium mt-1">
              {getErrorMessage('origin')}
            </p>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <label htmlFor="destination" className="block text-sm font-medium text-ink-primary">
            Destination <span className="text-status-danger-text">*</span>
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              if (clientErrors.destination) {
                setClientErrors((prev) => {
                  const next = { ...prev };
                  delete next.destination;
                  return next;
                });
              }
            }}
            onBlur={(e) => handleBlur('destination', e.target.value)}
            placeholder="e.g. Kathmandu, Nepal"
            maxLength={255}
            aria-required="true"
            aria-invalid={hasError('destination')}
            aria-describedby={hasError('destination') ? 'destination-error' : undefined}
            className={`
              w-full px-3.5 py-2.5 text-sm bg-surface text-ink-primary rounded-md border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors
              ${
                hasError('destination')
                  ? 'border-status-danger-border ring-1 ring-status-danger-border'
                  : 'border-border-input focus:border-brand-700'
              }
            `}
          />
          {hasError('destination') && (
            <p id="destination-error" role="alert" className="text-xs text-status-danger-text font-medium mt-1">
              {getErrorMessage('destination')}
            </p>
          )}
        </div>
      </div>

      {/* 3. Expected Delivery Date & Initial Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expected Delivery Date */}
        <div className="space-y-1.5">
          <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-ink-primary">
            Expected Delivery Date <span className="text-status-danger-text">*</span>
          </label>
          <input
            id="expectedDeliveryDate"
            name="expectedDeliveryDate"
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => {
              setExpectedDeliveryDate(e.target.value);
              if (clientErrors.expectedDeliveryDate) {
                setClientErrors((prev) => {
                  const next = { ...prev };
                  delete next.expectedDeliveryDate;
                  return next;
                });
              }
            }}
            onBlur={(e) => handleBlur('expectedDeliveryDate', e.target.value)}
            aria-required="true"
            aria-invalid={hasError('expectedDeliveryDate')}
            aria-describedby={
              hasError('expectedDeliveryDate')
                ? 'expectedDeliveryDate-error'
                : 'expectedDeliveryDate-hint'
            }
            className={`
              w-full px-3.5 py-2.5 text-sm bg-surface text-ink-primary rounded-md border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors
              ${
                hasError('expectedDeliveryDate')
                  ? 'border-status-danger-border ring-1 ring-status-danger-border'
                  : 'border-border-input focus:border-brand-700'
              }
            `}
          />
          <span id="expectedDeliveryDate-hint" className="text-xs text-ink-muted">
            YYYY-MM-DD calendar date.
          </span>
          {hasError('expectedDeliveryDate') && (
            <p id="expectedDeliveryDate-error" role="alert" className="text-xs text-status-danger-text font-medium mt-1">
              {getErrorMessage('expectedDeliveryDate')}
            </p>
          )}
        </div>

        {/* Initial Status */}
        <div className="space-y-1.5">
          <label htmlFor="currentStatus" className="block text-sm font-medium text-ink-primary">
            Initial Status <span className="text-status-danger-text">*</span>
          </label>
          <select
            id="currentStatus"
            name="currentStatus"
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value as ShipmentStatus)}
            aria-required="true"
            className="w-full px-3.5 py-2.5 text-sm bg-surface text-ink-primary rounded-md border border-border-input focus:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors cursor-pointer"
          >
            {ALLOWED_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-muted">
            Default consignment status at booking.
          </span>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <Link to="/shipments">
          <Button variant="ghost" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Create shipment
        </Button>
      </div>
    </form>
  );
};
