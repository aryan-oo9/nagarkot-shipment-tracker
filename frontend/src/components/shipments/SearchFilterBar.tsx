import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ALLOWED_STATUSES, ShipmentStatus } from '../../types/shipment';
import { Button } from '../common/Button';

export interface SearchFilterBarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: ShipmentStatus | '') => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onClearFilters,
  isLoading = false,
}) => {
  // Local input state for smooth instant typing feedback
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sync external prop changes (e.g., URL updates, back button, or Clear action)
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Debounce user input by 300ms before notifying parent
  useEffect(() => {
    if (localSearch === searchTerm) return;

    const timer = setTimeout(() => {
      onSearchChange(localSearch.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchTerm, onSearchChange]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-3.5 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input field */}
        <div className="relative flex-1">
          <label htmlFor="shipment-search-input" className="sr-only">
            Search reference number
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="shipment-search-input"
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search reference number…"
            aria-label="Search reference number"
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-9 pr-9 py-2 text-sm bg-surface text-ink-primary border border-border-input rounded-md placeholder:text-ink-muted focus:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search text"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter dropdown */}
        <div className="flex items-center gap-2 sm:w-56 shrink-0">
          <label htmlFor="shipment-status-select" className="sr-only">
            Filter by status
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted sm:hidden">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <select
              id="shipment-status-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as ShipmentStatus | '')}
              aria-label="Filter shipments by status"
              className="w-full pl-8 sm:pl-3 pr-8 py-2 text-sm bg-surface text-ink-primary border border-border-input rounded-md focus:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors cursor-pointer"
            >
              <option value="">All statuses</option>
              {ALLOWED_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear active filters button */}
        {hasActiveFilters && (
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={isLoading}
              className="w-full sm:w-auto text-ink-secondary hover:text-ink-primary"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
