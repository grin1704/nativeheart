import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    adminUser?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
declare class AdminModerationController {
    getModerationStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    getModerationQueue(req: AuthenticatedRequest, res: Response): Promise<void>;
    approveContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    rejectContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteInappropriateContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getModerationHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
    bulkApproveContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkRejectContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const adminModerationController: AdminModerationController;
export {};
//# sourceMappingURL=adminModerationController.d.ts.map