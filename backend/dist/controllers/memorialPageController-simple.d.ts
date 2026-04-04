import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class MemorialPageController {
    createMemorialPage(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMemorialPage(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserMemorialPages(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const memorialPageController: MemorialPageController;
//# sourceMappingURL=memorialPageController-simple.d.ts.map