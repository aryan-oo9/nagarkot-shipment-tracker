import {
  ApiError,
  ApiResponse,
  BackendErrorPayload,
  PaginatedListResponse,
  ShipmentHistoryResponse,
  StatusUpdateResponse,
} from '../types/api';
import {
  CreateShipmentFormData,
  Shipment,
  ShipmentFilterParams,
  UpdateStatusFormData,
} from '../types/shipment';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000/api';

interface RequestOptions {
  signal?: AbortSignal;
  params?: Record<string, string | number | undefined>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  let body: unknown = null;

  if (isJson) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorPayload = body as BackendErrorPayload | null;
    const errorData = errorPayload?.error;

    const message =
      errorData?.message ||
      `HTTP Error ${response.status} (${response.statusText || 'Unknown'})`;
    const code = errorData?.code || `HTTP_${response.status}`;

    const fieldErrors: Record<string, string> = {};

    // 1. Map 400 validation details
    if (Array.isArray(errorData?.details)) {
      for (const item of errorData.details) {
        if (item && typeof item.field === 'string' && typeof item.message === 'string') {
          fieldErrors[item.field] = item.message;
        }
      }
    }

    // 2. Map 409 Conflict directly to referenceNumber field error if appropriate
    if (response.status === 409 || code === 'CONFLICT') {
      fieldErrors.referenceNumber =
        'A shipment with this reference number already exists.';
    }

    throw new ApiError(message, response.status, code, fieldErrors, errorData?.details);
  }

  return body as T;
}

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      }
    }

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: options?.signal,
      });
      return await handleResponse<T>(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(
        'Unable to connect to the shipment API server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  async post<T>(path: string, payload: unknown, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: options?.signal,
      });
      return await handleResponse<T>(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(
        'Unable to connect to the shipment API server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  async patch<T>(path: string, payload: unknown, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: options?.signal,
      });
      return await handleResponse<T>(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(
        'Unable to connect to the shipment API server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  // Specific domain helpers for convenience & strict type-safety
  listShipments(
    params?: ShipmentFilterParams,
    signal?: AbortSignal
  ): Promise<PaginatedListResponse<Shipment>> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.status) queryParams.status = params.status;
    if (params?.limit !== undefined) queryParams.limit = params.limit;
    if (params?.offset !== undefined) queryParams.offset = params.offset;

    return this.get<PaginatedListResponse<Shipment>>('/shipments', {
      params: queryParams,
      signal,
    });
  },

  getShipment(id: number, signal?: AbortSignal): Promise<ApiResponse<Shipment>> {
    return this.get<ApiResponse<Shipment>>(`/shipments/${id}`, { signal });
  },

  createShipment(
    data: CreateShipmentFormData,
    signal?: AbortSignal
  ): Promise<ApiResponse<Shipment>> {
    return this.post<ApiResponse<Shipment>>('/shipments', data, { signal });
  },

  updateShipmentStatus(
    id: number,
    data: UpdateStatusFormData,
    signal?: AbortSignal
  ): Promise<StatusUpdateResponse> {
    return this.patch<StatusUpdateResponse>(`/shipments/${id}/status`, data, { signal });
  },

  getShipmentHistory(
    id: number,
    signal?: AbortSignal
  ): Promise<ShipmentHistoryResponse> {
    return this.get<ShipmentHistoryResponse>(`/shipments/${id}/history`, { signal });
  },
};
