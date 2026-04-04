"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTributesForModeration = exports.moderateTribute = exports.deleteTribute = exports.updateTribute = exports.getTributeById = exports.getTributes = exports.createTribute = void 0;
const tributeService_1 = __importDefault(require("../services/tributeService"));
const tribute_1 = require("../validation/tribute");
const errors_1 = require("../utils/errors");
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