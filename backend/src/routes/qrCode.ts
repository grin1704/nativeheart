import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import {
  getQRCode,
  downloadQRCode,
  regenerateQRCode,
  getPublicQRCode,
} from '../controllers/qrCodeController';

const router = Router();

/**
 * @route GET /api/qr-code/:pageId
 * @desc Get QR code data for memorial page
 * @access Private (owner/collaborator)
 */
router.get('/:pageId', optionalAuth, getQRCode);

/**
 * @route GET /api/qr-code/:pageId/download
 * @desc Download QR code as file
 * @access Private (owner/collaborator)
 */
router.get('/:pageId/download', optionalAuth, downloadQRCode);

/**
 * @route POST /api/qr-code/:pageId/regenerate
 * @desc Regenerate QR code for memorial page
 * @access Private (owner/collaborator)
 */
router.post('/:pageId/regenerate', authenticateToken, regenerateQRCode);

/**
 * @route GET /api/qr-code/public/:slug
 * @desc Get QR code for public memorial page by slug
 * @access Public
 */
router.get('/public/:slug', getPublicQRCode);

export default router;