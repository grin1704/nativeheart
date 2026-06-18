import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { getCandidateTokens } from '../utils/authToken';
import { AuthenticatedRequest } from '../types/auth';

/**
 * Optional authentication middleware
 * Adds user info to request if valid token is provided, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Перебираем кандидатов (Authorization header, затем cookie)
    for (const token of getCandidateTokens(req)) {
      try {
        const decoded = verifyToken(token);
        // Transform JWT payload to user object
        (req as AuthenticatedRequest).user = {
          id: decoded.userId,
          email: decoded.email,
          name: '', // Will be filled from database if needed
          subscriptionType: decoded.subscriptionType,
          subscriptionExpiresAt: null, // Will be filled from database if needed
          emailVerified: false, // Will be filled from database if needed
          oauthProvider: null,
          oauthId: null,
        };
        break; // нашли валидный — дальше не пробуем
      } catch (error) {
        // Invalid token, пробуем следующий кандидат
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};