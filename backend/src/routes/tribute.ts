import { Router } from 'express';
import {
  createTribute,
  getTributes,
  getTributeById,
  updateTribute,
  deleteTribute,
  moderateTribute,
  getTributesForModeration
} from '../controllers/tributeController';
import { authenticateToken } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { checkPasswordAccess } from '../middleware/passwordSession';

const router = Router();

// Public routes (no authentication required)
// Get tributes for a memorial page (public access with password protection)
router.get('/memorial-pages/:memorialPageId/tributes', optionalAuth, checkPasswordAccess, getTributes);

// Create a tribute (public can leave tributes, but need password access)
router.post('/memorial-pages/:memorialPageId/tributes', optionalAuth, checkPasswordAccess, createTribute);

// Protected routes for editors (authentication required)
// Get all tributes for a memorial page (for editing/moderation)
router.get('/memorial-pages/:memorialPageId/tributes/all', authenticateToken, getTributes);

// Get a specific tribute by ID (public access)
router.get('/tributes/:id', optionalAuth, getTributeById);

// Protected routes (authentication required)
// Update a tribute (for moderation or author edits)
router.put('/tributes/:id', authenticateToken, updateTribute);

// Delete a tribute
router.delete('/tributes/:id', authenticateToken, deleteTribute);

// Moderation routes (admin/moderator access)
// Moderate a tribute (approve/reject)
router.patch('/tributes/:id/moderate', authenticateToken, moderateTribute);

// Get tributes pending moderation
router.get('/admin/tributes/moderation', authenticateToken, getTributesForModeration);

export default router;