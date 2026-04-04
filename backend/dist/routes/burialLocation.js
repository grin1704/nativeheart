"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const burialLocationController_1 = require("../controllers/burialLocationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/geocode', burialLocationController_1.burialLocationController.geocodeAddress);
router.post('/reverse-geocode', burialLocationController_1.burialLocationController.reverseGeocode);
router.post('/memorial-pages/:pageId/burial-location', auth_1.authenticateToken, burialLocationController_1.burialLocationController.createOrUpdateBurialLocation);
router.get('/memorial-pages/:pageId/burial-location', burialLocationController_1.burialLocationController.getBurialLocation);
router.put('/memorial-pages/:pageId/burial-location', auth_1.authenticateToken, burialLocationController_1.burialLocationController.updateBurialLocation);
router.delete('/memorial-pages/:pageId/burial-location', auth_1.authenticateToken, burialLocationController_1.burialLocationController.deleteBurialLocation);
exports.default = router;
//# sourceMappingURL=burialLocation.js.map