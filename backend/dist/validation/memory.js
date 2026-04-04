"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryQuerySchema = exports.updateMemorySchema = exports.createMemorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createMemorySchema = joi_1.default.object({
    date: joi_1.default.date().required().messages({
        'date.base': 'Дата должна быть корректной',
        'any.required': 'Дата обязательна для заполнения',
    }),
    title: joi_1.default.string().min(1).max(255).required().messages({
        'string.empty': 'Заголовок не может быть пустым',
        'string.max': 'Заголовок не может превышать 255 символов',
        'any.required': 'Заголовок обязателен для заполнения',
    }),
    description: joi_1.default.string().max(5000).optional().allow('').messages({
        'string.max': 'Описание не может превышать 5000 символов',
    }),
    photoIds: joi_1.default.array().items(joi_1.default.string().uuid()).max(20).optional().messages({
        'array.max': 'Можно прикрепить не более 20 фотографий',
        'string.guid': 'Некорректный ID фотографии',
    }),
});
exports.updateMemorySchema = joi_1.default.object({
    date: joi_1.default.date().optional().messages({
        'date.base': 'Дата должна быть корректной',
    }),
    title: joi_1.default.string().min(1).max(255).optional().messages({
        'string.empty': 'Заголовок не может быть пустым',
        'string.max': 'Заголовок не может превышать 255 символов',
    }),
    description: joi_1.default.string().max(5000).optional().allow('').messages({
        'string.max': 'Описание не может превышать 5000 символов',
    }),
    photoIds: joi_1.default.array().items(joi_1.default.string().uuid()).max(20).optional().messages({
        'array.max': 'Можно прикрепить не более 20 фотографий',
        'string.guid': 'Некорректный ID фотографии',
    }),
});
exports.memoryQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1).messages({
        'number.base': 'Номер страницы должен быть числом',
        'number.integer': 'Номер страницы должен быть целым числом',
        'number.min': 'Номер страницы должен быть больше 0',
    }),
    limit: joi_1.default.number().integer().min(1).max(100).default(20).messages({
        'number.base': 'Лимит должен быть числом',
        'number.integer': 'Лимит должен быть целым числом',
        'number.min': 'Лимит должен быть больше 0',
        'number.max': 'Лимит не может превышать 100',
    }),
    sortBy: joi_1.default.string().valid('date', 'createdAt').default('date').messages({
        'any.only': 'Сортировка возможна только по дате или времени создания',
    }),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc').messages({
        'any.only': 'Порядок сортировки может быть только asc или desc',
    }),
});
//# sourceMappingURL=memory.js.map