import Joi from 'joi';

const permissionsSchema = Joi.object({
  basicInfo: Joi.boolean().default(true),
  biography: Joi.boolean().default(true),
  gallery: Joi.boolean().default(true),
  memories: Joi.boolean().default(true),
  timeline: Joi.boolean().default(true),
  tributes: Joi.boolean().default(true),
  burialLocation: Joi.boolean().default(true),
});

export const inviteCollaboratorSchema = Joi.object({
  email: Joi.string()
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

export const updateCollaboratorPermissionsSchema = Joi.object({
  permissions: permissionsSchema.required()
    .messages({
      'any.required': 'Права доступа обязательны для заполнения'
    })
});

export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть больше 0'
    }),
  limit: Joi.number()
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