import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreateTimelineEventData {
  year: number;
  description: string;
  orderIndex?: number;
}

export interface UpdateTimelineEventData {
  year?: number;
  description?: string;
  orderIndex?: number;
}

export const timelineService = {
  async getTimelineEvents(memorialPageId: string) {
    return await prisma.timelineEvent.findMany({
      where: { memorialPageId },
      orderBy: [{ orderIndex: 'asc' }, { year: 'asc' }],
    });
  },

  async createTimelineEvent(memorialPageId: string, data: CreateTimelineEventData) {
    // Если orderIndex не указан, ставим в конец
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

  async updateTimelineEvent(eventId: string, data: UpdateTimelineEventData) {
    return await prisma.timelineEvent.update({
      where: { id: eventId },
      data,
    });
  },

  async deleteTimelineEvent(eventId: string) {
    return await prisma.timelineEvent.delete({
      where: { id: eventId },
    });
  },

  async reorderTimelineEvents(memorialPageId: string, eventIds: string[]) {
    // Проверяем, что все события принадлежат этой странице
    const events = await prisma.timelineEvent.findMany({
      where: {
        id: { in: eventIds },
        memorialPageId,
      },
    });

    if (events.length !== eventIds.length) {
      throw new Error('Некоторые события не найдены или не принадлежат этой странице');
    }

    // Обновляем orderIndex для каждого события
    const updates = eventIds.map((eventId, index) =>
      prisma.timelineEvent.update({
        where: { id: eventId },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);

    return await this.getTimelineEvents(memorialPageId);
  },

  async getTimelineEvent(eventId: string) {
    return await prisma.timelineEvent.findUnique({
      where: { id: eventId },
    });
  },

  async checkEditAccess(memorialPageId: string, userId: string): Promise<void> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { ownerId: true },
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Check if user is owner or collaborator
    const hasAccess = page.ownerId === userId || await this.isCollaborator(memorialPageId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('У вас нет прав для редактирования этой страницы');
    }
  },

  async isCollaborator(memorialPageId: string, userId: string): Promise<boolean> {
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
