import { Router } from 'express';
import { shipmentController } from '../controllers/shipmentController';

const router = Router();

router.post('/', (req, res, next) => shipmentController.create(req, res, next));
router.get('/', (req, res, next) => shipmentController.list(req, res, next));
router.get('/summary', (req, res, next) => shipmentController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => shipmentController.getById(req, res, next));
router.patch('/:id/status', (req, res, next) => shipmentController.updateStatus(req, res, next));
router.get('/:id/history', (req, res, next) => shipmentController.getHistory(req, res, next));

export default router;
