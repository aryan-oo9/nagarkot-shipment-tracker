export const ALLOWED_STATUSES = [
  'Booked',
  'In Transit',
  'Customs Hold',
  'Delivered',
] as const;

export type ShipmentStatus = (typeof ALLOWED_STATUSES)[number];

export interface Shipment {
  id: number;
  reference_number: string;
  origin: string;
  destination: string;
  current_status: ShipmentStatus;
  expected_delivery_date: string; // Strictly YYYY-MM-DD calendar date
  created_at: string; // ISO 8601 UTC
  updated_at: string; // ISO 8601 UTC
}

export interface ShipmentHistoryItem {
  id: number;
  shipment_id: number;
  status: ShipmentStatus;
  changed_at: string; // ISO 8601 UTC
  note: string | null;
}

export interface CreateShipmentFormData {
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
}

export interface UpdateStatusFormData {
  status: ShipmentStatus;
  note?: string;
}

export interface ShipmentFilterParams {
  search?: string;
  status?: ShipmentStatus | '';
  limit?: number;
  offset?: number;
}
