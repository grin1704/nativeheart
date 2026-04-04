"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateCollaboratorPermissionsSchema = exports.inviteCollaboratorSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const permissionsSchema = joi_1.default.object({
    basicInfo: joi_1.default.boolean().default(true),
    biography: joi_1.default.boolean().default(true),
    gallery: joi_1.default.boolean().default(true),
    memories: joi_1.default.boolean().default(true),
    timeline: joi_1.default.boolean().default(true),
    tributes: joi_1.default.boolean().default(true),
    burialLocation: joi_1.default.boolean().default(true),
});
exports.inviteCollaboratorSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Введите корректный email адрес',
        'any.required': 'Email обязателен для заполнения'
    }),
    permissions: permissionsSchema.default({
        basicInfo: true,
        biography: true,
        gallery: true,
        memories: true,
        timeline: true,
        tributes: true,
        burialLocation: true,
    })
});
exports.updateCollaboratorPermissionsSchema = joi_1.default.object({
    permissions: permissionsSchema.required()
        .messages({
        'any.required': 'Права доступа обязательны для заполнения'
    })
});
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        'number.base': 'Номер страницы должен быть числом',
        'number.integer': 'Номер страницы должен быть целым числом',
        'number.min': 'Номер страницы должен быть больше 0'
    }),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
        'number.base': 'Лимит должен быть числом',
        'number.integer': 'Лимит должен быть целым числом',
        'number.min': 'Лимит должен быть больше 0',
        'number.max': 'Лимит не может быть больше 100'
    })
});
//# sourceMappingURL=collaborator.js.map