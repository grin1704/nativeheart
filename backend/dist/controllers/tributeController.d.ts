import { Request, Response, NextFunction } from 'express';
export declare const createTribute: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTributes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTributeById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTribute: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTribute: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const moderateTribute: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTributesForModeration: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tributeController.d.ts.map