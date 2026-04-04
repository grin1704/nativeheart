"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.burialLocationController = exports.BurialLocationController = void 0;
const burialLocationService_1 = require("../services/burialLocationService");
const burialLocation_1 = require("../validation/burialLocation");
class BurialLocationController {
    async createOrUpdateBurialLocation(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user.id;
            const { error, value } = burialLocation_1.createBurialLocationSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Ошибка валидации данных',
                    errors: error.details.map(detail => detail.message),
                });
                return;
            }
            const burialLocation = await burialLocationService_1.burialLocationService.createOrUpdateBurialLocation(pageId, userId, value);
            res.status(200).json({
                success: true,
                message: 'Место захоронения успешно сохранено',
                data: burialLocation,
            });
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
    async getBurialLocation(req, res) {
        try {
            const { pageId } = req.params;
            const burialLocation = await burialLocationService_1.burialLocationService.getBurialLocation(pageId);
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
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
    async updateBurialLocation(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user.id;
            const { error, value } = burialLocation_1.updateBurialLocationSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Ошибка валидации данных',
                    errors: error.details.map(detail => detail.message),
                });
                return;
            }
            const burialLocation = await burialLocationService_1.burialLocationService.updateBurialLocation(pageId, userId, value);
            res.status(200).json({
                success: true,
                message: 'Место захоронения успешно обновлено',
                data: burialLocation,
            });
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
    async deleteBurialLocation(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user.id;
            await burialLocationService_1.burialLocationService.deleteBurialLocation(pageId, userId);
            res.status(200).json({
                success: true,
                message: 'Место захоронения успешно удалено',
            });
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
    async geocodeAddress(req, res) {
        try {
            const { error, value } = burialLocation_1.geocodeAddressSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Ошибка валидации данных',
                    errors: error.details.map(detail => detail.message),
                });
                return;
            }
            const result = await burialLocationService_1.burialLocationService.geocodeAddress(value.address);
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
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
    async reverseGeocode(req, res) {
        try {
            const { latitude, longitude } = req.body;
            if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                res.status(400).json({
                    success: false,
                    message: 'Широта и долгота должны быть числами',
                });
                return;
            }
            const address = await burialLocationService_1.burialLocationService.reverseGeocode(latitude, longitude);
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
        }
        catch (error) {
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера',
            });
        }
    }
}
exports.BurialLocationController = BurialLocationController;
exports.burialLocationController = new BurialLocationController();
//# sourceMappingURL=burialLocationController.js.map