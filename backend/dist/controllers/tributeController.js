"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTributesForModeration = exports.getLikeStatus = exports.unlikeTribute = exports.likeTribute = exports.moderateTribute = exports.deleteTribute = exports.updateTribute = exports.getTributeById = exports.getTributes = exports.createTribute = void 0;
const tributeService_1 = __importDefault(require("../services/tributeService"));
const logger_1 = require("../utils/logger");
const tribute_1 = require("../validation/tribute");
const errors_1 = require("../utils/errors");
const collaboratorService_1 = require("../services/collaboratorService");
const createTribute = async (req, res, next) => {
    try {
        const { memorialPageId } = req.params;
        const { error, value } = tribute_1.createTributeSchema.validate(req.body);
        if (error) {
            throw new errors_1.ValidationError(error.details[0].message);
        }
        const tribute = await tributeService_1.default.createTribute({
            memorialPageId,
            ...value
        });
        collaboratorService_1.collaboratorService.notifyPageChange(memorialPageId, req.user?.id || '', 'Слова близких', `Оставлен новый отзыв от ${value.authorName}`, value.authorName).catch(err => logger_1.logger.warn('Failed to send tribute notification', err));
        res.status(201).json({
            success: true,
            data: tribute
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTribute = createTribute;
const getTributes = async (req, res, next) => {
    try {
        const { memorialPageId } = req.params;
        const { error, value } = tribute_1.getTributesSchema.validate(req.query);
        if (error) {
            throw new errors_1.ValidationError(error.details[0].message);
        }
        const userId = req.user?.id;
        const result = await tributeService_1.default.getTributesByMemorialPage(memorialPageId, value, userId);
        res.json({
            success: true,
            data: result.tributes,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTributes = getTributes;
const getTributeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tribute = await tributeService_1.default.getTributeById(id);
        res.json({
            success: true,
            data: tribute
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTributeById = getTributeById;
const updateTribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = tribute_1.updateTributeSchema.validate(req.body);
        if (error) {
            throw new errors_1.ValidationError(error.details[0].message);
        }
        const tribute = await tributeService_1.default.updateTribute(id, value);
        res.json({
            success: true,
            data: tribute
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTribute = updateTribute;
const deleteTribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        await tributeService_1.default.deleteTribute(id);
        res.json({
            success: true,
            message: 'Tribute deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTribute = deleteTribute;
const moderateTribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = tribute_1.moderateTributeSchema.validate(req.body);
        if (error) {
            throw new errors_1.ValidationError(error.details[0].message);
        }
        const tribute = await tributeService_1.default.moderateTribute(id, value.isApproved, value.reason);
        res.json({
            success: true,
            data: tribute
        });
    }
    catch (error) {
        next(error);
    }
};
exports.moderateTribute = moderateTribute;
const likeTribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fingerprint } = req.body;
        const userId = req.user?.id;
        const result = await tributeService_1.default.likeTribute(id, userId, fingerprint);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.likeTribute = likeTribute;
const unlikeTribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fingerprint = req.query.fingerprint;
        const userId = req.user?.id;
        const result = await tributeService_1.default.unlikeTribute(id, userId, fingerprint);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unlikeTribute = unlikeTribute;
const getLikeStatus = async (req, res, next) => {
    try {
        const { tributeIds, fingerprint } = req.body;
        const userId = req.user?.id;
        if (!Array.isArray(tributeIds)) {
            throw new errors_1.ValidationError('tributeIds must be an array');
        }
        const likedTributeIds = await tributeService_1.default.getLikedTributeIds(tributeIds, userId, fingerprint);
        res.json({
            success: true,
            data: { likedTributeIds }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLikeStatus = getLikeStatus;
const getTributesForModeration = async (req, res, next) => {
    try {
        const { error, value } = tribute_1.getTributesSchema.validate(req.query);
        if (error) {
            throw new errors_1.ValidationError(error.details[0].message);
        }
        const result = await tributeService_1.default.getTributesForModeration(value);
        res.json({
            success: true,
            data: result.tributes,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTributesForModeration = getTributesForModeration;
//# sourceMappingURL=tributeController.js.map