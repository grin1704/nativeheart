"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryController = exports.MemoryController = void 0;
const memoryService_1 = require("../services/memoryService");
const memory_1 = require("../validation/memory");
const errors_1 = require("../utils/errors");
class MemoryController {
    async createMemory(req, res, next) {
        try {
            const { memorialPageId } = req.params;
            const { error, value } = memory_1.createMemorySchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const memory = await memoryService_1.memoryService.createMemory(memorialPageId, req.user.id, value);
            res.status(201).json({
                success: true,
                data: memory,
                message: 'Воспоминание успешно создано',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMemoriesForPage(req, res, next) {
        try {
            const { memorialPageId } = req.params;
            const { error, value } = memory_1.memoryQuerySchema.validate(req.query);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const userId = req.user?.id;
            const memories = await memoryService_1.memoryService.getMemoriesForPage(memorialPageId, userId, value);
            res.json({
                success: true,
                data: memories.data,
                pagination: memories.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMemoryById(req, res, next) {
        try {
            const { memoryId } = req.params;
            const memory = await memoryService_1.memoryService.getMemoryById(memoryId);
            res.json({
                success: true,
                data: memory,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemory(req, res, next) {
        try {
            const { memoryId } = req.params;
            const { error, value } = memory_1.updateMemorySchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const memory = await memoryService_1.memoryService.updateMemory(memoryId, req.user.id, value);
            res.json({
                success: true,
                data: memory,
                message: 'Воспоминание успешно обновлено',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMemory(req, res, next) {
        try {
            const { memoryId } = req.params;
            await memoryService_1.memoryService.deleteMemory(memoryId, req.user.id);
            res.json({
                success: true,
                message: 'Воспоминание успешно удалено',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addPhotoToMemory(req, res, next) {
        try {
            const { memoryId } = req.params;
            const { photoId } = req.body;
            if (!photoId) {
                throw new errors_1.ValidationError('ID фотографии обязателен');
            }
            await memoryService_1.memoryService.addPhotoToMemory(memoryId, req.user.id, photoId);
            res.json({
                success: true,
                message: 'Фотография успешно добавлена к воспоминанию',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removePhotoFromMemory(req, res, next) {
        try {
            const { memoryId, photoId } = req.params;
            await memoryService_1.memoryService.removePhotoFromMemory(memoryId, req.user.id, photoId);
            res.json({
                success: true,
                message: 'Фотография успешно удалена из воспоминания',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async reorderMemoryPhotos(req, res, next) {
        try {
            const { memoryId } = req.params;
            const { photoIds } = req.body;
            if (!Array.isArray(photoIds)) {
                throw new errors_1.ValidationError('photoIds должен быть массивом');
            }
            await memoryService_1.memoryService.reorderMemoryPhotos(memoryId, req.user.id, photoIds);
            res.json({
                success: true,
                message: 'Порядок фотографий успешно изменен',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MemoryController = MemoryController;
exports.memoryController = new MemoryController();
//# sourceMappingURL=memoryController.js.map