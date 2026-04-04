import { Response } from 'express';
import { galleryService } from '../services/galleryService';
import { AuthenticatedRequest } from '../types/auth';

export class GalleryController {
  /**
   * Get photo gallery for a memorial page
   */
  async getPhotoGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id;

      const gallery = await galleryService.getPhotoGallery(pageId, userId);

      res.json({
        success: true,
        data: gallery,
      });
    } catch (error) {
      console.error('Get photo gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to get photo gallery',
      });
    }
  }

  /**
   * Get video gallery for a memorial page
   */
  async getVideoGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id;

      const gallery = await galleryService.getVideoGallery(pageId, userId);

      res.json({
        success: true,
        data: gallery,
      });
    } catch (error) {
      console.error('Get video gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to get video gallery',
      });
    }
  }

  /**
   * Add photo to gallery
   */
  async addPhotoToGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const { mediaFileId, title, description } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const galleryItem = await galleryService.addPhotoToGallery(
        pageId,
        req.user.id,
        { mediaFileId, title, description }
      );

      res.status(201).json({
        success: true,
        data: galleryItem,
      });
    } catch (error) {
      console.error('Add photo to gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to add photo to gallery',
      });
    }
  }

  /**
   * Add video to gallery
   */
  async addVideoToGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const galleryItem = await galleryService.addVideoToGallery(
        pageId,
        req.user.id,
        { 
          mediaFileId, 
          title, 
          description,
          videoType,
          externalUrl,
          embedCode,
          thumbnailUrl
        }
      );

      console.log('✅ Видео успешно добавлено:', galleryItem.id);

      res.status(201).json({
        success: true,
        data: galleryItem,
      });
    } catch (error) {
      console.error('❌ Ошибка добавления видео:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to add video to gallery',
      });
    }
  }

  /**
   * Parse external video URL
   */
  async parseVideoUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { externalVideoService } = await import('../services/externalVideoService');
      const videoInfo = await externalVideoService.parseVideoUrl(url);

      res.json({
        success: true,
        data: videoInfo,
      });
    } catch (error) {
      console.error('Parse video URL error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to parse video URL',
      });
    }
  }

  /**
   * Update photo gallery item
   */
  async updatePhotoGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId, itemId } = req.params;
      const { title, description, orderIndex } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Prepare update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex);

      console.log(`🔍 Controller received:`, { title, description, orderIndex });
      console.log(`🔍 Prepared updateData:`, updateData);

      const updatedItem = await galleryService.updatePhotoGalleryItem(
        pageId,
        itemId,
        req.user.id,
        updateData
      );

      res.json({
        success: true,
        data: updatedItem,
      });
    } catch (error) {
      console.error('Update photo gallery item error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to update photo gallery item',
      });
    }
  }

  /**
   * Update video gallery item
   */
  async updateVideoGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId, itemId } = req.params;
      const { title, description, orderIndex } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Prepare update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex);

      const updatedItem = await galleryService.updateVideoGalleryItem(
        pageId,
        itemId,
        req.user.id,
        updateData
      );

      res.json({
        success: true,
        data: updatedItem,
      });
    } catch (error) {
      console.error('Update video gallery item error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to update video gallery item',
      });
    }
  }

  /**
   * Remove photo from gallery
   */
  async removePhotoFromGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId, itemId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await galleryService.removePhotoFromGallery(pageId, itemId, req.user.id);

      res.json({
        success: true,
        message: 'Photo removed from gallery successfully',
      });
    } catch (error) {
      console.error('Remove photo from gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to remove photo from gallery',
      });
    }
  }

  /**
   * Remove video from gallery
   */
  async removeVideoFromGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId, itemId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await galleryService.removeVideoFromGallery(pageId, itemId, req.user.id);

      res.json({
        success: true,
        message: 'Video removed from gallery successfully',
      });
    } catch (error) {
      console.error('Remove video from gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to remove video from gallery',
      });
    }
  }

  /**
   * Reorder photo gallery items
   */
  async reorderPhotoGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      await galleryService.reorderPhotoGallery(pageId, req.user.id, itemIds);

      res.json({
        success: true,
        message: 'Photo gallery reordered successfully',
      });
    } catch (error) {
      console.error('Reorder photo gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to reorder photo gallery',
      });
    }
  }

  /**
   * Reorder video gallery items
   */
  async reorderVideoGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      await galleryService.reorderVideoGallery(pageId, req.user.id, itemIds);

      res.json({
        success: true,
        message: 'Video gallery reordered successfully',
      });
    } catch (error) {
      console.error('Reorder video gallery error:', error);
      res.status(error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500).json({
        error: error instanceof Error ? error.message : 'Failed to reorder video gallery',
      });
    }
  }
}

export const galleryController = new GalleryController();