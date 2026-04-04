"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionUpdateSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Введите корректный email адрес',
        'any.required': 'Email обязателен для заполнения'
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Пароль должен содержать минимум 6 символов',
        'any.required': 'Пароль обязателен для заполнения'
    }),
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Имя должно содержать минимум 2 символа',
        'string.max': 'Имя не должно превышать 100 символов',
        'any.required': 'Имя обязательно для заполнения'
    })
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Введите корректный email адрес',
        'any.required': 'Email обязателен для заполнения'
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Пароль обязателен для заполнения'
    })
});
exports.subscriptionUpdateSchema = joi_1.default.object({
    subscriptionType: joi_1.default.string()
        .valid('trial', 'free', 'premium')
        .required()
        .messages({
        'any.only': 'Тип подписки должен быть trial, free или premium',
        'any.required': 'Тип подписки обязателен'
    })
});
//# sourceMappingURL=auth.js.map