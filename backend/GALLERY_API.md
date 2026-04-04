# Gallery API Documentation

## Overview

The Gallery API provides endpoints for managing photo and video galleries for memorial pages. Access to galleries is controlled by subscription type - free accounts cannot access gallery features.

## Base URL

```
/api/gallery
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Subscription Access Control

- **Free accounts**: No access to photo or video galleries
- **Trial/Premium accounts**: Full access to both photo and video galleries

## Endpoints

### Photo Gallery

#### Get Photo Gallery
```http
GET /api/gallery/:pageId/photos
```

**Description**: Retrieves all photos in the gallery for a memorial page.

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "gallery-item-uuid",
        "mediaFileId": "media-file-uuid",
        "title": "Photo title",
        "description": "Photo description",
        "orderIndex": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "mediaFile": {
          "id": "media-file-uuid",
          "originalName": "photo.jpg",
          "url": "https://storage.yandexcloud.net/bucket/path/photo.jpg",
          "thumbnailUrl": "https://storage.yandexcloud.net/bucket/path/photo_thumb.jpg",
          "size": 1024000,
          "mimeType": "image/jpeg",
          "uploadedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "hasAccess": true,
    "subscriptionRequired": false
  }
}
```

**Access Control**: 
- Returns empty array with `hasAccess: false` for free accounts
- Returns full gallery for trial/premium accounts

#### Add Photo to Gallery
```http
POST /api/gallery/:pageId/photos
```

**Description**: Adds a photo to the memorial page gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Request Body**:
```json
{
  "mediaFileId": "media-file-uuid",
  "title": "Optional photo title",
  "description": "Optional photo description"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "gallery-item-uuid",
    "mediaFileId": "media-file-uuid",
    "title": "Photo title",
    "description": "Photo description",
    "orderIndex": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "mediaFile": {
      "id": "media-file-uuid",
      "originalName": "photo.jpg",
      "url": "https://storage.yandexcloud.net/bucket/path/photo.jpg",
      "thumbnailUrl": "https://storage.yandexcloud.net/bucket/path/photo_thumb.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Validation**:
- Media file must exist and belong to the authenticated user
- Media file must be an image (mimeType starts with 'image/')
- Photo cannot already be in the gallery
- User must have edit access to the memorial page
- Page owner must have photo gallery access (trial/premium subscription)

#### Update Photo Gallery Item
```http
PUT /api/gallery/:pageId/photos/:itemId
```

**Description**: Updates title and/or description of a photo gallery item.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page
- `itemId` (path, required): UUID of the gallery item

**Request Body**:
```json
{
  "title": "Updated photo title",
  "description": "Updated photo description"
}
```

**Response**: Same as Add Photo to Gallery

#### Remove Photo from Gallery
```http
DELETE /api/gallery/:pageId/photos/:itemId
```

**Description**: Removes a photo from the gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page
- `itemId` (path, required): UUID of the gallery item

**Response**:
```json
{
  "success": true,
  "message": "Photo removed from gallery successfully"
}
```

#### Reorder Photo Gallery
```http
PUT /api/gallery/:pageId/photos/reorder
```

**Description**: Reorders photos in the gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Request Body**:
```json
{
  "itemIds": ["item-uuid-1", "item-uuid-2", "item-uuid-3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Photo gallery reordered successfully"
}
```

### Video Gallery

#### Get Video Gallery
```http
GET /api/gallery/:pageId/videos
```

**Description**: Retrieves all videos in the gallery for a memorial page.

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Response**: Same structure as photo gallery, but with video files

#### Add Video to Gallery
```http
POST /api/gallery/:pageId/videos
```

**Description**: Adds a video to the memorial page gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Request Body**:
```json
{
  "mediaFileId": "media-file-uuid",
  "title": "Optional video title",
  "description": "Optional video description"
}
```

**Validation**:
- Media file must exist and belong to the authenticated user
- Media file must be a video (mimeType starts with 'video/')
- Video cannot already be in the gallery
- User must have edit access to the memorial page
- Page owner must have video gallery access (trial/premium subscription)

#### Update Video Gallery Item
```http
PUT /api/gallery/:pageId/videos/:itemId
```

**Description**: Updates title and/or description of a video gallery item.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page
- `itemId` (path, required): UUID of the gallery item

**Request Body**:
```json
{
  "title": "Updated video title",
  "description": "Updated video description"
}
```

#### Remove Video from Gallery
```http
DELETE /api/gallery/:pageId/videos/:itemId
```

**Description**: Removes a video from the gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page
- `itemId` (path, required): UUID of the gallery item

#### Reorder Video Gallery
```http
PUT /api/gallery/:pageId/videos/reorder
```

**Description**: Reorders videos in the gallery.

**Authentication**: Required

**Parameters**:
- `pageId` (path, required): UUID of the memorial page

**Request Body**:
```json
{
  "itemIds": ["item-uuid-1", "item-uuid-2", "item-uuid-3"]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Фотогалерея недоступна для данного типа подписки"
}
```

### 404 Not Found
```json
{
  "error": "Памятная страница не найдена"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

## Usage Examples

### Adding a Photo to Gallery

1. First, upload a photo using the media API:
```bash
curl -X POST /api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg"
```

2. Then add it to the gallery:
```bash
curl -X POST /api/gallery/page-uuid/photos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaFileId": "media-file-uuid",
    "title": "Beautiful sunset",
    "description": "A photo from our last vacation together"
  }'
```

### Reordering Gallery Items

```bash
curl -X PUT /api/gallery/page-uuid/photos/reorder \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemIds": ["item-1", "item-3", "item-2"]
  }'
```

## Subscription Feature Access

The gallery API respects subscription-based feature access:

- **Free accounts**: 
  - Cannot add items to galleries
  - Gallery endpoints return empty arrays with `hasAccess: false`
  
- **Trial/Premium accounts**:
  - Full access to both photo and video galleries
  - Can add, update, remove, and reorder gallery items

## Database Schema

### PhotoGallery Table
```sql
CREATE TABLE "photo_gallery" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photo_gallery_pkey" PRIMARY KEY ("id")
);
```

### VideoGallery Table
```sql
CREATE TABLE "video_gallery" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_gallery_pkey" PRIMARY KEY ("id")
);
```

Both tables have:
- Foreign key constraints to memorial_pages and media_files
- Unique constraints on (memorial_page_id, media_file_id)
- Indexes on memorial_page_id for performance
- Cascade delete when memorial page or media file is deleted