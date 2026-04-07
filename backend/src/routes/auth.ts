import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { oauthService } from '../services/oauthService';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// VK OAuth
router.get('/vk/url', (_req, res) => {
  const { authUrl, state } = oauthService.getVkAuthUrl();
  res.json({ authUrl, state });
});
router.post('/vk/callback', async (req, res) => {
  try {
    const { code, device_id, state } = req.body;
    if (!code) return res.status(400).json({ error: 'Код авторизации обязателен' });
    const result = await oauthService.handleVkCallback(code, device_id || '', state || '');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('VK callback error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка авторизации VK' });
  }
});

// Яндекс OAuth
router.get('/yandex/url', (_req, res) => {
  res.json({ authUrl: oauthService.getYandexAuthUrl() });
});
router.post('/yandex/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Код авторизации обязателен' });
    const result = await oauthService.handleYandexCallback(code);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Yandex callback error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка авторизации Яндекс' });
  }
});

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.get('/me', authenticateToken, authController.getProfile.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.patch('/subscription', authenticateToken, authController.updateSubscription.bind(authController));
router.post('/change-unverified-email', authenticateToken, authController.changeUnverifiedEmail.bind(authController));

export default router;