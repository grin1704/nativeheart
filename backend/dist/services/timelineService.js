"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
exports.timelineService = {
    async getTimelineEvents(memorialPageId) {
        return await prisma.timelineEvent.findMany({
            where: { memorialPageId },
            orderBy: [{ orderIndex: 'asc' }, { year: 'asc' }],
        });
    },
    async createTimelineEvent(memorialPageId, data) {
        if (data.orderIndex === undefined) {
            const maxOrder = await prisma.timelineEvent.aggregate({
                where: { memorialPageId },
                _max: { orderIndex: true },
            });
            data.orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
        }
        return await prisma.timelineEvent.create({
            data: {
                memorialPageId,
                year: data.year,
                description: data.description,
                orderIndex: data.orderIndex,
            },
        });
    },
    async updateTimelineEvent(eventId, data) {
        return await prisma.timelineEvent.update({
            where: { id: eventId },
            data,
        });
    },
    async deleteTimelineEvent(eventId) {
        return await prisma.timelineEvent.delete({
            where: { id: eventId },
        });
    },
    async reorderTimelineEvents(memorialPageId, eventIds) {
        const events = await prisma.timelineEvent.findMany({
            where: {
                id: { in: eventIds },
                memorialPageId,
            },
        });
        if (events.length !== eventIds.length) {
            throw new Error('Некоторые события не найдены или не принадлежат этой странице');
        }
        const updates = eventIds.map((eventId, index) => prisma.timelineEvent.update({
            where: { id: eventId },
            data: { orderIndex: index },
        }));
        await prisma.$transaction(updates);
        return await this.getTimelineEvents(memorialPageId);
    },
    async getTimelineEvent(eventId) {
        return await prisma.timelineEvent.findUnique({
            where: { id: eventId },
        });
    },
    async checkEditAccess(memorialPageId, userId) {
        const page = await prisma.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { ownerId: true },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const hasAccess = page.ownerId === userId || await this.isCollaborator(memorialPageId, userId);
        if (!hasAccess) {
            throw new errors_1.ForbiddenError('У вас нет прав для редактирования этой страницы');
        }
    },
    async isCollaborator(memorialPageId, userId) {
        const collaborator = await prisma.collaborator.findFirst({
            where: {
                memorialPageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    },
};
//# sourceMappingURL=timelineService.js.map