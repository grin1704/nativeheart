import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class MemorialPageController {
    createMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMemorialPageById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMemorialPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserMemorialPages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    verifyPagePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    clearPasswordAccess(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPasswordAccessStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBiography(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateBiography(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addBiographyPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeBiographyPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorderBiographyPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const memorialPageController: MemorialPageController;
//# sourceMappingURL=memorialPageController.d.ts.map