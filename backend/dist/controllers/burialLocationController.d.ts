import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare class BurialLocationController {
    createOrUpdateBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
    getBurialLocation(req: Request, res: Response): Promise<void>;
    updateBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
    geocodeAddress(req: Request, res: Response): Promise<void>;
    reverseGeocode(req: Request, res: Response): Promise<void>;
}
export declare const burialLocationController: BurialLocationController;
//# sourceMappingURL=burialLocationController.d.ts.map