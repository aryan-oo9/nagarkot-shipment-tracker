import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../components/common/StatusBadge';

describe('StatusBadge', () => {
  it('renders with correct status text and accessibility aria-label', () => {
    render(<StatusBadge status="In Transit" />);
    const badge = screen.getByLabelText('Status: In Transit');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('In Transit');
  });

  it('renders all four allowed status values cleanly', () => {
    const statuses = ['Booked', 'In Transit', 'Customs Hold', 'Delivered'] as const;

    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByLabelText(`Status: ${status}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('supports the small size variant', () => {
    render(<StatusBadge status="Delivered" size="sm" />);
    const badge = screen.getByLabelText('Status: Delivered');
    expect(badge).toHaveClass('text-xs');
  });
});
