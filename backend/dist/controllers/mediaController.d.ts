import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class MediaController {
    uploadFile(req: AuthenticatedRequest, res: Response): Promise<void>;
    uploadMultipleFiles(req: AuthenticatedRequest, res: Response): Promise<void>;
    uploadTributeFile(req: Request, res: Response): Promise<void>;
    getFile(req: Request, res: Response): Promise<void>;
    deleteFile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMemorialPageFiles(req: Request, res: Response): Promise<void>;
    getFileStatistics(req: Request, res: Response): Promise<void>;
    cleanupUnusedFiles(req: Request, res: Response): Promise<void>;
}
export declare const mediaController: MediaController;
//# sourceMappingURL=mediaController.d.ts.map