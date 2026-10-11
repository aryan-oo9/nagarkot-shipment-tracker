import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ShipmentCardList } from '../components/shipments/ShipmentCardList';
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
];

describe('ShipmentCardList', () => {
  it('renders mobile cards with reference, route, status, and due date', () => {
    render(
      <BrowserRouter>
        <ShipmentCardList shipments={mockShipments} />
      </BrowserRouter>
    );

    expect(screen.getByText('NF-2026-001')).toBeInTheDocument();
    expect(screen.getByText('New Delhi')).toBeInTheDocument();
    expect(screen.getByText('Kathmandu')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Due Oct 18, 2026')).toBeInTheDocument();
  });
});
