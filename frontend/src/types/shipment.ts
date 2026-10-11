export const ALLOWED_STATUSES = [
  'Booked',
  'In Transit',
  'Customs Hold',
  'Delivered',
] as const;

export type ShipmentStatus = (typeof ALLOWED_STATUSES)[number];

export const ALLOWED_SHIPMENT_TYPES = ['Domestic', 'International'] as const;
export type ShipmentType = (typeof ALLOWED_SHIPMENT_TYPES)[number];

export interface Shipment {
  id: number;
  reference_number: string;
  shipment_type: ShipmentType;
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
  shipmentType: ShipmentType;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
}

export interface DashboardSummary {
  thisMonth: number;
  thisYear: number;
  domestic: number;
  international: number;
  statusCounts: {
    booked: number;
    inTransit: number;
    customsHold: number;
    delivered: number;
  };
  recentShipments: Shipment[];
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
