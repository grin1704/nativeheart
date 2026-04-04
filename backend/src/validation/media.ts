import Joi from 'joi';

export const mediaValidation = {
  // File upload validation (handled by multer middleware)
  fileUpload: {
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
      // Allowed image types
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      // Allowed video types
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      
      const isImage = allowedImageTypes.includes(file.mimetype);
      const isVideo = allowedVideoTypes.includes(file.mimetype);
      
      if (isImage || isVideo) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'), false);
      }
    },
    
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
      files: 10 // Maximum 10 files per request
    }
  },

  // Validation for file ID parameter
  fileId: Joi.object({
    fileId: Joi.string().uuid().required().messages({
      'string.guid': 'File ID must be a valid UUID',
      'any.required': 'File ID is required'
    })
  }),

  // Validation for memorial page ID parameter
  memorialPageId: Joi.object({
    memorialPageId: Joi.string().uuid().required().messages({
      'string.guid': 'Memorial page ID must be a valid UUID',
      'any.required': 'Memorial page ID is required'
    })
  }),

  // Validation for file metadata (optional body data)
  fileMetadata: Joi.object({
    description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    category: Joi.string().valid('profile', 'gallery', 'biography', 'memory', 'tribute').optional()
  }).optional()
};

// Helper function to validate file size based on type
export const validateFileSize = (file: Express.Multer.File): boolean => {
  const isImage = file.mimetype.startsWith('image/');
  const maxImageSize = 10 * 1024 * 1024; // 10MB for images
  const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
  
  if (isImage && file.size > maxImageSize) {
    return false;
  }
  
  if (!isImage && file.size > maxVideoSize) {
    return false;
  }
  
  return true;
};

// Helper function to get file type category
export const getFileCategory = (mimeType: string): 'image' | 'video' | 'unknown' => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'unknown';
};