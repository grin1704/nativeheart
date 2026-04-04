"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQuerySchema = exports.updateUserSubscriptionSchema = exports.suspendUserSchema = exports.refreshTokenSchema = exports.updateAdminSchema = exports.createAdminSchema = exports.adminLoginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    })
});
exports.createAdminSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .required()
        .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
    }),
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
    }),
    role: joi_1.default.string()
        .valid('super_admin', 'admin', 'moderator')
        .default('moderator')
        .messages({
        'any.only': 'Role must be one of: super_admin, admin, moderator'
    })
});
exports.updateAdminSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters'
    }),
    role: joi_1.default.string()
        .valid('super_admin', 'admin', 'moderator')
        .messages({
        'any.only': 'Role must be one of: super_admin, admin, moderator'
    }),
    isActive: joi_1.default.boolean()
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Refresh token is required'
    })
});
exports.suspendUserSchema = joi_1.default.object({
    reason: joi_1.default.string()
        .min(10)
        .max(500)
        .required()
        .messages({
        'string.min': 'Reason must be at least 10 characters long',
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Reason is required'
    })
});
exports.updateUserSubscriptionSchema = joi_1.default.object({
    subscriptionType: joi_1.default.string()
        .valid('trial', 'free', 'premium')
        .required()
        .messages({
        'any.only': 'Subscription type must be one of: trial, free, premium',
        'any.required': 'Subscription type is required'
    }),
    expiresAt: joi_1.default.date()
        .iso()
        .allow(null)
        .messages({
        'date.format': 'Expiration date must be in ISO format'
    })
});
exports.getUsersQuerySchema = joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .default(1),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
    search: joi_1.default.string()
        .max(100)
        .allow(''),
    subscriptionType: joi_1.default.string()
        .valid('trial', 'free', 'premium'),
    isActive: joi_1.default.string()
        .valid('true', 'false'),
    createdAfter: joi_1.default.date()
        .iso(),
    createdBefore: joi_1.default.date()
        .iso()
});
//# sourceMappingURL=admin.js.map