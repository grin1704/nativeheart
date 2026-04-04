import Joi from 'joi';

export const galleryValidation = {
  // Path parameters
  pageId: Joi.object({
    pageId: Joi.string().uuid().required().messages({
      'string.guid': 'ID страницы должен быть валидным UUID',
      'any.required': 'ID страницы обязателен',
    }),
  }),

  itemId: Joi.object({
    itemId: Joi.string().uuid().required().messages({
      'string.guid': 'ID элемента должен быть валидным UUID',
      'any.required': 'ID элемента обязателен',
    }),
  }),

  pageAndItemId: Joi.object({
    pageId: Joi.string().uuid().required().messages({
      'string.guid': 'ID страницы должен быть валидным UUID',
      'any.required': 'ID страницы обязателен',
    }),
    itemId: Joi.string().uuid().required().messages({
      'string.guid': 'ID элемента должен быть валидным UUID',
      'any.required': 'ID элемента обязателен',
    }),
  }),

  // Add item to gallery
  addToGallery: Joi.object({
    // For uploaded videos
    mediaFileId: Joi.string().uuid().optional().messages({
      'string.guid': 'ID медиафайла должен быть валидным UUID',
    }),
    // For external videos
    videoType: Joi.string().valid('upload', 'vk', 'rutube').optional().messages({
      'any.only': 'Тип видео должен быть upload, vk или rutube',
    }),
    externalUrl: Joi.string().uri().max(500).optional().messages({
      'string.uri': 'Внешняя ссылка должна быть валидным URL',
      'string.max': 'Внешняя ссылка не может превышать 500 символов',
    }),
    embedCode: Joi.string().max(5000).optional().messages({
      'string.max': 'Embed код не может превышать 5000 символов',
    }),
    thumbnailUrl: Joi.string().uri().max(500).optional().messages({
      'string.uri': 'Ссылка на превью должна быть валидным URL',
      'string.max': 'Ссылка на превью не может превышать 500 символов',
    }),
    // Common fields
    title: Joi.string().max(255).optional().messages({
      'string.max': 'Заголовок не может превышать 255 символов',
    }),
    description: Joi.string().max(2000).optional().messages({
      'string.max': 'Описание не может превышать 2000 символов',
    }),
  })
    .or('mediaFileId', 'externalUrl')
    .messages({
      'object.missing': 'Необходимо указать либо mediaFileId, либо externalUrl',
    }),

  // Update gallery item
  updateGalleryItem: Joi.object({
    title: Joi.string().max(255).optional().allow('').messages({
      'string.max': 'Заголовок не может превышать 255 символов',
    }),
    description: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Описание не может превышать 2000 символов',
    }),
    orderIndex: Joi.number().integer().min(0).optional().messages({
      'number.base': 'Индекс порядка должен быть числом',
      'number.integer': 'Индекс порядка должен быть целым числом',
      'number.min': 'Индекс порядка не может быть отрицательным',
    }),
  }).min(1).messages({
    'object.min': 'Необходимо указать хотя бы одно поле для обновления',
  }),

  // Reorder gallery items
  reorderGallery: Joi.object({
    itemIds: Joi.array()
      .items(Joi.string().uuid().messages({
        'string.guid': 'Каждый ID элемента должен быть валидным UUID',
      }))
      .min(1)
      .required()
      .messages({
        'array.min': 'Массив ID элементов не может быть пустым',
        'any.required': 'Массив ID элементов обязателен',
      }),
  }),
};