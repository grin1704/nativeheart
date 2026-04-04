import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AdminLoginResult {
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
  };
  token: string;
}

export const adminAuthService = {
  async login(email: string, password: string): Promise<AdminLoginResult | null> {
    try {
      // Find admin user
      const admin = await prisma.adminUser.findUnique({
        where: { email },
        include: {
          permissions: true
        }
      });

      if (!admin || !admin.isActive) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      return {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions.map(p => ({
            resource: p.resource,
            actions: p.actions
          }))
        },
        token
      };
    } catch (error) {
      logger.error('Admin login service error:', error);
      throw error;
    }
  },

  async getAdminProfile(adminId: string) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id: adminId },
        include: {
          permissions: true
        }
      });

      if (!admin) {
        return null;
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin,
        permissions: admin.permissions.map(p => ({
          resource: p.resource,
          actions: p.actions
        }))
      };
    } catch (error) {
      logger.error('Get admin profile service error:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string } | null> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Verify admin still exists and is active
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId }
      });

      if (!admin || !admin.isActive) {
        return null;
      }

      // Generate new token
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      return { token };
    } catch (error) {
      logger.error('Admin refresh token service error:', error);
      return null;
    }
  },

  async createAdmin(email: string, password: string, name: string, role: string = 'moderator') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.adminUser.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          role
        }
      });

      // Create default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(role);
      
      for (const permission of defaultPermissions) {
        await prisma.adminPermission.create({
          data: {
            adminUserId: admin.id,
            resource: permission.resource,
            actions: permission.actions
          }
        });
      }

      return admin;
    } catch (error) {
      logger.error('Create admin service error:', error);
      throw error;
    }
  },

  getDefaultPermissions(role: string) {
    const permissions = [];

    switch (role) {
      case 'super_admin':
        permissions.push(
          { resource: 'users', actions: ['read', 'write', 'delete'] },
          { resource: 'memorial_pages', actions: ['read', 'write', 'delete', 'moderate'] },
          { resource: 'payments', actions: ['read', 'write'] },
          { resource: 'settings', actions: ['read', 'write'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'admin_users', actions: ['read', 'write', 'delete'] }
        );
        break;
      case 'admin':
        permissions.push(
          { resource: 'users', actions: ['read', 'write'] },
          { resource: 'memorial_pages', actions: ['read', 'write', 'moderate'] },
          { resource: 'payments', actions: ['read'] },
          { resource: 'settings', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        );
        break;
      case 'moderator':
        permissions.push(
          { resource: 'users', actions: ['read'] },
          { resource: 'memorial_pages', actions: ['read', 'moderate'] },
          { resource: 'analytics', actions: ['read'] }
        );
        break;
    }

    return permissions;
  }
};