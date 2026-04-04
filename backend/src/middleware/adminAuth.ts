import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

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

export const adminAuth = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify admin user exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      include: {
        permissions: true
      }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin account deactivated.'
      });
    }

    // Attach admin info to request
    req.adminUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions.map(p => ({
        resource: p.resource,
        actions: p.actions
      }))
    };

    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export const requirePermission = (resource: string, action: string) => {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    const adminUser = req.adminUser;

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admin has all permissions
    if (adminUser.role === 'super_admin') {
      return next();
    }

    // Check if admin has required permission
    const hasPermission = adminUser.permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${action} on ${resource}`
      });
    }

    next();
  };
};