"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddressSchema = exports.updateBurialLocationSchema = exports.createBurialLocationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createBurialLocationSchema = joi_1.default.object({
    address: joi_1.default.string().required().min(1).max(1000).messages({
        'string.empty': 'Адрес обязателен для заполнения',
        'string.min': 'Адрес не может быть пустым',
        'string.max': 'Адрес не может превышать 1000 символов',
        'any.required': 'Адрес обязателен для заполнения',
    }),
    description: joi_1.default.string().optional().allow('').max(2000).messages({
        'string.max': 'Описание не может превышать 2000 символов',
    }),
    latitude: joi_1.default.number().optional().min(-90).max(90).messages({
        'number.min': 'Широта должна быть между -90 и 90',
        'number.max': 'Широта должна быть между -90 и 90',
    }),
    longitude: joi_1.default.number().optional().min(-180).max(180).messages({
        'number.min': 'Долгота должна быть между -180 и 180',
        'number.max': 'Долгота должна быть между -180 и 180',
    }),
    instructions: joi_1.default.string().optional().allow('').max(2000).messages({
        'string.max': 'Инструкции не могут превышать 2000 символов',
    }),
});
exports.updateBurialLocationSchema = joi_1.default.object({
    address: joi_1.default.string().optional().min(1).max(1000).messages({
        'string.empty': 'Адрес не может быть пустым',
        'string.min': 'Адрес не может быть пустым',
        'string.max': 'Адрес не может превышать 1000 символов',
    }),
    description: joi_1.default.string().optional().allow('').max(2000).messages({
        'string.max': 'Описание не может превышать 2000 символов',
    }),
    latitude: joi_1.default.number().optional().allow(null).min(-90).max(90).messages({
        'number.min': 'Широта должна быть между -90 и 90',
        'number.max': 'Широта должна быть между -90 и 90',
    }),
    longitude: joi_1.default.number().optional().allow(null).min(-180).max(180).messages({
        'number.min': 'Долгота должна быть между -180 и 180',
        'number.max': 'Долгота должна быть между -180 и 180',
    }),
    instructions: joi_1.default.string().optional().allow('').max(2000).messages({
        'string.max': 'Инструкции не могут превышать 2000 символов',
    }),
});
exports.geocodeAddressSchema = joi_1.default.object({
    address: joi_1.default.string().required().min(1).max(1000).messages({
        'string.empty': 'Адрес обязателен для заполнения',
        'string.min': 'Адрес не может быть пустым',
        'string.max': 'Адрес не может превышать 1000 символов',
        'any.required': 'Адрес обязателен для заполнения',
    }),
});
//# sourceMappingURL=burialLocation.js.map