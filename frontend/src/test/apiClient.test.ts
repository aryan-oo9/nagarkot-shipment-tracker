import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../lib/apiClient';
import { ApiError } from '../types/api';

describe('apiClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('normalizes 400 validation error with field-level details', async () => {
    const mockErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters',
        details: [
          { field: 'origin', message: 'origin cannot be empty' },
          { field: 'expectedDeliveryDate', message: 'expectedDeliveryDate must be a valid calendar date' },
        ],
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => mockErrorResponse,
    });

    try {
      await apiClient.post('/shipments', { origin: '' });
      expect.fail('Expected apiClient.post to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('VALIDATION_ERROR');
      expect(apiErr.fieldErrors.origin).toBe('origin cannot be empty');
      expect(apiErr.fieldErrors.expectedDeliveryDate).toBe(
        'expectedDeliveryDate must be a valid calendar date'
      );
    }
  });

  it('normalizes 409 conflict error and binds it to referenceNumber field', async () => {
    const mockConflictResponse = {
      error: {
        code: 'CONFLICT',
        message: 'A shipment with this reference number already exists',
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => mockConflictResponse,
    });

    try {
      await apiClient.post('/shipments', { referenceNumber: 'NF-DUP-001' });
      expect.fail('Expected apiClient.post to throw on 409');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(409);
      expect(apiErr.code).toBe('CONFLICT');
      expect(apiErr.fieldErrors.referenceNumber).toBe(
        'A shipment with this reference number already exists.'
      );
    }
  });

  it('converts network connection failures into user-friendly ApiError', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    try {
      await apiClient.get('/shipments');
      expect.fail('Expected apiClient.get to throw on network error');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.code).toBe('NETWORK_ERROR');
      expect(apiErr.message).toContain('Unable to connect to the shipment API server');
    }
  });

  it('passes AbortSignal to fetch and re-throws AbortError directly', async () => {
    const controller = new AbortController();
    controller.abort();

    const abortError = new DOMException('The user aborted a request.', 'AbortError');
    globalThis.fetch = vi.fn().mockRejectedValue(abortError);

    await expect(
      apiClient.get('/shipments', { signal: controller.signal })
    ).rejects.toThrow('The user aborted a request.');
  });
});
