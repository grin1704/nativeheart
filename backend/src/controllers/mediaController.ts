import { Request, Response } from 'express';
import { mediaService } from '../services/mediaService';
import { AuthenticatedRequest } from '../types/auth';

export class MediaController {
  /**
   * Upload a single file
   */
  async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      
      const result = await mediaService.uploadFile(
        buffer,
        originalname,
        mimetype,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: result.mediaFile
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to upload file' 
      });
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files provided' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const uploadPromises = files.map(file => 
        mediaService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          req.user!.id
        )
      );

      const results = await Promise.all(uploadPromises);
      const mediaFiles = results.map(result => result.mediaFile);

      res.status(201).json({
        success: true,
        data: mediaFiles
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to upload files' 
      });
    }
  }

  /**
   * Upload a file for tribute (public access)
   */
  async uploadTributeFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Validate file type for tributes (only images)
      if (!mimetype.startsWith('image/')) {
        res.status(400).json({ error: 'Only image files are allowed for tributes' });
        return;
      }

      // Use a special user ID for public uploads (or null)
      const result = await mediaService.uploadFile(
        buffer,
        originalname,
        mimetype,
        null // No user ID for public uploads
      );

      res.status(201).json({
        success: true,
        data: result.mediaFile
      });
    } catch (error) {
      console.error('Tribute upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to upload tribute file' 
      });
    }
  }

  /**
   * Get file by ID
   */
  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      const file = await mediaService.getFile(fileId);
      
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve file' 
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get file to check ownership
      const file = await mediaService.getFile(fileId);
      
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Check if user owns the file
      if (file.uploadedBy !== req.user.id) {
        res.status(403).json({ error: 'Not authorized to delete this file' });
        return;
      }

      await mediaService.deleteFile(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete file' 
      });
    }
  }

  /**
   * Get files for a memorial page
   */
  async getMemorialPageFiles(req: Request, res: Response): Promise<void> {
    try {
      const { memorialPageId } = req.params;
      
      const files = await mediaService.getFilesByMemorialPage(memorialPageId);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Get memorial page files error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve files' 
      });
    }
  }

  /**
   * Get file statistics (admin only)
   */
  async getFileStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await mediaService.getFileStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get file statistics error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve file statistics' 
      });
    }
  }

  /**
   * Cleanup unused files (admin only)
   */
  async cleanupUnusedFiles(req: Request, res: Response): Promise<void> {
    try {
      const deletedCount = await mediaService.cleanupUnusedFiles();

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} unused files`
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cleanup files' 
      });
    }
  }
}

export const mediaController = new MediaController();