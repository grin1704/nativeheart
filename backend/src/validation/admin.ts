import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

export const createAdminSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  role: Joi.string()
    .valid('super_admin', 'admin', 'moderator')
    .default('moderator')
    .messages({
      'any.only': 'Role must be one of: super_admin, admin, moderator'
    })
});

export const updateAdminSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  role: Joi.string()
    .valid('super_admin', 'admin', 'moderator')
    .messages({
      'any.only': 'Role must be one of: super_admin, admin, moderator'
    }),
  isActive: Joi.boolean()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

// User management validation schemas
export const suspendUserSchema = Joi.object({
  reason: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason cannot exceed 500 characters',
      'any.required': 'Reason is required'
    })
});

export const updateUserSubscriptionSchema = Joi.object({
  subscriptionType: Joi.string()
    .valid('trial', 'free', 'premium')
    .required()
    .messages({
      'any.only': 'Subscription type must be one of: trial, free, premium',
      'any.required': 'Subscription type is required'
    }),
  expiresAt: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': 'Expiration date must be in ISO format'
    })
});

export const getUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
  search: Joi.string()
    .max(100)
    .allow(''),
  subscriptionType: Joi.string()
    .valid('trial', 'free', 'premium'),
  isActive: Joi.string()
    .valid('true', 'false'),
  createdAfter: Joi.date()
    .iso(),
  createdBefore: Joi.date()
    .iso()
});