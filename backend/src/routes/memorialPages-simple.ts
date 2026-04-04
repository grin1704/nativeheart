import { Router } from 'express';
import { memorialPageController } from '../controllers/memorialPageController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Routes that require authentication
router.post('/', requireAuth, memorialPageController.createMemorialPage);
router.get('/my', requireAuth, memorialPageController.getUserMemorialPages);
router.get('/:id', requireAuth, memorialPageController.getMemorialPageById);

export default router;