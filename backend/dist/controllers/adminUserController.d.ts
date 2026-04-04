import { Request, Response } from 'express';
interface AuthenticatedAdminRequest extends Request {
    adminUser?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare const adminUserController: {
    getAllUsers(req: AuthenticatedAdminRequest, res: Response): Promise<void>;
    getUserDetails(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    suspendUser(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    activateUser(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUserSubscription(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserActivity(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllMemorialPages(req: AuthenticatedAdminRequest, res: Response): Promise<void>;
    getMemorialPageDetails(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteMemorialPage(req: AuthenticatedAdminRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
export {};
//# sourceMappingURL=adminUserController.d.ts.map