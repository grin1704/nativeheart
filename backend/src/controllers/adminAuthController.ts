import { Request, Response } from 'express';
import { adminAuthService } from '../services/adminAuthService';
import { logger } from '../utils/logger';

export const adminAuthController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await adminAuthService.login(email, password);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Log successful login
      logger.info('Admin login successful', {
        adminId: result.admin.id,
        email: result.admin.email,
        ip: req.ip
      });

      res.json({
        success: true,
        data: {
          admin: {
            id: result.admin.id,
            email: result.admin.email,
            name: result.admin.name,
            role: result.admin.role,
            permissions: result.admin.permissions
          },
          token: result.token
        }
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const adminId = (req as any).adminUser.id;
      const admin = await adminAuthService.getAdminProfile(adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      });
    } catch (error) {
      logger.error('Get admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await adminAuthService.refreshToken(refreshToken);

      if (!result) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      res.json({
        success: true,
        data: {
          token: result.token
        }
      });
    } catch (error) {
      logger.error('Admin refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const adminId = (req as any).adminUser.id;

      // Log logout
      logger.info('Admin logout', {
        adminId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};