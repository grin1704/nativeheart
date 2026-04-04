"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryController_1 = require("../controllers/memoryController");
const auth_1 = require("../middleware/auth");
const optionalAuth_1 = require("../middleware/optionalAuth");
const passwordSession_1 = require("../middleware/passwordSession");
const router = (0, express_1.Router)();
router.post('/memorial-pages/:memorialPageId/memories', auth_1.authenticateToken, memoryController_1.memoryController.createMemory);
router.get('/memorial-pages/:memorialPageId/memories', optionalAuth_1.optionalAuth, passwordSession_1.checkPasswordAccess, memoryController_1.memoryController.getMemoriesForPage);
router.get('/memories/:memoryId', memoryController_1.memoryController.getMemoryById);
router.put('/memories/:memoryId', auth_1.authenticateToken, memoryController_1.memoryController.updateMemory);
router.delete('/memories/:memoryId', auth_1.authenticateToken, memoryController_1.memoryController.deleteMemory);
router.post('/memories/:memoryId/photos', auth_1.authenticateToken, memoryController_1.memoryController.addPhotoToMemory);
router.delete('/memories/:memoryId/photos/:photoId', auth_1.authenticateToken, memoryController_1.memoryController.removePhotoFromMemory);
router.put('/memories/:memoryId/photos/reorder', auth_1.authenticateToken, memoryController_1.memoryController.reorderMemoryPhotos);
exports.default = router;
//# sourceMappingURL=memory.js.map