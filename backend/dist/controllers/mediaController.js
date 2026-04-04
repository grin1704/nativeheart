"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaController = exports.MediaController = void 0;
const mediaService_1 = require("../services/mediaService");
class MediaController {
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const { buffer, originalname, mimetype } = req.file;
            const result = await mediaService_1.mediaService.uploadFile(buffer, originalname, mimetype, req.user.id);
            res.status(201).json({
                success: true,
                data: result.mediaFile
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to upload file'
            });
        }
    }
    async uploadMultipleFiles(req, res) {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                res.status(400).json({ error: 'No files provided' });
                return;
            }
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const uploadPromises = files.map(file => mediaService_1.mediaService.uploadFile(file.buffer, file.originalname, file.mimetype, req.user.id));
            const results = await Promise.all(uploadPromises);
            const mediaFiles = results.map(result => result.mediaFile);
            res.status(201).json({
                success: true,
                data: mediaFiles
            });
        }
        catch (error) {
            console.error('Multiple upload error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to upload files'
            });
        }
    }
    async uploadTributeFile(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }
            const { buffer, originalname, mimetype } = req.file;
            if (!mimetype.startsWith('image/')) {
                res.status(400).json({ error: 'Only image files are allowed for tributes' });
                return;
            }
            const result = await mediaService_1.mediaService.uploadFile(buffer, originalname, mimetype, null);
            res.status(201).json({
                success: true,
                data: result.mediaFile
            });
        }
        catch (error) {
            console.error('Tribute upload error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to upload tribute file'
            });
        }
    }
    async getFile(req, res) {
        try {
            const { fileId } = req.params;
            const file = await mediaService_1.mediaService.getFile(fileId);
            if (!file) {
                res.status(404).json({ error: 'File not found' });
                return;
            }
            res.json({
                success: true,
                data: file
            });
        }
        catch (error) {
            console.error('Get file error:', error);
            res.status(500).json({
                error: 'Failed to retrieve file'
            });
        }
    }
    async deleteFile(req, res) {
        try {
            const { fileId } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const file = await mediaService_1.mediaService.getFile(fileId);
            if (!file) {
                res.status(404).json({ error: 'File not found' });
                return;
            }
            if (file.uploadedBy !== req.user.id) {
                res.status(403).json({ error: 'Not authorized to delete this file' });
                return;
            }
            await mediaService_1.mediaService.deleteFile(fileId);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to delete file'
            });
        }
    }
    async getMemorialPageFiles(req, res) {
        try {
            const { memorialPageId } = req.params;
            const files = await mediaService_1.mediaService.getFilesByMemorialPage(memorialPageId);
            res.json({
                success: true,
                data: files
            });
        }
        catch (error) {
            console.error('Get memorial page files error:', error);
            res.status(500).json({
                error: 'Failed to retrieve files'
            });
        }
    }
    async getFileStatistics(req, res) {
        try {
            const stats = await mediaService_1.mediaService.getFileStatistics();
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Get file statistics error:', error);
            res.status(500).json({
                error: 'Failed to retrieve file statistics'
            });
        }
    }
    async cleanupUnusedFiles(req, res) {
        try {
            const deletedCount = await mediaService_1.mediaService.cleanupUnusedFiles();
            res.json({
                success: true,
                message: `Cleaned up ${deletedCount} unused files`
            });
        }
        catch (error) {
            console.error('Cleanup error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to cleanup files'
            });
        }
    }
}
exports.MediaController = MediaController;
exports.mediaController = new MediaController();
//# sourceMappingURL=mediaController.js.map