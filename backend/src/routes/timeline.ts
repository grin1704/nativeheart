import { Router } from 'express';
import { timelineController } from '../controllers/timelineController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route - get timeline events for a memorial page
router.get('/:memorialPageId/timeline', timelineController.getTimelineEvents);

// Protected routes - require authentication
router.post('/:memorialPageId/timeline', authenticateToken, timelineController.createTimelineEvent);
router.put('/:memorialPageId/timeline/reorder', authenticateToken, timelineController.reorderTimelineEvents);

// These routes don't have memorialPageId in path
router.put('/timeline-events/:eventId', authenticateToken, timelineController.updateTimelineEvent);
router.delete('/timeline-events/:eventId', authenticateToken, timelineController.deleteTimelineEvent);

export default router;
