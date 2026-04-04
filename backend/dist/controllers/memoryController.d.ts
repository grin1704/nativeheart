import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class MemoryController {
    createMemory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMemoriesForPage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMemoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMemory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteMemory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addPhotoToMemory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removePhotoFromMemory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorderMemoryPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const memoryController: MemoryController;
//# sourceMappingURL=memoryController.d.ts.map