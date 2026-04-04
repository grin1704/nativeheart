"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.adminAuthService = {
    async login(email, password) {
        try {
            const admin = await prisma.adminUser.findUnique({
                where: { email },
                include: {
                    permissions: true
                }
            });
            if (!admin || !admin.isActive) {
                return null;
            }
            const isValidPassword = await bcrypt_1.default.compare(password, admin.passwordHash);
            if (!isValidPassword) {
                return null;
            }
            await prisma.adminUser.update({
                where: { id: admin.id },
                data: { lastLogin: new Date() }
            });
            const token = jsonwebtoken_1.default.sign({
                adminId: admin.id,
                email: admin.email,
                role: admin.role
            }, process.env.JWT_SECRET, { expiresIn: '8h' });
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
        }
        catch (error) {
            logger_1.logger.error('Admin login service error:', error);
            throw error;
        }
    },
    async getAdminProfile(adminId) {
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
        }
        catch (error) {
            logger_1.logger.error('Get admin profile service error:', error);
            throw error;
        }
    },
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
            const admin = await prisma.adminUser.findUnique({
                where: { id: decoded.adminId }
            });
            if (!admin || !admin.isActive) {
                return null;
            }
            const token = jsonwebtoken_1.default.sign({
                adminId: admin.id,
                email: admin.email,
                role: admin.role
            }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return { token };
        }
        catch (error) {
            logger_1.logger.error('Admin refresh token service error:', error);
            return null;
        }
    },
    async createAdmin(email, password, name, role = 'moderator') {
        try {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const admin = await prisma.adminUser.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    name,
                    role
                }
            });
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
        }
        catch (error) {
            logger_1.logger.error('Create admin service error:', error);
            throw error;
        }
    },
    getDefaultPermissions(role) {
        const permissions = [];
        switch (role) {
            case 'super_admin':
                permissions.push({ resource: 'users', actions: ['read', 'write', 'delete'] }, { resource: 'memorial_pages', actions: ['read', 'write', 'delete', 'moderate'] }, { resource: 'payments', actions: ['read', 'write'] }, { resource: 'settings', actions: ['read', 'write'] }, { resource: 'analytics', actions: ['read'] }, { resource: 'admin_users', actions: ['read', 'write', 'delete'] });
                break;
            case 'admin':
                permissions.push({ resource: 'users', actions: ['read', 'write'] }, { resource: 'memorial_pages', actions: ['read', 'write', 'moderate'] }, { resource: 'payments', actions: ['read'] }, { resource: 'settings', actions: ['read'] }, { resource: 'analytics', actions: ['read'] });
                break;
            case 'moderator':
                permissions.push({ resource: 'users', actions: ['read'] }, { resource: 'memorial_pages', actions: ['read', 'moderate'] }, { resource: 'analytics', actions: ['read'] });
                break;
        }
        return permissions;
    }
};
//# sourceMappingURL=adminAuthService.js.map