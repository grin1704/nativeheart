import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType } from '../types/auth';
import prisma from '../config/database';

export interface CreateMemoryData {
  date: Date;
  title: string;
  description?: string;
  photoIds?: string[];
}

export interface UpdateMemoryData {
  date?: Date;
  title?: string;
  description?: string;
  photoIds?: string[];
}

export interface MemoryWithPhotos {
  id: string;
  memorialPageId: string;
  date: Date;
  title: string;
  description: string | null;
  createdAt: Date;
  photos: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    originalName: string;
    orderIndex: number;
  }[];
}

export interface MemoryQueryParams extends PaginationParams {
  sortBy?: 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class MemoryService {
  /**
   * Creates a new memory for a memorial page
   */
  async createMemory(
    memorialPageId: string,
    userId: string,
    data: CreateMemoryData
  ): Promise<MemoryWithPhotos> {
    // Check if memorial page exists and user has edit access
    await this.checkEditAccess(memorialPageId, userId);

    // Check if memories feature is available for the page owner
    await this.checkMemoriesFeatureAccess(memorialPageId);

    // Validate photo IDs if provided
    if (data.photoIds && data.photoIds.length > 0) {
      await this.validatePhotoIds(data.photoIds, userId);
    }

    // Create memory
    const memory = await prisma.memory.create({
      data: {
        memorialPageId,
        date: data.date,
        title: data.title,
        description: data.description || null,
      },
    });

    // Add photos if provided
    if (data.photoIds && data.photoIds.length > 0) {
      await this.addPhotosToMemory(memory.id, data.photoIds);
    }

    // Return memory with photos
    return this.getMemoryById(memory.id);
  }

  /**
   * Gets a memory by ID with photos
   */
  async getMemoryById(memoryId: string): Promise<MemoryWithPhotos> {
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
      include: {
        photos: {
          include: {
            mediaFile: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                originalName: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!memory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    return {
      id: memory.id,
      memorialPageId: memory.memorialPageId,
      date: memory.date,
      title: memory.title,
      description: memory.description,
      createdAt: memory.createdAt,
      photos: memory.photos.map((photo: any) => ({
        id: photo.mediaFile.id,
        url: photo.mediaFile.url,
        thumbnailUrl: photo.mediaFile.thumbnailUrl,
        originalName: photo.mediaFile.originalName,
        orderIndex: photo.orderIndex,
      })),
    };
  }

  /**
   * Gets memories for a memorial page with pagination and sorting
   */
  async getMemoriesForPage(
    memorialPageId: string,
    userId: string | undefined,
    params: MemoryQueryParams
  ): Promise<PaginatedResponse<MemoryWithPhotos>> {
    // Check if memorial page exists and user has access
    await this.checkPageAccess(memorialPageId, userId);

    // Check if memories feature is available for the page owner
    await this.checkMemoriesFeatureAccess(memorialPageId);

    const { page, limit, sortBy = 'date', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy = sortBy === 'date' 
      ? { date: sortOrder }
      : { createdAt: sortOrder };

    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where: { memorialPageId },
        skip,
        take: limit,
        orderBy,
        include: {
          photos: {
            include: {
              mediaFile: {
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  originalName: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      }),
      prisma.memory.count({ where: { memorialPageId } }),
    ]);

    const memoriesWithPhotos = memories.map((memory: any) => ({
      id: memory.id,
      memorialPageId: memory.memorialPageId,
      date: memory.date,
      title: memory.title,
      description: memory.description,
      createdAt: memory.createdAt,
      photos: memory.photos.map((photo: any) => ({
        id: photo.mediaFile.id,
        url: photo.mediaFile.url,
        thumbnailUrl: photo.mediaFile.thumbnailUrl,
        originalName: photo.mediaFile.originalName,
        orderIndex: photo.orderIndex,
      })),
    }));

    return {
      data: memoriesWithPhotos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates a memory
   */
  async updateMemory(
    memoryId: string,
    userId: string,
    data: UpdateMemoryData
  ): Promise<MemoryWithPhotos> {
    // Get memory to check access
    const existingMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { memorialPageId: true },
    });

    if (!existingMemory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    // Check edit access
    await this.checkEditAccess(existingMemory.memorialPageId, userId);

    // Validate photo IDs if provided
    if (data.photoIds && data.photoIds.length > 0) {
      await this.validatePhotoIds(data.photoIds, userId);
    }

    // Update memory basic info
    const updateData: any = {};
    if (data.date !== undefined) updateData.date = data.date;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    if (Object.keys(updateData).length > 0) {
      await prisma.memory.update({
        where: { id: memoryId },
        data: updateData,
      });
    }

    // Update photos if provided
    if (data.photoIds !== undefined) {
      // Remove existing photos
      await prisma.memoryPhoto.deleteMany({
        where: { memoryId },
      });

      // Add new photos
      if (data.photoIds.length > 0) {
        await this.addPhotosToMemory(memoryId, data.photoIds);
      }
    }

    // Return updated memory
    return this.getMemoryById(memoryId);
  }

  /**
   * Deletes a memory
   */
  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    // Get memory to check access
    const existingMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { memorialPageId: true },
    });

    if (!existingMemory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    // Check edit access
    await this.checkEditAccess(existingMemory.memorialPageId, userId);

    // Delete memory (cascade will handle photos)
    await prisma.memory.delete({
      where: { id: memoryId },
    });
  }

  /**
   * Adds a photo to a memory
   */
  async addPhotoToMemory(
    memoryId: string,
    userId: string,
    photoId: string
  ): Promise<void> {
    // Get memory to check access
    const existingMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { memorialPageId: true },
    });

    if (!existingMemory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    // Check edit access
    await this.checkEditAccess(existingMemory.memorialPageId, userId);

    // Validate photo
    await this.validatePhotoIds([photoId], userId);

    // Check if photo is already attached
    const existingPhoto = await prisma.memoryPhoto.findUnique({
      where: {
        memoryId_mediaFileId: {
          memoryId,
          mediaFileId: photoId,
        },
      },
    });

    if (existingPhoto) {
      throw new ValidationError('Фотография уже прикреплена к воспоминанию');
    }

    // Get next order index
    const lastPhoto = await prisma.memoryPhoto.findFirst({
      where: { memoryId },
      orderBy: { orderIndex: 'desc' },
    });

    const nextOrderIndex = lastPhoto ? lastPhoto.orderIndex + 1 : 0;

    // Add photo
    await prisma.memoryPhoto.create({
      data: {
        memoryId,
        mediaFileId: photoId,
        orderIndex: nextOrderIndex,
      },
    });
  }

  /**
   * Removes a photo from a memory
   */
  async removePhotoFromMemory(
    memoryId: string,
    userId: string,
    photoId: string
  ): Promise<void> {
    // Get memory to check access
    const existingMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { memorialPageId: true },
    });

    if (!existingMemory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    // Check edit access
    await this.checkEditAccess(existingMemory.memorialPageId, userId);

    // Remove photo
    const deletedPhoto = await prisma.memoryPhoto.deleteMany({
      where: {
        memoryId,
        mediaFileId: photoId,
      },
    });

    if (deletedPhoto.count === 0) {
      throw new NotFoundError('Фотография не найдена в воспоминании');
    }
  }

  /**
   * Reorders photos in a memory
   */
  async reorderMemoryPhotos(
    memoryId: string,
    userId: string,
    photoIds: string[]
  ): Promise<void> {
    // Get memory to check access
    const existingMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { memorialPageId: true },
    });

    if (!existingMemory) {
      throw new NotFoundError('Воспоминание не найдено');
    }

    // Check edit access
    await this.checkEditAccess(existingMemory.memorialPageId, userId);

    // Verify all photos exist in memory
    const existingPhotos = await prisma.memoryPhoto.findMany({
      where: { memoryId },
    });

    const existingPhotoIds = existingPhotos.map((p: any) => p.mediaFileId);
    const missingPhotos = photoIds.filter(id => !existingPhotoIds.includes(id));

    if (missingPhotos.length > 0) {
      throw new ValidationError('Некоторые фотографии не найдены в воспоминании');
    }

    // Update order indices
    await Promise.all(
      photoIds.map((photoId, index) =>
        prisma.memoryPhoto.updateMany({
          where: {
            memoryId,
            mediaFileId: photoId,
          },
          data: { orderIndex: index },
        })
      )
    );
  }

