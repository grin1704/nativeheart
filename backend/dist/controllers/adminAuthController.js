"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthController = void 0;
const adminAuthService_1 = require("../services/adminAuthService");
const logger_1 = require("../utils/logger");
exports.adminAuthController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }
            const result = await adminAuthService_1.adminAuthService.login(email, password);
            if (!result) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            logger_1.logger.info('Admin login successful', {
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
        }
        catch (error) {
            logger_1.logger.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async getProfile(req, res) {
        try {
            const adminId = req.adminUser.id;
            const admin = await adminAuthService_1.adminAuthService.getAdminProfile(adminId);
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
        }
        catch (error) {
            logger_1.logger.error('Get admin profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }
            const result = await adminAuthService_1.adminAuthService.refreshToken(refreshToken);
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
        }
        catch (error) {
            logger_1.logger.error('Admin refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async logout(req, res) {
        try {
            const adminId = req.adminUser.id;
            logger_1.logger.info('Admin logout', {
                adminId,
                ip: req.ip
            });
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Admin logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};
//# sourceMappingURL=adminAuthController.js.map