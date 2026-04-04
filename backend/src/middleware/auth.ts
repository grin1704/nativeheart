import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthService } from '../services/authService';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType, FeatureAccess } from '../types/auth';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        subscriptionType: string;
        subscriptionExpiresAt: Date | null;
      };
      featureAccess?: FeatureAccess;
    }
  }
}

const authService = new AuthService();

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Токен доступа отсутствует',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get fresh user data from database
    const user = await authService.getUserById(decoded.userId);
    
    // Attach user to request
    req.user = user;
    
    // Calculate feature access based on current subscription
    req.featureAccess = getFeatureAccess(
      user.subscriptionType as SubscriptionType, 
      user.subscriptionExpiresAt
    );

    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Недействительный токен доступа',
      code: 'INVALID_TOKEN'
    });
    return;
  }
};

export const requireSubscription = (requiredFeature: keyof FeatureAccess) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.featureAccess) {
      res.status(401).json({ 
        error: 'Требуется аутентификация',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    if (!req.featureAccess[requiredFeature]) {
      res.status(403).json({ 
        error: 'Данная функция недоступна в вашем тарифном плане',
        code: 'FEATURE_NOT_AVAILABLE',
        requiredFeature,
        currentSubscription: req.user?.subscriptionType
      });
      return;
    }

    next();
  };
};

// Alias for authenticateToken for consistency
export const requireAuth = authenticateToken;

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await authService.getUserById(decoded.userId);
      req.user = user;
      req.featureAccess = getFeatureAccess(
        user.subscriptionType as SubscriptionType, 
        user.subscriptionExpiresAt
      );
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};