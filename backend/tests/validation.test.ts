import { describe, expect, it } from 'vitest';
import {
  createShipmentSchema,
  idParamSchema,
  queryShipmentsSchema,
  updateStatusSchema,
} from '../src/schemas/shipment';

describe('Zod Validation Schemas', () => {
  describe('createShipmentSchema', () => {
    it('should validate and normalize valid shipment input', () => {
      const valid = {
        referenceNumber: '  nf-100293  ',
        origin: 'Kathmandu, Nepal',
        destination: 'Hamburg, Germany',
        currentStatus: 'Booked',
        expectedDeliveryDate: '2026-11-05',
      };

      const result = createShipmentSchema.parse(valid);
      expect(result.referenceNumber).toBe('NF-100293'); // Trimmed & uppercase
      expect(result.origin).toBe('Kathmandu, Nepal');
      expect(result.destination).toBe('Hamburg, Germany');
      expect(result.currentStatus).toBe('Booked');
      expect(result.expectedDeliveryDate).toBe('2026-11-05');
    });

    it('should reject invalid status value', () => {
      const invalid = {
        referenceNumber: 'NF-100',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        currentStatus: 'UnknownStatus',
        expectedDeliveryDate: '2026-11-05',
      };

      const result = createShipmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('currentStatus must be one of');
      }
    });

    it('should reject invalid calendar dates like February 30th or 31st', () => {
      const invalidDates = [
        '2026-02-30', // Feb 30 does not exist
        '2026-02-31', // Feb 31 does not exist
        '2026-04-31', // April has only 30 days
        '2025-02-29', // 2025 is not a leap year
        '2026/11/05', // Wrong delimiter
        'invalid-date',
      ];

      for (const date of invalidDates) {
        const payload = {
          referenceNumber: 'NF-100',
          origin: 'Kathmandu',
          destination: 'Hamburg',
          currentStatus: 'Booked',
          expectedDeliveryDate: date,
        };
        const result = createShipmentSchema.safeParse(payload);
        expect(result.success).toBe(false);
      }
    });

    it('should accept a valid leap year date like 2024-02-29', () => {
      const payload = {
        referenceNumber: 'NF-100',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        currentStatus: 'Booked',
        expectedDeliveryDate: '2024-02-29',
      };
      const result = createShipmentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject empty or missing fields', () => {
      const payload = {
        referenceNumber: '',
        origin: '   ',
        destination: '',
        currentStatus: 'Booked',
      };
      const result = createShipmentSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateStatusSchema', () => {
    it('should validate valid status transition with optional note', () => {
      const payload = {
        status: 'In Transit',
        note: 'Passed through customs hub',
      };
      const result = updateStatusSchema.parse(payload);
      expect(result.status).toBe('In Transit');
      expect(result.note).toBe('Passed through customs hub');
    });

    it('should accept valid status with empty note', () => {
      const payload = { status: 'Delivered' };
      const result = updateStatusSchema.parse(payload);
      expect(result.status).toBe('Delivered');
      expect(result.note).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const payload = { status: 'ReturnedToSender' };
      const result = updateStatusSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('queryShipmentsSchema', () => {
    it('should apply defaults for pagination', () => {
      const result = queryShipmentsSchema.parse({});
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should reject negative offset or limit exceeding 100', () => {
      expect(queryShipmentsSchema.safeParse({ offset: '-5' }).success).toBe(false);
      expect(queryShipmentsSchema.safeParse({ limit: '101' }).success).toBe(false);
      expect(queryShipmentsSchema.safeParse({ limit: '0' }).success).toBe(false);
    });
  });

  describe('idParamSchema', () => {
    it('should parse valid positive integer', () => {
      const result = idParamSchema.parse({ id: '42' });
      expect(result.id).toBe(42);
    });

    it('should reject non-numeric or non-positive ID', () => {
      expect(idParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
      expect(idParamSchema.safeParse({ id: '0' }).success).toBe(false);
      expect(idParamSchema.safeParse({ id: '-10' }).success).toBe(false);
    });
  });
});
