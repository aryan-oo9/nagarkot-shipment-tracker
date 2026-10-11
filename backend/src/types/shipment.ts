export const ALLOWED_STATUSES = [
  'Booked',
  'In Transit',
  'Customs Hold',
  'Delivered',
] as const;

export type ShipmentStatus = (typeof ALLOWED_STATUSES)[number];

export const ALLOWED_SHIPMENT_TYPES = ['Domestic', 'International'] as const;
export type ShipmentType = (typeof ALLOWED_SHIPMENT_TYPES)[number];

export interface ShipmentRecord {
  id: number;
  reference_number: string;
  shipment_type: ShipmentType;
  origin: string;
  destination: string;
  current_status: ShipmentStatus;
  expected_delivery_date: string; // ISO Date YYYY-MM-DD
  created_at: string; // ISO 8601 UTC
  updated_at: string; // ISO 8601 UTC
}

export interface ShipmentHistoryRecord {
  id: number;
  shipment_id: number;
  status: ShipmentStatus;
  changed_at: string; // ISO 8601 UTC
  note: string | null;
}

export interface CreateShipmentInput {
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
  recentShipments: ShipmentRecord[];
}

export interface UpdateStatusInput {
  status: ShipmentStatus;
  note?: string;
}

export interface QueryShipmentsInput {
  search?: string;
  status?: ShipmentStatus;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
  };
}
