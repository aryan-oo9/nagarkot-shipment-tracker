import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CreateShipmentFormData } from '../types/shipment';
import { ApiError } from '../types/api';
import { apiClient } from '../lib/apiClient';
import { CreateShipmentForm } from '../components/shipments/CreateShipmentForm';

export const CreateShipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});

  const handleCreateShipment = async (formData: CreateShipmentFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setServerFieldErrors({});

    try {
      const response = await apiClient.createShipment(formData);
      // On success, redirect directly to the newly created shipment details
      if (response.data && response.data.id) {
        navigate(`/shipments/${response.data.id}`, {
          state: { flashMessage: 'Shipment created successfully.' },
        });
      } else {
        navigate('/shipments');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === 'CONFLICT') {
          setServerFieldErrors({
            referenceNumber:
              'This reference number is already in use. Enter a different reference number.',
          });
          setServerError(
            'This reference number is already in use. Enter a different reference number.'
          );
        } else if (err.status === 400 && Object.keys(err.fieldErrors).length > 0) {
          setServerFieldErrors(err.fieldErrors);
          setServerError('Invalid submission. Please review highlighted field errors.');
        } else {
          setServerError(
            err.message ||
              "We couldn't create the shipment. Your entries are still here—please try again."
          );
        }
      } else {
        setServerError(
          "We couldn't connect to the server. Your entries are preserved—please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb back to Dashboard */}
      <div>
        <Link
          to="/shipments"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded p-0.5 transition-colors"
          aria-label="Return to shipments dashboard"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Shipments / New shipment</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
          Create shipment
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Enter the shipment details to register a new record.
        </p>
      </div>

      {/* Main Creation Form */}
      <CreateShipmentForm
        onSubmit={handleCreateShipment}
        isSubmitting={isSubmitting}
        serverError={serverError}
        serverFieldErrors={serverFieldErrors}
        onClearServerError={() => setServerError(null)}
      />
    </div>
  );
};
