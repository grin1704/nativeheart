"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSizes = exports.handleUploadError = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const media_1 = require("../validation/media");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        try {
            media_1.mediaValidation.fileUpload.fileFilter(req, file, cb);
        }
        catch (error) {
            cb(error);
        }
    },
    limits: media_1.mediaValidation.fileUpload.limits
});
const uploadSingle = (fieldName = 'file') => {
    return upload.single(fieldName);
};
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
    return upload.array(fieldName, maxCount);
};
exports.uploadMultiple = uploadMultiple;
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    error: 'File too large. Maximum size is 100MB for videos and 10MB for images.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    error: 'Too many files. Maximum 10 files per request.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    error: 'Unexpected field name for file upload.'
                });
            default:
                return res.status(400).json({
                    error: 'File upload error: ' + error.message
                });
        }
    }
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            error: error.message
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
const validateFileSizes = (req, res, next) => {
    try {
        if (req.file && !(0, media_1.validateFileSize)(req.file)) {
            return res.status(400).json({
                error: 'File size exceeds limits. Images: 10MB max, Videos: 100MB max.'
            });
        }
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                if (!(0, media_1.validateFileSize)(file)) {
                    return res.status(400).json({
                        error: `File "${file.originalname}" exceeds size limits. Images: 10MB max, Videos: 100MB max.`
                    });
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateFileSizes = validateFileSizes;
//# sourceMappingURL=upload.js.map