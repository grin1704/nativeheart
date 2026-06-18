import { Request, Response } from 'express';
export declare const AUTH_COOKIE_NAME = "token";
export declare const getCandidateTokens: (req: Request) => string[];
export declare const setAuthCookie: (res: Response, token: string) => void;
export declare const clearAuthCookie: (res: Response) => void;
//# sourceMappingURL=authToken.d.ts.map