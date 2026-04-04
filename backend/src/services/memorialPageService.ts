import { generateSlug } from '../utils/slug';

// Helper function to generate unique slug
async function generateUniqueSlug(fullName: string, excludeSlug?: string): Promise<string> {
  const baseSlug = generateSlug(fullName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.memorialPage.findUnique({ 
      where: { slug },
      select: { slug: true }
    });
    
    if (!existing || (excludeSlug && existing.slug === excludeSlug)) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
import { hashPassword, comparePassword } from '../utils/password';
import { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType } from '../types/auth';
import prisma from '../config/database';

export interface CreateMemorialPageData {
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  mainPhotoId?: string;
  biographyText?: string;
  isPrivate?: boolean;
  password?: string;
}

export interface UpdateMemorialPageData {
  fullName?: string;
  birthDate?: Date;
  deathDate?: Date;
  mainPhotoId?: string | null;
  biographyText?: string;
  isPrivate?: boolean;
  password?: string;
}

export interface UpdateBiographyData {
  text?: string;
  photoIds?: string[];
}

export interface BiographyData {
  text: string;
  photos: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    originalName: string;
    orderIndex: number;
  }[];
  isLimited: boolean;
  characterLimit?: number;
}

export interface MemorialPageWithDetails {
  id: string;
  slug: string;
  ownerId: string;
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  mainPhotoId: string | null;
  biographyText: string | null;
  isPrivate: boolean;
  passwordHash: string | null;
  qrCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  mainPhoto?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
  } | null;
  biography?: BiographyData;
  _count: {
    memories: number;
    tributes: number;
    mediaFiles: number;
    photoGallery: number;
    videoGallery: number;
  };
}

export class MemorialPageService {
  /**
   * Creates a new memorial page
   */
  async createMemorialPage(
    userId: string,
    data: CreateMemorialPageData
  ): Promise<MemorialPageWithDetails> {
    // Check if user's email is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, email: true }
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Для создания памятных страниц необходимо подтвердить email адрес');
    }

