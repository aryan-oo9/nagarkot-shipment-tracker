import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PaginationControls } from '../components/shipments/PaginationControls';

describe('PaginationControls', () => {
  it('renders range summary accurately and handles previous/next navigation', async () => {
    const handlePageChange = vi.fn();

    render(
      <PaginationControls
        total={42}
        limit={20}
        offset={20}
        hasNextPage={true}
        onPageChange={handlePageChange}
      />
    );

    // Summary should say "Showing 21–40 of 42 shipments"
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /go to previous page/i });
    const nextButton = screen.getByRole('button', { name: /go to next page/i });

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    // Click Previous
    await userEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(0);

    // Click Next
    await userEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(40);
  });

  it('disables previous button on first page and next button on last page', () => {
    const { rerender } = render(
      <PaginationControls
        total={15}
        limit={20}
        offset={0}
        hasNextPage={false}
        onPageChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole('button', { name: /go to previous page/i });
    const nextButton = screen.getByRole('button', { name: /go to next page/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    // Rerender when on page 1 with more pages available
    rerender(
      <PaginationControls
        total={40}
        limit={20}
        offset={0}
        hasNextPage={true}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /go to previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /go to next page/i })).toBeEnabled();
  });

  it('renders nothing when total is 0', () => {
    const { container } = render(
      <PaginationControls
        total={0}
        limit={20}
        offset={0}
        hasNextPage={false}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
