"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineController = exports.TimelineController = void 0;
const timelineService_1 = require("../services/timelineService");
const timeline_1 = require("../validation/timeline");
const errors_1 = require("../utils/errors");
const checkSectionAccess_1 = require("../utils/checkSectionAccess");
const collaboratorService_1 = require("../services/collaboratorService");
const logger_1 = require("../utils/logger");
class TimelineController {
    async getTimelineEvents(req, res, next) {
        try {
            const { memorialPageId } = req.params;
            const events = await timelineService_1.timelineService.getTimelineEvents(memorialPageId);
            res.json({
                success: true,
                data: events,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createTimelineEvent(req, res, next) {
        try {
            const { memorialPageId } = req.params;
            const { error, value } = timeline_1.createTimelineEventSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            await timelineService_1.timelineService.checkEditAccess(memorialPageId, req.user.id);
            await (0, checkSectionAccess_1.checkSectionAccess)(memorialPageId, req.user.id, 'timeline');
            const event = await timelineService_1.timelineService.createTimelineEvent(memorialPageId, value);
            collaboratorService_1.collaboratorService.notifyPageChange(memorialPageId, req.user.id, 'Хронология', 'Добавлено событие в хронологию').catch(err => logger_1.logger.warn('Failed to send timeline notification', err));
            res.status(201).json({
                success: true,
                data: event,
                message: 'Событие успешно создано',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTimelineEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const { error, value } = timeline_1.updateTimelineEventSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const existingEvent = await timelineService_1.timelineService.getTimelineEvent(eventId);
            if (!existingEvent) {
                throw new errors_1.ValidationError('Событие не найдено');
            }
            await timelineService_1.timelineService.checkEditAccess(existingEvent.memorialPageId, req.user.id);
            await (0, checkSectionAccess_1.checkSectionAccess)(existingEvent.memorialPageId, req.user.id, 'timeline');
            const event = await timelineService_1.timelineService.updateTimelineEvent(eventId, value);
            collaboratorService_1.collaboratorService.notifyPageChange(existingEvent.memorialPageId, req.user.id, 'Хронология', 'Изменено событие в хронологии').catch(err => logger_1.logger.warn('Failed to send timeline notification', err));
            res.json({
                success: true,
                data: event,
                message: 'Событие успешно обновлено',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTimelineEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const existingEvent = await timelineService_1.timelineService.getTimelineEvent(eventId);
            if (!existingEvent) {
                throw new errors_1.ValidationError('Событие не найдено');
            }
            await timelineService_1.timelineService.checkEditAccess(existingEvent.memorialPageId, req.user.id);
            await (0, checkSectionAccess_1.checkSectionAccess)(existingEvent.memorialPageId, req.user.id, 'timeline');
            await timelineService_1.timelineService.deleteTimelineEvent(eventId);
            res.json({
                success: true,
                message: 'Событие успешно удалено',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async reorderTimelineEvents(req, res, next) {
        try {
            const { memorialPageId } = req.params;
            const { error, value } = timeline_1.reorderTimelineEventsSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            await timelineService_1.timelineService.checkEditAccess(memorialPageId, req.user.id);
            await (0, checkSectionAccess_1.checkSectionAccess)(memorialPageId, req.user.id, 'timeline');
            const events = await timelineService_1.timelineService.reorderTimelineEvents(memorialPageId, value.eventIds);
            res.json({
                success: true,
                data: events,
                message: 'Порядок событий успешно изменен',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TimelineController = TimelineController;
exports.timelineController = new TimelineController();
//# sourceMappingURL=timelineController.js.map