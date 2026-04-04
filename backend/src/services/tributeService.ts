import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType } from '../types/auth';
import prisma from '../config/database';

export interface CreateTributeData {
  memorialPageId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  photoId?: string;
}

export interface UpdateTributeData {
  authorName?: string;
  authorEmail?: string;
  text?: string;
  photoId?: string;
  isApproved?: boolean;
}

export interface TributeFilters {
  page?: number;
  limit?: number;
  approved?: boolean | 'all';
}

export interface TributeWithDetails {
  id: string;
  memorialPageId: string;
  authorName: string;
  authorEmail: string | null;
  text: string;
  photoId: string | null;
  isApproved: boolean;
  createdAt: Date;
  photo?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    originalName: string;
  };
}

class TributeService {
  async createTribute(data: CreateTributeData): Promise<TributeWithDetails> {
    try {
      // Check if memorial page exists
      const memorialPage = await prisma.memorialPage.findUnique({
        where: { id: data.memorialPageId },
        include: {
          owner: {
            select: {
              subscriptionType: true,
              subscriptionExpiresAt: true
            }
          }
        }
      });

      if (!memorialPage) {
        throw new NotFoundError('Memorial page');
      }

      // Check subscription access to tributes feature
      const features = getFeatureAccess(
        memorialPage.owner.subscriptionType as SubscriptionType,
        memorialPage.owner.subscriptionExpiresAt
      );

      if (!features.tributes) {
        throw new ValidationError('Tributes feature is not available for this subscription type');
      }

      // Validate photo if provided
      if (data.photoId) {
        const photo = await prisma.mediaFile.findUnique({
          where: { id: data.photoId }
        });

        if (!photo) {
          throw new NotFoundError('Photo');
        }

        // Check if photo is an image
        if (!photo.mimeType.startsWith('image/')) {
          throw new ValidationError('Only image files are allowed for tribute photos');
        }
      }

      // Create tribute with automatic approval for now
      const tribute = await prisma.tribute.create({
        data: {
          memorialPageId: data.memorialPageId,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
          text: data.text,
          photoId: data.photoId,
          isApproved: true // Automatic approval as specified in requirements
        },
        include: {
          photo: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              originalName: true
            }
          }
        }
      });

