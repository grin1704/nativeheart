# Memorial Pages API Documentation

## Overview

The Memorial Pages API provides endpoints for creating, managing, and accessing memorial pages. It supports both authenticated operations (for page owners and collaborators) and public access (for viewing pages).

## Base URL

```
http://localhost:3001/api/memorial-pages
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Some endpoints support optional authentication or are completely public.

## Endpoints

### 1. Create Memorial Page

**POST** `/`

Creates a new memorial page for the authenticated user.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "Иван Иванович Иванов",
  "birthDate": "1950-01-15",
  "deathDate": "2023-12-01",
  "mainPhotoId": "uuid-of-uploaded-photo", // optional
  "biographyText": "Краткая биография...", // optional
  "isPrivate": false, // optional, default: false
  "password": "secret123" // required if isPrivate is true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-uuid",
    "slug": "ivan-ivanovich-ivanov",
    "ownerId": "user-uuid",
    "fullName": "Иван Иванович Иванов",
    "birthDate": "1950-01-15T00:00:00.000Z",
    "deathDate": "2023-12-01T00:00:00.000Z",
    "mainPhotoId": "photo-uuid",
    "biographyText": "Краткая биография...",
    "isPrivate": false,
    "qrCodeUrl": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "owner": {
      "id": "user-uuid",
      "name": "Пользователь",
      "email": "user@example.com"
    },
    "mainPhoto": {
      "id": "photo-uuid",
      "url": "https://storage.yandexcloud.net/...",
      "thumbnailUrl": "https://storage.yandexcloud.net/..."
    },
    "_count": {
      "memories": 0,
      "tributes": 0,
      "mediaFiles": 1
    }
  },
  "message": "Памятная страница успешно создана"
}
```

### 2. Get Memorial Page by ID

**GET** `/id/:id`

Retrieves a memorial page by its ID.

**Authentication:** Optional (provides additional access for owners/collaborators)

**Query Parameters:**
- `password` (string, optional): Password for private pages

**Response:** Same as create response

### 3. Get Memorial Page by Slug

**GET** `/slug/:slug`

Retrieves a memorial page by its slug (URL-friendly identifier).

**Authentication:** Optional

**Query Parameters:**
- `password` (string, optional): Password for private pages

**Response:** Same as create response

### 4. Update Memorial Page

**PUT** `/:id`

Updates an existing memorial page.

**Authentication:** Required (owner or collaborator)

**Request Body:** Same as create, but all fields are optional
```json
{
  "fullName": "Новое имя", // optional
  "birthDate": "1950-01-15", // optional
  "deathDate": "2023-12-01", // optional
  "mainPhotoId": "new-photo-uuid", // optional, null to remove
  "biographyText": "Обновленная биография", // optional
  "isPrivate": true, // optional
  "password": "new-password" // optional, empty string to remove
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated memorial page */ },
  "message": "Памятная страница успешно обновлена"
}
```

### 5. Delete Memorial Page

**DELETE** `/:id`

Deletes a memorial page. Only the owner can delete a page.

**Authentication:** Required (owner only)

**Response:**
```json
{
  "success": true,
  "message": "Памятная страница успешно удалена"
}
```

### 6. Get User's Memorial Pages

**GET** `/my`

Retrieves all memorial pages owned by the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by full name

**Response:**
```json
{
  "success": true,
  "data": [
    { /* memorial page object */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 7. Verify Page Password

**POST** `/:id/verify-password`

Verifies the password for a private memorial page.

**Authentication:** Not required

**Request Body:**
```json
{
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true
  },
  "message": "Пароль верный"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message in Russian"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required or invalid password)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Memorial Page Creation/Update

- `fullName`: 2-255 characters, required for creation
- `birthDate`: Valid ISO date, cannot be in the future, required for creation
- `deathDate`: Valid ISO date, cannot be in the future, must be after birth date, required for creation
- `mainPhotoId`: Valid UUID of an uploaded media file owned by the user
- `biographyText`: Maximum 50,000 characters
- `isPrivate`: Boolean value
- `password`: 4-50 characters, required if `isPrivate` is true

### Query Parameters

- `page`: Integer >= 1
- `limit`: Integer 1-100
- `search`: Maximum 255 characters

## Slug Generation

Slugs are automatically generated from the `fullName` field:

1. Convert to lowercase
2. Transliterate Cyrillic characters to Latin
3. Replace spaces with hyphens
4. Remove special characters
5. Ensure uniqueness by appending numbers if needed

Examples:
- "Иван Петров" → "ivan-petrov"
- "Анна-Мария Сидорова" → "anna-mariya-sidorova"
- "Иван Петров" (duplicate) → "ivan-petrov-1"

## Access Control

### Public Access
- Anyone can view non-private memorial pages
- Private pages require password verification

### Authenticated Access
- Users can create, update, and delete their own memorial pages
- Collaborators can edit pages they have access to
- Owners have full control over their pages

### Private Pages
- Require password for public access
- Owners and collaborators bypass password requirement
- Password verification is session-based (implementation pending)

## Integration Notes

### Media Files
- `mainPhotoId` must reference an existing media file uploaded by the user
- Media file validation is performed on create/update operations

### Subscription Limits
- Biography character limits are enforced based on subscription type
- Feature access (galleries, memories, etc.) is controlled by subscription status

### Future Enhancements
- QR code generation (pending implementation)
- Collaborator management (pending implementation)
- Content moderation (pending implementation)