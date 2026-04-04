import { Request, Response, NextFunction } from 'express';
import { FeatureAccess } from '../types/auth';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                subscriptionType: string;
                subscriptionExpiresAt: Date | null;
            };
            featureAccess?: FeatureAccess;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireSubscription: (requiredFeature: keyof FeatureAccess) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map