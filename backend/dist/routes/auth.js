"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const oauthService_1 = require("../services/oauthService");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.get('/vk/url', (_req, res) => {
    const { authUrl, state } = oauthService_1.oauthService.getVkAuthUrl();
    res.json({ authUrl, state });
});
router.post('/vk/callback', async (req, res) => {
    try {
        const { code, device_id, state } = req.body;
        if (!code)
            return res.status(400).json({ error: 'Код авторизации обязателен' });
        const result = await oauthService_1.oauthService.handleVkCallback(code, device_id || '', state || '');
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('VK callback error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка авторизации VK' });
    }
});
router.get('/yandex/url', (_req, res) => {
    res.json({ authUrl: oauthService_1.oauthService.getYandexAuthUrl() });
});
router.post('/yandex/callback', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).json({ error: 'Код авторизации обязателен' });
        const result = await oauthService_1.oauthService.handleYandexCallback(code);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Yandex callback error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка авторизации Яндекс' });
    }
});
router.get('/profile', auth_1.authenticateToken, authController.getProfile.bind(authController));
router.get('/me', auth_1.authenticateToken, authController.getProfile.bind(authController));
router.post('/logout', auth_1.authenticateToken, authController.logout.bind(authController));
router.patch('/subscription', auth_1.authenticateToken, authController.updateSubscription.bind(authController));
router.post('/change-unverified-email', auth_1.authenticateToken, authController.changeUnverifiedEmail.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.js.map