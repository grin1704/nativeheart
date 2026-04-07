"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const qrCodePlateController_1 = require("../controllers/qrCodePlateController");
const router = (0, express_1.Router)();
router.use(adminAuth_1.adminAuth);
router.get('/stats', (0, adminAuth_1.requirePermission)('settings', 'read'), qrCodePlateController_1.getPoolStats);
router.get('/batches', (0, adminAuth_1.requirePermission)('settings', 'read'), qrCodePlateController_1.getBatches);
router.post('/batches', (0, adminAuth_1.requirePermission)('settings', 'write'), qrCodePlateController_1.createBatch);
router.get('/batches/:batchId/export', (0, adminAuth_1.requirePermission)('settings', 'read'), qrCodePlateController_1.exportBatchSvg);
router.get('/', (0, adminAuth_1.requirePermission)('settings', 'read'), qrCodePlateController_1.getPlates);
exports.default = router;
//# sourceMappingURL=qrCodePlates.js.map