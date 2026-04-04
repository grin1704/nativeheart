import { Request, Response, NextFunction } from 'express';
interface AdminAuthRequest extends Request {
    adminUser?: {
        id: string;
        email: string;
        role: string;
        permissions: Array<{
            resource: string;
            actions: string[];
        }>;
    };
}
export declare const adminAuth: (req: AdminAuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const requirePermission: (resource: string, action: string) => (req: AdminAuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=adminAuth.d.ts.map