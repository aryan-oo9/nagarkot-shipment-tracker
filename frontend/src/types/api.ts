import { Shipment, ShipmentHistoryItem } from './shipment';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
}

export interface PaginatedListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ShipmentHistoryResponse {
  shipmentId: number;
  history: ShipmentHistoryItem[];
  count: number;
}

export interface StatusUpdateResponse {
  data: Shipment;
  message: string;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface BackendErrorPayload {
  error: {
    code: string;
    message: string;
    details?: FieldValidationError[] | any;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly fieldErrors: Record<string, string>;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    fieldErrors: Record<string, string> = {},
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}
