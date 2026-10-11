import { NextFunction, Request, Response } from 'express';
import {
  createShipmentSchema,
  idParamSchema,
  queryShipmentsSchema,
  updateStatusSchema,
} from '../schemas/shipment';
import { shipmentService } from '../services/shipmentService';

export class ShipmentController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createShipmentSchema.parse(req.body);
      const created = await shipmentService.createShipment(validatedInput);
      res.status(201).json({
        data: created,
        message: 'Shipment created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = queryShipmentsSchema.parse(req.query);
      const result = await shipmentService.listShipments(validatedQuery);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const shipment = await shipmentService.getShipmentById(id);
      res.status(200).json({ data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedBody = updateStatusSchema.parse(req.body);
      const result = await shipmentService.updateStatus(id, validatedBody);
      res.status(200).json({
        data: result.shipment,
        message: result.updated
          ? 'Shipment status updated successfully'
          : 'Status was already current; no update applied',
      });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const history = await shipmentService.getShipmentHistory(id);
      res.status(200).json({
        shipmentId: id,
        history,
        count: history.length,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await shipmentService.getDashboardSummary();
      res.status(200).json({
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const shipmentController = new ShipmentController();
