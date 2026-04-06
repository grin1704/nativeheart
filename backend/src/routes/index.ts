import { Router } from 'express';
import authRoutes from './auth';
import memorialPagesRoutes from './memorialPages';
import mediaRoutes from './media';
import galleryRoutes from './gallery';
import memoryRoutes from './memory';
import tributeRoutes from './tribute';
import burialLocationRoutes from './burialLocation';
import qrCodeRoutes from './qrCode';
import collaboratorRoutes from './collaborator';
import adminRoutes from './admin';
import timelineRoutes from './timeline';
import { redirectByToken } from '../controllers/qrCodePlateController';
import { qrCodePlateService } from '../services/qrCodePlateService';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount admin routes (MUST be before root-mounted routes)
router.use('/admin', adminRoutes);

// Mount memorial pages routes
router.use('/memorial-pages', memorialPagesRoutes);
router.use('/memorial-pages', timelineRoutes);

// Mount media routes
router.use('/media', mediaRoutes);

// Mount gallery routes
router.use('/gallery', galleryRoutes);

// Mount QR code routes
router.use('/qr-code', qrCodeRoutes);

// Public QR plate redirect
router.get('/qr/:token', redirectByToken);

// Public QR plate info (for SSR page)
router.get('/qr-plates/:token', async (req, res, next) => {
  try {
    const plate = await qrCodePlateService.getPlateByToken(req.params.token);
    res.json({ success: true, data: plate });
  } catch (error) {
    next(error);
  }
});

// Mount root-level routes (these have global middleware)
router.use('/', memoryRoutes);
router.use('/', tributeRoutes);
router.use('/', burialLocationRoutes);
router.use('/', collaboratorRoutes);

// Health check for API
router.get('/', (_req, res) => {
  res.json({ 
    message: 'Memorial Pages API v1.0',
    endpoints: {
      auth: '/api/auth',
      memorialPages: '/api/memorial-pages',
      media: '/api/media',
      gallery: '/api/gallery',
      memories: '/api/memories',
      tributes: '/api/tributes',
      burialLocation: '/api/memorial-pages/:pageId/burial-location',
      qrCode: '/api/qr-code',
      collaborators: '/api/memorial-pages/:pageId/collaborators',
      invitations: '/api/invitations',
      geocoding: '/api/geocode',
      timeline: '/api/memorial-pages/:pageId/timeline',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

export default router;