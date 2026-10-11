import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchFilterBar } from '../components/shipments/SearchFilterBar';

describe('SearchFilterBar', () => {
  it('renders search input, status select, and debounces search input by 300ms', async () => {
    const handleSearchChange = vi.fn();
    const handleStatusChange = vi.fn();
    const handleClearFilters = vi.fn();

    render(
      <SearchFilterBar
        searchTerm=""
        statusFilter=""
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />
    );

    const input = screen.getByRole('searchbox', { name: /search reference number/i });
    expect(input).toBeInTheDocument();

    await userEvent.type(input, 'NF-100');

    // Immediately before debounce fires, onSearchChange shouldn't have been called with final text
    expect(handleSearchChange).not.toHaveBeenCalledWith('NF-100');

    // Wait for 300ms debounce
    await waitFor(
      () => {
        expect(handleSearchChange).toHaveBeenCalledWith('NF-100');
      },
      { timeout: 1000 }
    );
  });

  it('triggers onStatusChange when selecting a status option', async () => {
    const handleStatusChange = vi.fn();

    render(
      <SearchFilterBar
        searchTerm=""
        statusFilter=""
        onSearchChange={vi.fn()}
        onStatusChange={handleStatusChange}
        onClearFilters={vi.fn()}
      />
    );

    const select = screen.getByRole('combobox', { name: /filter shipments by status/i });
    await userEvent.selectOptions(select, 'In Transit');

    expect(handleStatusChange).toHaveBeenCalledWith('In Transit');
  });

  it('renders "Clear filters" button only when active filter or search exists', async () => {
    const handleClearFilters = vi.fn();
    const { rerender } = render(
      <SearchFilterBar
        searchTerm=""
        statusFilter=""
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onClearFilters={handleClearFilters}
      />
    );

    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    // Re-render with active status
    rerender(
      <SearchFilterBar
        searchTerm=""
        statusFilter="Delivered"
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onClearFilters={handleClearFilters}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    await userEvent.click(clearBtn);
    expect(handleClearFilters).toHaveBeenCalledTimes(1);
  });
});
