"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
        logger_1.logger.error('Admin auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
exports.adminAuth = adminAuth;
const requirePermission = (resource, action) => {
    return (req, res, next) => {
        const adminUser = req.adminUser;
        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }
        if (adminUser.role === 'super_admin') {
            return next();
        }
        const hasPermission = adminUser.permissions.some(p => p.resource === resource && p.actions.includes(action));
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permission: ${action} on ${resource}`
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=adminAuth.js.map