import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipmentDetailPage } from '../pages/ShipmentDetailPage';
import { apiClient } from '../lib/apiClient';
import { Shipment, ShipmentHistoryItem } from '../types/shipment';
import { ApiError } from '../types/api';

const mockShipment: Shipment = {
  id: 5,
  reference_number: 'NF-2026-999',
  origin: 'Kolkata Depot',
  destination: 'Kathmandu ICD',
  current_status: 'Booked',
  expected_delivery_date: '2026-10-25',
  created_at: '2026-10-10T08:30:00Z',
  updated_at: '2026-10-10T08:30:00Z',
};

const mockHistory: ShipmentHistoryItem[] = [
  {
    id: 1,
    shipment_id: 5,
    status: 'Booked',
    changed_at: '2026-10-10T08:30:00Z',
    note: 'Initial consignment booking',
  },
];

describe('ShipmentDetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (initialPath = '/shipments/5', locationState?: unknown) => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: initialPath, state: locationState }]}>
        <Routes>
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="/shipments" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders invalid ID view when path parameter is non-numeric', async () => {
    renderComponent('/shipments/not-a-number');

    expect(screen.getByRole('heading', { level: 1, name: /invalid shipment identifier/i })).toBeInTheDocument();
    expect(screen.getByText(/the requested url path does not contain a valid numeric shipment record id/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to shipments dashboard/i })).toHaveAttribute(
      'href',
      '/shipments'
    );
  });

  it('renders invalid ID view when path parameter is 0', async () => {
    renderComponent('/shipments/0');

    expect(screen.getByRole('heading', { level: 1, name: /invalid shipment identifier/i })).toBeInTheDocument();
  });

  it('renders 404 Not Found error view when API returns 404', async () => {
    vi.spyOn(apiClient, 'getShipment').mockRejectedValue(
      new ApiError('Shipment not found', 404, 'NOT_FOUND')
    );
    vi.spyOn(apiClient, 'getShipmentHistory').mockRejectedValue(
      new ApiError('Shipment not found', 404, 'NOT_FOUND')
    );

    renderComponent('/shipments/999');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /we couldn't find this shipment/i })).toBeInTheDocument();
      expect(screen.getByText(/consignment record #999 does not exist/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to shipments/i })).toHaveAttribute(
        'href',
        '/shipments'
      );
    });
  });

  it('renders server error view when API fails and handles retry click', async () => {
    const getShipmentSpy = vi
      .spyOn(apiClient, 'getShipment')
      .mockRejectedValueOnce(new Error('Connection failure'))
      .mockResolvedValueOnce({ data: mockShipment });

    const getHistorySpy = vi
      .spyOn(apiClient, 'getShipmentHistory')
      .mockRejectedValueOnce(new Error('Connection failure'))
      .mockResolvedValueOnce({ history: mockHistory, shipmentId: 5, count: mockHistory.length });

    renderComponent('/shipments/5');

    await waitFor(() => {
      expect(screen.getByText(/we couldn't load shipment details/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryBtn);

    await waitFor(() => {
      expect(getShipmentSpy).toHaveBeenCalledTimes(2);
      expect(getHistorySpy).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('heading', { level: 1, name: 'NF-2026-999' })).toBeInTheDocument();
    });
  });

  it('renders shipment summary, details, and history timeline successfully', async () => {
    vi.spyOn(apiClient, 'getShipment').mockResolvedValue({ data: mockShipment });
    vi.spyOn(apiClient, 'getShipmentHistory').mockResolvedValue({
      history: mockHistory,
      shipmentId: 5,
      count: mockHistory.length,
    });

    renderComponent('/shipments/5');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'NF-2026-999' })).toBeInTheDocument();
      expect(screen.getByText('Kolkata Depot')).toBeInTheDocument();
      expect(screen.getByText('Kathmandu ICD')).toBeInTheDocument();
      expect(screen.getByText('Initial consignment booking')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy reference number nf-2026-999/i })).toBeInTheDocument();
    });
  });

  it('renders flash message when passed in location state', async () => {
    vi.spyOn(apiClient, 'getShipment').mockResolvedValue({ data: mockShipment });
    vi.spyOn(apiClient, 'getShipmentHistory').mockResolvedValue({
      history: mockHistory,
      shipmentId: 5,
      count: mockHistory.length,
    });

    renderComponent('/shipments/5', { flashMessage: 'Shipment created successfully.' });

    await waitFor(() => {
      expect(screen.getByText('Shipment created successfully.')).toBeInTheDocument();
    });
  });

  it('submits status update and refreshes timeline history', async () => {
    const updatedShipment: Shipment = {
      ...mockShipment,
      current_status: 'In Transit',
      updated_at: '2026-10-11T12:00:00Z',
    };

    const updatedHistory: ShipmentHistoryItem[] = [
      ...mockHistory,
      {
        id: 2,
        shipment_id: 5,
        status: 'In Transit',
        changed_at: '2026-10-11T12:00:00Z',
        note: 'Crossed border checkpoint at Raxaul',
      },
    ];

    vi.spyOn(apiClient, 'getShipment').mockResolvedValue({ data: mockShipment });
    const getHistorySpy = vi
      .spyOn(apiClient, 'getShipmentHistory')
      .mockResolvedValueOnce({ history: mockHistory, shipmentId: 5, count: mockHistory.length })
      .mockResolvedValueOnce({ history: updatedHistory, shipmentId: 5, count: updatedHistory.length });

    const updateStatusSpy = vi.spyOn(apiClient, 'updateShipmentStatus').mockResolvedValue({
      data: updatedShipment,
      message: 'Shipment status updated successfully',
    });

    renderComponent('/shipments/5');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'NF-2026-999' })).toBeInTheDocument();
    });

    // Select new status
    const statusSelect = screen.getByLabelText(/new status/i);
    await userEvent.selectOptions(statusSelect, 'In Transit');

    // Type operational note
    const noteInput = screen.getByLabelText(/operational note/i);
    await userEvent.type(noteInput, 'Crossed border checkpoint at Raxaul');

    // Submit
    const submitBtn = screen.getByRole('button', { name: /save status update/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateStatusSpy).toHaveBeenCalledWith(5, {
        status: 'In Transit',
        note: 'Crossed border checkpoint at Raxaul',
      });
      expect(getHistorySpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Shipment status updated successfully')).toBeInTheDocument();
      expect(screen.getByText('Crossed border checkpoint at Raxaul')).toBeInTheDocument();
    });
  });
});
