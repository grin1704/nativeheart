"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.galleryValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.galleryValidation = {
    pageId: joi_1.default.object({
        pageId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'ID страницы должен быть валидным UUID',
            'any.required': 'ID страницы обязателен',
        }),
    }),
    itemId: joi_1.default.object({
        itemId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'ID элемента должен быть валидным UUID',
            'any.required': 'ID элемента обязателен',
        }),
    }),
    pageAndItemId: joi_1.default.object({
        pageId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'ID страницы должен быть валидным UUID',
            'any.required': 'ID страницы обязателен',
        }),
        itemId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'ID элемента должен быть валидным UUID',
            'any.required': 'ID элемента обязателен',
        }),
    }),
    addToGallery: joi_1.default.object({
        mediaFileId: joi_1.default.string().uuid().optional().messages({
            'string.guid': 'ID медиафайла должен быть валидным UUID',
        }),
        videoType: joi_1.default.string().valid('upload', 'vk', 'rutube').optional().messages({
            'any.only': 'Тип видео должен быть upload, vk или rutube',
        }),
        externalUrl: joi_1.default.string().uri().max(500).optional().messages({
            'string.uri': 'Внешняя ссылка должна быть валидным URL',
            'string.max': 'Внешняя ссылка не может превышать 500 символов',
        }),
        embedCode: joi_1.default.string().max(5000).optional().messages({
            'string.max': 'Embed код не может превышать 5000 символов',
        }),
        thumbnailUrl: joi_1.default.string().uri().max(500).optional().messages({
            'string.uri': 'Ссылка на превью должна быть валидным URL',
            'string.max': 'Ссылка на превью не может превышать 500 символов',
        }),
        title: joi_1.default.string().max(255).optional().messages({
            'string.max': 'Заголовок не может превышать 255 символов',
        }),
        description: joi_1.default.string().max(2000).optional().messages({
            'string.max': 'Описание не может превышать 2000 символов',
        }),
    })
        .or('mediaFileId', 'externalUrl')
        .messages({
        'object.missing': 'Необходимо указать либо mediaFileId, либо externalUrl',
    }),
    updateGalleryItem: joi_1.default.object({
        title: joi_1.default.string().max(255).optional().allow('').messages({
            'string.max': 'Заголовок не может превышать 255 символов',
        }),
        description: joi_1.default.string().max(2000).optional().allow('').messages({
            'string.max': 'Описание не может превышать 2000 символов',
        }),
        orderIndex: joi_1.default.number().integer().min(0).optional().messages({
            'number.base': 'Индекс порядка должен быть числом',
            'number.integer': 'Индекс порядка должен быть целым числом',
            'number.min': 'Индекс порядка не может быть отрицательным',
        }),
    }).min(1).messages({
        'object.min': 'Необходимо указать хотя бы одно поле для обновления',
    }),
    reorderGallery: joi_1.default.object({
        itemIds: joi_1.default.array()
            .items(joi_1.default.string().uuid().messages({
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
//# sourceMappingURL=gallery.js.map