    // Validate that main photo exists and belongs to user if provided
    if (data.mainPhotoId) {
      const mainPhoto = await prisma.mediaFile.findFirst({
        where: {
          id: data.mainPhotoId,
          uploadedBy: userId,
        },
      });

      if (!mainPhoto) {
        throw new ValidationError('Указанное главное фото не найдено или не принадлежит пользователю');
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(data.fullName);

    // Hash password if provided
    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Generate QR code URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCodeUrl = `${baseUrl}/memorial/${slug}`;

    // Create memorial page
    const memorialPage = await prisma.memorialPage.create({
      data: {
        slug,
        ownerId: userId,
        fullName: data.fullName,
        birthDate: data.birthDate,
        deathDate: data.deathDate,
        mainPhotoId: data.mainPhotoId,
        biographyText: data.biographyText,
        isPrivate: data.isPrivate || false,
        passwordHash,
        qrCodeUrl,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mainPhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        burialLocation: true,
        _count: {
          select: {
            memories: true,
            tributes: true,
            mediaFiles: true,
            photoGallery: true,
            videoGallery: true,
          },
        },
      },
    });

    return memorialPage;
  }

  /**
   * Gets a memorial page by ID
   */
  async getMemorialPageById(
    pageId: string,
    userId?: string
  ): Promise<MemorialPageWithDetails> {
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionType: true,
            subscriptionExpiresAt: true,
          },
        },
        mainPhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        burialLocation: true,
        _count: {
          select: {
            memories: true,
            tributes: true,
            mediaFiles: true,
            photoGallery: true,
            videoGallery: true,
          },
        },
      },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Add biography data
    const biography = await this.getBiography(pageId, userId);
    
    return {
      ...memorialPage,
      biography,
    };
  }

  /**
   * Gets a memorial page by slug
   */
  async getMemorialPageBySlug(
    slug: string,
    userId?: string
  ): Promise<MemorialPageWithDetails> {
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionType: true,
            subscriptionExpiresAt: true,
          },
        },
        mainPhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        burialLocation: true,
        _count: {
          select: {
            memories: true,
            tributes: true,
            mediaFiles: true,
            photoGallery: true,
            videoGallery: true,
          },
        },
      },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Add biography data
    const biography = await this.getBiography(memorialPage.id, userId);
    
    return {
      ...memorialPage,
      biography,
    };
  }

  /**
   * Updates a memorial page
   */
  async updateMemorialPage(
    pageId: string,
    userId: string,
    data: UpdateMemorialPageData
  ): Promise<MemorialPageWithDetails> {
    // Check if page exists and user has edit access
    const existingPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Validate main photo if provided
    if (data.mainPhotoId) {
      const mainPhoto = await prisma.mediaFile.findFirst({
        where: {
          id: data.mainPhotoId,
          uploadedBy: userId,
        },
      });

      if (!mainPhoto) {
        throw new ValidationError('Указанное главное фото не найдено или не принадлежит пользователю');
      }
    }

    // Generate new slug if name changed
    let slug = existingPage.slug;
    let qrCodeUrl = existingPage.qrCodeUrl;
    if (data.fullName && data.fullName !== existingPage.fullName) {
      slug = await generateUniqueSlug(data.fullName, existingPage.slug);
      // Update QR code URL if slug changed
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      qrCodeUrl = `${baseUrl}/memorial/${slug}`;
    }

    // Hash password if provided
    let passwordHash = existingPage.passwordHash;
    if (data.password !== undefined) {
      passwordHash = data.password ? await hashPassword(data.password) : null;
    }

    // Remove password from data before passing to Prisma (it's not a database field)
    const { password, ...updateData } = data;

    // Update memorial page
    const updatedPage = await prisma.memorialPage.update({
      where: { id: pageId },
      data: {
        ...updateData,
        slug,
        passwordHash,
        qrCodeUrl,
        mainPhotoId: data.mainPhotoId === null ? null : data.mainPhotoId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mainPhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        burialLocation: true,
        _count: {
          select: {
            memories: true,
            tributes: true,
            mediaFiles: true,
            photoGallery: true,
            videoGallery: true,
          },
        },
      },
    });

    // Send notification about page changes (import collaboratorService when needed)
    try {
      const { collaboratorService } = await import('./collaboratorService');
      await collaboratorService.notifyPageChange(
        pageId,
        userId,
        'Основная информация',
        'Обновлена основная информация о памятной странице'
      );
    } catch (error) {
      console.error('Failed to send change notification:', error);
    }

    return updatedPage;
  }

  /**
   * Deletes a memorial page
   */
  async deleteMemorialPage(pageId: string, userId: string): Promise<void> {
    // Check if page exists and user has delete access
    const existingPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Only owner can delete the page
    if (existingPage.ownerId !== userId) {
      throw new ForbiddenError('Только владелец может удалить памятную страницу');
    }

    // Delete the page (cascade will handle related records)
    await prisma.memorialPage.delete({
      where: { id: pageId },
    });
  }

  /**
   * Gets user's memorial pages with pagination
   */
  async getUserMemorialPages(
    userId: string,
    params: PaginationParams & { search?: string }
  ): Promise<PaginatedResponse<MemorialPageWithDetails>> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = {
      ownerId: userId,
      ...(search && {
        fullName: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [pages, total] = await Promise.all([
      prisma.memorialPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mainPhoto: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
            },
          },
          burialLocation: true,
          _count: {
            select: {
              memories: true,
              tributes: true,
              mediaFiles: true,
              photoGallery: true,
              videoGallery: true,
            },
          },
        },
      }),
      prisma.memorialPage.count({ where }),
    ]);

    return {
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Verifies password for private memorial page
   */
  async verifyPagePassword(pageId: string, password: string): Promise<boolean> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { passwordHash: true, isPrivate: true },
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    if (!page.isPrivate || !page.passwordHash) {
      return true; // Page is not private
    }

    return await comparePassword(password, page.passwordHash);
  }



  /**
   * Checks if user has edit access to the page
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
   * Updates biography text and photos for a memorial page
   */
  async updateBiography(
    pageId: string,
    userId: string,
    data: UpdateBiographyData
  ): Promise<BiographyData> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Get user's subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const featureAccess = getFeatureAccess(
      user.subscriptionType as SubscriptionType,
      user.subscriptionExpiresAt
    );

    // Validate text length for free accounts
    if (data.text !== undefined && !featureAccess.unlimitedBiography) {
      const characterLimit = 1000;
      if (data.text.length > characterLimit) {
        throw new ValidationError(
          `Для бесплатного аккаунта текст биографии не может превышать ${characterLimit} символов`
        );
      }
    }

    // Validate photo IDs if provided
    if (data.photoIds && data.photoIds.length > 0) {
      const validPhotos = await prisma.mediaFile.findMany({
        where: {
          id: { in: data.photoIds },
          uploadedBy: userId,
          mimeType: { startsWith: 'image/' },
        },
      });

      if (validPhotos.length !== data.photoIds.length) {
        throw new ValidationError('Некоторые фотографии не найдены или не принадлежат пользователю');
      }
    }

    // Update biography text if provided
    if (data.text !== undefined) {
      await prisma.memorialPage.update({
        where: { id: pageId },
        data: { biographyText: data.text },
      });
    }

    // Update biography photos if provided
    if (data.photoIds !== undefined) {
      // Remove existing biography photos
      await prisma.biographyPhoto.deleteMany({
        where: { memorialPageId: pageId },
      });

      // Add new biography photos
      if (data.photoIds.length > 0) {
        await prisma.biographyPhoto.createMany({
          data: data.photoIds.map((photoId, index) => ({
            memorialPageId: pageId,
            mediaFileId: photoId,
            orderIndex: index,
          })),
        });
      }
    }

    // Send notification about biography changes
    try {
      const { collaboratorService } = await import('./collaboratorService');
      await collaboratorService.notifyPageChange(
        pageId,
        userId,
        'Биография',
        'Обновлена биография памятной страницы'
      );
    } catch (error) {
      console.error('Failed to send change notification:', error);
    }

    // Return updated biography data
    return this.getBiography(pageId, userId);
  }

  /**
   * Gets biography data for a memorial page with subscription-aware display
   */
  async getBiography(pageId: string, userId?: string): Promise<BiographyData> {
    // Get memorial page with owner info
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: {
        biographyText: true,
        owner: {
          select: {
            subscriptionType: true,
            subscriptionExpiresAt: true,
          },
        },
      },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Get feature access for the page owner
    const featureAccess = getFeatureAccess(
      memorialPage.owner.subscriptionType as SubscriptionType,
      memorialPage.owner.subscriptionExpiresAt
    );

    // Get biography photos
    const biographyPhotos = await prisma.biographyPhoto.findMany({
      where: { memorialPageId: pageId },
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
    });

    let biographyText = memorialPage.biographyText || '';
    let isLimited = false;
    let characterLimit: number | undefined;

    // Apply subscription limits for display
    if (!featureAccess.unlimitedBiography) {
      characterLimit = 1000;
      if (biographyText.length > characterLimit) {
        biographyText = biographyText.substring(0, characterLimit);
        isLimited = true;
      }
    }

    return {
      text: biographyText,
      photos: biographyPhotos.map((bp: any) => ({
        id: bp.mediaFile.id,
        url: bp.mediaFile.url,
        thumbnailUrl: bp.mediaFile.thumbnailUrl,
        originalName: bp.mediaFile.originalName,
        orderIndex: bp.orderIndex,
      })),
      isLimited,
      characterLimit,
    };
  }

  /**
   * Adds a photo to biography
   */
  async addBiographyPhoto(
    pageId: string,
    userId: string,
    photoId: string
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Validate photo exists and belongs to user
    const photo = await prisma.mediaFile.findFirst({
      where: {
        id: photoId,
        uploadedBy: userId,
        mimeType: { startsWith: 'image/' },
      },
    });

    if (!photo) {
      throw new ValidationError('Фотография не найдена или не принадлежит пользователю');
    }

    // Check if photo is already in biography
    const existingPhoto = await prisma.biographyPhoto.findUnique({
      where: {
        memorialPageId_mediaFileId: {
          memorialPageId: pageId,
          mediaFileId: photoId,
        },
      },
    });

    if (existingPhoto) {
      throw new ValidationError('Фотография уже добавлена в биографию');
    }

    // Get next order index
    const lastPhoto = await prisma.biographyPhoto.findFirst({
      where: { memorialPageId: pageId },
      orderBy: { orderIndex: 'desc' },
    });

    const nextOrderIndex = lastPhoto ? lastPhoto.orderIndex + 1 : 0;

    // Add photo to biography
    await prisma.biographyPhoto.create({
      data: {
        memorialPageId: pageId,
        mediaFileId: photoId,
        orderIndex: nextOrderIndex,
      },
    });
  }

  /**
   * Removes a photo from biography
   */
  async removeBiographyPhoto(
    pageId: string,
    userId: string,
    photoId: string
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Remove photo from biography
    const deletedPhoto = await prisma.biographyPhoto.deleteMany({
      where: {
        memorialPageId: pageId,
        mediaFileId: photoId,
      },
    });

    if (deletedPhoto.count === 0) {
      throw new NotFoundError('Фотография не найдена в биографии');
    }
  }

  /**
   * Reorders biography photos
   */
  async reorderBiographyPhotos(
    pageId: string,
    userId: string,
    photoIds: string[]
  ): Promise<void> {
    // Check edit permissions
    await this.checkEditAccess(pageId, userId);

    // Verify all photos exist in biography
    const existingPhotos = await prisma.biographyPhoto.findMany({
      where: { memorialPageId: pageId },
    });

    const existingPhotoIds = existingPhotos.map((p: any) => p.mediaFileId);
    const missingPhotos = photoIds.filter(id => !existingPhotoIds.includes(id));

    if (missingPhotos.length > 0) {
      throw new ValidationError('Некоторые фотографии не найдены в биографии');
    }

    // Update order indices
    await Promise.all(
      photoIds.map((photoId, index) =>
        prisma.biographyPhoto.updateMany({
          where: {
            memorialPageId: pageId,
            mediaFileId: photoId,
          },
          data: { orderIndex: index },
        })
      )
    );
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
}

export const memorialPageService = new MemorialPageService();