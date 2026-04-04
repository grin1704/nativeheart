"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminModerationController_1 = require("../controllers/adminModerationController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.use(adminAuth_1.adminAuth);
router.get('/stats', adminModerationController_1.adminModerationController.getModerationStats);
router.get('/queue', adminModerationController_1.adminModerationController.getModerationQueue);
router.post('/:moderationId/approve', adminModerationController_1.adminModerationController.approveContent);
router.post('/:moderationId/reject', adminModerationController_1.adminModerationController.rejectContent);
router.delete('/:contentType/:contentId', adminModerationController_1.adminModerationController.deleteInappropriateContent);
router.get('/history/:contentType/:contentId', adminModerationController_1.adminModerationController.getModerationHistory);
router.post('/bulk/approve', adminModerationController_1.adminModerationController.bulkApproveContent);
router.post('/bulk/reject', adminModerationController_1.adminModerationController.bulkRejectContent);
exports.default = router;
//# sourceMappingURL=adminModeration.js.map