import Joi from 'joi';

const currentYear = new Date().getFullYear();

// Helper function to validate day based on month and year
const validateDay = (value: number, helpers: Joi.CustomHelpers) => {
  const { month, year } = helpers.state.ancestors[0];
  
  if (!month) {
    return value; // If no month, any day is technically valid
  }
  
  // Get the number of days in the specified month
  const daysInMonth = new Date(year || currentYear, month, 0).getDate();
  
  if (value > daysInMonth) {
    return helpers.error('any.invalid', { 
      message: `День не может быть больше ${daysInMonth} для указанного месяца` 
    });
  }
  
  return value;
};

export const createTimelineEventSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(1800)
    .max(currentYear + 10)
    .required()
    .messages({
      'number.base': 'Год должен быть числом',
      'number.min': 'Год не может быть раньше 1800',
      'number.max': `Год не может быть позже ${currentYear + 10}`,
      'any.required': 'Год обязателен для заполнения',
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Месяц должен быть числом',
      'number.min': 'Месяц должен быть от 1 до 12',
      'number.max': 'Месяц должен быть от 1 до 12',
    }),
  day: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .optional()
    .allow(null)
    .custom(validateDay)
    .messages({
      'number.base': 'День должен быть числом',
      'number.min': 'День должен быть от 1 до 31',
      'number.max': 'День должен быть от 1 до 31',
    }),
  description: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Описание не может быть пустым',
      'string.min': 'Описание должно содержать минимум 1 символ',
      'string.max': 'Описание не может превышать 500 символов',
      'any.required': 'Описание обязательно для заполнения',
    }),
  location: Joi.string()
    .max(200)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Место не может превышать 200 символов',
    }),
  orderIndex: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Порядок должен быть числом',
      'number.min': 'Порядок не может быть отрицательным',
    }),
});

export const updateTimelineEventSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(1800)
    .max(currentYear + 10)
    .optional()
    .messages({
      'number.base': 'Год должен быть числом',
      'number.min': 'Год не может быть раньше 1800',
      'number.max': `Год не может быть позже ${currentYear + 10}`,
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Месяц должен быть числом',
      'number.min': 'Месяц должен быть от 1 до 12',
      'number.max': 'Месяц должен быть от 1 до 12',
    }),
  day: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .optional()
    .allow(null)
    .custom(validateDay)
    .messages({
      'number.base': 'День должен быть числом',
      'number.min': 'День должен быть от 1 до 31',
      'number.max': 'День должен быть от 1 до 31',
    }),
  description: Joi.string()
    .min(1)
    .max(500)
    .optional()
    .messages({
      'string.empty': 'Описание не может быть пустым',
      'string.min': 'Описание должно содержать минимум 1 символ',
      'string.max': 'Описание не может превышать 500 символов',
    }),
  location: Joi.string()
    .max(200)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Место не может превышать 200 символов',
    }),
  orderIndex: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Порядок должен быть числом',
      'number.min': 'Порядок не может быть отрицательным',
    }),
}).min(1);

export const reorderTimelineEventsSchema = Joi.object({
  eventIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      'array.base': 'eventIds должен быть массивом',
      'array.min': 'Необходимо указать хотя бы одно событие',
      'any.required': 'eventIds обязателен для заполнения',
    }),
});
