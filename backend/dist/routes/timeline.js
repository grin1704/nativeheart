"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timelineController_1 = require("../controllers/timelineController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/:memorialPageId/timeline', timelineController_1.timelineController.getTimelineEvents);
router.post('/:memorialPageId/timeline', auth_1.authenticateToken, timelineController_1.timelineController.createTimelineEvent);
router.put('/:memorialPageId/timeline/reorder', auth_1.authenticateToken, timelineController_1.timelineController.reorderTimelineEvents);
router.put('/timeline-events/:eventId', auth_1.authenticateToken, timelineController_1.timelineController.updateTimelineEvent);
router.delete('/timeline-events/:eventId', auth_1.authenticateToken, timelineController_1.timelineController.deleteTimelineEvent);
exports.default = router;
//# sourceMappingURL=timeline.js.map