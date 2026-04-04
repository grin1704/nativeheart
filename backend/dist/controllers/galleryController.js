"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.galleryController = exports.GalleryController = void 0;
const galleryService_1 = require("../services/galleryService");
class GalleryController {
    async getPhotoGallery(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user?.id;
            const gallery = await galleryService_1.galleryService.getPhotoGallery(pageId, userId);
            res.json({
                success: true,
                data: gallery,
            });
        }
        catch (error) {
            console.error('Get photo gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to get photo gallery',
            });
        }
    }
    async getVideoGallery(req, res) {
        try {
            const { pageId } = req.params;
            const userId = req.user?.id;
            const gallery = await galleryService_1.galleryService.getVideoGallery(pageId, userId);
            res.json({
                success: true,
                data: gallery,
            });
        }
        catch (error) {
            console.error('Get video gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to get video gallery',
            });
        }
    }
    async addPhotoToGallery(req, res) {
        try {
            const { pageId } = req.params;
            const { mediaFileId, title, description } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const galleryItem = await galleryService_1.galleryService.addPhotoToGallery(pageId, req.user.id, { mediaFileId, title, description });
            res.status(201).json({
                success: true,
                data: galleryItem,
            });
        }
        catch (error) {
            console.error('Add photo to gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to add photo to gallery',
            });
        }
    }
    async addVideoToGallery(req, res) {
        try {
            const { pageId } = req.params;
            const { mediaFileId, title, description, videoType, externalUrl, embedCode, thumbnailUrl } = req.body;
            console.log('📥 Получен запрос на добавление видео:', {
                pageId,
                videoType,
                hasMediaFileId: !!mediaFileId,
                hasExternalUrl: !!externalUrl,
                hasEmbedCode: !!embedCode,
                title,
            });
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const galleryItem = await galleryService_1.galleryService.addVideoToGallery(pageId, req.user.id, {
                mediaFileId,
                title,
                description,
                videoType,
                externalUrl,
                embedCode,
                thumbnailUrl
            });
            console.log('✅ Видео успешно добавлено:', galleryItem.id);
            res.status(201).json({
                success: true,
                data: galleryItem,
            });
        }
        catch (error) {
            console.error('❌ Ошибка добавления видео:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to add video to gallery',
            });
        }
    }
    async parseVideoUrl(req, res) {
        try {
            const { url } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            if (!url) {
                res.status(400).json({ error: 'URL is required' });
                return;
            }
            const { externalVideoService } = await Promise.resolve().then(() => __importStar(require('../services/externalVideoService')));
            const videoInfo = await externalVideoService.parseVideoUrl(url);
            res.json({
                success: true,
                data: videoInfo,
            });
        }
        catch (error) {
            console.error('Parse video URL error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to parse video URL',
            });
        }
    }
    async updatePhotoGalleryItem(req, res) {
        try {
            const { pageId, itemId } = req.params;
            const { title, description, orderIndex } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (orderIndex !== undefined)
                updateData.orderIndex = Number(orderIndex);
            console.log(`🔍 Controller received:`, { title, description, orderIndex });
            console.log(`🔍 Prepared updateData:`, updateData);
            const updatedItem = await galleryService_1.galleryService.updatePhotoGalleryItem(pageId, itemId, req.user.id, updateData);
            res.json({
                success: true,
                data: updatedItem,
            });
        }
        catch (error) {
            console.error('Update photo gallery item error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to update photo gallery item',
            });
        }
    }
    async updateVideoGalleryItem(req, res) {
        try {
            const { pageId, itemId } = req.params;
            const { title, description, orderIndex } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (orderIndex !== undefined)
                updateData.orderIndex = Number(orderIndex);
            const updatedItem = await galleryService_1.galleryService.updateVideoGalleryItem(pageId, itemId, req.user.id, updateData);
            res.json({
                success: true,
                data: updatedItem,
            });
        }
        catch (error) {
            console.error('Update video gallery item error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to update video gallery item',
            });
        }
    }
    async removePhotoFromGallery(req, res) {
        try {
            const { pageId, itemId } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            await galleryService_1.galleryService.removePhotoFromGallery(pageId, itemId, req.user.id);
            res.json({
                success: true,
                message: 'Photo removed from gallery successfully',
            });
        }
        catch (error) {
            console.error('Remove photo from gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to remove photo from gallery',
            });
        }
    }
    async removeVideoFromGallery(req, res) {
        try {
            const { pageId, itemId } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            await galleryService_1.galleryService.removeVideoFromGallery(pageId, itemId, req.user.id);
            res.json({
                success: true,
                message: 'Video removed from gallery successfully',
            });
        }
        catch (error) {
            console.error('Remove video from gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to remove video from gallery',
            });
        }
    }
    async reorderPhotoGallery(req, res) {
        try {
            const { pageId } = req.params;
            const { itemIds } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            if (!Array.isArray(itemIds)) {
                res.status(400).json({ error: 'itemIds must be an array' });
                return;
            }
            await galleryService_1.galleryService.reorderPhotoGallery(pageId, req.user.id, itemIds);
            res.json({
                success: true,
                message: 'Photo gallery reordered successfully',
            });
        }
        catch (error) {
            console.error('Reorder photo gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to reorder photo gallery',
            });
        }
    }
    async reorderVideoGallery(req, res) {
        try {
            const { pageId } = req.params;
            const { itemIds } = req.body;
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            if (!Array.isArray(itemIds)) {
                res.status(400).json({ error: 'itemIds must be an array' });
                return;
            }
            await galleryService_1.galleryService.reorderVideoGallery(pageId, req.user.id, itemIds);
            res.json({
                success: true,
                message: 'Video gallery reordered successfully',
            });
        }
        catch (error) {
            console.error('Reorder video gallery error:', error);
            res.status(error instanceof Error && 'statusCode' in error ? error.statusCode : 500).json({
                error: error instanceof Error ? error.message : 'Failed to reorder video gallery',
            });
        }
    }
}
exports.GalleryController = GalleryController;
exports.galleryController = new GalleryController();
//# sourceMappingURL=galleryController.js.map