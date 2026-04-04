"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaboratorController = exports.CollaboratorController = void 0;
const collaboratorService_1 = require("../services/collaboratorService");
const collaborator_1 = require("../validation/collaborator");
class CollaboratorController {
    async inviteCollaborator(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user.id;
            const { error } = collaborator_1.inviteCollaboratorSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(', ')
                });
                return;
            }
            const collaborator = await collaboratorService_1.collaboratorService.inviteCollaborator(pageId, userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Приглашение отправлено',
                data: collaborator,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async acceptInvitation(req, res) {
        try {
            const { collaboratorId } = req.params;
            const userId = req.user.id;
            const collaborator = await collaboratorService_1.collaboratorService.acceptInvitation(collaboratorId, userId);
            res.json({
                success: true,
                message: 'Приглашение принято',
                data: collaborator,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async declineInvitation(req, res) {
        try {
            const { collaboratorId } = req.params;
            const userId = req.user.id;
            await collaboratorService_1.collaboratorService.declineInvitation(collaboratorId, userId);
            res.json({
                success: true,
                message: 'Приглашение отклонено',
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async removeCollaborator(req, res) {
        try {
            const { pageId, collaboratorId } = req.params;
            const userId = req.user.id;
            await collaboratorService_1.collaboratorService.removeCollaborator(pageId, collaboratorId, userId);
            res.json({
                success: true,
                message: 'Соавтор удален',
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async getPageCollaborators(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user.id;
            const { error } = collaborator_1.paginationSchema.validate(req.query);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(', ')
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await collaboratorService_1.collaboratorService.getPageCollaborators(pageId, userId, { page, limit });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async getUserPendingInvitations(req, res) {
        try {
            const userId = req.user.id;
            const { error } = collaborator_1.paginationSchema.validate(req.query);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(', ')
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await collaboratorService_1.collaboratorService.getUserPendingInvitations(userId, { page, limit });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async getUserCollaboratorPages(req, res) {
        try {
            const userId = req.user.id;
            const { error } = collaborator_1.paginationSchema.validate(req.query);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(', ')
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await collaboratorService_1.collaboratorService.getUserCollaboratorPages(userId, { page, limit });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async updateCollaboratorPermissions(req, res) {
        try {
            const { pageId, collaboratorId } = req.params;
            const userId = req.user.id;
            const { error } = collaborator_1.updateCollaboratorPermissionsSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details.map((detail) => detail.message).join(', ')
                });
                return;
            }
            const collaborator = await collaboratorService_1.collaboratorService.updateCollaboratorPermissions(pageId, collaboratorId, req.body.permissions, userId);
            res.json({
                success: true,
                message: 'Права соавтора обновлены',
                data: collaborator,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
    async getInvitationDetails(req, res) {
        try {
            const { collaboratorId } = req.params;
            const userId = req.user.id;
            const invitation = await collaboratorService_1.collaboratorService.getInvitationDetails(collaboratorId, userId);
            res.json({
                success: true,
                data: invitation,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Внутренняя ошибка сервера',
            });
        }
    }
}
exports.CollaboratorController = CollaboratorController;
exports.collaboratorController = new CollaboratorController();
//# sourceMappingURL=collaboratorController.js.map