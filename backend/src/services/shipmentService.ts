import { PoolClient } from 'pg';
import { getClient, query } from '../db/pool';
import {
  CreateShipmentInput,
  PaginatedResult,
  QueryShipmentsInput,
  ShipmentHistoryRecord,
  ShipmentRecord,
  UpdateStatusInput,
} from '../types/shipment';
import { ConflictError, NotFoundError } from '../utils/errors';

export class ShipmentService {
  /**
   * Create a new shipment and record initial status history within an atomic transaction.
   */
  async createShipment(input: CreateShipmentInput): Promise<ShipmentRecord> {
    const client: PoolClient = await getClient();
    try {
      await client.query('BEGIN');

      // Check for existing reference number
      const checkRes = await client.query(
        'SELECT 1 FROM shipments WHERE reference_number = $1',
        [input.referenceNumber]
      );
      if (checkRes.rowCount && checkRes.rowCount > 0) {
        throw new ConflictError(
          `Shipment with reference number '${input.referenceNumber}' already exists`
        );
      }

      // Insert shipment record
      const insertShipmentSql = `
        INSERT INTO shipments (
          reference_number, origin, destination, current_status, expected_delivery_date
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          reference_number,
          origin,
          destination,
          current_status,
          to_char(expected_delivery_date, 'YYYY-MM-DD') AS expected_delivery_date,
          created_at,
          updated_at
      `;
      const shipmentRes = await client.query<ShipmentRecord>(insertShipmentSql, [
        input.referenceNumber,
        input.origin,
        input.destination,
        input.currentStatus,
        input.expectedDeliveryDate,
      ]);

      const createdShipment = shipmentRes.rows[0];

      // Insert initial history record
      const insertHistorySql = `
        INSERT INTO shipment_status_history (
          shipment_id, status, note
        ) VALUES ($1, $2, $3)
      `;
      await client.query(insertHistorySql, [
        createdShipment.id,
        input.currentStatus,
        'Initial consignment registration',
      ]);

      await client.query('COMMIT');
      return createdShipment;
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        throw new ConflictError(
          `Shipment with reference number '${input.referenceNumber}' already exists`
        );
      }
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * List shipments with search, status filtering, and pagination.
   */
  async listShipments(
    params: QueryShipmentsInput
  ): Promise<PaginatedResult<ShipmentRecord>> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.search) {
      conditions.push(`reference_number ILIKE $${paramIndex}`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    if (params.status) {
      conditions.push(`current_status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*)::int AS total FROM shipments ${whereClause}`;
    const countRes = await query<{ total: number }>(countSql, values);
    const total = countRes.rows[0]?.total ?? 0;

    // Data query with pagination and deterministic ordering
    const dataSql = `
      SELECT
        id,
        reference_number,
        origin,
        destination,
        current_status,
        to_char(expected_delivery_date, 'YYYY-MM-DD') AS expected_delivery_date,
        created_at,
        updated_at
      FROM shipments
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataValues = [...values, params.limit, params.offset];
    const dataRes = await query<ShipmentRecord>(dataSql, dataValues);

    return {
      data: dataRes.rows,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasNextPage: params.offset + params.limit < total,
      },
    };
  }

  /**
   * Retrieve a single shipment by ID.
   */
  async getShipmentById(id: number): Promise<ShipmentRecord> {
    const sql = `
      SELECT
        id,
        reference_number,
        origin,
        destination,
        current_status,
        to_char(expected_delivery_date, 'YYYY-MM-DD') AS expected_delivery_date,
        created_at,
        updated_at
      FROM shipments
      WHERE id = $1
    `;
    const res = await query<ShipmentRecord>(sql, [id]);
    if (res.rows.length === 0) {
      throw new NotFoundError(`Shipment with ID ${id} not found`);
    }
    return res.rows[0];
  }

  /**
   * Concurrency-safe status update with row locking and atomic history entry.
   */
  async updateStatus(
    id: number,
    input: UpdateStatusInput
  ): Promise<{ shipment: ShipmentRecord; updated: boolean }> {
    const client: PoolClient = await getClient();
    try {
      await client.query('BEGIN');

      // Lock row to prevent concurrent conflicting updates
      const lockSql = `
        SELECT
          id,
          reference_number,
          origin,
          destination,
          current_status,
          to_char(expected_delivery_date, 'YYYY-MM-DD') AS expected_delivery_date,
          created_at,
          updated_at
        FROM shipments
        WHERE id = $1
        FOR UPDATE
      `;
      const lockRes = await client.query<ShipmentRecord>(lockSql, [id]);

      if (lockRes.rows.length === 0) {
        throw new NotFoundError(`Shipment with ID ${id} not found`);
      }

      const currentShipment = lockRes.rows[0];

      // No-op if status is already identical
      if (currentShipment.current_status === input.status) {
        await client.query('COMMIT');
        return {
          shipment: currentShipment,
          updated: false,
        };
      }

      // Update current status and updated_at
      const updateSql = `
        UPDATE shipments
        SET current_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          reference_number,
          origin,
          destination,
          current_status,
          to_char(expected_delivery_date, 'YYYY-MM-DD') AS expected_delivery_date,
          created_at,
          updated_at
      `;
      const updateRes = await client.query<ShipmentRecord>(updateSql, [
        input.status,
        id,
      ]);
      const updatedShipment = updateRes.rows[0];

      // Append status history entry
      const insertHistorySql = `
        INSERT INTO shipment_status_history (
          shipment_id, status, note
        ) VALUES ($1, $2, $3)
      `;
      await client.query(insertHistorySql, [
        id,
        input.status,
        input.note ?? null,
      ]);

      await client.query('COMMIT');
      return {
        shipment: updatedShipment,
        updated: true,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve full status history for a shipment in chronological order.
   */
  async getShipmentHistory(id: number): Promise<ShipmentHistoryRecord[]> {
    // Verify parent shipment exists
    const checkSql = 'SELECT id FROM shipments WHERE id = $1';
    const checkRes = await query(checkSql, [id]);
    if (checkRes.rows.length === 0) {
      throw new NotFoundError(`Shipment with ID ${id} not found`);
    }

    const historySql = `
      SELECT
        id,
        shipment_id,
        status,
        changed_at,
        note
      FROM shipment_status_history
      WHERE shipment_id = $1
      ORDER BY changed_at ASC, id ASC
    `;
    const historyRes = await query<ShipmentHistoryRecord>(historySql, [id]);
    return historyRes.rows;
  }
}

export const shipmentService = new ShipmentService();
