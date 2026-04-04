# Password Protection API Documentation

## Overview

The password protection system allows memorial page owners to set passwords on their pages, restricting public access to the content. The system includes session management to remember entered passwords for a limited time.

## Features

- **Password Setting**: Memorial page owners can set passwords when creating or updating pages
- **Session Management**: Entered passwords are remembered for 30 minutes using in-memory sessions
- **Automatic Protection**: All public routes that access memorial page content are automatically protected
- **Owner/Collaborator Bypass**: Page owners and collaborators always have access without passwords
- **Multiple Access Methods**: Passwords can be provided via API calls or query parameters

## API Endpoints

### 1. Verify Password and Grant Session Access

**POST** `/api/memorial-pages/:id/verify-password`

Verifies a password for a private memorial page and grants session access if correct.

**Request Body:**
```json
{
  "password": "string"
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

**Error Response:**
```json
{
  "success": true,
  "data": {
    "isValid": false
  },
  "message": "Неверный пароль"
}
```

### 2. Check Password Access Status

**GET** `/api/memorial-pages/:id/password-access`

Checks if the current session has password access to the memorial page.

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAccess": true
  }
}
```

### 3. Clear Password Access

**DELETE** `/api/memorial-pages/:id/password-access`

Clears password access for the current session.

**Response:**
```json
{
  "success": true,
  "message": "Доступ к странице отозван"
}
```

## Protected Routes

The following routes are automatically protected by the password middleware:

### Memorial Pages
- `GET /api/memorial-pages/id/:id`
- `GET /api/memorial-pages/slug/:slug`
- `GET /api/memorial-pages/:id/biography`

### Memories
- `GET /api/memories/memorial-pages/:memorialPageId/memories`

### Tributes
- `GET /api/tributes/memorial-pages/:memorialPageId/tributes`
- `POST /api/tributes/memorial-pages/:memorialPageId/tributes`

### Galleries
- `GET /api/gallery/:pageId/photos`
- `GET /api/gallery/:pageId/videos`

## Access Methods

### 1. Session-Based Access (Recommended)

1. Call the verify password endpoint
2. If successful, subsequent requests will have access for 30 minutes
3. No need to include password in further requests

```javascript
// Verify password
const response = await fetch('/api/memorial-pages/123/verify-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'secretpassword' })
});

// If successful, can now access protected content
const pageData = await fetch('/api/memorial-pages/id/123');
```

### 2. Query Parameter Access

Include the password as a query parameter in the request:

```javascript
const pageData = await fetch('/api/memorial-pages/id/123?password=secretpassword');
```

## Session Management

### Session Storage
- Sessions are stored in-memory on the server
- Each session is identified by IP address, User-Agent, and timestamp
- Sessions automatically expire after 30 minutes of inactivity

### Session Cleanup
- Expired sessions are automatically cleaned up every 5 minutes
- Sessions can be manually cleared using the clear access endpoint

### Security Considerations
- Sessions are tied to IP address and User-Agent for basic security
- In production, consider using Redis or database-backed sessions
- Passwords are hashed using bcrypt before storage

## Error Handling

### Common Error Responses

**401 Unauthorized - Password Required:**
```json
{
  "error": "Unauthorized",
  "message": "Для доступа к этой странице требуется пароль"
}
```

**401 Unauthorized - Invalid Password:**
```json
{
  "error": "Unauthorized", 
  "message": "Неверный пароль"
}
```

**404 Not Found - Page Not Found:**
```json
{
  "error": "Not Found",
  "message": "Памятная страница не найдена"
}
```

## Frontend Integration

### React Components

The system includes React components for easy frontend integration:

#### PasswordForm Component
```tsx
import PasswordForm from '@/components/PasswordForm';

<PasswordForm
  onSubmit={handlePasswordSubmit}
  loading={loading}
  error={error}
  title="Доступ к памятной странице"
  description="Эта страница защищена паролем..."
/>
```

#### PasswordProtectedPage HOC
```tsx
import PasswordProtectedPage from '@/components/PasswordProtectedPage';

<PasswordProtectedPage pageId={pageId}>
  <MemorialPageContent />
</PasswordProtectedPage>
```

#### usePasswordAccess Hook
```tsx
import { usePasswordAccess } from '@/hooks/usePasswordAccess';

const { verifyPassword, clearAccess, checkAccess, loading, error } = usePasswordAccess();
```

## Implementation Details

### Middleware Flow

1. **checkPasswordAccess** middleware runs on protected routes
2. Extracts page ID from request parameters
3. Checks if page is private and has password
4. Verifies user permissions (owner/collaborator bypass)
5. Checks session for existing password access
6. Allows query parameter password for direct access
7. Throws 401 error if password required but not provided

### Password Validation

- Passwords are validated using Joi schema
- Minimum 4 characters, maximum 50 characters
- Required for private pages, forbidden for public pages
- Stored as bcrypt hashes in database

### Database Schema

The memorial_pages table includes:
- `is_private`: Boolean flag for privacy
- `password_hash`: Bcrypt hash of the password (nullable)

## Testing

Use the provided test script to verify functionality:

```bash
node backend/test-password-protection.js
```

The test covers:
- Password verification with correct/incorrect passwords
- Session management
- Owner/collaborator access bypass
- Protected route access
- Query parameter access method

## Production Considerations

1. **Session Storage**: Replace in-memory sessions with Redis or database
2. **Rate Limiting**: Add rate limiting to password verification endpoints
3. **Logging**: Log password access attempts for security monitoring
4. **HTTPS**: Ensure all password-related requests use HTTPS
5. **Session Security**: Consider additional session security measures (CSRF tokens, etc.)