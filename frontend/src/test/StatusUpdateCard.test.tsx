import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StatusUpdateCard } from '../components/shipments/StatusUpdateCard';

describe('StatusUpdateCard', () => {
  it('renders current status and updates status with optional note', async () => {
    const handleUpdate = vi.fn().mockResolvedValue({
      updated: true,
      message: 'Shipment status updated successfully',
    });

    render(
      <StatusUpdateCard
        currentStatus="Booked"
        onUpdateStatus={handleUpdate}
        isUpdating={false}
      />
    );

    expect(screen.getByText('Update Shipment Status')).toBeInTheDocument();
    expect(screen.getByText('Booked', { selector: 'span.font-semibold' })).toBeInTheDocument();

    const statusSelect = screen.getByLabelText(/new status/i);
    await userEvent.selectOptions(statusSelect, 'In Transit');

    const noteInput = screen.getByLabelText(/operational note/i);
    await userEvent.type(noteInput, 'Cargo loaded onto freight vehicle.');

    const submitBtn = screen.getByRole('button', { name: /save status update/i });
    await userEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      'In Transit',
      'Cargo loaded onto freight vehicle.'
    );

    await waitFor(() => {
      expect(screen.getByText('Status Updated')).toBeInTheDocument();
      expect(screen.getByText('Shipment status updated successfully')).toBeInTheDocument();
    });
  });

  it('displays neutral informational alert when status was already current (no-op)', async () => {
    const handleUpdate = vi.fn().mockResolvedValue({
      updated: false,
      message: 'Status was already current; no update applied',
    });

    render(
      <StatusUpdateCard
        currentStatus="In Transit"
        onUpdateStatus={handleUpdate}
        isUpdating={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /save status update/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('No Change Applied')).toBeInTheDocument();
      expect(screen.getByText('Status was already current; no update applied')).toBeInTheDocument();
    });
  });

  it('displays error alert when status update fails', async () => {
    const handleUpdate = vi.fn().mockRejectedValue(new Error('Internal server error'));

    render(
      <StatusUpdateCard
        currentStatus="Booked"
        onUpdateStatus={handleUpdate}
        isUpdating={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /save status update/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Update Failed')).toBeInTheDocument();
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });
  });
});