      return tribute;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create tribute', 500);
    }
  }

  async getTributesByMemorialPage(
    memorialPageId: string,
    filters: TributeFilters = {},
    userId?: string
  ): Promise<{
    tributes: TributeWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Check if memorial page exists
      const memorialPage = await prisma.memorialPage.findUnique({
        where: { id: memorialPageId },
        include: {
          owner: {
            select: {
              subscriptionType: true,
              subscriptionExpiresAt: true
            }
          }
        }
      });

      if (!memorialPage) {
        throw new NotFoundError('Memorial page');
      }

      // Check subscription access to tributes feature
      const features = getFeatureAccess(
        memorialPage.owner.subscriptionType as SubscriptionType,
        memorialPage.owner.subscriptionExpiresAt
      );

      if (!features.tributes) {
        throw new ValidationError('Tributes feature is not available for this subscription type');
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {
        memorialPageId
      };

      // Check if user is the owner or collaborator
      const isOwnerOrCollaborator = userId && (
        memorialPage.ownerId === userId ||
        await prisma.collaborator.findFirst({
          where: {
            memorialPageId,
            userId,
            acceptedAt: { not: null }
          }
        })
      );

      // Filter by approval status if specified
      if (filters.approved !== undefined && filters.approved !== 'all') {
        where.isApproved = filters.approved;
      } else if (filters.approved === undefined) {
        // If user is owner/collaborator, show all tributes by default
        // Otherwise, only show approved tributes for public access
        if (!isOwnerOrCollaborator) {
          where.isApproved = true;
        }
      }
      // If approved === 'all', don't add any filter (show all tributes)

      const [tributes, total] = await Promise.all([
        prisma.tribute.findMany({
          where,
          include: {
            photo: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                originalName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.tribute.count({ where })
      ]);

      return {
        tributes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get tributes', 500);
    }
  }

  async getTributeById(id: string): Promise<TributeWithDetails> {
    try {
      const tribute = await prisma.tribute.findUnique({
        where: { id },
        include: {
          photo: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              originalName: true
            }
          },
          memorialPage: {
            include: {
              owner: {
                select: {
                  subscriptionType: true,
                  subscriptionExpiresAt: true
                }
              }
            }
          }
        }
      });

      if (!tribute) {
        throw new NotFoundError('Tribute');
      }

      // Check subscription access to tributes feature
      const features = getFeatureAccess(
        tribute.memorialPage.owner.subscriptionType as SubscriptionType,
        tribute.memorialPage.owner.subscriptionExpiresAt
      );

      if (!features.tributes) {
        throw new ValidationError('Tributes feature is not available for this subscription type');
      }

      return tribute;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get tribute', 500);
    }
  }

  async updateTribute(id: string, data: UpdateTributeData): Promise<TributeWithDetails> {
    try {
      // Check if tribute exists
      const existingTribute = await prisma.tribute.findUnique({
        where: { id },
        include: {
          memorialPage: {
            include: {
              owner: {
                select: {
                  subscriptionType: true,
                  subscriptionExpiresAt: true
                }
              }
            }
          }
        }
      });

      if (!existingTribute) {
        throw new NotFoundError('Tribute');
      }

      // Check subscription access to tributes feature
      const features = getFeatureAccess(
        existingTribute.memorialPage.owner.subscriptionType as SubscriptionType,
        existingTribute.memorialPage.owner.subscriptionExpiresAt
      );

      if (!features.tributes) {
        throw new ValidationError('Tributes feature is not available for this subscription type');
      }

      // Validate photo if provided
      if (data.photoId) {
        const photo = await prisma.mediaFile.findUnique({
          where: { id: data.photoId }
        });

        if (!photo) {
          throw new NotFoundError('Photo');
        }

        // Check if photo is an image
        if (!photo.mimeType.startsWith('image/')) {
          throw new ValidationError('Only image files are allowed for tribute photos');
        }
      }

      const tribute = await prisma.tribute.update({
        where: { id },
        data,
        include: {
          photo: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              originalName: true
            }
          }
        }
      });

      return tribute;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update tribute', 500);
    }
  }

  async deleteTribute(id: string): Promise<void> {
    try {
      const tribute = await prisma.tribute.findUnique({
        where: { id },
        include: {
          memorialPage: {
            include: {
              owner: {
                select: {
                  subscriptionType: true,
                  subscriptionExpiresAt: true
                }
              }
            }
          }
        }
      });

      if (!tribute) {
        throw new NotFoundError('Tribute');
      }

      // Check subscription access to tributes feature
      const features = getFeatureAccess(
        tribute.memorialPage.owner.subscriptionType as SubscriptionType,
        tribute.memorialPage.owner.subscriptionExpiresAt
      );

      if (!features.tributes) {
        throw new ValidationError('Tributes feature is not available for this subscription type');
      }

      await prisma.tribute.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete tribute', 500);
    }
  }

  async moderateTribute(id: string, isApproved: boolean, reason?: string): Promise<TributeWithDetails> {
    try {
      const tribute = await prisma.tribute.findUnique({
        where: { id }
      });

      if (!tribute) {
        throw new NotFoundError('Tribute');
      }

      const updatedTribute = await prisma.tribute.update({
        where: { id },
        data: {
          isApproved
        },
        include: {
          photo: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              originalName: true
            }
          }
        }
      });

      // TODO: In the future, we could log the moderation action
      // or send notifications to the tribute author

      return updatedTribute;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to moderate tribute', 500);
    }
  }

  async getTributesForModeration(filters: TributeFilters = {}): Promise<{
    tributes: TributeWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {
        isApproved: false // Only get pending tributes
      };

      const [tributes, total] = await Promise.all([
        prisma.tribute.findMany({
          where,
          include: {
            photo: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                originalName: true
              }
            },
            memorialPage: {
              select: {
                id: true,
                slug: true,
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc' // Oldest first for moderation queue
          },
          skip,
          take: limit
        }),
        prisma.tribute.count({ where })
      ]);

      return {
        tributes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError('Failed to get tributes for moderation', 500);
    }
  }

  async likeTribute(tributeId: string, userId?: string, fingerprint?: string): Promise<{ likesCount: number; isLiked: boolean }> {
    try {
      // Check if tribute exists
      const tribute = await prisma.tribute.findUnique({
        where: { id: tributeId }
      });

      if (!tribute) {
        throw new NotFoundError('Tribute');
      }

      // Check if already liked
      const existingLike = await prisma.tributeLike.findFirst({
        where: {
          tributeId,
          OR: [
            userId ? { userId } : {},
            fingerprint ? { fingerprint } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });

      if (existingLike) {
        // Already liked, fetch current count from database
        const currentTribute = await prisma.tribute.findUnique({
          where: { id: tributeId },
          select: { likesCount: true }
        });
        
        return {
          likesCount: currentTribute!.likesCount,
          isLiked: true
        };
      }

      // Create like and increment counter
      await prisma.$transaction([
        prisma.tributeLike.create({
          data: {
            tributeId,
            userId,
            fingerprint
          }
        }),
        prisma.tribute.update({
          where: { id: tributeId },
          data: {
            likesCount: {
              increment: 1
            }
          }
        })
      ]);

      const updatedTribute = await prisma.tribute.findUnique({
        where: { id: tributeId },
        select: { likesCount: true }
      });

      return {
        likesCount: updatedTribute!.likesCount,
        isLiked: true
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to like tribute', 500);
    }
  }

  async unlikeTribute(tributeId: string, userId?: string, fingerprint?: string): Promise<{ likesCount: number; isLiked: boolean }> {
    try {
      // Check if tribute exists
      const tribute = await prisma.tribute.findUnique({
        where: { id: tributeId }
      });

      if (!tribute) {
        throw new NotFoundError('Tribute');
      }

      // Find existing like
      const existingLike = await prisma.tributeLike.findFirst({
        where: {
          tributeId,
          OR: [
            userId ? { userId } : {},
            fingerprint ? { fingerprint } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });

      if (!existingLike) {
        // Not liked, fetch current count from database
        const currentTribute = await prisma.tribute.findUnique({
          where: { id: tributeId },
          select: { likesCount: true }
        });
        
        return {
          likesCount: currentTribute!.likesCount,
          isLiked: false
        };
      }

      // Delete like and decrement counter
      await prisma.$transaction([
        prisma.tributeLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.tribute.update({
          where: { id: tributeId },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        })
      ]);

      const updatedTribute = await prisma.tribute.findUnique({
        where: { id: tributeId },
        select: { likesCount: true }
      });

      return {
        likesCount: updatedTribute!.likesCount,
        isLiked: false
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to unlike tribute', 500);
    }
  }

  async checkIfLiked(tributeId: string, userId?: string, fingerprint?: string): Promise<boolean> {
    try {
      const like = await prisma.tributeLike.findFirst({
        where: {
          tributeId,
          OR: [
            userId ? { userId } : {},
            fingerprint ? { fingerprint } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });

      return !!like;
    } catch (error) {
      return false;
    }
  }
}

export default new TributeService();