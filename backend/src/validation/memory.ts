import Joi from 'joi';

export const createMemorySchema = Joi.object({
  date: Joi.date().required().messages({
    'date.base': 'Дата должна быть корректной',
    'any.required': 'Дата обязательна для заполнения',
  }),
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Заголовок не может быть пустым',
    'string.max': 'Заголовок не может превышать 255 символов',
    'any.required': 'Заголовок обязателен для заполнения',
  }),
  description: Joi.string().max(5000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 5000 символов',
  }),
  photoIds: Joi.array().items(Joi.string().uuid()).max(20).optional().messages({
    'array.max': 'Можно прикрепить не более 20 фотографий',
    'string.guid': 'Некорректный ID фотографии',
  }),
});

export const updateMemorySchema = Joi.object({
  date: Joi.date().optional().messages({
    'date.base': 'Дата должна быть корректной',
  }),
  title: Joi.string().min(1).max(255).optional().messages({
    'string.empty': 'Заголовок не может быть пустым',
    'string.max': 'Заголовок не может превышать 255 символов',
  }),
  description: Joi.string().max(5000).optional().allow('').messages({
    'string.max': 'Описание не может превышать 5000 символов',
  }),
  photoIds: Joi.array().items(Joi.string().uuid()).max(20).optional().messages({
    'array.max': 'Можно прикрепить не более 20 фотографий',
    'string.guid': 'Некорректный ID фотографии',
  }),
});

export const memoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Номер страницы должен быть числом',
    'number.integer': 'Номер страницы должен быть целым числом',
    'number.min': 'Номер страницы должен быть больше 0',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Лимит должен быть числом',
    'number.integer': 'Лимит должен быть целым числом',
    'number.min': 'Лимит должен быть больше 0',
    'number.max': 'Лимит не может превышать 100',
  }),
  sortBy: Joi.string().valid('date', 'createdAt').default('date').messages({
    'any.only': 'Сортировка возможна только по дате или времени создания',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Порядок сортировки может быть только asc или desc',
  }),
});