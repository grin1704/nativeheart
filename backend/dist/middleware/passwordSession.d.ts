import { Request, Response, NextFunction } from 'express';
export declare const checkPasswordAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyAndGrantPasswordAccess: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const clearPasswordAccess: (req: Request, res: Response) => void;
export declare const getPasswordAccessStatus: (req: Request, res: Response) => void;
//# sourceMappingURL=passwordSession.d.ts.map