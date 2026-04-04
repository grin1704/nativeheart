"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaboratorService = exports.CollaboratorService = void 0;
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = require("./emailService");
const collaborator_1 = require("../types/collaborator");
class CollaboratorService {
    async inviteCollaborator(pageId, inviterId, data) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (memorialPage.ownerId !== inviterId) {
            throw new errors_1.ForbiddenError('Только владелец страницы может приглашать соавторов');
        }
        const invitedUser = await database_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!invitedUser) {
            throw new errors_1.ValidationError('Пользователь с указанным email не найден');
        }
        if (invitedUser.id === inviterId) {
            throw new errors_1.ValidationError('Нельзя пригласить самого себя в качестве соавтора');
        }
        const existingCollaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId: invitedUser.id,
            },
        });
        if (existingCollaborator) {
            throw new errors_1.ValidationError('Пользователь уже является соавтором этой страницы');
        }
        const collaborator = await database_1.default.collaborator.create({
            data: {
                memorialPageId: pageId,
                userId: invitedUser.id,
                permissions: data.permissions || collaborator_1.DEFAULT_PERMISSIONS,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...collaborator,
            permissions: collaborator.permissions,
        };
        try {
            await emailService_1.emailService.sendCollaboratorInvitation({
                invitedUserEmail: invitedUser.email,
                invitedUserName: invitedUser.name,
                inviterName: memorialPage.owner.name,
                memorialPageName: memorialPage.fullName,
                memorialPageSlug: memorialPage.slug,
                collaboratorId: collaborator.id,
            });
        }
        catch (error) {
            console.error('Failed to send invitation email:', error);
        }
        return {
            ...collaborator,
            permissions: collaborator.permissions,
        };
    }
    async acceptInvitation(collaboratorId, userId) {
        const collaborator = await database_1.default.collaborator.findUnique({
            where: { id: collaboratorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                memorialPage: {
                    select: {
                        id: true,
                        fullName: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!collaborator) {
            throw new errors_1.NotFoundError('Приглашение не найдено');
        }
        if (collaborator.userId !== userId) {
            throw new errors_1.ForbiddenError('Это приглашение предназначено для другого пользователя');
        }
        if (collaborator.acceptedAt) {
            throw new errors_1.ValidationError('Приглашение уже принято');
        }
        const updatedCollaborator = await database_1.default.collaborator.update({
            where: { id: collaboratorId },
            data: { acceptedAt: new Date() },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...updatedCollaborator,
            permissions: updatedCollaborator.permissions,
        };
        try {
            await emailService_1.emailService.sendCollaboratorAcceptedNotification({
                ownerEmail: collaborator.memorialPage.owner.email,
                ownerName: collaborator.memorialPage.owner.name,
                collaboratorName: collaborator.user.name,
                memorialPageName: collaborator.memorialPage.fullName,
            });
        }
        catch (error) {
            console.error('Failed to send acceptance notification email:', error);
        }
        return {
            ...updatedCollaborator,
            permissions: updatedCollaborator.permissions,
        };
    }
    async declineInvitation(collaboratorId, userId) {
        const collaborator = await database_1.default.collaborator.findUnique({
            where: { id: collaboratorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                memorialPage: {
                    select: {
                        id: true,
                        fullName: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!collaborator) {
            throw new errors_1.NotFoundError('Приглашение не найдено');
        }
        if (collaborator.userId !== userId) {
            throw new errors_1.ForbiddenError('Это приглашение предназначено для другого пользователя');
        }
        if (collaborator.acceptedAt) {
            throw new errors_1.ValidationError('Нельзя отклонить уже принятое приглашение');
        }
        await database_1.default.collaborator.delete({
            where: { id: collaboratorId },
        });
        try {
            await emailService_1.emailService.sendCollaboratorDeclinedNotification({
                ownerEmail: collaborator.memorialPage.owner.email,
                ownerName: collaborator.memorialPage.owner.name,
                collaboratorName: collaborator.user.name,
                memorialPageName: collaborator.memorialPage.fullName,
            });
        }
        catch (error) {
            console.error('Failed to send decline notification email:', error);
        }
    }
    async removeCollaborator(pageId, collaboratorId, requesterId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const collaborator = await database_1.default.collaborator.findUnique({
            where: { id: collaboratorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!collaborator) {
            throw new errors_1.NotFoundError('Соавтор не найден');
        }
        if (collaborator.memorialPageId !== pageId) {
            throw new errors_1.ValidationError('Соавтор не принадлежит к этой странице');
        }
        const isOwner = memorialPage.ownerId === requesterId;
        const isSelf = collaborator.userId === requesterId;
        if (!isOwner && !isSelf) {
            throw new errors_1.ForbiddenError('У вас нет прав для удаления этого соавтора');
        }
        await database_1.default.collaborator.delete({
            where: { id: collaboratorId },
        });
    }
    async getPageCollaborators(pageId, requesterId, params) {
        const hasAccess = await this.checkPageAccess(pageId, requesterId);
        if (!hasAccess) {
            throw new errors_1.ForbiddenError('У вас нет доступа к этой странице');
        }
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [collaboratorsRaw, total] = await Promise.all([
            database_1.default.collaborator.findMany({
                where: { memorialPageId: pageId },
                skip,
                take: limit,
                orderBy: { invitedAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            database_1.default.collaborator.count({
                where: { memorialPageId: pageId },
            }),
        ]);
        const collaborators = collaboratorsRaw.map(c => ({
            ...c,
            permissions: c.permissions,
        }));
        return {
            data: collaborators,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserPendingInvitations(userId, params) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [invitations, total] = await Promise.all([
            database_1.default.collaborator.findMany({
                where: {
                    userId,
                    acceptedAt: null,
                },
                skip,
                take: limit,
                orderBy: { invitedAt: 'desc' },
                include: {
                    memorialPage: {
                        select: {
                            id: true,
                            fullName: true,
                            owner: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            database_1.default.collaborator.count({
                where: {
                    userId,
                    acceptedAt: null,
                },
            }),
        ]);
        const formattedInvitations = invitations.map((inv) => ({
            id: inv.id,
            memorialPageId: inv.memorialPageId,
            memorialPageName: inv.memorialPage.fullName,
            inviterName: inv.memorialPage.owner.name,
            permissions: inv.permissions,
            invitedAt: inv.invitedAt,
        }));
        return {
            data: formattedInvitations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserCollaboratorPages(userId, params) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [collaborations, total] = await Promise.all([
            database_1.default.collaborator.findMany({
                where: {
                    userId,
                    acceptedAt: { not: null },
                },
                skip,
                take: limit,
                orderBy: { acceptedAt: 'desc' },
                include: {
                    memorialPage: {
                        select: {
                            id: true,
                            slug: true,
                            fullName: true,
                            birthDate: true,
                            deathDate: true,
                            mainPhoto: {
                                select: {
                                    id: true,
                                    url: true,
                                    thumbnailUrl: true,
                                },
                            },
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            _count: {
                                select: {
                                    memories: true,
                                    tributes: true,
                                    photoGallery: true,
                                },
                            },
                        },
                    },
                },
            }),
            database_1.default.collaborator.count({
                where: {
                    userId,
                    acceptedAt: { not: null },
                },
            }),
        ]);
        const formattedPages = collaborations.map((collab) => {
            const permissions = typeof collab.permissions === 'string'
                ? JSON.parse(collab.permissions)
                : collab.permissions;
            return {
                ...collab.memorialPage,
                _count: {
                    memories: collab.memorialPage._count.memories,
                    tributes: collab.memorialPage._count.tributes,
                    mediaFiles: collab.memorialPage._count.photoGallery,
                },
                collaboratorPermissions: permissions,
                collaboratorSince: collab.acceptedAt,
            };
        });
        return {
            data: formattedPages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateCollaboratorPermissions(pageId, collaboratorId, permissions, requesterId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (memorialPage.ownerId !== requesterId) {
            throw new errors_1.ForbiddenError('Только владелец страницы может изменять права соавторов');
        }
        const collaborator = await database_1.default.collaborator.findUnique({
            where: { id: collaboratorId },
        });
        if (!collaborator) {
            throw new errors_1.NotFoundError('Соавтор не найден');
        }
        if (collaborator.memorialPageId !== pageId) {
            throw new errors_1.ValidationError('Соавтор не принадлежит к этой странице');
        }
        const updatedCollaborator = await database_1.default.collaborator.update({
            where: { id: collaboratorId },
            data: { permissions: permissions },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...updatedCollaborator,
            permissions: updatedCollaborator.permissions,
        };
    }
    async checkPageAccess(pageId, userId) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!page) {
            return false;
        }
        if (page.ownerId === userId) {
            return true;
        }
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
    async checkEditAccess(pageId, userId) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!page) {
            return false;
        }
        if (page.ownerId === userId) {
            return true;
        }
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
    async checkSectionPermission(pageId, userId, section) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!page) {
            return false;
        }
        if (page.ownerId === userId) {
            return true;
        }
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        if (!collaborator) {
            return false;
        }
        const permissions = collaborator.permissions;
        return permissions[section] === true;
    }
    async getInvitationDetails(collaboratorId, userId) {
        const invitation = await database_1.default.collaborator.findUnique({
            where: { id: collaboratorId },
            include: {
                memorialPage: {
                    select: {
                        id: true,
                        fullName: true,
                        owner: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!invitation) {
            throw new errors_1.NotFoundError('Приглашение не найдено');
        }
        if (invitation.userId !== userId) {
            throw new errors_1.ForbiddenError('Это приглашение предназначено для другого пользователя');
        }
        return {
            id: invitation.id,
            memorialPageId: invitation.memorialPageId,
            memorialPageName: invitation.memorialPage.fullName,
            inviterName: invitation.memorialPage.owner.name,
            permissions: invitation.permissions,
            invitedAt: invitation.invitedAt,
        };
    }
    async notifyPageChange(pageId, changeMadeBy, changeType, changeDescription) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                collaborators: {
                    where: { acceptedAt: { not: null } },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!page) {
            return;
        }
        const changeUser = await database_1.default.user.findUnique({
            where: { id: changeMadeBy },
            select: { name: true },
        });
        if (!changeUser) {
            return;
        }
        const usersToNotify = [];
        if (page.owner.id !== changeMadeBy) {
            usersToNotify.push({
                email: page.owner.email,
                name: page.owner.name,
            });
        }
        page.collaborators.forEach((collab) => {
            if (collab.user.id !== changeMadeBy) {
                usersToNotify.push({
                    email: collab.user.email,
                    name: collab.user.name,
                });
            }
        });
        for (const user of usersToNotify) {
            try {
                await emailService_1.emailService.sendPageChangeNotification({
                    recipientEmail: user.email,
                    recipientName: user.name,
                    changerName: changeUser.name,
                    memorialPageName: page.fullName,
                    changeType,
                    changeDescription,
                    memorialPageSlug: page.slug,
                });
            }
            catch (error) {
                console.error(`Failed to send change notification to ${user.email}:`, error);
            }
        }
    }
}
exports.CollaboratorService = CollaboratorService;
exports.collaboratorService = new CollaboratorService();
//# sourceMappingURL=collaboratorService.js.map