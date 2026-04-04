"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminModerationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminModerationService {
    async getModerationStats() {
        const [pendingMemorialPages, pendingTributes, pendingMemories, totalModerated] = await Promise.all([
            prisma.contentModeration.count({
                where: {
                    contentType: 'memorial_page',
                    status: 'pending'
                }
            }),
            prisma.contentModeration.count({
                where: {
                    contentType: 'tribute',
                    status: 'pending'
                }
            }),
            prisma.contentModeration.count({
                where: {
                    contentType: 'memory',
                    status: 'pending'
                }
            }),
            prisma.contentModeration.count({
                where: {
                    status: { in: ['approved', 'rejected'] }
                }
            })
        ]);
        return {
            pendingMemorialPages,
            pendingTributes,
            pendingMemories,
            totalModerated
        };
    }
    async getModerationQueue(contentType, status = 'pending', page = 1, limit = 20) {
        const where = { status };
        if (contentType) {
            where.contentType = contentType;
        }
        const [items, total] = await Promise.all([
            prisma.contentModeration.findMany({
                where,
                include: {
                    moderator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.contentModeration.count({ where })
        ]);
        const moderationItems = await Promise.all(items.map(async (item) => {
            let content = null;
            switch (item.contentType) {
                case 'memorial_page':
                    content = await this.getMemorialPageForModeration(item.contentId);
                    break;
                case 'tribute':
                    content = await this.getTributeForModeration(item.contentId);
                    break;
                case 'memory':
                    content = await this.getMemoryForModeration(item.contentId);
                    break;
            }
            return {
                id: item.id,
                contentType: item.contentType,
                contentId: item.contentId,
                status: item.status,
                createdAt: item.createdAt,
                moderatedAt: item.moderatedAt || undefined,
                moderatorId: item.moderatorId || undefined,
                reason: item.reason || undefined,
                content
            };
        }));
        return {
            items: moderationItems,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getMemorialPageForModeration(pageId) {
        const page = await prisma.memorialPage.findUnique({
            where: { id: pageId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!page)
            return null;
        return {
            id: page.id,
            fullName: page.fullName,
            slug: page.slug,
            biographyText: page.biographyText || undefined,
            owner: page.owner,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt
        };
    }
    async getTributeForModeration(tributeId) {
        const tribute = await prisma.tribute.findUnique({
            where: { id: tributeId },
            include: {
                memorialPage: {
                    select: {
                        id: true,
                        fullName: true,
                        slug: true
                    }
                }
            }
        });
        if (!tribute)
            return null;
        return {
            id: tribute.id,
            authorName: tribute.authorName,
            authorEmail: tribute.authorEmail || undefined,
            text: tribute.text,
            memorialPage: tribute.memorialPage,
            createdAt: tribute.createdAt
        };
    }
    async getMemoryForModeration(memoryId) {
        const memory = await prisma.memory.findUnique({
            where: { id: memoryId },
            include: {
                memorialPage: {
                    select: {
                        id: true,
                        fullName: true,
                        slug: true
                    }
                }
            }
        });
        if (!memory)
            return null;
        return {
            id: memory.id,
            title: memory.title,
            description: memory.description || undefined,
            date: memory.date,
            memorialPage: memory.memorialPage,
            createdAt: memory.createdAt
        };
    }
    async approveContent(moderationId, moderatorId, reason) {
        const moderation = await prisma.contentModeration.findUnique({
            where: { id: moderationId }
        });
        if (!moderation) {
            throw new Error('Элемент модерации не найден');
        }
        await prisma.$transaction(async (tx) => {
            await tx.contentModeration.update({
                where: { id: moderationId },
                data: {
                    status: 'approved',
                    moderatorId,
                    moderatedAt: new Date(),
                    reason
                }
            });
            if (moderation.contentType === 'tribute') {
                await tx.tribute.update({
                    where: { id: moderation.contentId },
                    data: { isApproved: true }
                });
            }
            await tx.adminAuditLog.create({
                data: {
                    adminUserId: moderatorId,
                    action: 'approve_content',
                    resourceType: moderation.contentType,
                    resourceId: moderation.contentId,
                    details: {
                        moderationId,
                        reason: reason || 'Контент одобрен'
                    }
                }
            });
        });
    }
    async rejectContent(moderationId, moderatorId, reason) {
        const moderation = await prisma.contentModeration.findUnique({
            where: { id: moderationId }
        });
        if (!moderation) {
            throw new Error('Элемент модерации не найден');
        }
        await prisma.$transaction(async (tx) => {
            await tx.contentModeration.update({
                where: { id: moderationId },
                data: {
                    status: 'rejected',
                    moderatorId,
                    moderatedAt: new Date(),
                    reason
                }
            });
            await tx.adminAuditLog.create({
                data: {
                    adminUserId: moderatorId,
                    action: 'reject_content',
                    resourceType: moderation.contentType,
                    resourceId: moderation.contentId,
                    details: {
                        moderationId,
                        reason
                    }
                }
            });
        });
    }
    async deleteInappropriateContent(contentType, contentId, moderatorId, reason) {
        await prisma.$transaction(async (tx) => {
            switch (contentType) {
                case 'memorial_page':
                    await tx.memorialPage.delete({
                        where: { id: contentId }
                    });
                    break;
                case 'tribute':
                    await tx.tribute.delete({
                        where: { id: contentId }
                    });
                    break;
                case 'memory':
                    await tx.memory.delete({
                        where: { id: contentId }
                    });
                    break;
            }
            await tx.contentModeration.deleteMany({
                where: {
                    contentType,
                    contentId
                }
            });
            await tx.adminAuditLog.create({
                data: {
                    adminUserId: moderatorId,
                    action: 'delete_inappropriate_content',
                    resourceType: contentType,
                    resourceId: contentId,
                    details: {
                        reason
                    }
                }
            });
        });
    }
    async createModerationRecord(contentType, contentId) {
        await prisma.contentModeration.create({
            data: {
                contentType,
                contentId,
                status: 'pending'
            }
        });
    }
    async getModerationHistory(contentType, contentId) {
        const items = await prisma.contentModeration.findMany({
            where: {
                contentType,
                contentId
            },
            include: {
                moderator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return items.map(item => ({
            id: item.id,
            contentType: item.contentType,
            contentId: item.contentId,
            status: item.status,
            createdAt: item.createdAt,
            moderatedAt: item.moderatedAt || undefined,
            moderatorId: item.moderatorId || undefined,
            reason: item.reason || undefined
        }));
    }
}
exports.adminModerationService = new AdminModerationService();
//# sourceMappingURL=adminModerationService.js.map