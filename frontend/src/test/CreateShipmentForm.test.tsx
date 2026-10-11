import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CreateShipmentForm } from '../components/shipments/CreateShipmentForm';

describe('CreateShipmentForm', () => {
  it('renders all required form controls with accessible labels', () => {
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={vi.fn()}
          isSubmitting={false}
          serverError={null}
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/reference number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/origin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected delivery date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initial status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create shipment/i })).toBeInTheDocument();
  });

  it('validates empty inputs and blocks submission with inline errors', async () => {
    const handleSubmit = vi.fn();
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={handleSubmit}
          isSubmitting={false}
          serverError={null}
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Reference number is required')).toBeInTheDocument();
    expect(screen.getByText('Origin is required')).toBeInTheDocument();
    expect(screen.getByText('Destination is required')).toBeInTheDocument();
    expect(screen.getByText('Expected delivery date is required')).toBeInTheDocument();
  });

  it('accepts valid past and future dates without artificially enforcing future dates', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={handleSubmit}
          isSubmitting={false}
          serverError={null}
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/reference number/i), 'NGK-PAST-01');
    await userEvent.type(screen.getByLabelText(/origin/i), 'Delhi');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Kathmandu');

    const dateInput = screen.getByLabelText(/expected delivery date/i);
    fireEvent.change(dateInput, { target: { value: '2020-05-15' } });

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedDeliveryDate: '2020-05-15',
      })
    );
  });

  it('submits successfully with normalized uppercase reference number', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={handleSubmit}
          isSubmitting={false}
          serverError={null}
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/reference number/i), '  ngk-1004  ');
    await userEvent.type(screen.getByLabelText(/origin/i), 'New Delhi, India');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Kathmandu, Nepal');
    await userEvent.type(screen.getByLabelText(/expected delivery date/i), '2026-10-25');
    await userEvent.selectOptions(screen.getByLabelText(/initial status/i), 'In Transit');

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    await userEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      referenceNumber: 'NGK-1004',
      origin: 'New Delhi, India',
      destination: 'Kathmandu, Nepal',
      expectedDeliveryDate: '2026-10-25',
      currentStatus: 'In Transit',
    });
  });

  it('displays inline server field error when duplicate conflict is returned', () => {
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={vi.fn()}
          isSubmitting={false}
          serverError={null}
          serverFieldErrors={{
            referenceNumber:
              'This reference number is already in use. Enter a different reference number.',
          }}
        />
      </BrowserRouter>
    );

    const refInput = screen.getByLabelText(/reference number/i);
    expect(refInput).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText('This reference number is already in use. Enter a different reference number.')
    ).toBeInTheDocument();
  });

  it('displays global server error alert', () => {
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={vi.fn()}
          isSubmitting={false}
          serverError="Database connection timeout"
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Database connection timeout')).toBeInTheDocument();
  });

  it('disables submit button and shows loading spinner when isSubmitting is true', () => {
    render(
      <BrowserRouter>
        <CreateShipmentForm
          onSubmit={vi.fn()}
          isSubmitting={true}
          serverError={null}
          serverFieldErrors={{}}
        />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /create shipment/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');
  });
});
