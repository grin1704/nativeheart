# Tributes API Documentation

## Overview

The Tributes API allows visitors to leave tributes (отзывы/слова близких) on memorial pages. This feature includes automatic moderation, photo attachments, and subscription-based access control.

## Features

- ✅ Public tribute creation (visitors can leave tributes without authentication)
- ✅ Photo attachments to tributes
- ✅ Automatic approval system (configurable for manual moderation)
- ✅ Subscription-based access control (free accounts don't show tributes section)
- ✅ Pagination support
- ✅ Moderation endpoints for admin users
- ✅ CRUD operations for tribute management

## Subscription Access

| Subscription Type | Tributes Access |
|------------------|----------------|
| Trial | ✅ Full access |
| Premium | ✅ Full access |
| Free | ❌ No access |

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Create Tribute
```http
POST /api/memorial-pages/{memorialPageId}/tributes
```

**Request Body:**
```json
{
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "text": "Beautiful memories of a wonderful person...",
  "photoId": "uuid-of-uploaded-photo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tribute-uuid",
    "memorialPageId": "page-uuid",
    "authorName": "John Doe",
    "authorEmail": "john@example.com",
    "text": "Beautiful memories...",
    "photoId": "photo-uuid",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "photo": {
      "id": "photo-uuid",
      "url": "https://storage.yandexcloud.net/...",
      "thumbnailUrl": "https://storage.yandexcloud.net/...",
      "originalName": "photo.jpg"
    }
  }
}
```

#### Get Tributes for Memorial Page
```http
GET /api/memorial-pages/{memorialPageId}/tributes
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `approved` (optional): Filter by approval status (default: true for public access)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tribute-uuid",
      "authorName": "John Doe",
      "authorEmail": "john@example.com",
      "text": "Beautiful memories...",
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "photo": {
        "id": "photo-uuid",
        "url": "https://storage.yandexcloud.net/...",
        "thumbnailUrl": "https://storage.yandexcloud.net/...",
        "originalName": "photo.jpg"
      }
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

#### Get Specific Tribute
```http
GET /api/tributes/{tributeId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tribute-uuid",
    "memorialPageId": "page-uuid",
    "authorName": "John Doe",
    "authorEmail": "john@example.com",
    "text": "Beautiful memories...",
    "photoId": "photo-uuid",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "photo": {
      "id": "photo-uuid",
      "url": "https://storage.yandexcloud.net/...",
      "thumbnailUrl": "https://storage.yandexcloud.net/...",
      "originalName": "photo.jpg"
    }
  }
}
```

### Protected Endpoints (Authentication Required)

#### Update Tribute
```http
PUT /api/tributes/{tributeId}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "authorName": "Updated Name",
  "authorEmail": "updated@example.com",
  "text": "Updated tribute text...",
  "photoId": "new-photo-uuid",
  "isApproved": true
}
```

#### Delete Tribute
```http
DELETE /api/tributes/{tributeId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Tribute deleted successfully"
}
```

### Moderation Endpoints (Admin Access)

#### Moderate Tribute
```http
PATCH /api/tributes/{tributeId}/moderate
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "isApproved": true,
  "reason": "Content is appropriate and respectful"
}
```

#### Get Tributes for Moderation
```http
GET /api/admin/tributes/moderation
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tribute-uuid",
      "authorName": "John Doe",
      "text": "Pending tribute...",
      "isApproved": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "memorialPage": {
        "id": "page-uuid",
        "slug": "john-smith",
        "fullName": "John Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

## Validation Rules

### Create/Update Tribute
- `authorName`: Required, 1-255 characters
- `authorEmail`: Optional, valid email format
- `text`: Required, 1-5000 characters
- `photoId`: Optional, valid UUID, must reference an existing image file

### Photo Attachments
- Only image files are allowed (MIME type must start with 'image/')
- Photo must be uploaded through the media API first
- Photo will be automatically resized and thumbnails generated

## Error Responses

### Subscription Access Denied
```json
{
  "success": false,
  "error": "Tributes feature is not available for this subscription type"
}
```

### Memorial Page Not Found
```json
{
  "success": false,
  "error": "Memorial page not found"
}
```

### Invalid Photo
```json
{
  "success": false,
  "error": "Only image files are allowed for tribute photos"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed: authorName is required"
}
```

## Usage Examples

### JavaScript/Frontend Integration

```javascript
// Create a tribute
const createTribute = async (memorialPageId, tributeData) => {
  const response = await fetch(`/api/memorial-pages/${memorialPageId}/tributes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tributeData)
  });
  
  return response.json();
};

// Get tributes with pagination
const getTributes = async (memorialPageId, page = 1) => {
  const response = await fetch(
    `/api/memorial-pages/${memorialPageId}/tributes?page=${page}&limit=10`
  );
  
  return response.json();
};

// Upload photo and create tribute
const createTributeWithPhoto = async (memorialPageId, tributeData, photoFile) => {
  // First upload the photo
  const formData = new FormData();
  formData.append('file', photoFile);
  formData.append('category', 'tribute');
  
  const uploadResponse = await fetch('/api/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const uploadResult = await uploadResponse.json();
  
  // Then create tribute with photo
  return createTribute(memorialPageId, {
    ...tributeData,
    photoId: uploadResult.data.id
  });
};
```

### cURL Examples

```bash
# Create a tribute
curl -X POST "http://localhost:3001/api/memorial-pages/{pageId}/tributes" \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "John Doe",
    "authorEmail": "john@example.com",
    "text": "Beautiful memories of a wonderful person..."
  }'

# Get tributes with pagination
curl "http://localhost:3001/api/memorial-pages/{pageId}/tributes?page=1&limit=5"

# Moderate a tribute (admin)
curl -X PATCH "http://localhost:3001/api/tributes/{tributeId}/moderate" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "isApproved": true,
    "reason": "Content approved"
  }'
```

## Testing

Run the tribute tests:

```bash
# Make sure the server is running on port 3001
npm run dev

# In another terminal, run the tests
node test-tributes.js
```

The test file covers:
- ✅ Creating tributes (public access)
- ✅ Getting tributes with pagination
- ✅ Photo attachments
- ✅ Subscription access control
- ✅ Moderation functionality
- ✅ CRUD operations
- ✅ Error handling

## Implementation Status

- ✅ **API for adding tributes by visitors** - Complete
- ✅ **Automatic moderation system** - Complete (auto-approval enabled)
- ✅ **Photo attachment capability** - Complete
- ✅ **Subscription access control** - Complete

All requirements from task 7.1, 7.2, and 7.3 have been implemented successfully.