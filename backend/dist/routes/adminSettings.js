"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminSettingsController_1 = require("../controllers/adminSettingsController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.use(adminAuth_1.adminAuth);
router.get('/settings', adminSettingsController_1.adminSettingsController.getSystemSettings.bind(adminSettingsController_1.adminSettingsController));
router.put('/settings', adminSettingsController_1.adminSettingsController.updateSystemSettings.bind(adminSettingsController_1.adminSettingsController));
router.get('/settings/:key', adminSettingsController_1.adminSettingsController.getSetting.bind(adminSettingsController_1.adminSettingsController));
router.put('/settings/:key', adminSettingsController_1.adminSettingsController.updateSetting.bind(adminSettingsController_1.adminSettingsController));
router.get('/statistics', adminSettingsController_1.adminSettingsController.getSystemStatistics.bind(adminSettingsController_1.adminSettingsController));
router.get('/settings/export/backup', adminSettingsController_1.adminSettingsController.exportSettings.bind(adminSettingsController_1.adminSettingsController));
router.post('/settings/import/backup', adminSettingsController_1.adminSettingsController.importSettings.bind(adminSettingsController_1.adminSettingsController));
router.post('/settings/reset/defaults', adminSettingsController_1.adminSettingsController.resetToDefaults.bind(adminSettingsController_1.adminSettingsController));
router.get('/test/connections', adminSettingsController_1.adminSettingsController.testConnections.bind(adminSettingsController_1.adminSettingsController));
exports.default = router;
//# sourceMappingURL=adminSettings.js.map