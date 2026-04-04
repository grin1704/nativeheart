import { Request, Response } from 'express';
export declare const adminAuthController: {
    login(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=adminAuthController.d.ts.map