import { Request, Response, NextFunction } from 'express';
import { memoryService } from '../services/memoryService';
import { 
  createMemorySchema, 
  updateMemorySchema, 
  memoryQuerySchema 
} from '../validation/memory';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';

export class MemoryController {
  /**
   * Creates a new memory for a memorial page
   */
  async createMemory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memorialPageId } = req.params;
      const { error, value } = createMemorySchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const memory = await memoryService.createMemory(
        memorialPageId,
        req.user!.id,
        value
      );

      res.status(201).json({
        success: true,
        data: memory,
        message: 'Воспоминание успешно создано',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets memories for a memorial page
   */
  async getMemoriesForPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { memorialPageId } = req.params;
      const { error, value } = memoryQuerySchema.validate(req.query);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      // Get user ID from auth if available
      const userId = (req as AuthenticatedRequest).user?.id;

      const memories = await memoryService.getMemoriesForPage(
        memorialPageId,
        userId,
        value
      );

      res.json({
        success: true,
        data: memories.data,
        pagination: memories.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a specific memory by ID
   */
  async getMemoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { memoryId } = req.params;

      const memory = await memoryService.getMemoryById(memoryId);

      res.json({
        success: true,
        data: memory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a memory
   */
  async updateMemory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memoryId } = req.params;
      const { error, value } = updateMemorySchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const memory = await memoryService.updateMemory(
        memoryId,
        req.user!.id,
        value
      );

      res.json({
        success: true,
        data: memory,
        message: 'Воспоминание успешно обновлено',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a memory
   */
  async deleteMemory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memoryId } = req.params;

      await memoryService.deleteMemory(memoryId, req.user!.id);

      res.json({
        success: true,
        message: 'Воспоминание успешно удалено',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a photo to a memory
   */
  async addPhotoToMemory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memoryId } = req.params;
      const { photoId } = req.body;

      if (!photoId) {
        throw new ValidationError('ID фотографии обязателен');
      }

      await memoryService.addPhotoToMemory(memoryId, req.user!.id, photoId);

      res.json({
        success: true,
        message: 'Фотография успешно добавлена к воспоминанию',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes a photo from a memory
   */
  async removePhotoFromMemory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memoryId, photoId } = req.params;

      await memoryService.removePhotoFromMemory(memoryId, req.user!.id, photoId);

      res.json({
        success: true,
        message: 'Фотография успешно удалена из воспоминания',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorders photos in a memory
   */
  async reorderMemoryPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memoryId } = req.params;
      const { photoIds } = req.body;

      if (!Array.isArray(photoIds)) {
        throw new ValidationError('photoIds должен быть массивом');
      }

      await memoryService.reorderMemoryPhotos(memoryId, req.user!.id, photoIds);

      res.json({
        success: true,
        message: 'Порядок фотографий успешно изменен',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const memoryController = new MemoryController();