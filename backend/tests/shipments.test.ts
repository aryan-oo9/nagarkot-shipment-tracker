import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import * as poolModule from '../src/db/pool';
import { shipmentService } from '../src/services/shipmentService';
import { ConflictError, NotFoundError } from '../src/utils/errors';

describe('Shipments API Endpoints', () => {
  let app: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock_db';
    app = createApp();
  });

  describe('POST /api/shipments', () => {
    const validPayload = {
      referenceNumber: 'NF-100234',
      origin: 'Kathmandu, Nepal',
      destination: 'Hamburg, Germany',
      currentStatus: 'Booked',
      expectedDeliveryDate: '2026-11-05',
    };

    it('should create a shipment and initial history, returning 201', async () => {
      const mockCreated = {
        id: 1,
        reference_number: 'NF-100234',
        origin: 'Kathmandu, Nepal',
        destination: 'Hamburg, Germany',
        current_status: 'Booked' as const,
        expected_delivery_date: '2026-11-05',
        created_at: '2026-10-11T10:00:00Z',
        updated_at: '2026-10-11T10:00:00Z',
      };

      vi.spyOn(shipmentService, 'createShipment').mockResolvedValue(mockCreated);

      const res = await request(app)
        .post('/api/shipments')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(mockCreated);
      expect(res.body.message).toBe('Shipment created successfully');
    });

    it('should return 409 Conflict if reference number already exists', async () => {
      vi.spyOn(shipmentService, 'createShipment').mockRejectedValue(
        new ConflictError("Shipment with reference number 'NF-100234' already exists")
      );

      const res = await request(app)
        .post('/api/shipments')
        .send(validPayload);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already exists');
    });

    it('should return 400 Bad Request if payload fails Zod validation', async () => {
      const invalidPayload = {
        referenceNumber: '',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        currentStatus: 'InvalidStatus',
        expectedDeliveryDate: 'not-a-date',
      };

      const res = await request(app)
        .post('/api/shipments')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });
  });

  describe('GET /api/shipments', () => {
    it('should return paginated shipment list with metadata', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            reference_number: 'NF-100234',
            origin: 'Kathmandu',
            destination: 'Hamburg',
            current_status: 'Booked' as const,
            expected_delivery_date: '2026-11-05',
            created_at: '2026-10-11T10:00:00Z',
            updated_at: '2026-10-11T10:00:00Z',
          },
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasNextPage: false,
        },
      };

      vi.spyOn(shipmentService, 'listShipments').mockResolvedValue(mockResult);

      const res = await request(app).get('/api/shipments');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should pass search and status parameters to service', async () => {
      const spy = vi.spyOn(shipmentService, 'listShipments').mockResolvedValue({
        data: [],
        pagination: { total: 0, limit: 10, offset: 5, hasNextPage: false },
      });

      const res = await request(app).get(
        '/api/shipments?search=NF-100&status=In Transit&limit=10&offset=5'
      );

      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalledWith({
        search: 'NF-100',
        status: 'In Transit',
        limit: 10,
        offset: 5,
      });
    });

    it('should return 400 for invalid pagination query', async () => {
      const res = await request(app).get('/api/shipments?limit=999');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/shipments/:id', () => {
    it('should return 200 with shipment when found', async () => {
      const mockShipment = {
        id: 1,
        reference_number: 'NF-100234',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        current_status: 'Booked' as const,
        expected_delivery_date: '2026-11-05',
        created_at: '2026-10-11T10:00:00Z',
        updated_at: '2026-10-11T10:00:00Z',
      };

      vi.spyOn(shipmentService, 'getShipmentById').mockResolvedValue(mockShipment);

      const res = await request(app).get('/api/shipments/1');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockShipment);
    });

    it('should return 404 when shipment does not exist', async () => {
      vi.spyOn(shipmentService, 'getShipmentById').mockRejectedValue(
        new NotFoundError('Shipment with ID 999 not found')
      );

      const res = await request(app).get('/api/shipments/999');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when ID is invalid', async () => {
      const res = await request(app).get('/api/shipments/abc');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/shipments/:id/status', () => {
    it('should update status and return 200 with updated shipment', async () => {
      const updatedShipment = {
        id: 1,
        reference_number: 'NF-100234',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        current_status: 'In Transit' as const,
        expected_delivery_date: '2026-11-05',
        created_at: '2026-10-11T10:00:00Z',
        updated_at: '2026-10-11T12:00:00Z',
      };

      vi.spyOn(shipmentService, 'updateStatus').mockResolvedValue({
        shipment: updatedShipment,
        updated: true,
      });

      const res = await request(app)
        .patch('/api/shipments/1/status')
        .send({ status: 'In Transit', note: 'Departed airport' });

      expect(res.status).toBe(200);
      expect(res.body.data.current_status).toBe('In Transit');
      expect(res.body.message).toBe('Shipment status updated successfully');
    });

    it('should return 200 with no-op message when status is already current', async () => {
      const currentShipment = {
        id: 1,
        reference_number: 'NF-100234',
        origin: 'Kathmandu',
        destination: 'Hamburg',
        current_status: 'Booked' as const,
        expected_delivery_date: '2026-11-05',
        created_at: '2026-10-11T10:00:00Z',
        updated_at: '2026-10-11T10:00:00Z',
      };

      vi.spyOn(shipmentService, 'updateStatus').mockResolvedValue({
        shipment: currentShipment,
        updated: false,
      });

      const res = await request(app)
        .patch('/api/shipments/1/status')
        .send({ status: 'Booked' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('already current');
    });

    it('should return 404 when updating non-existent shipment', async () => {
      vi.spyOn(shipmentService, 'updateStatus').mockRejectedValue(
        new NotFoundError('Shipment with ID 999 not found')
      );

      const res = await request(app)
        .patch('/api/shipments/999/status')
        .send({ status: 'Delivered' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/shipments/:id/history', () => {
    it('should return 200 with full history in chronological order', async () => {
      const mockHistory = [
        {
          id: 1,
          shipment_id: 1,
          status: 'Booked' as const,
          changed_at: '2026-10-11T10:00:00Z',
          note: 'Initial consignment registration',
        },
        {
          id: 2,
          shipment_id: 1,
          status: 'In Transit' as const,
          changed_at: '2026-10-11T12:00:00Z',
          note: 'Departed airport',
        },
      ];

      vi.spyOn(shipmentService, 'getShipmentHistory').mockResolvedValue(mockHistory);

      const res = await request(app).get('/api/shipments/1/history');

      expect(res.status).toBe(200);
      expect(res.body.shipmentId).toBe(1);
      expect(res.body.history).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });

    it('should return 404 if shipment for history does not exist', async () => {
      vi.spyOn(shipmentService, 'getShipmentHistory').mockRejectedValue(
        new NotFoundError('Shipment with ID 999 not found')
      );

      const res = await request(app).get('/api/shipments/999/history');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Service Transaction Rollback & Error Handling', () => {
    it('should rollback transaction and release client if query fails', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };

      vi.spyOn(poolModule, 'getClient').mockResolvedValue(mockClient as any);

      // 1. BEGIN succeeds
      mockClient.query.mockResolvedValueOnce({});
      // 2. Reference check succeeds
      mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
      // 3. Insert shipment fails with a database exception
      mockClient.query.mockRejectedValueOnce(new Error('Simulated database connection loss'));
      // 4. ROLLBACK succeeds
      mockClient.query.mockResolvedValueOnce({});

      await expect(
        shipmentService.createShipment({
          referenceNumber: 'NF-TEST',
          origin: 'Origin',
          destination: 'Dest',
          currentStatus: 'Booked',
          expectedDeliveryDate: '2026-11-05',
        })
      ).rejects.toThrow('Simulated database connection loss');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
