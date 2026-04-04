import { Request, Response } from 'express';
import { collaboratorService } from '../services/collaboratorService';
import { 
  inviteCollaboratorSchema, 
  updateCollaboratorPermissionsSchema,
  paginationSchema 
} from '../validation/collaborator';

export class CollaboratorController {
  /**
   * Invites a collaborator to a memorial page
   */
  async inviteCollaborator(req: Request, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user!.id;
      
      // Validate request body
      const { error } = inviteCollaboratorSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details.map((detail: any) => detail.message).join(', ')
        });
        return;
      }
      
      const collaborator = await collaboratorService.inviteCollaborator(
        pageId,
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Приглашение отправлено',
        data: collaborator,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Accepts a collaborator invitation
   */
  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { collaboratorId } = req.params;
      const userId = req.user!.id;

      const collaborator = await collaboratorService.acceptInvitation(
        collaboratorId,
        userId
      );

      res.json({
        success: true,
        message: 'Приглашение принято',
        data: collaborator,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Declines a collaborator invitation
   */
  async declineInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { collaboratorId } = req.params;
      const userId = req.user!.id;

      await collaboratorService.declineInvitation(collaboratorId, userId);

      res.json({
        success: true,
        message: 'Приглашение отклонено',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Removes a collaborator from a memorial page
   */
  async removeCollaborator(req: Request, res: Response): Promise<void> {
    try {
      const { pageId, collaboratorId } = req.params;
      const userId = req.user!.id;

      await collaboratorService.removeCollaborator(
        pageId,
        collaboratorId,
        userId
      );

      res.json({
        success: true,
        message: 'Соавтор удален',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Gets all collaborators for a memorial page
   */
  async getPageCollaborators(req: Request, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user!.id;
      
      // Validate query parameters
      const { error } = paginationSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details.map((detail: any) => detail.message).join(', ')
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await collaboratorService.getPageCollaborators(
        pageId,
        userId,
        { page, limit }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Gets pending invitations for the current user
   */
  async getUserPendingInvitations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Validate query parameters
      const { error } = paginationSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details.map((detail: any) => detail.message).join(', ')
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await collaboratorService.getUserPendingInvitations(
        userId,
        { page, limit }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Gets pages where user is a collaborator
   */
  async getUserCollaboratorPages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Validate query parameters
      const { error } = paginationSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details.map((detail: any) => detail.message).join(', ')
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await collaboratorService.getUserCollaboratorPages(
        userId,
        { page, limit }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Updates collaborator permissions (owner only)
   */
  async updateCollaboratorPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { pageId, collaboratorId } = req.params;
      const userId = req.user!.id;
      
      // Validate request body
      const { error } = updateCollaboratorPermissionsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details.map((detail: any) => detail.message).join(', ')
        });
        return;
      }

      const collaborator = await collaboratorService.updateCollaboratorPermissions(
        pageId,
        collaboratorId,
        req.body.permissions,
        userId
      );

      res.json({
        success: true,
        message: 'Права соавтора обновлены',
        data: collaborator,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Gets a specific collaborator invitation details
   */
  async getInvitationDetails(req: Request, res: Response): Promise<void> {
    try {
      const { collaboratorId } = req.params;
      const userId = req.user!.id;

      const invitation = await collaboratorService.getInvitationDetails(
        collaboratorId,
        userId
      );

      res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
      });
    }
  }
}

export const collaboratorController = new CollaboratorController();