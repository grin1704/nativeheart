"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.burialLocationService = exports.BurialLocationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const geocodingService_1 = require("./geocodingService");
const logger_1 = require("../utils/logger");
class BurialLocationService {
    async createOrUpdateBurialLocation(memorialPageId, userId, data) {
        await this.checkEditAccess(memorialPageId, userId);
        if (data.latitude !== undefined && data.longitude !== undefined) {
            if (!geocodingService_1.geocodingService.validateCoordinates(data.latitude, data.longitude)) {
                throw new errors_1.ValidationError('Некорректные координаты');
            }
        }
        let geocodeResult = null;
        if ((!data.latitude || !data.longitude) && data.address) {
            geocodeResult = await geocodingService_1.geocodingService.geocodeAddress(data.address);
            if (geocodeResult) {
                logger_1.logger.info(`Successfully geocoded address: ${data.address}`, {
                    latitude: geocodeResult.latitude,
                    longitude: geocodeResult.longitude,
                });
            }
        }
        const burialLocationData = {
            memorialPageId,
            address: data.address,
            description: data.description || null,
            latitude: data.latitude ?? geocodeResult?.latitude ?? null,
            longitude: data.longitude ?? geocodeResult?.longitude ?? null,
            instructions: data.instructions || null,
        };
        const existingLocation = await database_1.default.burialLocation.findUnique({
            where: { memorialPageId },
        });
        let burialLocation;
        if (existingLocation) {
            burialLocation = await database_1.default.burialLocation.update({
                where: { memorialPageId },
                data: burialLocationData,
            });
        }
        else {
            burialLocation = await database_1.default.burialLocation.create({
                data: burialLocationData,
            });
        }
        return {
            ...burialLocation,
            latitude: burialLocation.latitude ? Number(burialLocation.latitude) : undefined,
            longitude: burialLocation.longitude ? Number(burialLocation.longitude) : undefined,
            geocodedAddress: geocodeResult?.formattedAddress,
        };
    }
    async getBurialLocation(memorialPageId) {
        const burialLocation = await database_1.default.burialLocation.findUnique({
            where: { memorialPageId },
        });
        if (!burialLocation) {
            return null;
        }
        return {
            ...burialLocation,
            latitude: burialLocation.latitude ? Number(burialLocation.latitude) : undefined,
            longitude: burialLocation.longitude ? Number(burialLocation.longitude) : undefined,
        };
    }
    async updateBurialLocation(memorialPageId, userId, data) {
        await this.checkEditAccess(memorialPageId, userId);
        const existingLocation = await database_1.default.burialLocation.findUnique({
            where: { memorialPageId },
        });
        if (!existingLocation) {
            throw new errors_1.NotFoundError('Место захоронения не найдено');
        }
        if (data.latitude !== undefined && data.longitude !== undefined) {
            if (data.latitude !== null && data.longitude !== null) {
                if (!geocodingService_1.geocodingService.validateCoordinates(data.latitude, data.longitude)) {
                    throw new errors_1.ValidationError('Некорректные координаты');
                }
            }
        }
        let geocodeResult = null;
        if (data.address && (!data.latitude || !data.longitude)) {
            geocodeResult = await geocodingService_1.geocodingService.geocodeAddress(data.address);
            if (geocodeResult) {
                logger_1.logger.info(`Successfully geocoded updated address: ${data.address}`, {
                    latitude: geocodeResult.latitude,
                    longitude: geocodeResult.longitude,
                });
            }
        }
        const updateData = {};
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.description !== undefined)
            updateData.description = data.description || null;
        if (data.instructions !== undefined)
            updateData.instructions = data.instructions || null;
        if (data.latitude !== undefined) {
            updateData.latitude = data.latitude;
        }
        else if (geocodeResult) {
            updateData.latitude = geocodeResult.latitude;
        }
        if (data.longitude !== undefined) {
            updateData.longitude = data.longitude;
        }
        else if (geocodeResult) {
            updateData.longitude = geocodeResult.longitude;
        }
        const updatedLocation = await database_1.default.burialLocation.update({
            where: { memorialPageId },
            data: updateData,
        });
        return {
            ...updatedLocation,
            latitude: updatedLocation.latitude ? Number(updatedLocation.latitude) : undefined,
            longitude: updatedLocation.longitude ? Number(updatedLocation.longitude) : undefined,
            geocodedAddress: geocodeResult?.formattedAddress,
        };
    }
    async deleteBurialLocation(memorialPageId, userId) {
        await this.checkEditAccess(memorialPageId, userId);
        const existingLocation = await database_1.default.burialLocation.findUnique({
            where: { memorialPageId },
        });
        if (!existingLocation) {
            throw new errors_1.NotFoundError('Место захоронения не найдено');
        }
        await database_1.default.burialLocation.delete({
            where: { memorialPageId },
        });
    }
    async geocodeAddress(address) {
        return await geocodingService_1.geocodingService.geocodeAddress(address);
    }
    async reverseGeocode(latitude, longitude) {
        if (!geocodingService_1.geocodingService.validateCoordinates(latitude, longitude)) {
            throw new errors_1.ValidationError('Некорректные координаты');
        }
        return await geocodingService_1.geocodingService.reverseGeocode(latitude, longitude);
    }
    async checkEditAccess(memorialPageId, userId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { ownerId: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const hasAccess = memorialPage.ownerId === userId || await this.isCollaborator(memorialPageId, userId);
        if (!hasAccess) {
            throw new errors_1.ForbiddenError('У вас нет прав для редактирования этой страницы');
        }
    }
    async isCollaborator(memorialPageId, userId) {
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
}
exports.BurialLocationService = BurialLocationService;
exports.burialLocationService = new BurialLocationService();
//# sourceMappingURL=burialLocationService.js.map