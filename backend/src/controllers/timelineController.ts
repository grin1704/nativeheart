import { Request, Response, NextFunction } from 'express';
import { timelineService } from '../services/timelineService';
import {
  createTimelineEventSchema,
  updateTimelineEventSchema,
  reorderTimelineEventsSchema,
} from '../validation/timeline';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';
import { checkSectionAccess } from '../utils/checkSectionAccess';
import { collaboratorService } from '../services/collaboratorService';
import { logger } from '../utils/logger';

export class TimelineController {
  /**
   * Gets all timeline events for a memorial page
   */
  async getTimelineEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { memorialPageId } = req.params;

      const events = await timelineService.getTimelineEvents(memorialPageId);

      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new timeline event
   */
  async createTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memorialPageId } = req.params;
      const { error, value } = createTimelineEventSchema.validate(req.body);

      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      // Проверяем права доступа
      await timelineService.checkEditAccess(memorialPageId, req.user!.id);
      await checkSectionAccess(memorialPageId, req.user!.id, 'timeline');

      const event = await timelineService.createTimelineEvent(memorialPageId, value);

      // Notify owner about changes
      collaboratorService.notifyPageChange(memorialPageId, req.user!.id, 'Хронология', 'Добавлено событие в хронологию').catch(err => logger.warn('Failed to send timeline notification', err));

      res.status(201).json({
        success: true,
        data: event,
        message: 'Событие успешно создано',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a timeline event
   */
  async updateTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const { error, value } = updateTimelineEventSchema.validate(req.body);

      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      // Получаем событие и проверяем права
      const existingEvent = await timelineService.getTimelineEvent(eventId);
      if (!existingEvent) {
        throw new ValidationError('Событие не найдено');
      }

      await timelineService.checkEditAccess(existingEvent.memorialPageId, req.user!.id);
      await checkSectionAccess(existingEvent.memorialPageId, req.user!.id, 'timeline');

      const event = await timelineService.updateTimelineEvent(eventId, value);

      // Notify owner about changes
      collaboratorService.notifyPageChange(existingEvent.memorialPageId, req.user!.id, 'Хронология', 'Изменено событие в хронологии').catch(err => logger.warn('Failed to send timeline notification', err));

      res.json({
        success: true,
        data: event,
        message: 'Событие успешно обновлено',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a timeline event
   */
  async deleteTimelineEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      // Получаем событие и проверяем права
      const existingEvent = await timelineService.getTimelineEvent(eventId);
      if (!existingEvent) {
        throw new ValidationError('Событие не найдено');
      }

      await timelineService.checkEditAccess(existingEvent.memorialPageId, req.user!.id);
      await checkSectionAccess(existingEvent.memorialPageId, req.user!.id, 'timeline');

      await timelineService.deleteTimelineEvent(eventId);

      res.json({
        success: true,
        message: 'Событие успешно удалено',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorders timeline events
   */
  async reorderTimelineEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memorialPageId } = req.params;
      const { error, value } = reorderTimelineEventsSchema.validate(req.body);

      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      // Проверяем права доступа
      await timelineService.checkEditAccess(memorialPageId, req.user!.id);
      await checkSectionAccess(memorialPageId, req.user!.id, 'timeline');

      const events = await timelineService.reorderTimelineEvents(memorialPageId, value.eventIds);

      res.json({
        success: true,
        data: events,
        message: 'Порядок событий успешно изменен',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const timelineController = new TimelineController();
