# Biography API Documentation

## Overview

The Biography API provides functionality for managing biography text and photos for memorial pages with subscription-based limitations.

## Features

- **Text Management**: Create and update biography text with character limits for free accounts
- **Photo Management**: Add, remove, and reorder photos in biography
- **Subscription Limits**: Automatic enforcement of 1000 character limit for free accounts
- **Access Control**: Only page owners and collaborators can edit biography

## Endpoints

### Get Biography

```http
GET /api/memorial-pages/:id/biography
```

**Description**: Retrieves biography data for a memorial page with subscription-aware display.

**Parameters**:
- `id` (path): Memorial page ID

**Response**:
```json
{
  "success": true,
  "data": {
    "text": "Biography text content...",
    "photos": [
      {
        "id": "photo-uuid",
        "url": "https://storage.url/photo.jpg",
        "thumbnailUrl": "https://storage.url/thumb.jpg",
        "originalName": "photo.jpg",
        "orderIndex": 0
      }
    ],
    "isLimited": false,
    "characterLimit": 1000
  }
}
```

**Notes**:
- For free accounts, text is truncated to 1000 characters if longer
- `isLimited` indicates if text was truncated
- `characterLimit` shows the limit for the current subscription type

### Update Biography

```http
PUT /api/memorial-pages/:id/biography
Authorization: Bearer <token>
```

**Description**: Updates biography text and/or photos.

**Parameters**:
- `id` (path): Memorial page ID

**Request Body**:
```json
{
  "text": "Updated biography text...",
  "photoIds": ["photo-uuid-1", "photo-uuid-2"]
}
```

**Validation**:
- `text`: Optional string, max 50,000 characters
- `photoIds`: Optional array of UUIDs, max 20 photos
- For free accounts: text limited to 1000 characters

**Response**:
```json
{
  "success": true,
  "data": {
    "text": "Updated biography text...",
    "photos": [...],
    "isLimited": false,
    "characterLimit": null
  },
  "message": "Биография успешно обновлена"
}
```

### Add Biography Photo

```http
POST /api/memorial-pages/:id/biography/photos/:photoId
Authorization: Bearer <token>
```

**Description**: Adds a photo to the biography.

**Parameters**:
- `id` (path): Memorial page ID
- `photoId` (path): Media file ID

**Validation**:
- Photo must exist and belong to the user
- Photo must be an image file
- Photo cannot already be in biography

**Response**:
```json
{
  "success": true,
  "message": "Фотография добавлена в биографию"
}
```

### Remove Biography Photo

```http
DELETE /api/memorial-pages/:id/biography/photos/:photoId
Authorization: Bearer <token>
```

**Description**: Removes a photo from the biography.

**Parameters**:
- `id` (path): Memorial page ID
- `photoId` (path): Media file ID

**Response**:
```json
{
  "success": true,
  "message": "Фотография удалена из биографии"
}
```

### Reorder Biography Photos

```http
PUT /api/memorial-pages/:id/biography/photos/reorder
Authorization: Bearer <token>
```

**Description**: Changes the order of photos in the biography.

**Parameters**:
- `id` (path): Memorial page ID

**Request Body**:
```json
{
  "photoIds": ["photo-uuid-2", "photo-uuid-1", "photo-uuid-3"]
}
```

**Validation**:
- All photo IDs must exist in the biography
- Array order determines new display order

**Response**:
```json
{
  "success": true,
  "message": "Порядок фотографий обновлен"
}
```

## Subscription Limits

### Free Account Limitations
- Biography text limited to 1000 characters
- Text longer than 1000 characters is truncated in display
- Full text is preserved in database for potential upgrade

### Trial/Premium Account Features
- Unlimited biography text length (up to 50,000 characters)
- Full access to all biography features

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Для бесплатного аккаунта текст биографии не может превышать 1000 символов"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "У вас нет прав для редактирования этой страницы"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Памятная страница не найдена"
}
```

## Database Schema

### BiographyPhoto Table
```sql
CREATE TABLE "biography_photos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "memorial_page_id" UUID NOT NULL,
    "media_file_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE,
    FOREIGN KEY ("media_file_id") REFERENCES "media_files"("id") ON DELETE CASCADE,
    UNIQUE ("memorial_page_id", "media_file_id")
);
```

## Usage Examples

### Frontend Integration

```javascript
// Get biography data
const getBiography = async (pageId) => {
  const response = await fetch(`/api/memorial-pages/${pageId}/biography`);
  const data = await response.json();
  
  if (data.data.isLimited) {
    console.log(`Text truncated to ${data.data.characterLimit} characters`);
  }
  
  return data.data;
};

// Update biography text
const updateBiography = async (pageId, text, token) => {
  const response = await fetch(`/api/memorial-pages/${pageId}/biography`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
  
  return response.json();
};

// Add photo to biography
const addBiographyPhoto = async (pageId, photoId, token) => {
  const response = await fetch(`/api/memorial-pages/${pageId}/biography/photos/${photoId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Character Limit Handling

```javascript
const handleTextUpdate = async (pageId, text, userSubscription, token) => {
  // Check limit on frontend for better UX
  if (userSubscription === 'free' && text.length > 1000) {
    const confirmed = confirm(
      `Текст превышает лимит в 1000 символов для бесплатного аккаунта. 
       Продолжить? Текст будет обрезан при отображении.`
    );
    
    if (!confirmed) return;
  }
  
  try {
    await updateBiography(pageId, text, token);
  } catch (error) {
    if (error.message.includes('1000 символов')) {
      // Handle character limit error
      alert('Превышен лимит символов для бесплатного аккаунта');
    }
  }
};
```