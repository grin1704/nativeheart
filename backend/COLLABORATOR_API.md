# Collaborator API Documentation

## Overview

The Collaborator API provides functionality for managing collaborative editing of memorial pages. It allows page owners to invite other users as collaborators, manage permissions, and handle invitation workflows.

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Invite Collaborator

**POST** `/api/memorial-pages/:pageId/collaborators`

Invites a user to collaborate on a memorial page.

**Parameters:**
- `pageId` (string): Memorial page ID

**Request Body:**
```json
{
  "email": "collaborator@example.com",
  "permissions": "edit"  // "edit" or "view", defaults to "edit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Приглашение отправлено",
  "data": {
    "id": "collaborator-id",
    "memorialPageId": "page-id",
    "userId": "user-id",
    "permissions": "edit",
    "invitedAt": "2024-01-01T00:00:00.000Z",
    "acceptedAt": null,
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "collaborator@example.com"
    }
  }
}
```

### 2. Get Page Collaborators

**GET** `/api/memorial-pages/:pageId/collaborators`

Gets all collaborators for a memorial page.

**Parameters:**
- `pageId` (string): Memorial page ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "collaborator-id",
      "memorialPageId": "page-id",
      "userId": "user-id",
      "permissions": "edit",
      "invitedAt": "2024-01-01T00:00:00.000Z",
      "acceptedAt": "2024-01-01T01:00:00.000Z",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "email": "collaborator@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Remove Collaborator

**DELETE** `/api/memorial-pages/:pageId/collaborators/:collaboratorId`

Removes a collaborator from a memorial page.

**Parameters:**
- `pageId` (string): Memorial page ID
- `collaboratorId` (string): Collaborator ID

**Response:**
```json
{
  "success": true,
  "message": "Соавтор удален"
}
```

### 4. Update Collaborator Permissions

**PUT** `/api/memorial-pages/:pageId/collaborators/:collaboratorId/permissions`

Updates collaborator permissions (owner only).

**Parameters:**
- `pageId` (string): Memorial page ID
- `collaboratorId` (string): Collaborator ID

**Request Body:**
```json
{
  "permissions": "view"  // "edit" or "view"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Права соавтора обновлены",
  "data": {
    "id": "collaborator-id",
    "memorialPageId": "page-id",
    "userId": "user-id",
    "permissions": "view",
    "invitedAt": "2024-01-01T00:00:00.000Z",
    "acceptedAt": "2024-01-01T01:00:00.000Z",
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "collaborator@example.com"
    }
  }
}
```

### 5. Get User's Pending Invitations

**GET** `/api/my/invitations`

Gets pending collaboration invitations for the current user.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "collaborator-id",
      "memorialPageId": "page-id",
      "memorialPageName": "John Doe",
      "inviterName": "Jane Smith",
      "permissions": "edit",
      "invitedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 6. Get User's Collaborator Pages

**GET** `/api/my/collaborator-pages`

Gets memorial pages where the user is a collaborator.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "page-id",
      "slug": "john-doe-1950-2020",
      "fullName": "John Doe",
      "birthDate": "1950-01-01",
      "deathDate": "2020-12-31",
      "mainPhoto": {
        "id": "photo-id",
        "url": "https://storage.example.com/photo.jpg",
        "thumbnailUrl": "https://storage.example.com/photo-thumb.jpg"
      },
      "owner": {
        "id": "owner-id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "collaboratorPermissions": "edit",
      "collaboratorSince": "2024-01-01T01:00:00.000Z",
      "_count": {
        "memories": 5,
        "tributes": 3,
        "mediaFiles": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 7. Get Invitation Details

**GET** `/api/invitations/:collaboratorId`

Gets details of a specific invitation.

**Parameters:**
- `collaboratorId` (string): Collaborator invitation ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "collaborator-id",
    "memorialPageId": "page-id",
    "memorialPageName": "John Doe",
    "inviterName": "Jane Smith",
    "permissions": "edit",
    "invitedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. Accept Invitation

**POST** `/api/invitations/:collaboratorId/accept`

Accepts a collaboration invitation.

**Parameters:**
- `collaboratorId` (string): Collaborator invitation ID

**Response:**
```json
{
  "success": true,
  "message": "Приглашение принято",
  "data": {
    "id": "collaborator-id",
    "memorialPageId": "page-id",
    "userId": "user-id",
    "permissions": "edit",
    "invitedAt": "2024-01-01T00:00:00.000Z",
    "acceptedAt": "2024-01-01T01:00:00.000Z",
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "collaborator@example.com"
    }
  }
}
```

### 9. Decline Invitation

**POST** `/api/invitations/:collaboratorId/decline`

Declines a collaboration invitation.

**Parameters:**
- `collaboratorId` (string): Collaborator invitation ID

**Response:**
```json
{
  "success": true,
  "message": "Приглашение отклонено"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Требуется аутентификация"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "У вас нет прав для выполнения этого действия"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Ресурс не найден"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Внутренняя ошибка сервера"
}
```

## Email Notifications

The system automatically sends email notifications for the following events:

1. **Invitation Sent**: When a user is invited to collaborate
2. **Invitation Accepted**: When a collaborator accepts an invitation
3. **Invitation Declined**: When a collaborator declines an invitation
4. **Page Changes**: When a collaborator makes changes to a memorial page

## Permission Levels

- **edit**: Can modify all content on the memorial page
- **view**: Can only view the memorial page (read-only access)

## Access Control

- **Page Owner**: Can invite/remove collaborators, update permissions, and has full edit access
- **Collaborators**: Access level depends on assigned permissions
- **Public**: Can view public memorial pages and leave tributes (if enabled)

## Integration with Memorial Page Editing

When collaborators make changes to memorial pages, the system:

1. Validates that the user has appropriate permissions
2. Records the change in the database
3. Sends email notifications to the page owner and other collaborators
4. Updates the page's `updatedAt` timestamp

## Rate Limiting

Consider implementing rate limiting for invitation endpoints to prevent spam:
- Maximum 10 invitations per hour per user
- Maximum 5 invitation attempts per email per day