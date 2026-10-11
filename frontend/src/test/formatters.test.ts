import { describe, it, expect } from 'vitest';
import {
  formatCalendarDate,
  formatDateTime,
  getStatusColorConfig,
  normalizeReferenceNumber,
} from '../lib/formatters';

describe('Formatters', () => {
  describe('formatCalendarDate', () => {
    it('formats a valid calendar date string accurately without timezone shifting', () => {
      expect(formatCalendarDate('2026-10-15')).toBe('Oct 15, 2026');
      expect(formatCalendarDate('2025-01-01')).toBe('Jan 1, 2025');
      expect(formatCalendarDate('2027-12-31')).toBe('Dec 31, 2027');
    });

    it('returns a fallback dash for invalid or empty dates', () => {
      expect(formatCalendarDate('')).toBe('—');
      expect(formatCalendarDate(null)).toBe('—');
      expect(formatCalendarDate(undefined)).toBe('—');
      expect(formatCalendarDate('invalid-date')).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('formats valid ISO 8601 timestamps', () => {
      const formatted = formatDateTime('2026-10-11T12:00:00.000Z');
      expect(formatted).not.toBe('—');
      expect(formatted).toContain('2026');
    });

    it('returns a fallback dash for invalid timestamps', () => {
      expect(formatDateTime('')).toBe('—');
      expect(formatDateTime(null)).toBe('—');
      expect(formatDateTime('not-a-timestamp')).toBe('—');
    });
  });

  describe('normalizeReferenceNumber', () => {
    it('trims whitespace and converts to uppercase', () => {
      expect(normalizeReferenceNumber('  nf-2026-001  ')).toBe('NF-2026-001');
      expect(normalizeReferenceNumber('sh-999')).toBe('SH-999');
    });
  });

  describe('getStatusColorConfig', () => {
    it('returns proper semantic styles for all allowed statuses', () => {
      const booked = getStatusColorConfig('Booked');
      expect(booked.bg).toBe('bg-status-booked-bg');
      expect(booked.text).toBe('text-status-booked-text');

      const transit = getStatusColorConfig('In Transit');
      expect(transit.bg).toBe('bg-status-transit-bg');
      expect(transit.text).toBe('text-status-transit-text');

      const hold = getStatusColorConfig('Customs Hold');
      expect(hold.bg).toBe('bg-status-hold-bg');
      expect(hold.text).toBe('text-status-hold-text');

      const delivered = getStatusColorConfig('Delivered');
      expect(delivered.bg).toBe('bg-status-delivered-bg');
      expect(delivered.text).toBe('text-status-delivered-text');
    });

    it('returns neutral fallback for unknown status', () => {
      const unknown = getStatusColorConfig('Unknown Status');
      expect(unknown.bg).toBe('bg-gray-100');
    });
  });
});
