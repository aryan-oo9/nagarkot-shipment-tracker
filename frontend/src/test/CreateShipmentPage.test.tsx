import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateShipmentPage } from '../pages/CreateShipmentPage';
import { apiClient } from '../lib/apiClient';
import { ApiError } from '../types/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateShipmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading and breadcrumb back link', () => {
    render(
      <BrowserRouter>
        <CreateShipmentPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /create shipment/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to shipments dashboard/i })).toHaveAttribute(
      'href',
      '/shipments'
    );
  });

  it('submits shipment successfully and redirects to details view', async () => {
    const mockCreatedShipment = {
      id: 42,
      reference_number: 'NF-SUCCESS-001',
      origin: 'New Delhi',
      destination: 'Kathmandu',
      current_status: 'Booked' as const,
      expected_delivery_date: '2026-10-30',
      created_at: '2026-10-11T10:00:00Z',
      updated_at: '2026-10-11T10:00:00Z',
    };

    vi.spyOn(apiClient, 'createShipment').mockResolvedValue({
      data: mockCreatedShipment,
      message: 'Shipment created successfully',
    });

    render(
      <BrowserRouter>
        <CreateShipmentPage />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/reference number/i), 'NF-SUCCESS-001');
    await userEvent.type(screen.getByLabelText(/origin/i), 'New Delhi');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Kathmandu');
    await userEvent.type(screen.getByLabelText(/expected delivery date/i), '2026-10-30');

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/shipments/42', {
        state: { flashMessage: 'Shipment created successfully.' },
      });
    });
  });

  it('handles 409 Conflict error with inline reference error and preserves inputs', async () => {
    const conflictError = new ApiError(
      'A resource with this identifier already exists',
      409,
      'CONFLICT',
      { referenceNumber: 'This reference number is already in use.' }
    );

    vi.spyOn(apiClient, 'createShipment').mockRejectedValue(conflictError);

    render(
      <BrowserRouter>
        <CreateShipmentPage />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/reference number/i), 'NF-EXISTING-01');
    await userEvent.type(screen.getByLabelText(/origin/i), 'Mumbai');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Birgunj');
    await userEvent.type(screen.getByLabelText(/expected delivery date/i), '2026-10-25');

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getAllByText(/this reference number is already in use/i).length
      ).toBeGreaterThanOrEqual(1);
    });

    // Verify inputs were preserved
    expect(screen.getByLabelText(/reference number/i)).toHaveValue('NF-EXISTING-01');
    expect(screen.getByLabelText(/origin/i)).toHaveValue('Mumbai');
    expect(screen.getByLabelText(/destination/i)).toHaveValue('Birgunj');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles 400 Bad Request validation errors from server', async () => {
    const validationError = new ApiError(
      'Invalid request payload',
      400,
      'VALIDATION_ERROR',
      { origin: 'origin cannot be empty' }
    );

    vi.spyOn(apiClient, 'createShipment').mockRejectedValue(validationError);

    render(
      <BrowserRouter>
        <CreateShipmentPage />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/reference number/i), 'NF-VALID-01');
    await userEvent.type(screen.getByLabelText(/origin/i), 'Delhi');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Pokhara');
    await userEvent.type(screen.getByLabelText(/expected delivery date/i), '2026-10-25');

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('origin cannot be empty')).toBeInTheDocument();
      expect(
        screen.getByText(/invalid submission. please review highlighted field errors/i)
      ).toBeInTheDocument();
    });
  });
});