  /**
   * Checks if user has access to view the memorial page
   */
  private async checkPageAccess(memorialPageId: string, userId?: string): Promise<void> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: {
        id: true,
        ownerId: true,
        isPrivate: true,
        passwordHash: true,
      },
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Owner and collaborators always have access
    if (userId && (page.ownerId === userId || await this.isCollaborator(memorialPageId, userId))) {
      return;
    }

    // For private pages, we'll assume access is already validated at the controller level
    // This method is mainly for checking if the page exists
  }

  /**
   * Checks if user has edit access to the memorial page
   */
  private async checkEditAccess(memorialPageId: string, userId: string): Promise<void> {
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
  }

  /**
   * Checks if memories feature is available for the page owner
   */
  private async checkMemoriesFeatureAccess(memorialPageId: string): Promise<void> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      include: {
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
      page.owner.subscriptionExpiresAt,
      page.isPremium
    );

    if (!featureAccess.memories) {
      throw new ForbiddenError('Раздел воспоминаний доступен только в платной версии');
    }
  }

  /**
   * Validates that photo IDs exist and belong to the user
   */
  private async validatePhotoIds(photoIds: string[], userId: string): Promise<void> {
    const validPhotos = await prisma.mediaFile.findMany({
      where: {
        id: { in: photoIds },
        uploadedBy: userId,
        mimeType: { startsWith: 'image/' },
      },
    });

    if (validPhotos.length !== photoIds.length) {
      throw new ValidationError('Некоторые фотографии не найдены или не принадлежат пользователю');
    }
  }

  /**
   * Adds multiple photos to a memory
   */
  private async addPhotosToMemory(memoryId: string, photoIds: string[]): Promise<void> {
    await prisma.memoryPhoto.createMany({
      data: photoIds.map((photoId, index) => ({
        memoryId,
        mediaFileId: photoId,
        orderIndex: index,
      })),
    });
  }

  /**
   * Checks if user is a collaborator on the page
   */
  private async isCollaborator(memorialPageId: string, userId: string): Promise<boolean> {
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        memorialPageId,
        userId,
        acceptedAt: { not: null },
      },
    });

    return !!collaborator;
  }
}

export const memoryService = new MemoryService();