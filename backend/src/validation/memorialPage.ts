import Joi from 'joi';

export const createMemorialPageSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Полное имя обязательно для заполнения',
      'string.min': 'Полное имя должно содержать минимум 2 символа',
      'string.max': 'Полное имя не должно превышать 255 символов',
    }),
  
  birthDate: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': 'Дата рождения должна быть корректной датой',
      'date.max': 'Дата рождения не может быть в будущем',
      'any.required': 'Дата рождения обязательна для заполнения',
    }),
  
  deathDate: Joi.date()
    .iso()
    .max('now')
    .greater(Joi.ref('birthDate'))
    .required()
    .messages({
      'date.base': 'Дата смерти должна быть корректной датой',
      'date.max': 'Дата смерти не может быть в будущем',
      'date.greater': 'Дата смерти должна быть позже даты рождения',
      'any.required': 'Дата смерти обязательна для заполнения',
    }),
  
  mainPhotoId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'ID главного фото должно быть корректным UUID',
    }),
  
  biographyText: Joi.string()
    .max(50000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
  
  isPrivate: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Приватность должна быть булевым значением',
    }),
  
  password: Joi.string()
    .min(4)
    .max(50)
    .when('isPrivate', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      'string.min': 'Пароль должен содержать минимум 4 символа',
      'string.max': 'Пароль не должен превышать 50 символов',
      'any.required': 'Пароль обязателен для приватных страниц',
      'any.unknown': 'Пароль можно указать только для приватных страниц',
    }),
});

export const updateMemorialPageSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Полное имя должно содержать минимум 2 символа',
      'string.max': 'Полное имя не должно превышать 255 символов',
    }),
  
  birthDate: Joi.date()
    .iso()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Дата рождения должна быть корректной датой',
      'date.max': 'Дата рождения не может быть в будущем',
    }),
  
  deathDate: Joi.date()
    .iso()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Дата смерти должна быть корректной датой',
      'date.max': 'Дата смерти не может быть в будущем',
    }),
  
  mainPhotoId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'ID главного фото должно быть корректным UUID',
    }),
  
  biographyText: Joi.string()
    .max(50000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
  
  isPrivate: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Приватность должна быть булевым значением',
    }),
  
  password: Joi.string()
    .min(4)
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Пароль должен содержать минимум 4 символа',
      'string.max': 'Пароль не должен превышать 50 символов',
    }),
}).custom((value, helpers) => {
  // Custom validation to ensure deathDate is after birthDate when both are provided
  if (value.birthDate && value.deathDate && new Date(value.deathDate) <= new Date(value.birthDate)) {
    return helpers.error('custom.dateOrder');
  }
  return value;
}).messages({
  'custom.dateOrder': 'Дата смерти должна быть позже даты рождения',
});

export const memorialPageQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть больше 0',
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
      'number.max': 'Лимит не должен превышать 100',
    }),
  
  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Поисковый запрос не должен превышать 255 символов',
    }),
});

export const passwordAccessSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Пароль обязателен для доступа к приватной странице',
      'any.required': 'Пароль обязателен для доступа к приватной странице',
    }),
});

export const updateBiographySchema = Joi.object({
  text: Joi.string()
    .max(50000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Текст биографии не должен превышать 50000 символов',
    }),
  
  photoIds: Joi.array()
    .items(Joi.string().uuid())
    .max(20)
    .optional()
    .messages({
      'array.max': 'Можно добавить максимум 20 фотографий в биографию',
      'string.guid': 'ID фотографии должно быть корректным UUID',
    }),
});