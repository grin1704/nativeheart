import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType } from '../types/auth';

const prisma = new PrismaClient();

export interface GalleryItem {
  id: string;
  mediaFileId: string;
  title?: string;
  description?: string;
  orderIndex: number;
  createdAt: Date;
  mediaFile: {
    id: string;
    originalName: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  };
}

export interface CreateGalleryItemData {
  mediaFileId?: string;
  title?: string;
  description?: string;
  // For external videos
  videoType?: 'upload' | 'vk' | 'rutube';
  externalUrl?: string;
  embedCode?: string;
  thumbnailUrl?: string;
}

export interface UpdateGalleryItemData {
  title?: string;
  description?: string;
  orderIndex?: number;
  mediaFileId?: string;
}

export interface GalleryResponse {
  items: GalleryItem[];
  hasAccess: boolean;
  subscriptionRequired: boolean;
}

export class GalleryService {
  /**
   * Checks if user has edit access to the memorial page
   */
  private async checkEditAccess(pageId: string, userId: string): Promise<void> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Check if user is owner or collaborator
    const hasAccess = page.ownerId === userId || await this.isCollaborator(pageId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('У вас нет прав для редактирования этой страницы');
    }
  }

  /**
   * Checks if user is a collaborator on the page
   */
  private async isCollaborator(pageId: string, userId: string): Promise<boolean> {
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        memorialPageId: pageId,
        userId,
        acceptedAt: { not: null },
      },
    });

    return !!collaborator;
  }

  /**
   * Gets feature access for a memorial page owner
   */
  private async getPageFeatureAccess(pageId: string): Promise<{
    photoGallery: boolean;
    videoGallery: boolean;
  }> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: {
        owner: {
          select: {
            subscriptionType: true,
            subscriptionExpiresAt: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    const featureAccess = getFeatureAccess(
      page.owner.subscriptionType as SubscriptionType,
      page.owner.subscriptionExpiresAt
    );

    return {
      photoGallery: featureAccess.photoGallery,
      videoGallery: featureAccess.videoGallery,
    };
  }

  /**
   * Gets photo gallery for a memorial page
   */
  async getPhotoGallery(pageId: string, userId?: string): Promise<GalleryResponse> {
    // Check if memorial page exists
    const pageExists = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { id: true },
    });

    if (!pageExists) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Get feature access
    const featureAccess = await this.getPageFeatureAccess(pageId);

    // If no access to photo gallery, return empty response
    if (!featureAccess.photoGallery) {
      return {
        items: [],
        hasAccess: false,
        subscriptionRequired: true,
      };
    }

    // Get photo gallery items
    const items = await prisma.photoGallery.findMany({
      where: { memorialPageId: pageId },
      include: {
        mediaFile: {
          select: {
            id: true,
            originalName: true,
            url: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      items,
      hasAccess: true,
      subscriptionRequired: false,
    };
  }

  /**
   * Gets video gallery for a memorial page
   */
  async getVideoGallery(pageId: string, userId?: string): Promise<GalleryResponse> {
    // Check if memorial page exists
    const pageExists = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { id: true },
    });

    if (!pageExists) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Get feature access
    const featureAccess = await this.getPageFeatureAccess(pageId);

    // If no access to video gallery, return empty response
    if (!featureAccess.videoGallery) {
      return {
        items: [],
        hasAccess: false,
        subscriptionRequired: true,
      };
    }

    // Get video gallery items
    const items = await prisma.videoGallery.findMany({
      where: { memorialPageId: pageId },
      include: {
        mediaFile: {
          select: {
            id: true,
            originalName: true,
            url: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      items,
      hasAccess: true,
      subscriptionRequired: false,
    };
  }

  /**
   * Adds a photo to the photo gallery
   */
  async addPhotoToGallery(
    pageId: string,
    userId: string,
    data: CreateGalleryItemData
  ): Promise<GalleryItem> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check feature access
    const featureAccess = await this.getPageFeatureAccess(pageId);
    if (!featureAccess.photoGallery) {
      throw new ForbiddenError('Фотогалерея недоступна для данного типа подписки');
    }

    // Validate that the media file exists, belongs to user, and is an image
    const mediaFile = await prisma.mediaFile.findFirst({
      where: {
        id: data.mediaFileId,
        uploadedBy: userId,
        mimeType: { startsWith: 'image/' },
      },
    });

    if (!mediaFile) {
      throw new ValidationError('Фотография не найдена или не принадлежит пользователю');
    }

    // Check if photo is already in gallery
    const existingItem = await prisma.photoGallery.findUnique({
      where: {
        memorialPageId_mediaFileId: {
          memorialPageId: pageId,
          mediaFileId: data.mediaFileId,
        },
      },
    });

    if (existingItem) {
      throw new ValidationError('Фотография уже добавлена в галерею');
    }

    // Get next order index
    const lastItem = await prisma.photoGallery.findFirst({
      where: { memorialPageId: pageId },
      orderBy: { orderIndex: 'desc' },
    });

    const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

    // Add photo to gallery
    const galleryItem = await prisma.photoGallery.create({
      data: {
        memorialPageId: pageId,
        mediaFileId: data.mediaFileId,
        title: data.title,
        description: data.description,
        orderIndex: nextOrderIndex,
      },
      include: {
        mediaFile: {
          select: {
            id: true,
            originalName: true,
            url: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
    });

    return galleryItem;
  }

  /**
   * Adds a video to the video gallery
   */
  async addVideoToGallery(
    pageId: string,
    userId: string,
    data: CreateGalleryItemData
  ): Promise<GalleryItem> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check feature access
    const featureAccess = await this.getPageFeatureAccess(pageId);
    if (!featureAccess.videoGallery) {
      throw new ForbiddenError('Видеогалерея недоступна для данного типа подписки');
    }

    const videoType = data.videoType || 'upload';

    // For uploaded videos
    if (videoType === 'upload') {
      if (!data.mediaFileId) {
        throw new ValidationError('Не указан ID медиафайла');
      }

      // Validate that the media file exists, belongs to user, and is a video
      const mediaFile = await prisma.mediaFile.findFirst({
        where: {
          id: data.mediaFileId,
          uploadedBy: userId,
          mimeType: { startsWith: 'video/' },
        },
      });

      if (!mediaFile) {
        throw new ValidationError('Видео не найдено или не принадлежит пользователю');
      }

      // Check if video is already in gallery
      const existingItem = await prisma.videoGallery.findFirst({
        where: {
          memorialPageId: pageId,
          mediaFileId: data.mediaFileId,
        },
      });

      if (existingItem) {
        throw new ValidationError('Видео уже добавлено в галерею');
      }
    }

    // For external videos (VK, Rutube)
    if (videoType === 'vk' || videoType === 'rutube') {
      if (!data.externalUrl || !data.embedCode) {
        throw new ValidationError('Не указана ссылка или embed-код для внешнего видео');
      }

      // Check if this external video is already in gallery
      const existingItem = await prisma.videoGallery.findFirst({
        where: {
          memorialPageId: pageId,
          externalUrl: data.externalUrl,
        },
      });

      if (existingItem) {
        throw new ValidationError('Это видео уже добавлено в галерею');
      }
    }

    // Get next order index
    const lastItem = await prisma.videoGallery.findFirst({
      where: { memorialPageId: pageId },
      orderBy: { orderIndex: 'desc' },
    });

    const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

    // Add video to gallery
    const galleryItem = await prisma.videoGallery.create({
      data: {
        memorialPageId: pageId,
        mediaFileId: data.mediaFileId,
        videoType,
        externalUrl: data.externalUrl,
        embedCode: data.embedCode,
        thumbnailUrl: data.thumbnailUrl,
        title: data.title,
        description: data.description,
        orderIndex: nextOrderIndex,
      },
      include: {
        mediaFile: data.mediaFileId ? {
          select: {
            id: true,
            originalName: true,
            url: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
        } : undefined,
      },
    });

    return galleryItem;
  }

  /**
   * Updates a photo gallery item
   */
  async updatePhotoGalleryItem(
    pageId: string,
    itemId: string,
    userId: string,
    data: UpdateGalleryItemData
  ): Promise<GalleryItem> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check if item exists
    const existingItem = await prisma.photoGallery.findFirst({
      where: {
        id: itemId,
        memorialPageId: pageId,
      },
    });

    if (!existingItem) {
      throw new NotFoundError('Элемент фотогалереи не найден');
    }

    console.log(`📝 Updating photo gallery item ${itemId}:`, data);
    console.log(`📝 Existing item:`, existingItem);

    // Update item
    try {
      const updatedItem = await prisma.photoGallery.update({
        where: { id: itemId },
        data,
        include: {
          mediaFile: {
            select: {
              id: true,
              originalName: true,
              url: true,
              thumbnailUrl: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
      });

      console.log(`✅ Updated photo gallery item ${itemId}, new orderIndex: ${updatedItem.orderIndex}`);
      return updatedItem;
    } catch (error) {
      console.error(`❌ Prisma update error for ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Updates a video gallery item
   */
  async updateVideoGalleryItem(
    pageId: string,
    itemId: string,
    userId: string,
    data: UpdateGalleryItemData
  ): Promise<GalleryItem> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check if item exists
    const existingItem = await prisma.videoGallery.findFirst({
      where: {
        id: itemId,
        memorialPageId: pageId,
      },
    });

    if (!existingItem) {
      throw new NotFoundError('Элемент видеогалереи не найден');
    }

    // Update item
    const updatedItem = await prisma.videoGallery.update({
      where: { id: itemId },
      data,
      include: {
        mediaFile: {
          select: {
            id: true,
            originalName: true,
            url: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
    });

    return updatedItem;
  }

  /**
   * Removes a photo from the gallery
   */
  async removePhotoFromGallery(
    pageId: string,
    itemId: string,
    userId: string
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check if item exists
    const existingItem = await prisma.photoGallery.findFirst({
      where: {
        id: itemId,
        memorialPageId: pageId,
      },
      include: {
        mediaFile: true
      }
    });

    if (!existingItem) {
      throw new NotFoundError('Элемент фотогалереи не найден');
    }

    // Remove item from gallery
    await prisma.photoGallery.delete({
      where: { id: itemId },
    });

    // Delete the actual media file from storage and database
    if (existingItem.mediaFileId) {
      try {
        const { mediaService } = await import('./mediaService');
        await mediaService.deleteFile(existingItem.mediaFileId);
      } catch (error) {
        console.error('Error deleting media file:', error);
        // Continue even if file deletion fails
      }
    }
  }

  /**
   * Removes a video from the gallery
   */
  async removeVideoFromGallery(
    pageId: string,
    itemId: string,
    userId: string
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Check if item exists
    const existingItem = await prisma.videoGallery.findFirst({
      where: {
        id: itemId,
        memorialPageId: pageId,
      },
      include: {
        mediaFile: true
      }
    });

    if (!existingItem) {
      throw new NotFoundError('Элемент видеогалереи не найден');
    }

    // Remove item from gallery
    await prisma.videoGallery.delete({
      where: { id: itemId },
    });

    // Delete the actual media file from storage and database
    if (existingItem.mediaFileId) {
      try {
        const { mediaService } = await import('./mediaService');
        await mediaService.deleteFile(existingItem.mediaFileId);
      } catch (error) {
        console.error('Error deleting media file:', error);
        // Continue even if file deletion fails
      }
    }
  }

  /**
   * Reorders photo gallery items
   */
  async reorderPhotoGallery(
    pageId: string,
    userId: string,
    itemIds: string[]
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Verify all items exist in the gallery
    const existingItems = await prisma.photoGallery.findMany({
      where: { memorialPageId: pageId },
      select: { id: true },
    });

    const existingItemIds = existingItems.map(item => item.id);
    const missingItems = itemIds.filter(id => !existingItemIds.includes(id));

    if (missingItems.length > 0) {
      throw new ValidationError('Некоторые элементы не найдены в фотогалерее');
    }

    // Update order indices
    await Promise.all(
      itemIds.map((itemId, index) =>
        prisma.photoGallery.update({
          where: { id: itemId },
          data: { orderIndex: index },
        })
      )
    );
  }

  /**
   * Reorders video gallery items
   */
  async reorderVideoGallery(
    pageId: string,
    userId: string,
    itemIds: string[]
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Verify all items exist in the gallery
    const existingItems = await prisma.videoGallery.findMany({
      where: { memorialPageId: pageId },
      select: { id: true },
    });

    const existingItemIds = existingItems.map(item => item.id);
    const missingItems = itemIds.filter(id => !existingItemIds.includes(id));

    if (missingItems.length > 0) {
      throw new ValidationError('Некоторые элементы не найдены в видеогалерее');
    }

    // Update order indices
    await Promise.all(
      itemIds.map((itemId, index) =>
        prisma.videoGallery.update({
          where: { id: itemId },
          data: { orderIndex: index },
        })
      )
    );
  }
}

export const galleryService = new GalleryService();