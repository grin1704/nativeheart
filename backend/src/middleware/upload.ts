import multer from 'multer';
import { Request } from 'express';
import { mediaValidation, validateFileSize } from '../validation/media';

// Configure multer for memory storage (files will be processed in memory)
const storage = multer.memoryStorage();

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      // Use validation from media validation
      mediaValidation.fileUpload.fileFilter(req, file, cb);
    } catch (error) {
      cb(error as Error);
    }
  },
  limits: mediaValidation.fileUpload.limits
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName);
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for handling upload errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
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
  
  // Pass other errors to the next error handler
  next(error);
};

// Middleware to validate file size after multer processing
export const validateFileSizes = (req: Request, res: any, next: any) => {
  try {
    // Check single file
    if (req.file && !validateFileSize(req.file)) {
      return res.status(400).json({
        error: 'File size exceeds limits. Images: 10MB max, Videos: 100MB max.'
      });
    }
    
    // Check multiple files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (!validateFileSize(file)) {
          return res.status(400).json({
            error: `File "${file.originalname}" exceeds size limits. Images: 10MB max, Videos: 100MB max.`
          });
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};