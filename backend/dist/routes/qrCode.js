"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const optionalAuth_1 = require("../middleware/optionalAuth");
const qrCodeController_1 = require("../controllers/qrCodeController");
const router = (0, express_1.Router)();
router.get('/:pageId', optionalAuth_1.optionalAuth, qrCodeController_1.getQRCode);
router.get('/:pageId/download', optionalAuth_1.optionalAuth, qrCodeController_1.downloadQRCode);
router.post('/:pageId/regenerate', auth_1.authenticateToken, qrCodeController_1.regenerateQRCode);
router.get('/public/:slug', qrCodeController_1.getPublicQRCode);
exports.default = router;
//# sourceMappingURL=qrCode.js.map