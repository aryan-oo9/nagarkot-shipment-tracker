import { z } from 'zod';
import { ALLOWED_STATUSES } from '../types/shipment';

// Helper: strictly validate real calendar dates in YYYY-MM-DD format
function isValidCalendarDate(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = val.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return false;
  }

  // Create UTC date and verify fields match exactly
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

export const createShipmentSchema = z.object({
  referenceNumber: z
    .string({ required_error: 'referenceNumber is required' })
    .trim()
    .min(1, 'referenceNumber cannot be empty')
    .max(64, 'referenceNumber cannot exceed 64 characters')
    .transform((val) => val.toUpperCase()), // Normalize to uppercase
  origin: z
    .string({ required_error: 'origin is required' })
    .trim()
    .min(1, 'origin cannot be empty')
    .max(255, 'origin cannot exceed 255 characters'),
  destination: z
    .string({ required_error: 'destination is required' })
    .trim()
    .min(1, 'destination cannot be empty')
    .max(255, 'destination cannot exceed 255 characters'),
  currentStatus: z.enum(ALLOWED_STATUSES, {
    errorMap: () => ({
      message: `currentStatus must be one of: ${ALLOWED_STATUSES.join(', ')}`,
    }),
  }),
  expectedDeliveryDate: z
    .string({ required_error: 'expectedDeliveryDate is required' })
    .trim()
    .refine(isValidCalendarDate, {
      message: 'expectedDeliveryDate must be a valid calendar date in YYYY-MM-DD format',
    }),
});

export const updateStatusSchema = z.object({
  status: z.enum(ALLOWED_STATUSES, {
    errorMap: () => ({
      message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
    }),
  }),
  note: z
    .string()
    .trim()
    .max(1000, 'note cannot exceed 1000 characters')
    .optional(),
});

export const queryShipmentsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ALLOWED_STATUSES).optional(),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'limit must be an integer between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'offset must be a non-negative integer',
    }),
});

export const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'ID parameter must be a positive integer',
    }),
});
