import { Router } from 'express';
import { memoryController } from '../controllers/memoryController';
import { authenticateToken } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { checkPasswordAccess } from '../middleware/passwordSession';

const router = Router();

// Routes for memories within a memorial page
router.post('/memorial-pages/:memorialPageId/memories', authenticateToken, memoryController.createMemory);
router.get('/memorial-pages/:memorialPageId/memories', optionalAuth, checkPasswordAccess, memoryController.getMemoriesForPage);

// Routes for individual memories
router.get('/memories/:memoryId', memoryController.getMemoryById);
router.put('/memories/:memoryId', authenticateToken, memoryController.updateMemory);
router.delete('/memories/:memoryId', authenticateToken, memoryController.deleteMemory);

// Routes for memory photos
router.post('/memories/:memoryId/photos', authenticateToken, memoryController.addPhotoToMemory);
router.delete('/memories/:memoryId/photos/:photoId', authenticateToken, memoryController.removePhotoFromMemory);
router.put('/memories/:memoryId/photos/reorder', authenticateToken, memoryController.reorderMemoryPhotos);

export default router;