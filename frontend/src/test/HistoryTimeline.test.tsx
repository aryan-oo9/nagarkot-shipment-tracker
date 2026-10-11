import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HistoryTimeline } from '../components/shipments/HistoryTimeline';
import { ShipmentHistoryItem } from '../types/shipment';

const mockHistory: ShipmentHistoryItem[] = [
  {
    id: 1,
    shipment_id: 5,
    status: 'Booked',
    changed_at: '2026-10-10T10:00:00Z',
    note: null,
  },
  {
    id: 2,
    shipment_id: 5,
    status: 'In Transit',
    changed_at: '2026-10-11T12:00:00Z',
    note: 'Departed Mumbai logistics terminal',
  },
];

describe('HistoryTimeline', () => {
  it('renders empty history fallback when no events are recorded', () => {
    render(<HistoryTimeline history={[]} />);

    expect(screen.getByText('Shipment History')).toBeInTheDocument();
    expect(
      screen.getByText('No historical transitions recorded for this shipment.')
    ).toBeInTheDocument();
  });

  it('renders chronological timeline entries with status badges, timestamps, and notes', () => {
    render(<HistoryTimeline history={mockHistory} />);

    expect(screen.getByText('Initial Booking')).toBeInTheDocument();
    expect(screen.getByText('Event #2')).toBeInTheDocument();
    expect(screen.getByText('Departed Mumbai logistics terminal', { exact: false })).toBeInTheDocument();
  });
});
