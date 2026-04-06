import { Router } from 'express';
import { adminAuth, requirePermission } from '../middleware/adminAuth';
import {
  createBatch,
  getBatches,
  getPlates,
  exportBatchSvg,
  getPoolStats,
} from '../controllers/qrCodePlateController';

const router = Router();

// Все роуты требуют авторизации администратора
router.use(adminAuth);

router.get('/stats', requirePermission('settings', 'read'), getPoolStats);
router.get('/batches', requirePermission('settings', 'read'), getBatches);
router.post('/batches', requirePermission('settings', 'write'), createBatch);
router.get('/batches/:batchId/export', requirePermission('settings', 'read'), exportBatchSvg);
router.get('/', requirePermission('settings', 'read'), getPlates);

export default router;
