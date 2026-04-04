/**
 * Utility functions for media file handling
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

export const FILE_SIZE_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  THUMBNAIL_SIZE: { width: 300, height: 300 }
};

/**
 * Check if a MIME type is a supported image format
 */
export const isImageType = (mimeType: string): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
};

/**
 * Check if a MIME type is a supported video format
 */
export const isVideoType = (mimeType: string): boolean => {
  return ALLOWED_VIDEO_TYPES.includes(mimeType);
};

/**
 * Get the appropriate file size limit based on MIME type
 */
export const getFileSizeLimit = (mimeType: string): number => {
  if (isImageType(mimeType)) {
    return FILE_SIZE_LIMITS.IMAGE_MAX_SIZE;
  }
  if (isVideoType(mimeType)) {
    return FILE_SIZE_LIMITS.VIDEO_MAX_SIZE;
  }
  return FILE_SIZE_LIMITS.IMAGE_MAX_SIZE; // Default to image limit
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a safe filename from original name
 */
export const generateSafeFilename = (originalName: string): string => {
  // Remove special characters and spaces, keep only alphanumeric, dots, and hyphens
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Validate file type and size
 */
export const validateFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
  const { mimetype, size } = file;
  
  // Check if file type is supported
  if (!isImageType(mimetype) && !isVideoType(mimetype)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'
    };
  }
  
  // Check file size
  const maxSize = getFileSizeLimit(mimetype);
  if (size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${isImageType(mimetype) ? 'images' : 'videos'}.`
    };
  }
  
  return { isValid: true };
};