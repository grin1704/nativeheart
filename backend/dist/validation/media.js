"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileCategory = exports.validateFileSize = exports.mediaValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.mediaValidation = {
    fileUpload: {
        fileFilter: (req, file, cb) => {
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            const isImage = allowedImageTypes.includes(file.mimetype);
            const isVideo = allowedVideoTypes.includes(file.mimetype);
            if (isImage || isVideo) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'), false);
            }
        },
        limits: {
            fileSize: 100 * 1024 * 1024,
            files: 10
        }
    },
    fileId: joi_1.default.object({
        fileId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'File ID must be a valid UUID',
            'any.required': 'File ID is required'
        })
    }),
    memorialPageId: joi_1.default.object({
        memorialPageId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'Memorial page ID must be a valid UUID',
            'any.required': 'Memorial page ID is required'
        })
    }),
    fileMetadata: joi_1.default.object({
        description: joi_1.default.string().max(500).optional(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        category: joi_1.default.string().valid('profile', 'gallery', 'biography', 'memory', 'tribute').optional()
    }).optional()
};
const validateFileSize = (file) => {
    const isImage = file.mimetype.startsWith('image/');
    const maxImageSize = 10 * 1024 * 1024;
    const maxVideoSize = 100 * 1024 * 1024;
    if (isImage && file.size > maxImageSize) {
        return false;
    }
    if (!isImage && file.size > maxVideoSize) {
        return false;
    }
    return true;
};
exports.validateFileSize = validateFileSize;
const getFileCategory = (mimeType) => {
    if (mimeType.startsWith('image/')) {
        return 'image';
    }
    if (mimeType.startsWith('video/')) {
        return 'video';
    }
    return 'unknown';
};
exports.getFileCategory = getFileCategory;
//# sourceMappingURL=media.js.map