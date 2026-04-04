"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorialPageController = exports.MemorialPageController = void 0;
const memorialPageService_1 = require("../services/memorialPageService");
const memorialPage_1 = require("../validation/memorialPage");
const errors_1 = require("../utils/errors");
class MemorialPageController {
    async createMemorialPage(req, res, next) {
        try {
            const { error, value } = memorialPage_1.createMemorialPageSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const memorialPage = await memorialPageService_1.memorialPageService.createMemorialPage(req.user.id, value);
            res.status(201).json({
                success: true,
                data: memorialPage,
                message: 'Памятная страница успешно создана',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMemorialPageById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const memorialPage = await memorialPageService_1.memorialPageService.getMemorialPageById(id, userId);
            res.json({
                success: true,
                data: memorialPage,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMemorialPageBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const userId = req.user?.id;
            const memorialPage = await memorialPageService_1.memorialPageService.getMemorialPageBySlug(slug, userId);
            res.json({
                success: true,
                data: memorialPage,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemorialPage(req, res, next) {
        try {
            const { id } = req.params;
            const { error, value } = memorialPage_1.updateMemorialPageSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const memorialPage = await memorialPageService_1.memorialPageService.updateMemorialPage(id, req.user.id, value);
            res.json({
                success: true,
                data: memorialPage,
                message: 'Памятная страница успешно обновлена',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMemorialPage(req, res, next) {
        try {
            const { id } = req.params;
            await memorialPageService_1.memorialPageService.deleteMemorialPage(id, req.user.id);
            res.json({
                success: true,
                message: 'Памятная страница успешно удалена',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserMemorialPages(req, res, next) {
        try {
            const { error, value } = memorialPage_1.memorialPageQuerySchema.validate(req.query);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const result = await memorialPageService_1.memorialPageService.getUserMemorialPages(req.user.id, value);
            res.json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyPagePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { error, value } = memorialPage_1.passwordAccessSchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const isValid = await memorialPageService_1.memorialPageService.verifyPagePassword(id, value.password);
            res.json({
                success: true,
                data: { isValid },
                message: isValid ? 'Пароль верный' : 'Неверный пароль',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async clearPasswordAccess(req, res, next) {
        try {
            const { id } = req.params;
            res.json({
                success: true,
                message: 'Доступ к странице отозван'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPasswordAccessStatus(req, res, next) {
        try {
            const { id } = req.params;
            res.json({
                success: true,
                data: { hasAccess: false }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBiography(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const biography = await memorialPageService_1.memorialPageService.getBiography(id, userId);
            res.json({
                success: true,
                data: biography,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBiography(req, res, next) {
        try {
            const { id } = req.params;
            const { error, value } = memorialPage_1.updateBiographySchema.validate(req.body);
            if (error) {
                throw new errors_1.ValidationError(error.details[0].message);
            }
            const biography = await memorialPageService_1.memorialPageService.updateBiography(id, req.user.id, value);
            res.json({
                success: true,
                data: biography,
                message: 'Биография успешно обновлена',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addBiographyPhoto(req, res, next) {
        try {
            const { id, photoId } = req.params;
            await memorialPageService_1.memorialPageService.addBiographyPhoto(id, req.user.id, photoId);
            res.json({
                success: true,
                message: 'Фотография добавлена в биографию',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeBiographyPhoto(req, res, next) {
        try {
            const { id, photoId } = req.params;
            await memorialPageService_1.memorialPageService.removeBiographyPhoto(id, req.user.id, photoId);
            res.json({
                success: true,
                message: 'Фотография удалена из биографии',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async reorderBiographyPhotos(req, res, next) {
        try {
            const { id } = req.params;
            const { photoIds } = req.body;
            if (!Array.isArray(photoIds)) {
                throw new errors_1.ValidationError('photoIds должен быть массивом');
            }
            await memorialPageService_1.memorialPageService.reorderBiographyPhotos(id, req.user.id, photoIds);
            res.json({
                success: true,
                message: 'Порядок фотографий обновлен',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MemorialPageController = MemorialPageController;
exports.memorialPageController = new MemorialPageController();
//# sourceMappingURL=memorialPageController.js.map