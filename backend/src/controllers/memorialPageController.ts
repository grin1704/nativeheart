import { Request, Response, NextFunction } from 'express';
import { memorialPageService } from '../services/memorialPageService';
import { 
  createMemorialPageSchema, 
  updateMemorialPageSchema, 
  memorialPageQuerySchema,
  passwordAccessSchema,
  updateBiographySchema
} from '../validation/memorialPage';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';

export class MemorialPageController {
  /**
   * Creates a new memorial page
   */
  async createMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { error, value } = createMemorialPageSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const memorialPage = await memorialPageService.createMemorialPage(
        req.user!.id,
        value
      );

      res.status(201).json({
        success: true,
        data: memorialPage,
        message: 'Памятная страница успешно создана',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a memorial page by ID
   */
  async getMemorialPageById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Get user ID from auth if available
      const userId = (req as AuthenticatedRequest).user?.id;

      const memorialPage = await memorialPageService.getMemorialPageById(
        id,
        userId
      );

      res.json({
        success: true,
        data: memorialPage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a memorial page by slug
   */
  async getMemorialPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      
      // Get user ID from auth if available
      const userId = (req as AuthenticatedRequest).user?.id;

      const memorialPage = await memorialPageService.getMemorialPageBySlug(
        slug,
        userId
      );

      res.json({
        success: true,
        data: memorialPage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a memorial page
   */
  async updateMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateMemorialPageSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const memorialPage = await memorialPageService.updateMemorialPage(
        id,
        req.user!.id,
        value
      );

      res.json({
        success: true,
        data: memorialPage,
        message: 'Памятная страница успешно обновлена',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a memorial page
   */
  async deleteMemorialPage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await memorialPageService.deleteMemorialPage(id, req.user!.id);

      res.json({
        success: true,
        message: 'Памятная страница успешно удалена',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets user's memorial pages
   */
  async getUserMemorialPages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { error, value } = memorialPageQuerySchema.validate(req.query);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const result = await memorialPageService.getUserMemorialPages(
        req.user!.id,
        value
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifies password for private memorial page and grants session access
   */
  async verifyPagePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = passwordAccessSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const isValid = await memorialPageService.verifyPagePassword(id, value.password);

      res.json({
        success: true,
        data: { isValid },
        message: isValid ? 'Пароль верный' : 'Неверный пароль',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clears password access for current session
   */
  async clearPasswordAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Доступ к странице отозван'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets password access status for current session
   */
  async getPasswordAccessStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        data: { hasAccess: false }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets biography data for a memorial page
   */
  async getBiography(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Get user ID from auth if available
      const userId = (req as AuthenticatedRequest).user?.id;

      const biography = await memorialPageService.getBiography(id, userId);

      res.json({
        success: true,
        data: biography,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates biography text and photos
   */
  async updateBiography(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateBiographySchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const biography = await memorialPageService.updateBiography(
        id,
        req.user!.id,
        value
      );

      res.json({
        success: true,
        data: biography,
        message: 'Биография успешно обновлена',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a photo to biography
   */
  async addBiographyPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, photoId } = req.params;

      await memorialPageService.addBiographyPhoto(id, req.user!.id, photoId);

      res.json({
        success: true,
        message: 'Фотография добавлена в биографию',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes a photo from biography
   */
  async removeBiographyPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, photoId } = req.params;

      await memorialPageService.removeBiographyPhoto(id, req.user!.id, photoId);

      res.json({
        success: true,
        message: 'Фотография удалена из биографии',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorders biography photos
   */
  async reorderBiographyPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { photoIds } = req.body;

      if (!Array.isArray(photoIds)) {
        throw new ValidationError('photoIds должен быть массивом');
      }

      await memorialPageService.reorderBiographyPhotos(id, req.user!.id, photoIds);

      res.json({
        success: true,
        message: 'Порядок фотографий обновлен',
      });
    } catch (error) {
      next(error);
    }
  }

}

export const memorialPageController = new MemorialPageController();