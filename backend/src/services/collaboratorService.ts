import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { PaginationParams, PaginatedResponse } from '../types';
import prisma from '../config/database';
import { emailService } from './emailService';
import { CollaboratorPermissions, DEFAULT_PERMISSIONS } from '../types/collaborator';

export interface InviteCollaboratorData {
  email: string;
  permissions?: CollaboratorPermissions;
}

export interface CollaboratorWithUser {
  id: string;
  memorialPageId: string;
  userId: string;
  permissions: CollaboratorPermissions;
  invitedAt: Date;
  acceptedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CollaboratorInvitation {
  id: string;
  memorialPageId: string;
  memorialPageName: string;
  inviterName: string;
  permissions: CollaboratorPermissions;
  invitedAt: Date;
}

export class CollaboratorService {
  /**
   * Invites a collaborator to a memorial page
   */
  async inviteCollaborator(
    pageId: string,
    inviterId: string,
    data: InviteCollaboratorData
  ): Promise<CollaboratorWithUser> {
    // Check if memorial page exists and user is owner
    const memorialPage = await prisma.memorialPage.findUnique({
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
      throw new NotFoundError('Памятная страница не найдена');
    }

    if (memorialPage.ownerId !== inviterId) {
      throw new ForbiddenError('Только владелец страницы может приглашать соавторов');
    }

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!invitedUser) {
      throw new ValidationError('Пользователь с указанным email не найден');
    }

    // Check if user is not the owner
    if (invitedUser.id === inviterId) {
      throw new ValidationError('Нельзя пригласить самого себя в качестве соавтора');
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.collaborator.findFirst({
      where: {
        memorialPageId: pageId,
        userId: invitedUser.id,
      },
    });

    if (existingCollaborator) {
      throw new ValidationError('Пользователь уже является соавтором этой страницы');
    }

    // Create collaborator invitation
    const collaborator = await prisma.collaborator.create({
      data: {
        memorialPageId: pageId,
        userId: invitedUser.id,
        permissions: data.permissions || DEFAULT_PERMISSIONS as any,
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
      permissions: collaborator.permissions as unknown as CollaboratorPermissions,
    } as CollaboratorWithUser;

    // Send invitation email
    try {
      await emailService.sendCollaboratorInvitation({
        invitedUserEmail: invitedUser.email,
        invitedUserName: invitedUser.name,
        inviterName: memorialPage.owner.name,
        memorialPageName: memorialPage.fullName,
        memorialPageSlug: memorialPage.slug,
        collaboratorId: collaborator.id,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't throw error, just log it - the invitation is still created
    }

    return {
      ...collaborator,
      permissions: collaborator.permissions as unknown as CollaboratorPermissions,
    } as CollaboratorWithUser;
  }

  /**
   * Accepts a collaborator invitation
   */
  async acceptInvitation(collaboratorId: string, userId: string): Promise<CollaboratorWithUser> {
    // Find the invitation
    const collaborator = await prisma.collaborator.findUnique({
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
      throw new NotFoundError('Приглашение не найдено');
    }

    // Check if the invitation is for this user
    if (collaborator.userId !== userId) {
      throw new ForbiddenError('Это приглашение предназначено для другого пользователя');
    }

    // Check if already accepted
    if (collaborator.acceptedAt) {
      throw new ValidationError('Приглашение уже принято');
    }

    // Accept the invitation
    const updatedCollaborator = await prisma.collaborator.update({
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
      permissions: updatedCollaborator.permissions as unknown as CollaboratorPermissions,
    } as CollaboratorWithUser;

    // Send notification to page owner
    try {
      await emailService.sendCollaboratorAcceptedNotification({
        ownerEmail: collaborator.memorialPage.owner.email,
        ownerName: collaborator.memorialPage.owner.name,
        collaboratorName: collaborator.user.name,
        memorialPageName: collaborator.memorialPage.fullName,
      });
    } catch (error) {
      console.error('Failed to send acceptance notification email:', error);
    }

    return {
      ...updatedCollaborator,
      permissions: updatedCollaborator.permissions as unknown as CollaboratorPermissions,
    } as CollaboratorWithUser;
  }

  /**
   * Declines a collaborator invitation
   */
  async declineInvitation(collaboratorId: string, userId: string): Promise<void> {
    // Find the invitation
    const collaborator = await prisma.collaborator.findUnique({
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
      throw new NotFoundError('Приглашение не найдено');
    }

    // Check if the invitation is for this user
    if (collaborator.userId !== userId) {
      throw new ForbiddenError('Это приглашение предназначено для другого пользователя');
    }

    // Check if already accepted
    if (collaborator.acceptedAt) {
      throw new ValidationError('Нельзя отклонить уже принятое приглашение');
    }

    // Delete the invitation
    await prisma.collaborator.delete({
      where: { id: collaboratorId },
    });

    // Send notification to page owner
    try {
      await emailService.sendCollaboratorDeclinedNotification({
        ownerEmail: collaborator.memorialPage.owner.email,
        ownerName: collaborator.memorialPage.owner.name,
        collaboratorName: collaborator.user.name,
        memorialPageName: collaborator.memorialPage.fullName,
      });
    } catch (error) {
      console.error('Failed to send decline notification email:', error);
    }
  }

  /**
   * Removes a collaborator from a memorial page
   */
  async removeCollaborator(
    pageId: string,
    collaboratorId: string,
    requesterId: string
  ): Promise<void> {
    // Check if memorial page exists
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Find the collaborator
    const collaborator = await prisma.collaborator.findUnique({
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
      throw new NotFoundError('Соавтор не найден');
    }

    // Check if collaborator belongs to this page
    if (collaborator.memorialPageId !== pageId) {
      throw new ValidationError('Соавтор не принадлежит к этой странице');
    }

    // Check permissions: owner can remove anyone, collaborator can only remove themselves
    const isOwner = memorialPage.ownerId === requesterId;
    const isSelf = collaborator.userId === requesterId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenError('У вас нет прав для удаления этого соавтора');
    }

    // Remove the collaborator
    await prisma.collaborator.delete({
      where: { id: collaboratorId },
    });
  }

  /**
   * Gets all collaborators for a memorial page
   */
  async getPageCollaborators(
    pageId: string,
    requesterId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<CollaboratorWithUser>> {
    // Check if user has access to view collaborators (owner or collaborator)
    const hasAccess = await this.checkPageAccess(pageId, requesterId);
    if (!hasAccess) {
      throw new ForbiddenError('У вас нет доступа к этой странице');
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [collaboratorsRaw, total] = await Promise.all([
      prisma.collaborator.findMany({
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
      prisma.collaborator.count({
        where: { memorialPageId: pageId },
      }),
    ]);

    const collaborators = collaboratorsRaw.map(c => ({
      ...c,
      permissions: c.permissions as unknown as CollaboratorPermissions,
    })) as CollaboratorWithUser[];

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

  /**
   * Gets pending invitations for a user
   */
  async getUserPendingInvitations(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<CollaboratorInvitation>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      prisma.collaborator.findMany({
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
      prisma.collaborator.count({
        where: {
          userId,
          acceptedAt: null,
        },
      }),
    ]);

    const formattedInvitations = invitations.map((inv: any) => ({
      id: inv.id,
      memorialPageId: inv.memorialPageId,
      memorialPageName: inv.memorialPage.fullName,
      inviterName: inv.memorialPage.owner.name,
      permissions: inv.permissions as unknown as CollaboratorPermissions,
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

  /**
   * Gets pages where user is a collaborator
   */
  async getUserCollaboratorPages(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [collaborations, total] = await Promise.all([
      prisma.collaborator.findMany({
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
      prisma.collaborator.count({
        where: {
          userId,
          acceptedAt: { not: null },
        },
      }),
    ]);

    const formattedPages = collaborations.map((collab: any) => {
      // Ensure permissions is properly formatted as JSON object
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

  /**
   * Updates collaborator permissions (owner only)
   */
  async updateCollaboratorPermissions(
    pageId: string,
    collaboratorId: string,
    permissions: CollaboratorPermissions,
    requesterId: string
  ): Promise<CollaboratorWithUser> {
    // Check if memorial page exists and user is owner
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    if (memorialPage.ownerId !== requesterId) {
      throw new ForbiddenError('Только владелец страницы может изменять права соавторов');
    }

    // Find the collaborator
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: collaboratorId },
    });

    if (!collaborator) {
      throw new NotFoundError('Соавтор не найден');
    }

    // Check if collaborator belongs to this page
    if (collaborator.memorialPageId !== pageId) {
      throw new ValidationError('Соавтор не принадлежит к этой странице');
    }

    // Update permissions
    const updatedCollaborator = await prisma.collaborator.update({
      where: { id: collaboratorId },
      data: { permissions: permissions as any },
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
      permissions: updatedCollaborator.permissions as unknown as CollaboratorPermissions,
    } as CollaboratorWithUser;
  }

  /**
   * Checks if user has access to a memorial page (owner or accepted collaborator)
   */
  async checkPageAccess(pageId: string, userId: string): Promise<boolean> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!page) {
      return false;
    }

    // Check if user is owner
    if (page.ownerId === userId) {
      return true;
    }

    // Check if user is an accepted collaborator
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
   * Checks if user has edit access to a memorial page
   */
  async checkEditAccess(pageId: string, userId: string): Promise<boolean> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!page) {
      return false;
    }

    // Check if user is owner
    if (page.ownerId === userId) {
      return true;
    }

    // Check if user is an accepted collaborator
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
   * Checks if user has permission to edit a specific section
   */
  async checkSectionPermission(
    pageId: string,
    userId: string,
    section: keyof CollaboratorPermissions
  ): Promise<boolean> {
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { ownerId: true },
    });

    if (!page) {
      return false;
    }

    // Owner has all permissions
    if (page.ownerId === userId) {
      return true;
    }

    // Check collaborator permissions
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        memorialPageId: pageId,
        userId,
        acceptedAt: { not: null },
      },
    });

    if (!collaborator) {
      return false;
    }

    const permissions = collaborator.permissions as unknown as CollaboratorPermissions;
    return permissions[section] === true;
  }

  /**
   * Gets invitation details for a specific collaborator invitation
   */
  async getInvitationDetails(
    collaboratorId: string,
    userId: string
  ): Promise<CollaboratorInvitation> {
    const invitation = await prisma.collaborator.findUnique({
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
      throw new NotFoundError('Приглашение не найдено');
    }

    // Check if the invitation is for this user
    if (invitation.userId !== userId) {
      throw new ForbiddenError('Это приглашение предназначено для другого пользователя');
    }

    return {
      id: invitation.id,
      memorialPageId: invitation.memorialPageId,
      memorialPageName: invitation.memorialPage.fullName,
      inviterName: invitation.memorialPage.owner.name,
      permissions: invitation.permissions as unknown as CollaboratorPermissions,
      invitedAt: invitation.invitedAt,
    };
  }

  /**
   * Sends notification about page changes to owner and collaborators
   */
  async notifyPageChange(
    pageId: string,
    changeMadeBy: string,
    changeType: string,
    changeDescription: string
  ): Promise<void> {
    // Get page info with owner and collaborators
    const page = await prisma.memorialPage.findUnique({
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

    // Get the user who made the change
    const changeUser = await prisma.user.findUnique({
      where: { id: changeMadeBy },
      select: { name: true },
    });

    if (!changeUser) {
      return;
    }

    // Collect all users to notify (owner + collaborators, excluding the one who made the change)
    const usersToNotify = [];

    if (page.owner.id !== changeMadeBy) {
      usersToNotify.push({
        email: page.owner.email,
        name: page.owner.name,
      });
    }

    page.collaborators.forEach((collab: any) => {
      if (collab.user.id !== changeMadeBy) {
        usersToNotify.push({
          email: collab.user.email,
          name: collab.user.name,
        });
      }
    });

    // Send notifications
    for (const user of usersToNotify) {
      try {
        await emailService.sendPageChangeNotification({
          recipientEmail: user.email,
          recipientName: user.name,
          changerName: changeUser.name,
          memorialPageName: page.fullName,
          changeType,
          changeDescription,
          memorialPageSlug: page.slug,
        });
      } catch (error) {
        console.error(`Failed to send change notification to ${user.email}:`, error);
      }
    }
  }
}

export const collaboratorService = new CollaboratorService();