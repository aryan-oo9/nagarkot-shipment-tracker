-- Migration: 001_initial_schema.sql
-- Description: Create shipments and shipment_status_history tables with integrity constraints and indexes
-- Target Engine: PostgreSQL 15+ (Compatible with Supabase PostgreSQL 17)

-- ============================================================================
-- 1. Shipments Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reference_number VARCHAR(64) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    current_status VARCHAR(32) NOT NULL,
    expected_delivery_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_shipments_reference_number UNIQUE (reference_number),
    CONSTRAINT chk_shipments_status CHECK (
        current_status IN ('Booked', 'In Transit', 'Customs Hold', 'Delivered')
    )
);

-- Indexes for Shipments
CREATE INDEX IF NOT EXISTS idx_shipments_current_status ON shipments (current_status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_ref_search ON shipments (reference_number varchar_pattern_ops);

-- ============================================================================
-- 2. Shipment Status History Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipment_status_history (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shipment_id INT NOT NULL,
    status VARCHAR(32) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,

    -- Constraints
    CONSTRAINT fk_history_shipment FOREIGN KEY (shipment_id)
        REFERENCES shipments (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_history_status CHECK (
        status IN ('Booked', 'In Transit', 'Customs Hold', 'Delivered')
    )
);

-- Indexes for History Audit Trail
CREATE INDEX IF NOT EXISTS idx_history_shipment_id_order ON shipment_status_history (shipment_id, changed_at ASC, id ASC);

-- ============================================================================
-- Documentation Comments
-- ============================================================================
COMMENT ON TABLE shipments IS 'Primary logistics consignments registered in the system.';
COMMENT ON COLUMN shipments.reference_number IS 'Unique tracking consignment code (e.g., NF-100482).';
COMMENT ON COLUMN shipments.current_status IS 'Fast-access current operational status of the consignment.';
COMMENT ON COLUMN shipments.expected_delivery_date IS 'Target arrival calendar date (YYYY-MM-DD).';

COMMENT ON TABLE shipment_status_history IS 'Append-only audit trail tracking every lifecycle status transition.';
COMMENT ON COLUMN shipment_status_history.shipment_id IS 'Foreign key referencing parent shipments table.';
COMMENT ON COLUMN shipment_status_history.note IS 'Optional operational remark logged during creation or status change.';
