import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class TimelineController {
    getTimelineEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorderTimelineEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const timelineController: TimelineController;
//# sourceMappingURL=timelineController.d.ts.map