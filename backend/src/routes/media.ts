import { Router } from 'express';
import { mediaController } from '../controllers/mediaController';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle, uploadMultiple, handleUploadError, validateFileSizes } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import { mediaValidation } from '../validation/media';

const router = Router();

// Upload single file (authenticated)
router.post(
  '/upload',
  authenticateToken,
  uploadSingle('file'),
  handleUploadError,
  validateFileSizes,
  mediaController.uploadFile.bind(mediaController)
);

// Upload single file for tributes (public access)
router.post(
  '/upload/tribute',
  uploadSingle('file'),
  handleUploadError,
  validateFileSizes,
  mediaController.uploadTributeFile.bind(mediaController)
);

// Upload multiple files
router.post(
  '/upload/multiple',
  authenticateToken,
  uploadMultiple('files', 10),
  handleUploadError,
  validateFileSizes,
  mediaController.uploadMultipleFiles.bind(mediaController)
);

// Get file by ID
router.get(
  '/:fileId',
  validateRequest(mediaValidation.fileId, 'params'),
  mediaController.getFile.bind(mediaController)
);

// Delete file
router.delete(
  '/:fileId',
  authenticateToken,
  validateRequest(mediaValidation.fileId, 'params'),
  mediaController.deleteFile.bind(mediaController)
);

// Get files for memorial page
router.get(
  '/memorial-page/:memorialPageId',
  validateRequest(mediaValidation.memorialPageId, 'params'),
  mediaController.getMemorialPageFiles.bind(mediaController)
);

// Admin routes
router.get(
  '/admin/statistics',
  authenticateToken,
  // TODO: Add admin role check middleware
  mediaController.getFileStatistics.bind(mediaController)
);

router.post(
  '/admin/cleanup',
  authenticateToken,
  // TODO: Add admin role check middleware
  mediaController.cleanupUnusedFiles.bind(mediaController)
);

export default router;