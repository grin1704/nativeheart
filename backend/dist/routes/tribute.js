"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tributeController_1 = require("../controllers/tributeController");
const auth_1 = require("../middleware/auth");
const optionalAuth_1 = require("../middleware/optionalAuth");
const passwordSession_1 = require("../middleware/passwordSession");
const router = (0, express_1.Router)();
router.get('/memorial-pages/:memorialPageId/tributes', optionalAuth_1.optionalAuth, passwordSession_1.checkPasswordAccess, tributeController_1.getTributes);
router.post('/memorial-pages/:memorialPageId/tributes', optionalAuth_1.optionalAuth, passwordSession_1.checkPasswordAccess, tributeController_1.createTribute);
router.get('/memorial-pages/:memorialPageId/tributes/all', auth_1.authenticateToken, tributeController_1.getTributes);
router.get('/tributes/:id', optionalAuth_1.optionalAuth, tributeController_1.getTributeById);
router.put('/tributes/:id', auth_1.authenticateToken, tributeController_1.updateTribute);
router.delete('/tributes/:id', auth_1.authenticateToken, tributeController_1.deleteTribute);
router.patch('/tributes/:id/moderate', auth_1.authenticateToken, tributeController_1.moderateTribute);
router.get('/admin/tributes/moderation', auth_1.authenticateToken, tributeController_1.getTributesForModeration);
exports.default = router;
//# sourceMappingURL=tribute.js.map