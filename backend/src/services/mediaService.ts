import AWS from 'aws-sdk';
import sharp from 'sharp';
import path from 'path';
import mime from 'mime-types';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { localMediaService } from './mediaService-local';

const prisma = new PrismaClient();

// Check if Yandex Cloud is configured
const isYandexCloudConfigured = !!(
  process.env.YANDEX_CLOUD_ACCESS_KEY_ID &&
  process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY &&
  process.env.YANDEX_CLOUD_BUCKET_NAME
);

// Configure AWS SDK for Yandex Cloud Object Storage only if configured
let s3: AWS.S3 | null = null;
if (isYandexCloudConfigured) {
  s3 = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY,
    region: process.env.YANDEX_CLOUD_REGION || 'ru-central1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
  });
}

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

export class MediaService {
  private readonly bucketName: string;
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB for images
  private readonly thumbnailWidth = 600; // Fixed width for masonry layout

  constructor() {
    this.bucketName = process.env.YANDEX_CLOUD_BUCKET_NAME || 'memorial-pages-storage';
  }

  /**
   * Upload a file to Yandex Cloud Object Storage or local storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string | null
  ): Promise<UploadResult> {
    console.log('[MediaService] uploadFile called:', {
      originalName,
      mimeType,
      bufferSize: fileBuffer.length,
      uploadedBy,
      isYandexCloudConfigured
    });

    // If Yandex Cloud is not configured, use local storage
    if (!isYandexCloudConfigured) {
      console.log('Yandex Cloud not configured, using local storage');
      return localMediaService.uploadFile(fileBuffer, originalName, mimeType, uploadedBy);
    }

    // Validate file type and size
    try {
      this.validateFile(fileBuffer, mimeType);
      console.log('[MediaService] File validation passed');
    } catch (error) {
      console.error('[MediaService] File validation failed:', error);
      throw error;
    }

    const fileId = randomUUID();
    const fileExtension = path.extname(originalName);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = this.generateFilePath(fileName, mimeType);

    console.log('[MediaService] Generated file path:', filePath);

    try {
      // Upload original file
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read'
      };

      console.log('[MediaService] Uploading to S3:', {
        bucket: this.bucketName,
        key: filePath,
        contentType: mimeType
      });

      const uploadResult = await s3!.upload(uploadParams).promise();
      const fileUrl = uploadResult.Location;

      console.log('[MediaService] S3 upload successful:', fileUrl);

      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (this.isImage(mimeType)) {
        console.log('[MediaService] Generating thumbnail...');
        try {
          thumbnailUrl = await this.generateThumbnail(fileBuffer, fileId, fileExtension);
          console.log('[MediaService] Thumbnail generated:', thumbnailUrl);
        } catch (thumbnailError) {
          // Log thumbnail generation error but don't fail the upload
          console.error('[MediaService] Thumbnail generation failed (non-critical):', thumbnailError);
          console.log('[MediaService] Continuing without thumbnail');
        }
      }

      // Save to database
      console.log('[MediaService] Saving to database...');
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

      console.log('[MediaService] Database save successful:', mediaFile.id);

      return {
        mediaFile: {
          ...mediaFile,
          thumbnailUrl: mediaFile.thumbnailUrl || undefined
        },
        thumbnailUrl
      };
    } catch (error) {
      console.error('[MediaService] Error uploading file:', error);
      if (error instanceof Error) {
        console.error('[MediaService] Error message:', error.message);
        console.error('[MediaService] Error stack:', error.stack);
      }
      throw new Error('Failed to upload file to cloud storage');
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
    // This method is only called when using cloud storage
    // Local storage handles thumbnails in its own service
    if (!isYandexCloudConfigured || !s3) {
      throw new Error('Cloud storage not configured');
    }

    try {
      // Validate image buffer before processing
      const metadata = await sharp(imageBuffer).metadata();
      console.log('[MediaService] Image metadata:', {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: imageBuffer.length
      });

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

      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: thumbnailPath,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      return uploadResult.Location;
    } catch (error) {
      console.error('[MediaService] Error generating thumbnail:', error);
      if (error instanceof Error) {
        console.error('[MediaService] Thumbnail error details:', error.message);
      }
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Delete file from cloud storage and database
   */
  async deleteFile(fileId: string): Promise<void> {
    // If Yandex Cloud is not configured, use local storage
    if (!isYandexCloudConfigured) {
      return localMediaService.deleteFile(fileId);
    }

    try {
      const mediaFile = await prisma.mediaFile.findUnique({
        where: { id: fileId }
      });

      if (!mediaFile) {
        throw new Error('File not found');
      }

      console.log('Deleting file from Yandex Cloud:', {
        fileId,
        url: mediaFile.url,
        thumbnailUrl: mediaFile.thumbnailUrl
      });

      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(mediaFile.url);
      console.log('Extracted file path:', filePath);
      
      // Delete original file
      await s3!.deleteObject({
        Bucket: this.bucketName,
        Key: filePath
      }).promise();
      console.log('Deleted original file from cloud');

      // Delete thumbnail if exists
      if (mediaFile.thumbnailUrl) {
        const thumbnailPath = this.extractFilePathFromUrl(mediaFile.thumbnailUrl);
        console.log('Extracted thumbnail path:', thumbnailPath);
        await s3!.deleteObject({
          Bucket: this.bucketName,
          Key: thumbnailPath
        }).promise();
        console.log('Deleted thumbnail from cloud');
      }

      // Remove from database
      await prisma.mediaFile.delete({
        where: { id: fileId }
      });
      console.log('Deleted file record from database');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<MediaFile | null> {
    // Both local and cloud storage use the same database, so this method works for both
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
    // Both local and cloud storage use the same database, so this method works for both
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
   * Clean up unused files (files not associated with any memorial page)
   */
  async cleanupUnusedFiles(): Promise<number> {
    // If Yandex Cloud is not configured, use local storage
    if (!isYandexCloudConfigured) {
      return localMediaService.cleanupUnusedFiles();
    }

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
          // Only delete files older than 24 hours to avoid deleting recently uploaded files
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
   * Extract file path from Yandex Cloud URL
   */
  private extractFilePathFromUrl(url: string): string {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === this.bucketName);
    return urlParts.slice(bucketIndex + 1).join('/');
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

export const mediaService = new MediaService();