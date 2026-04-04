# Media Management API Documentation

## Overview

The Media Management API provides endpoints for uploading, managing, and serving media files (images and videos) for the Memorial Pages service. It integrates with Yandex Cloud Object Storage for file storage and includes automatic thumbnail generation for images.

## Features

- ✅ File upload to Yandex Cloud Object Storage
- ✅ Automatic thumbnail generation for images
- ✅ File type and size validation
- ✅ File deletion and cleanup
- ✅ Support for images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV)
- ✅ Automatic cleanup of unused files
- ✅ File statistics and management

## Configuration

### Environment Variables

```bash
# Yandex Cloud Object Storage
YANDEX_CLOUD_ACCESS_KEY_ID=your-access-key
YANDEX_CLOUD_SECRET_ACCESS_KEY=your-secret-key
YANDEX_CLOUD_BUCKET_NAME=memorial-pages-storage
YANDEX_CLOUD_REGION=ru-central1
```

### File Limits

- **Images**: Maximum 10MB per file
- **Videos**: Maximum 50MB per file
- **Supported image formats**: JPEG, PNG, WebP, GIF
- **Supported video formats**: MP4, WebM, QuickTime (MOV)
- **Maximum files per request**: 10 files

## API Endpoints

### Upload Single File

```http
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

**Request Body:**
- `file`: The file to upload (form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "photo.jpg",
    "url": "https://storage.yandexcloud.net/bucket/path/to/file.jpg",
    "thumbnailUrl": "https://storage.yandexcloud.net/bucket/thumbnails/file_thumb.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedBy": "user-uuid",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Upload Multiple Files

```http
POST /api/media/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

**Request Body:**
- `files`: Array of files to upload (form-data)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid1",
      "originalName": "photo1.jpg",
      "url": "https://storage.yandexcloud.net/bucket/path/to/file1.jpg",
      "thumbnailUrl": "https://storage.yandexcloud.net/bucket/thumbnails/file1_thumb.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "uploadedBy": "user-uuid",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get File by ID

```http
GET /api/media/:fileId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "photo.jpg",
    "url": "https://storage.yandexcloud.net/bucket/path/to/file.jpg",
    "thumbnailUrl": "https://storage.yandexcloud.net/bucket/thumbnails/file_thumb.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedBy": "user-uuid",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete File

```http
DELETE /api/media/:fileId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Get Files for Memorial Page

```http
GET /api/media/memorial-page/:memorialPageId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "originalName": "photo.jpg",
      "url": "https://storage.yandexcloud.net/bucket/path/to/file.jpg",
      "thumbnailUrl": "https://storage.yandexcloud.net/bucket/thumbnails/file_thumb.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "uploadedBy": "user-uuid",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Admin: Get File Statistics

```http
GET /api/media/admin/statistics
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 1250,
    "totalSize": 5368709120,
    "imageCount": 1000,
    "videoCount": 250
  }
}
```

### Admin: Cleanup Unused Files

```http
POST /api/media/admin/cleanup
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 15 unused files"
}
```

## Error Responses

### Validation Errors

```json
{
  "error": "Validation error",
  "details": "File ID must be a valid UUID"
}
```

### File Upload Errors

```json
{
  "error": "File too large. Maximum size is 50MB for videos and 10MB for images."
}
```

```json
{
  "error": "Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed."
}
```

### Authorization Errors

```json
{
  "error": "User not authenticated"
}
```

```json
{
  "error": "Not authorized to delete this file"
}
```

## File Storage Structure

Files are organized in Yandex Cloud Object Storage with the following structure:

```
bucket-name/
├── images/
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── uuid1.jpg
│   │   │   └── uuid2.png
│   │   └── 02/
│   └── 2023/
├── videos/
│   ├── 2024/
│   │   ├── 01/
│   │   │   └── uuid3.mp4
│   │   └── 02/
│   └── 2023/
└── thumbnails/
    ├── 2024/
    │   ├── 01/
    │   │   ├── uuid1_thumb.jpg
    │   │   └── uuid2_thumb.jpg
    │   └── 02/
    └── 2023/
```

## Thumbnail Generation

- Automatically generated for all uploaded images
- Size: 300x300 pixels (cropped to fit)
- Format: JPEG with 80% quality
- Stored in `/thumbnails/` directory

## Cleanup Process

The system includes an automatic cleanup process that:

1. Identifies files not associated with any memorial page, memory, or tribute
2. Only deletes files older than 24 hours (to avoid deleting recently uploaded files)
3. Removes both original files and thumbnails from cloud storage
4. Removes database records

### Manual Cleanup

Administrators can trigger manual cleanup via the API endpoint or by calling:

```typescript
import { mediaService } from './services/mediaService';

const deletedCount = await mediaService.cleanupUnusedFiles();
console.log(`Deleted ${deletedCount} unused files`);
```

### Scheduled Cleanup

The cleanup job can be scheduled to run automatically:

```typescript
import { MediaCleanupJob } from './jobs/mediaCleanup';

// Schedule to run daily at 2 AM
MediaCleanupJob.scheduleDaily();
```

## Security Considerations

1. **Authentication**: All upload and delete operations require valid JWT tokens
2. **Authorization**: Users can only delete files they uploaded
3. **File Validation**: Strict validation of file types and sizes
4. **Public Access**: Uploaded files are publicly accessible via their URLs
5. **Rate Limiting**: Consider implementing rate limiting for upload endpoints

## Dependencies

The media management system requires the following npm packages:

```bash
npm install aws-sdk sharp mime-types
npm install --save-dev @types/mime-types
```

## Integration with Memorial Pages

Media files are automatically associated with memorial pages through the database relationships. When files are uploaded for a specific memorial page, they should be linked via the memorial page service.

Example integration:

```typescript
// Upload file and associate with memorial page
const uploadResult = await mediaService.uploadFile(buffer, filename, mimetype, userId);
await memorialPageService.addMediaFile(memorialPageId, uploadResult.mediaFile.id);
```