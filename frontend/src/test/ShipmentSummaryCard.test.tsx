import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShipmentSummaryCard } from '../components/shipments/ShipmentSummaryCard';
import { Shipment } from '../types/shipment';

const mockShipment: Shipment = {
  id: 10,
  reference_number: 'NF-TEST-010',
  origin: 'New Delhi, India',
  destination: 'Kathmandu, Nepal',
  current_status: 'In Transit',
  expected_delivery_date: '2026-10-28',
  created_at: '2026-10-10T08:30:00Z',
  updated_at: '2026-10-11T12:00:00Z',
};

describe('ShipmentSummaryCard', () => {
  it('renders origin, destination, expected delivery date, and timestamps', () => {
    render(<ShipmentSummaryCard shipment={mockShipment} />);

    expect(screen.getByText('Consignment Overview')).toBeInTheDocument();
    expect(screen.getByText('Record ID #10')).toBeInTheDocument();
    expect(screen.getByText('New Delhi, India')).toBeInTheDocument();
    expect(screen.getByText('Kathmandu, Nepal')).toBeInTheDocument();
    expect(screen.getByText('Oct 28, 2026')).toBeInTheDocument();
    expect(screen.getByText(/registered:/i)).toBeInTheDocument();
    expect(screen.getByText(/last modified:/i)).toBeInTheDocument();
  });
});
