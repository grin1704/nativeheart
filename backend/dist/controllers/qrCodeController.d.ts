import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const getQRCode: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export declare const downloadQRCode: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export declare const regenerateQRCode: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export declare const getPublicQRCode: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
//# sourceMappingURL=qrCodeController.d.ts.map