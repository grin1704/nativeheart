import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.get('/me', authenticateToken, authController.getProfile.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.patch('/subscription', authenticateToken, authController.updateSubscription.bind(authController));
router.post('/change-unverified-email', authenticateToken, authController.changeUnverifiedEmail.bind(authController));

export default router;