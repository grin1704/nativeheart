import { Request, Response } from 'express';
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<void>;
    updateSubscription(req: Request, res: Response): Promise<void>;
    logout(_req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendVerification(req: Request, res: Response): Promise<void>;
    requestPasswordReset(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    changeUnverifiedEmail(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map