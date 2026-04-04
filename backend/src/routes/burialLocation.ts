import { Router } from 'express';
import { burialLocationController } from '../controllers/burialLocationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Geocoding routes (public)
router.post('/geocode', burialLocationController.geocodeAddress);
router.post('/reverse-geocode', burialLocationController.reverseGeocode);

// Memorial page burial location routes (require authentication)
router.post('/memorial-pages/:pageId/burial-location', 
  authenticateToken, 
  burialLocationController.createOrUpdateBurialLocation
);

router.get('/memorial-pages/:pageId/burial-location', 
  burialLocationController.getBurialLocation
);

router.put('/memorial-pages/:pageId/burial-location', 
  authenticateToken, 
  burialLocationController.updateBurialLocation
);

router.delete('/memorial-pages/:pageId/burial-location', 
  authenticateToken, 
  burialLocationController.deleteBurialLocation
);

export default router;