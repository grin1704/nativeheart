"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = exports.getFileExtension = exports.generateSafeFilename = exports.formatFileSize = exports.getFileSizeLimit = exports.isVideoType = exports.isImageType = exports.FILE_SIZE_LIMITS = exports.ALLOWED_VIDEO_TYPES = exports.ALLOWED_IMAGE_TYPES = void 0;
exports.ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
];
exports.ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
];
exports.FILE_SIZE_LIMITS = {
    IMAGE_MAX_SIZE: 10 * 1024 * 1024,
    VIDEO_MAX_SIZE: 100 * 1024 * 1024,
    THUMBNAIL_SIZE: { width: 300, height: 300 }
};
const isImageType = (mimeType) => {
    return exports.ALLOWED_IMAGE_TYPES.includes(mimeType);
};
exports.isImageType = isImageType;
const isVideoType = (mimeType) => {
    return exports.ALLOWED_VIDEO_TYPES.includes(mimeType);
};
exports.isVideoType = isVideoType;
const getFileSizeLimit = (mimeType) => {
    if ((0, exports.isImageType)(mimeType)) {
        return exports.FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
    }
    if ((0, exports.isVideoType)(mimeType)) {
        return exports.FILE_SIZE_LIMITS.VIDEO_MAX_SIZE;
    }
    return exports.FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
};
exports.getFileSizeLimit = getFileSizeLimit;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const generateSafeFilename = (originalName) => {
    return originalName
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
};
exports.generateSafeFilename = generateSafeFilename;
const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};
exports.getFileExtension = getFileExtension;
const validateFile = (file) => {
    const { mimetype, size } = file;
    if (!(0, exports.isImageType)(mimetype) && !(0, exports.isVideoType)(mimetype)) {
        return {
            isValid: false,
            error: 'Unsupported file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'
        };
    }
    const maxSize = (0, exports.getFileSizeLimit)(mimetype);
    if (size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
            isValid: false,
            error: `File size exceeds ${maxSizeMB}MB limit for ${(0, exports.isImageType)(mimetype) ? 'images' : 'videos'}.`
        };
    }
    return { isValid: true };
};
exports.validateFile = validateFile;
//# sourceMappingURL=media.js.map