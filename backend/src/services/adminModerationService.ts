import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ModerationStats {
  pendingMemorialPages: number;
  pendingTributes: number;
  pendingMemories: number;
  totalModerated: number;
}

export interface ModerationItem {
  id: string;
  contentType: 'memorial_page' | 'tribute' | 'memory';
  contentId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  moderatedAt?: Date;
  moderatorId?: string;
  reason?: string;
  content?: any; // Содержимое для модерации
}

export interface MemorialPageModerationData {
  id: string;
  fullName: string;
  slug: string;
  biographyText?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TributeModerationData {
  id: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  memorialPage: {
    id: string;
    fullName: string;
    slug: string;
  };
  createdAt: Date;
}

export interface MemoryModerationData {
  id: string;
  title: string;
  description?: string;
  date: Date;
  memorialPage: {
    id: string;
    fullName: string;
    slug: string;
  };
  createdAt: Date;
}

class AdminModerationService {
  // Получить статистику модерации
  async getModerationStats(): Promise<ModerationStats> {
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

  // Получить список элементов для модерации
  async getModerationQueue(
    contentType?: 'memorial_page' | 'tribute' | 'memory',
    status: 'pending' | 'approved' | 'rejected' = 'pending',
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: ModerationItem[]; total: number; totalPages: number }> {
    const where: any = { status };
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

    const moderationItems: ModerationItem[] = await Promise.all(
      items.map(async (item) => {
        let content = null;

        // Получаем содержимое в зависимости от типа
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
          contentType: item.contentType as 'memorial_page' | 'tribute' | 'memory',
          contentId: item.contentId,
          status: item.status as 'pending' | 'approved' | 'rejected',
          createdAt: item.createdAt,
          moderatedAt: item.moderatedAt || undefined,
          moderatorId: item.moderatorId || undefined,
          reason: item.reason || undefined,
          content
        };
      })
    );

    return {
      items: moderationItems,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Получить памятную страницу для модерации
  private async getMemorialPageForModeration(pageId: string): Promise<MemorialPageModerationData | null> {
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

    if (!page) return null;

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

  // Получить отзыв для модерации
  private async getTributeForModeration(tributeId: string): Promise<TributeModerationData | null> {
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

    if (!tribute) return null;

    return {
      id: tribute.id,
      authorName: tribute.authorName,
      authorEmail: tribute.authorEmail || undefined,
      text: tribute.text,
      memorialPage: tribute.memorialPage,
      createdAt: tribute.createdAt
    };
  }

  // Получить воспоминание для модерации
  private async getMemoryForModeration(memoryId: string): Promise<MemoryModerationData | null> {
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

    if (!memory) return null;

    return {
      id: memory.id,
      title: memory.title,
      description: memory.description || undefined,
      date: memory.date,
      memorialPage: memory.memorialPage,
      createdAt: memory.createdAt
    };
  }

  // Одобрить контент
  async approveContent(
    moderationId: string,
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    const moderation = await prisma.contentModeration.findUnique({
      where: { id: moderationId }
    });

    if (!moderation) {
      throw new Error('Элемент модерации не найден');
    }

    await prisma.$transaction(async (tx) => {
      // Обновляем статус модерации
      await tx.contentModeration.update({
        where: { id: moderationId },
        data: {
          status: 'approved',
          moderatorId,
          moderatedAt: new Date(),
          reason
        }
      });

      // Если это отзыв, одобряем его
      if (moderation.contentType === 'tribute') {
        await tx.tribute.update({
          where: { id: moderation.contentId },
          data: { isApproved: true }
        });
      }

      // Логируем действие администратора
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

  // Отклонить контент
  async rejectContent(
    moderationId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    const moderation = await prisma.contentModeration.findUnique({
      where: { id: moderationId }
    });

    if (!moderation) {
      throw new Error('Элемент модерации не найден');
    }

    await prisma.$transaction(async (tx) => {
      // Обновляем статус модерации
      await tx.contentModeration.update({
        where: { id: moderationId },
        data: {
          status: 'rejected',
          moderatorId,
          moderatedAt: new Date(),
          reason
        }
      });

      // Логируем действие администратора
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

  // Удалить неподходящий контент
  async deleteInappropriateContent(
    contentType: 'memorial_page' | 'tribute' | 'memory',
    contentId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Удаляем контент в зависимости от типа
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

      // Удаляем связанные записи модерации
      await tx.contentModeration.deleteMany({
        where: {
          contentType,
          contentId
        }
      });

      // Логируем действие администратора
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

  // Создать запись для модерации (используется при создании нового контента)
  async createModerationRecord(
    contentType: 'memorial_page' | 'tribute' | 'memory',
    contentId: string
  ): Promise<void> {
    await prisma.contentModeration.create({
      data: {
        contentType,
        contentId,
        status: 'pending'
      }
    });
  }

  // Получить историю модерации для конкретного контента
  async getModerationHistory(
    contentType: 'memorial_page' | 'tribute' | 'memory',
    contentId: string
  ): Promise<ModerationItem[]> {
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
      contentType: item.contentType as 'memorial_page' | 'tribute' | 'memory',
      contentId: item.contentId,
      status: item.status as 'pending' | 'approved' | 'rejected',
      createdAt: item.createdAt,
      moderatedAt: item.moderatedAt || undefined,
      moderatorId: item.moderatorId || undefined,
      reason: item.reason || undefined
    }));
  }
}

export const adminModerationService = new AdminModerationService();