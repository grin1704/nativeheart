import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Введите корректный email адрес',
      'any.required': 'Email обязателен для заполнения'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'any.required': 'Пароль обязателен для заполнения'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя не должно превышать 100 символов',
      'any.required': 'Имя обязательно для заполнения'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Введите корректный email адрес',
      'any.required': 'Email обязателен для заполнения'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен для заполнения'
    })
});

export const subscriptionUpdateSchema = Joi.object({
  subscriptionType: Joi.string()
    .valid('trial', 'free', 'premium')
    .required()
    .messages({
      'any.only': 'Тип подписки должен быть trial, free или premium',
      'any.required': 'Тип подписки обязателен'
    })
});