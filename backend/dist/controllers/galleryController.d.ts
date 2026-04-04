import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class GalleryController {
    getPhotoGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    getVideoGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    addPhotoToGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    addVideoToGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    parseVideoUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    updatePhotoGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateVideoGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void>;
    removePhotoFromGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    removeVideoFromGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    reorderPhotoGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
    reorderVideoGallery(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const galleryController: GalleryController;
//# sourceMappingURL=galleryController.d.ts.map