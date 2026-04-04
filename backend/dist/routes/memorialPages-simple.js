"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memorialPageController_1 = require("../controllers/memorialPageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.requireAuth, memorialPageController_1.memorialPageController.createMemorialPage);
router.get('/my', auth_1.requireAuth, memorialPageController_1.memorialPageController.getUserMemorialPages);
router.get('/:id', auth_1.requireAuth, memorialPageController_1.memorialPageController.getMemorialPageById);
exports.default = router;
//# sourceMappingURL=memorialPages-simple.js.map