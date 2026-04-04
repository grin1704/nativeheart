import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export interface MediaFile {
  id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedBy: string | null;
  uploadedAt: Date;
}

export interface UploadResult {
  mediaFile: MediaFile;
  thumbnailUrl?: string;
}

export class LocalMediaService {
  private readonly uploadsDir: string;
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB for images
  private readonly thumbnailWidth = 600; // Fixed width for masonry layout

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureDirectoryExists(this.uploadsDir);
    this.ensureDirectoryExists(path.join(this.uploadsDir, 'images'));
    this.ensureDirectoryExists(path.join(this.uploadsDir, 'videos'));
    this.ensureDirectoryExists(path.join(this.uploadsDir, 'thumbnails'));
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Upload a file to local storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string | null
  ): Promise<UploadResult> {
    // Validate file type and size
    this.validateFile(fileBuffer, mimeType);

    const fileId = randomUUID();
    const fileExtension = path.extname(originalName);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = this.generateFilePath(fileName, mimeType);
    const fullPath = path.join(this.uploadsDir, filePath);

    try {
      // Ensure directory exists
      this.ensureDirectoryExists(path.dirname(fullPath));

      // Save original file
      fs.writeFileSync(fullPath, fileBuffer);
      const fileUrl = `/uploads/${filePath}`;

      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (this.isImage(mimeType)) {
        thumbnailUrl = await this.generateThumbnail(fileBuffer, fileId, fileExtension);
      }

      // Save to database
      const mediaFile = await prisma.mediaFile.create({
        data: {
          id: fileId,
          originalName,
          url: fileUrl,
          thumbnailUrl,
          size: fileBuffer.length,
          mimeType,
          uploadedBy: uploadedBy || null
        }
      });

      return {
        mediaFile: {
          ...mediaFile,
          thumbnailUrl: mediaFile.thumbnailUrl || undefined
        },
        thumbnailUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to local storage');
    }
  }

  /**
   * Generate thumbnail for images
   * Creates a thumbnail with fixed width (600px) and proportional height
   * This is optimized for masonry/column layouts where width is fixed but height varies
   */
  private async generateThumbnail(
    imageBuffer: Buffer,
    fileId: string,
    fileExtension: string
  ): Promise<string> {
    try {
      // Resize to fixed width, maintaining aspect ratio
      // This prevents layout shifts in masonry grids
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(this.thumbnailWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      const thumbnailFileName = `${fileId}_thumb.jpg`;
      const thumbnailPath = this.generateFilePath(thumbnailFileName, 'image/jpeg', 'thumbnails');
      const fullThumbnailPath = path.join(this.uploadsDir, thumbnailPath);

      // Ensure directory exists
      this.ensureDirectoryExists(path.dirname(fullThumbnailPath));

      fs.writeFileSync(fullThumbnailPath, thumbnailBuffer);
      return `/uploads/${thumbnailPath}`;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Delete file from local storage and database
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const mediaFile = await prisma.mediaFile.findUnique({
        where: { id: fileId }
      });

      if (!mediaFile) {
        throw new Error('File not found');
      }

      // Delete original file
      const originalPath = path.join(this.uploadsDir, mediaFile.url.replace('/uploads/', ''));
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }

      // Delete thumbnail if exists
      if (mediaFile.thumbnailUrl) {
        const thumbnailPath = path.join(this.uploadsDir, mediaFile.thumbnailUrl.replace('/uploads/', ''));
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

      // Remove from database
      await prisma.mediaFile.delete({
        where: { id: fileId }
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<MediaFile | null> {
    const file = await prisma.mediaFile.findUnique({
      where: { id: fileId }
    });
    
    if (!file) return null;
    
    return {
      ...file,
      thumbnailUrl: file.thumbnailUrl || undefined
    };
  }

  /**
   * Get files by memorial page ID
   */
  async getFilesByMemorialPage(memorialPageId: string): Promise<MediaFile[]> {
    const files = await prisma.mediaFile.findMany({
      where: {
        memorialPages: {
          some: {
            id: memorialPageId
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
    
    return files.map(file => ({
      ...file,
      thumbnailUrl: file.thumbnailUrl || undefined
    }));
  }

  /**
   * Clean up unused files
   */
  async cleanupUnusedFiles(): Promise<number> {
    try {
      // Find files that are not associated with any memorial page, memory, or tribute
      const unusedFiles = await prisma.mediaFile.findMany({
        where: {
          AND: [
            {
              mainPhotoFor: {
                none: {}
              }
            },
            {
              memorialPages: {
                none: {}
              }
            },
            {
              memoryPhotos: {
                none: {}
              }
            },
            {
              tributes: {
                none: {}
              }
            }
          ],
          // Only delete files older than 24 hours
          uploadedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      let deletedCount = 0;
      for (const file of unusedFiles) {
        try {
          await this.deleteFile(file.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete unused file ${file.id}:`, error);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw new Error('Failed to cleanup unused files');
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(fileBuffer: Buffer, mimeType: string): void {
    const isImage = this.isImage(mimeType);
    const isVideo = this.isVideo(mimeType);

    if (!isImage && !isVideo) {
      throw new Error('Unsupported file type. Only images and videos are allowed.');
    }

    const fileSize = fileBuffer.length;
    const maxSize = isImage ? this.maxImageSize : this.maxFileSize;

    if (fileSize > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
  }

  /**
   * Check if file is an image
   */
  private isImage(mimeType: string): boolean {
    return this.allowedImageTypes.includes(mimeType);
  }

  /**
   * Check if file is a video
   */
  private isVideo(mimeType: string): boolean {
    return this.allowedVideoTypes.includes(mimeType);
  }

  /**
   * Generate file path for storage
   */
  private generateFilePath(fileName: string, mimeType: string, subfolder?: string): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    let folder = this.isImage(mimeType) ? 'images' : 'videos';
    if (subfolder) {
      folder = subfolder;
    }
    
    return `${folder}/${year}/${month}/${fileName}`;
  }

  /**
   * Get file statistics
   */
  async getFileStatistics(): Promise<{
    totalFiles: number;
    totalSize: number;
    imageCount: number;
    videoCount: number;
  }> {
    const stats = await prisma.mediaFile.aggregate({
      _count: {
        id: true
      },
      _sum: {
        size: true
      }
    });

    const imageCount = await prisma.mediaFile.count({
      where: {
        mimeType: {
          in: this.allowedImageTypes
        }
      }
    });

    const videoCount = await prisma.mediaFile.count({
      where: {
        mimeType: {
          in: this.allowedVideoTypes
        }
      }
    });

    return {
      totalFiles: stats._count.id || 0,
      totalSize: stats._sum.size || 0,
      imageCount,
      videoCount
    };
  }
}

export const localMediaService = new LocalMediaService();