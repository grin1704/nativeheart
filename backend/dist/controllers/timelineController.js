"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineController = exports.TimelineController = void 0;
const timelineService_1 = require("../services/timelineService");
const timeline_1 = require("../validation/timeline");
const errors_1 = require("../utils/errors");
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
            const event = await timelineService_1.timelineService.createTimelineEvent(memorialPageId, value);
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
            const event = await timelineService_1.timelineService.updateTimelineEvent(eventId, value);
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