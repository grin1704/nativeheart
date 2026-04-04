import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types/auth';

/**
 * Optional authentication middleware
 * Adds user info to request if valid token is provided, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
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
      } catch (error) {
        // Invalid token, but we don't throw error for optional auth
        // Just continue without user info
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};