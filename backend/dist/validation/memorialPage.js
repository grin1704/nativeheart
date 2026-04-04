"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBiographySchema = exports.passwordAccessSchema = exports.memorialPageQuerySchema = exports.updateMemorialPageSchema = exports.createMemorialPageSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createMemorialPageSchema = joi_1.default.object({
    fullName: joi_1.default.string()
        .min(2)
        .max(255)
        .required()
        .messages({
        'string.empty': 'Полное имя обязательно для заполнения',
        'string.min': 'Полное имя должно содержать минимум 2 символа',
        'string.max': 'Полное имя не должно превышать 255 символов',
    }),
    birthDate: joi_1.default.date()
        .iso()
        .max('now')
        .required()
        .messages({
        'date.base': 'Дата рождения должна быть корректной датой',
        'date.max': 'Дата рождения не может быть в будущем',
        'any.required': 'Дата рождения обязательна для заполнения',
    }),
    deathDate: joi_1.default.date()
        .iso()
        .max('now')
        .greater(joi_1.default.ref('birthDate'))
        .required()
        .messages({
        'date.base': 'Дата смерти должна быть корректной датой',
        'date.max': 'Дата смерти не может быть в будущем',
        'date.greater': 'Дата смерти должна быть позже даты рождения',
        'any.required': 'Дата смерти обязательна для заполнения',
    }),
    mainPhotoId: joi_1.default.string()
        .uuid()
        .optional()
        .messages({
        'string.guid': 'ID главного фото должно быть корректным UUID',
    }),
    biographyText: joi_1.default.string()
        .max(50000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
    isPrivate: joi_1.default.boolean()
        .default(false)
        .messages({
        'boolean.base': 'Приватность должна быть булевым значением',
    }),
    password: joi_1.default.string()
        .min(4)
        .max(50)
        .when('isPrivate', {
        is: true,
        then: joi_1.default.required(),
        otherwise: joi_1.default.forbidden(),
    })
        .messages({
        'string.min': 'Пароль должен содержать минимум 4 символа',
        'string.max': 'Пароль не должен превышать 50 символов',
        'any.required': 'Пароль обязателен для приватных страниц',
        'any.unknown': 'Пароль можно указать только для приватных страниц',
    }),
});
exports.updateMemorialPageSchema = joi_1.default.object({
    fullName: joi_1.default.string()
        .min(2)
        .max(255)
        .optional()
        .messages({
        'string.min': 'Полное имя должно содержать минимум 2 символа',
        'string.max': 'Полное имя не должно превышать 255 символов',
    }),
    birthDate: joi_1.default.date()
        .iso()
        .max('now')
        .optional()
        .messages({
        'date.base': 'Дата рождения должна быть корректной датой',
        'date.max': 'Дата рождения не может быть в будущем',
    }),
    deathDate: joi_1.default.date()
        .iso()
        .max('now')
        .optional()
        .messages({
        'date.base': 'Дата смерти должна быть корректной датой',
        'date.max': 'Дата смерти не может быть в будущем',
    }),
    mainPhotoId: joi_1.default.string()
        .uuid()
        .optional()
        .allow(null)
        .messages({
        'string.guid': 'ID главного фото должно быть корректным UUID',
    }),
    biographyText: joi_1.default.string()
        .max(50000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
    isPrivate: joi_1.default.boolean()
        .optional()
        .messages({
        'boolean.base': 'Приватность должна быть булевым значением',
    }),
    password: joi_1.default.string()
        .min(4)
        .max(50)
        .optional()
        .allow('')
        .messages({
        'string.min': 'Пароль должен содержать минимум 4 символа',
        'string.max': 'Пароль не должен превышать 50 символов',
    }),
}).custom((value, helpers) => {
    if (value.birthDate && value.deathDate && new Date(value.deathDate) <= new Date(value.birthDate)) {
        return helpers.error('custom.dateOrder');
    }
    return value;
}).messages({
    'custom.dateOrder': 'Дата смерти должна быть позже даты рождения',
});
exports.memorialPageQuerySchema = joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        'number.base': 'Номер страницы должен быть числом',
        'number.integer': 'Номер страницы должен быть целым числом',
        'number.min': 'Номер страницы должен быть больше 0',
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
        'number.max': 'Лимит не должен превышать 100',
    }),
    search: joi_1.default.string()
        .max(255)
        .optional()
        .messages({
        'string.max': 'Поисковый запрос не должен превышать 255 символов',
    }),
});
exports.passwordAccessSchema = joi_1.default.object({
    password: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Пароль обязателен для доступа к приватной странице',
        'any.required': 'Пароль обязателен для доступа к приватной странице',
    }),
});
exports.updateBiographySchema = joi_1.default.object({
    text: joi_1.default.string()
        .max(50000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
    photoIds: joi_1.default.array()
        .items(joi_1.default.string().uuid())
        .max(20)
        .optional()
        .messages({
        'array.max': 'Можно добавить максимум 20 фотографий в биографию',
        'string.guid': 'ID фотографии должно быть корректным UUID',
    }),
});
//# sourceMappingURL=memorialPage.js.map