import { Request, Response } from 'express';
import { burialLocationService } from '../services/burialLocationService';
import { validateRequest } from '../middleware/validation';
import { 
  createBurialLocationSchema, 
  updateBurialLocationSchema,
  geocodeAddressSchema 
} from '../validation/burialLocation';
import { AuthenticatedRequest } from '../types/auth';

export class BurialLocationController {
  /**
   * Creates or updates burial location for a memorial page
   * POST /api/memorial-pages/:pageId/burial-location
   */
  async createOrUpdateBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user!.id;

      // Validate request body
      const { error, value } = createBurialLocationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const burialLocation = await burialLocationService.createOrUpdateBurialLocation(
        pageId,
        userId,
        value
      );

      res.status(200).json({
        success: true,
        message: 'Место захоронения успешно сохранено',
        data: burialLocation,
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Gets burial location for a memorial page
   * GET /api/memorial-pages/:pageId/burial-location
   */
  async getBurialLocation(req: Request, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;

      const burialLocation = await burialLocationService.getBurialLocation(pageId);

      if (!burialLocation) {
        res.status(404).json({
          success: false,
          message: 'Место захоронения не найдено',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: burialLocation,
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Updates burial location for a memorial page
   * PUT /api/memorial-pages/:pageId/burial-location
   */
  async updateBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user!.id;

      // Validate request body
      const { error, value } = updateBurialLocationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const burialLocation = await burialLocationService.updateBurialLocation(
        pageId,
        userId,
        value
      );

      res.status(200).json({
        success: true,
        message: 'Место захоронения успешно обновлено',
        data: burialLocation,
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Deletes burial location for a memorial page
   * DELETE /api/memorial-pages/:pageId/burial-location
   */
  async deleteBurialLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user!.id;

      await burialLocationService.deleteBurialLocation(pageId, userId);

      res.status(200).json({
        success: true,
        message: 'Место захоронения успешно удалено',
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Geocodes an address to get coordinates
   * POST /api/geocode
   */
  async geocodeAddress(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = geocodeAddressSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors: error.details.map(detail => detail.message),
        });
        return;
      }

      const result = await burialLocationService.geocodeAddress(value.address);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Не удалось найти координаты для указанного адреса',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }

  /**
   * Reverse geocodes coordinates to get address
   * POST /api/reverse-geocode
   */
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Широта и долгота должны быть числами',
        });
        return;
      }

      const address = await burialLocationService.reverseGeocode(latitude, longitude);

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Не удалось найти адрес для указанных координат',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { address },
      });
    } catch (error) {
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
      });
    }
  }
}

export const burialLocationController = new BurialLocationController();