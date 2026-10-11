import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { apiClient } from '../lib/apiClient';
import { Shipment } from '../types/shipment';

const mockShipments: Shipment[] = [
  {
    id: 1,
    reference_number: 'NF-TEST-001',
    origin: 'Kolkata',
    destination: 'Kathmandu',
    current_status: 'Booked',
    expected_delivery_date: '2026-10-20',
    created_at: '2026-10-11T10:00:00Z',
    updated_at: '2026-10-11T10:00:00Z',
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and renders shipments list successfully', async () => {
    vi.spyOn(apiClient, 'listShipments').mockResolvedValue({
      data: mockShipments,
      pagination: {
        total: 1,
        limit: 20,
        offset: 0,
        hasNextPage: false,
      },
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Initial heading should be visible
    expect(screen.getByRole('heading', { level: 1, name: /shipments/i })).toBeInTheDocument();

    // Shipment record should load in both desktop table and mobile card views
    await waitFor(() => {
      expect(screen.getAllByText('NF-TEST-001').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kolkata').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kathmandu').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays empty database state when total shipments is 0 and no filter is active', async () => {
    vi.spyOn(apiClient, 'listShipments').mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        limit: 20,
        offset: 0,
        hasNextPage: false,
      },
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No shipments yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first shipment/i })).toBeInTheDocument();
    });
  });

  it('displays error state with retry action when API request fails', async () => {
    vi.spyOn(apiClient, 'listShipments').mockRejectedValue(
      new Error('API server unavailable')
    );

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/we couldn't load shipments/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
