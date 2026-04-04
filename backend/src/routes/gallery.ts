import { Router } from 'express';
import { galleryController } from '../controllers/galleryController';
import { requireAuth } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { validateRequest } from '../middleware/validation';
import { galleryValidation } from '../validation/gallery';
import { checkPasswordAccess } from '../middleware/passwordSession';

const router = Router();

// Public routes (with optional authentication and password protection)
router.get(
  '/:pageId/photos',
  optionalAuth,
  checkPasswordAccess,
  validateRequest(galleryValidation.pageId, 'params'),
  galleryController.getPhotoGallery.bind(galleryController)
);

router.get(
  '/:pageId/videos',
  optionalAuth,
  checkPasswordAccess,
  validateRequest(galleryValidation.pageId, 'params'),
  galleryController.getVideoGallery.bind(galleryController)
);

// Protected routes (require authentication)
// Photo gallery management
router.post(
  '/:pageId/photos',
  requireAuth,
  validateRequest(galleryValidation.pageId, 'params'),
  validateRequest(galleryValidation.addToGallery, 'body'),
  galleryController.addPhotoToGallery.bind(galleryController)
);

router.put(
  '/:pageId/photos/:itemId',
  requireAuth,
  validateRequest(galleryValidation.pageAndItemId, 'params'),
  validateRequest(galleryValidation.updateGalleryItem, 'body'),
  galleryController.updatePhotoGalleryItem.bind(galleryController)
);

router.delete(
  '/:pageId/photos/:itemId',
  requireAuth,
  validateRequest(galleryValidation.pageAndItemId, 'params'),
  galleryController.removePhotoFromGallery.bind(galleryController)
);

router.put(
  '/:pageId/photos/reorder',
  requireAuth,
  validateRequest(galleryValidation.pageId, 'params'),
  validateRequest(galleryValidation.reorderGallery, 'body'),
  galleryController.reorderPhotoGallery.bind(galleryController)
);

// Parse external video URL
router.post(
  '/parse-video',
  requireAuth,
  galleryController.parseVideoUrl.bind(galleryController)
);

// Video gallery management
router.post(
  '/:pageId/videos',
  requireAuth,
  validateRequest(galleryValidation.pageId, 'params'),
  validateRequest(galleryValidation.addToGallery, 'body'),
  galleryController.addVideoToGallery.bind(galleryController)
);

router.put(
  '/:pageId/videos/:itemId',
  requireAuth,
  validateRequest(galleryValidation.pageAndItemId, 'params'),
  validateRequest(galleryValidation.updateGalleryItem, 'body'),
  galleryController.updateVideoGalleryItem.bind(galleryController)
);

router.delete(
  '/:pageId/videos/:itemId',
  requireAuth,
  validateRequest(galleryValidation.pageAndItemId, 'params'),
  galleryController.removeVideoFromGallery.bind(galleryController)
);

router.put(
  '/:pageId/videos/reorder',
  requireAuth,
  validateRequest(galleryValidation.pageId, 'params'),
  validateRequest(galleryValidation.reorderGallery, 'body'),
  galleryController.reorderVideoGallery.bind(galleryController)
);

export default router;