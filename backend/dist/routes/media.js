"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const media_1 = require("../validation/media");
const router = (0, express_1.Router)();
router.post('/upload', auth_1.authenticateToken, (0, upload_1.uploadSingle)('file'), upload_1.handleUploadError, upload_1.validateFileSizes, mediaController_1.mediaController.uploadFile.bind(mediaController_1.mediaController));
router.post('/upload/tribute', (0, upload_1.uploadSingle)('file'), upload_1.handleUploadError, upload_1.validateFileSizes, mediaController_1.mediaController.uploadTributeFile.bind(mediaController_1.mediaController));
router.post('/upload/multiple', auth_1.authenticateToken, (0, upload_1.uploadMultiple)('files', 10), upload_1.handleUploadError, upload_1.validateFileSizes, mediaController_1.mediaController.uploadMultipleFiles.bind(mediaController_1.mediaController));
router.get('/:fileId', (0, validation_1.validateRequest)(media_1.mediaValidation.fileId, 'params'), mediaController_1.mediaController.getFile.bind(mediaController_1.mediaController));
router.delete('/:fileId', auth_1.authenticateToken, (0, validation_1.validateRequest)(media_1.mediaValidation.fileId, 'params'), mediaController_1.mediaController.deleteFile.bind(mediaController_1.mediaController));
router.get('/memorial-page/:memorialPageId', (0, validation_1.validateRequest)(media_1.mediaValidation.memorialPageId, 'params'), mediaController_1.mediaController.getMemorialPageFiles.bind(mediaController_1.mediaController));
router.get('/admin/statistics', auth_1.authenticateToken, mediaController_1.mediaController.getFileStatistics.bind(mediaController_1.mediaController));
router.post('/admin/cleanup', auth_1.authenticateToken, mediaController_1.mediaController.cleanupUnusedFiles.bind(mediaController_1.mediaController));
exports.default = router;
//# sourceMappingURL=media.js.map