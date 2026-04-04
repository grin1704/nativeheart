import Joi from 'joi';

export const createBurialLocationSchema = Joi.object({
  address: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Адрес обязателен для заполнения',
    'string.min': 'Адрес не может быть пустым',
    'string.max': 'Адрес не может превышать 1000 символов',
    'any.required': 'Адрес обязателен для заполнения',
  }),
  description: Joi.string().optional().allow('').max(2000).messages({
    'string.max': 'Описание не может превышать 2000 символов',
  }),
  latitude: Joi.number().optional().min(-90).max(90).messages({
    'number.min': 'Широта должна быть между -90 и 90',
    'number.max': 'Широта должна быть между -90 и 90',
  }),
  longitude: Joi.number().optional().min(-180).max(180).messages({
    'number.min': 'Долгота должна быть между -180 и 180',
    'number.max': 'Долгота должна быть между -180 и 180',
  }),
  instructions: Joi.string().optional().allow('').max(2000).messages({
    'string.max': 'Инструкции не могут превышать 2000 символов',
  }),
});

export const updateBurialLocationSchema = Joi.object({
  address: Joi.string().optional().min(1).max(1000).messages({
    'string.empty': 'Адрес не может быть пустым',
    'string.min': 'Адрес не может быть пустым',
    'string.max': 'Адрес не может превышать 1000 символов',
  }),
  description: Joi.string().optional().allow('').max(2000).messages({
    'string.max': 'Описание не может превышать 2000 символов',
  }),
  latitude: Joi.number().optional().allow(null).min(-90).max(90).messages({
    'number.min': 'Широта должна быть между -90 и 90',
    'number.max': 'Широта должна быть между -90 и 90',
  }),
  longitude: Joi.number().optional().allow(null).min(-180).max(180).messages({
    'number.min': 'Долгота должна быть между -180 и 180',
    'number.max': 'Долгота должна быть между -180 и 180',
  }),
  instructions: Joi.string().optional().allow('').max(2000).messages({
    'string.max': 'Инструкции не могут превышать 2000 символов',
  }),
});

export const geocodeAddressSchema = Joi.object({
  address: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Адрес обязателен для заполнения',
    'string.min': 'Адрес не может быть пустым',
    'string.max': 'Адрес не может превышать 1000 символов',
    'any.required': 'Адрес обязателен для заполнения',
  }),
});