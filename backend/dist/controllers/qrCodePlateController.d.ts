import { Request, Response, NextFunction } from 'express';
export declare const createBatch: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getBatches: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getPlates: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const exportBatchSvg: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPoolStats: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const redirectByToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=qrCodePlateController.d.ts.map