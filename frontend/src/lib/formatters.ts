import { ShipmentStatus } from '../types/shipment';

/**
 * Format a calendar date string (YYYY-MM-DD) into a human-readable string (e.g. "Oct 15, 2026").
 * Explicitly parses year, month, and day parts to prevent timezone date shifts.
 */
export function formatCalendarDate(dateStr: string | null | undefined): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return '—';
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const monthName = months[month - 1] ?? monthStr;
  return `${monthName} ${day}, ${year}`;
}

/**
 * Format an ISO 8601 UTC timestamp into a readable localized date and time string.
 * Example: "Oct 11, 2026, 4:35 PM"
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '—';
  }
}

/**
 * Normalizes user-entered reference number: trimmed and uppercase.
 */
export function normalizeReferenceNumber(ref: string): string {
  return ref.trim().toUpperCase();
}

/**
 * Get semantic color classes for a given shipment status.
 * Colors strictly adhere to WCAG 2.2 AA/AAA mathematically verified tokens.
 */
export function getStatusColorConfig(status: ShipmentStatus | string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Booked':
      return {
        bg: 'bg-status-booked-bg',
        text: 'text-status-booked-text',
        border: 'border-status-booked-border',
        dot: 'bg-status-booked-text',
      };
    case 'In Transit':
      return {
        bg: 'bg-status-transit-bg',
        text: 'text-status-transit-text',
        border: 'border-status-transit-border',
        dot: 'bg-status-transit-text',
      };
    case 'Customs Hold':
      return {
        bg: 'bg-status-hold-bg',
        text: 'text-status-hold-text',
        border: 'border-status-hold-border',
        dot: 'bg-status-hold-text',
      };
    case 'Delivered':
      return {
        bg: 'bg-status-delivered-bg',
        text: 'text-status-delivered-text',
        border: 'border-status-delivered-border',
        dot: 'bg-status-delivered-text',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      };
  }
}
