import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ShipmentTable } from '../components/shipments/ShipmentTable';
import { Shipment } from '../types/shipment';

const mockShipments: Shipment[] = [
  {
    id: 1,
    reference_number: 'NF-2026-001',
    origin: 'New Delhi',
    destination: 'Kathmandu',
    current_status: 'In Transit',
    expected_delivery_date: '2026-10-18',
    created_at: '2026-10-11T10:00:00Z',
    updated_at: '2026-10-11T12:00:00Z',
  },
  {
    id: 2,
    reference_number: 'NF-2026-002',
    origin: 'Mumbai',
    destination: 'Birgunj',
    current_status: 'Delivered',
    expected_delivery_date: '2026-10-15',
    created_at: '2026-10-09T08:00:00Z',
    updated_at: '2026-10-11T14:00:00Z',
  },
];

describe('ShipmentTable', () => {
  it('renders table headers and shipment rows correctly', () => {
    render(
      <BrowserRouter>
        <ShipmentTable shipments={mockShipments} />
      </BrowserRouter>
    );

    // Header inspection
    expect(screen.getByRole('columnheader', { name: /reference/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /route/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /expected delivery/i })).toBeInTheDocument();

    // Row 1 values
    expect(screen.getByText('NF-2026-001')).toBeInTheDocument();
    expect(screen.getByText('New Delhi')).toBeInTheDocument();
    expect(screen.getByText('Kathmandu')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Oct 18, 2026')).toBeInTheDocument();

    // Row 2 values
    expect(screen.getByText('NF-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Birgunj')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Oct 15, 2026')).toBeInTheDocument();

    // Check link destinations
    const refLink = screen.getByRole('link', { name: /view shipment nf-2026-001/i });
    expect(refLink).toHaveAttribute('href', '/shipments/1');
  });
});
