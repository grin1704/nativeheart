"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugSchema = exports.pageIdSchema = exports.qrCodeOptionsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.qrCodeOptionsSchema = joi_1.default.object({
    format: joi_1.default.string().valid('png', 'svg').optional(),
    size: joi_1.default.number().integer().min(100).max(1000).optional(),
    margin: joi_1.default.number().integer().min(0).max(10).optional(),
    darkColor: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    lightColor: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});
exports.pageIdSchema = joi_1.default.object({
    pageId: joi_1.default.string().uuid().required(),
});
exports.slugSchema = joi_1.default.object({
    slug: joi_1.default.string().min(1).max(255).required(),
});
//# sourceMappingURL=qrCode.js.map