"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateTributeSchema = exports.getTributesSchema = exports.updateTributeSchema = exports.createTributeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createTributeSchema = joi_1.default.object({
    authorName: joi_1.default.string().min(1).max(255).required(),
    authorEmail: joi_1.default.string().email().optional(),
    text: joi_1.default.string().min(1).max(5000).required(),
    photoId: joi_1.default.string().uuid().optional()
});
exports.updateTributeSchema = joi_1.default.object({
    authorName: joi_1.default.string().min(1).max(255).optional(),
    authorEmail: joi_1.default.string().email().optional(),
    text: joi_1.default.string().min(1).max(5000).optional(),
    photoId: joi_1.default.string().uuid().optional(),
    isApproved: joi_1.default.boolean().optional()
});
exports.getTributesSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    approved: joi_1.default.alternatives().try(joi_1.default.boolean(), joi_1.default.string().valid('all')).optional()
});
exports.moderateTributeSchema = joi_1.default.object({
    isApproved: joi_1.default.boolean().required(),
    reason: joi_1.default.string().max(500).optional()
});
//# sourceMappingURL=tribute.js.map