# Memories API Documentation

## Overview

The Memories API provides functionality for managing memories (воспоминания) within memorial pages. Memories are chronologically organized entries that can include text, dates, and photos. This feature is only available to users with trial or premium subscriptions.

## Base URL

```
/api
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Memory

Creates a new memory for a memorial page.

**Endpoint:** `POST /memorial-pages/:memorialPageId/memories`

**Authentication:** Required

**Parameters:**
- `memorialPageId` (path) - UUID of the memorial page

**Request Body:**
```json
{
  "date": "2020-06-15",
  "title": "Летние каникулы",
  "description": "Прекрасные воспоминания о летних каникулах на даче.",
  "photoIds": ["uuid1", "uuid2"]
}
```

**Validation Rules:**
- `date`: Required, valid date
- `title`: Required, 1-255 characters
- `description`: Optional, max 5000 characters
- `photoIds`: Optional array, max 20 photo IDs

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-uuid",
    "memorialPageId": "page-uuid",
    "date": "2020-06-15T00:00:00.000Z",
    "title": "Летние каникулы",
    "description": "Прекрасные воспоминания о летних каникулах на даче.",
    "createdAt": "2024-10-03T10:00:00.000Z",
    "photos": [
      {
        "id": "photo-uuid",
        "url": "https://storage.yandexcloud.net/...",
        "thumbnailUrl": "https://storage.yandexcloud.net/...",
        "originalName": "summer.jpg",
        "orderIndex": 0
      }
    ]
  },
  "message": "Воспоминание успешно создано"
}
```

### 2. Get Memories for Page

Retrieves memories for a memorial page with pagination and sorting.

**Endpoint:** `GET /memorial-pages/:memorialPageId/memories`

**Authentication:** Optional (public pages can be viewed without auth)

**Parameters:**
- `memorialPageId` (path) - UUID of the memorial page

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)
- `sortBy` (optional) - Sort field: 'date' or 'createdAt' (default: 'date')
- `sortOrder` (optional) - Sort order: 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "memory-uuid",
      "memorialPageId": "page-uuid",
      "date": "2020-06-15T00:00:00.000Z",
      "title": "Летние каникулы",
      "description": "Прекрасные воспоминания...",
      "createdAt": "2024-10-03T10:00:00.000Z",
      "photos": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 3. Get Memory by ID

Retrieves a specific memory by its ID.

**Endpoint:** `GET /memories/:memoryId`

**Authentication:** Not required

**Parameters:**
- `memoryId` (path) - UUID of the memory

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-uuid",
    "memorialPageId": "page-uuid",
    "date": "2020-06-15T00:00:00.000Z",
    "title": "Летние каникулы",
    "description": "Прекрасные воспоминания о летних каникулах на даче.",
    "createdAt": "2024-10-03T10:00:00.000Z",
    "photos": [
      {
        "id": "photo-uuid",
        "url": "https://storage.yandexcloud.net/...",
        "thumbnailUrl": "https://storage.yandexcloud.net/...",
        "originalName": "summer.jpg",
        "orderIndex": 0
      }
    ]
  }
}
```

### 4. Update Memory

Updates an existing memory.

**Endpoint:** `PUT /memories/:memoryId`

**Authentication:** Required

**Parameters:**
- `memoryId` (path) - UUID of the memory

**Request Body:**
```json
{
  "date": "2020-06-16",
  "title": "Незабываемые летние каникулы",
  "description": "Обновленное описание воспоминания.",
  "photoIds": ["uuid1", "uuid3"]
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-uuid",
    "memorialPageId": "page-uuid",
    "date": "2020-06-16T00:00:00.000Z",
    "title": "Незабываемые летние каникулы",
    "description": "Обновленное описание воспоминания.",
    "createdAt": "2024-10-03T10:00:00.000Z",
    "photos": [...]
  },
  "message": "Воспоминание успешно обновлено"
}
```

### 5. Delete Memory

Deletes a memory and all associated photos.

**Endpoint:** `DELETE /memories/:memoryId`

**Authentication:** Required

**Parameters:**
- `memoryId` (path) - UUID of the memory

**Response:**
```json
{
  "success": true,
  "message": "Воспоминание успешно удалено"
}
```

### 6. Add Photo to Memory

Adds a photo to an existing memory.

**Endpoint:** `POST /memories/:memoryId/photos`

**Authentication:** Required

**Parameters:**
- `memoryId` (path) - UUID of the memory

**Request Body:**
```json
{
  "photoId": "photo-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Фотография успешно добавлена к воспоминанию"
}
```

### 7. Remove Photo from Memory

Removes a photo from a memory.

**Endpoint:** `DELETE /memories/:memoryId/photos/:photoId`

**Authentication:** Required

**Parameters:**
- `memoryId` (path) - UUID of the memory
- `photoId` (path) - UUID of the photo to remove

**Response:**
```json
{
  "success": true,
  "message": "Фотография успешно удалена из воспоминания"
}
```

### 8. Reorder Memory Photos

Changes the order of photos within a memory.

**Endpoint:** `PUT /memories/:memoryId/photos/reorder`

**Authentication:** Required

**Parameters:**
- `memoryId` (path) - UUID of the memory

**Request Body:**
```json
{
  "photoIds": ["photo-uuid-2", "photo-uuid-1", "photo-uuid-3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Порядок фотографий успешно изменен"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Заголовок не может быть пустым"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Токен аутентификации не предоставлен"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "ForbiddenError",
  "message": "Раздел воспоминаний доступен только в платной версии"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Воспоминание не найдено"
}
```

## Subscription Requirements

The memories feature is only available to users with:
- **Trial subscription** (14 days)
- **Premium subscription** (paid)

Users with **free subscription** will receive a 403 Forbidden error when trying to access memories functionality.

## Access Control

### View Access
- **Public pages**: Anyone can view memories
- **Private pages**: Requires password or owner/collaborator access

### Edit Access
- **Page owner**: Full access to create, update, delete memories
- **Collaborators**: Full access to create, update, delete memories (if accepted invitation)
- **Others**: No access

## Photo Management

### Photo Requirements
- Must be uploaded by the same user
- Must be image files (MIME type starts with 'image/')
- Maximum 20 photos per memory

### Photo Ordering
- Photos are ordered by `orderIndex` field
- When adding photos, they are appended to the end
- Use reorder endpoint to change photo sequence

## Chronological Sorting

Memories support two sorting options:

1. **By Date** (`sortBy=date`): Sorts by the memory's date field
2. **By Creation Time** (`sortBy=createdAt`): Sorts by when the memory was created

Both support ascending (`asc`) and descending (`desc`) order. Default is descending by date, showing newest memories first.

## Usage Examples

### Creating a Memory with Photos

1. First, upload photos using the Media API
2. Then create the memory with photo IDs:

```javascript
// Upload photos
const photo1 = await uploadPhoto('summer1.jpg');
const photo2 = await uploadPhoto('summer2.jpg');

// Create memory
const memory = await fetch('/api/memorial-pages/page-id/memories', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    date: '2020-06-15',
    title: 'Летние каникулы',
    description: 'Прекрасные воспоминания...',
    photoIds: [photo1.id, photo2.id]
  })
});
```

### Getting Chronological Timeline

```javascript
// Get memories in chronological order (oldest first)
const timeline = await fetch('/api/memorial-pages/page-id/memories?sortBy=date&sortOrder=asc');

// Get recent memories (newest first)
const recent = await fetch('/api/memorial-pages/page-id/memories?sortBy=date&sortOrder=desc&limit=5');
```