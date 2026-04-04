# Burial Location API Documentation

## Overview

The Burial Location API provides functionality for managing burial location information for memorial pages, including address storage, geocoding, and map integration with Yandex Maps API.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create or Update Burial Location

Creates a new burial location or updates an existing one for a memorial page.

**Endpoint:** `POST /memorial-pages/:pageId/burial-location`

**Authentication:** Required

**Parameters:**
- `pageId` (string, required): Memorial page ID

**Request Body:**
```json
{
  "address": "string (required, 1-1000 chars)",
  "description": "string (optional, max 2000 chars)",
  "latitude": "number (optional, -90 to 90)",
  "longitude": "number (optional, -180 to 180)",
  "instructions": "string (optional, max 2000 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Место захоронения успешно сохранено",
  "data": {
    "id": "uuid",
    "memorialPageId": "uuid",
    "address": "string",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "instructions": "string",
    "geocodedAddress": "string (if geocoding was performed)"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/memorial-pages/123e4567-e89b-12d3-a456-426614174000/burial-location \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Москва, Новодевичье кладбище",
    "description": "Участок 7, ряд 15",
    "instructions": "От главного входа пройти прямо 200 метров"
  }'
```

### 2. Get Burial Location

Retrieves burial location information for a memorial page.

**Endpoint:** `GET /memorial-pages/:pageId/burial-location`

**Authentication:** Not required (public access)

**Parameters:**
- `pageId` (string, required): Memorial page ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "memorialPageId": "uuid",
    "address": "string",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "instructions": "string"
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3001/api/memorial-pages/123e4567-e89b-12d3-a456-426614174000/burial-location
```

### 3. Update Burial Location

Updates an existing burial location for a memorial page.

**Endpoint:** `PUT /memorial-pages/:pageId/burial-location`

**Authentication:** Required

**Parameters:**
- `pageId` (string, required): Memorial page ID

**Request Body:**
```json
{
  "address": "string (optional, 1-1000 chars)",
  "description": "string (optional, max 2000 chars)",
  "latitude": "number (optional, -90 to 90, null to clear)",
  "longitude": "number (optional, -180 to 180, null to clear)",
  "instructions": "string (optional, max 2000 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Место захоронения успешно обновлено",
  "data": {
    "id": "uuid",
    "memorialPageId": "uuid",
    "address": "string",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "instructions": "string",
    "geocodedAddress": "string (if geocoding was performed)"
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:3001/api/memorial-pages/123e4567-e89b-12d3-a456-426614174000/burial-location \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Участок 7, ряд 15, место 3",
    "latitude": 55.726842,
    "longitude": 37.555186
  }'
```

### 4. Delete Burial Location

Deletes burial location information for a memorial page.

**Endpoint:** `DELETE /memorial-pages/:pageId/burial-location`

**Authentication:** Required

**Parameters:**
- `pageId` (string, required): Memorial page ID

**Response:**
```json
{
  "success": true,
  "message": "Место захоронения успешно удалено"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/memorial-pages/123e4567-e89b-12d3-a456-426614174000/burial-location \
  -H "Authorization: Bearer your-jwt-token"
```

### 5. Geocode Address

Converts an address to coordinates using Yandex Geocoder API.

**Endpoint:** `POST /geocode`

**Authentication:** Not required

**Request Body:**
```json
{
  "address": "string (required, 1-1000 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "latitude": "number",
    "longitude": "number",
    "formattedAddress": "string"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Москва, Красная площадь, 1"
  }'
```

### 6. Reverse Geocode

Converts coordinates to an address using Yandex Geocoder API.

**Endpoint:** `POST /reverse-geocode`

**Authentication:** Not required

**Request Body:**
```json
{
  "latitude": "number (required, -90 to 90)",
  "longitude": "number (required, -180 to 180)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "string"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/reverse-geocode \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 55.7558,
    "longitude": 37.6176
  }'
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional, for validation errors
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: User doesn't have permission to perform the action
- `404 Not Found`: Memorial page or burial location not found
- `500 Internal Server Error`: Server error

## Environment Variables

The following environment variables are required for full functionality:

```env
# Yandex Geocoder API Key (optional, but recommended for geocoding features)
YANDEX_GEOCODER_API_KEY=your_yandex_geocoder_api_key
```

## Features

### Automatic Geocoding

When creating or updating a burial location with an address but without coordinates, the system automatically attempts to geocode the address using Yandex Geocoder API to obtain latitude and longitude coordinates.

### Coordinate Validation

All coordinates are validated to ensure they fall within valid ranges:
- Latitude: -90 to 90 degrees
- Longitude: -180 to 180 degrees

### Access Control

- **Create/Update/Delete**: Only memorial page owners and collaborators can modify burial location information
- **Read**: Burial location information is publicly accessible (respects memorial page privacy settings)

### Integration with Memorial Pages

Burial location data is automatically included when fetching memorial page details, providing a complete view of the memorial information.

## Usage Examples

### Complete Workflow

1. **Create a burial location with address only:**
```bash
# System will automatically geocode the address
curl -X POST http://localhost:3001/api/memorial-pages/page-id/burial-location \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Москва, Новодевичье кладбище",
    "description": "Участок 7, ряд 15",
    "instructions": "От главного входа пройти прямо 200 метров"
  }'
```

2. **Update with specific coordinates:**
```bash
curl -X PUT http://localhost:3001/api/memorial-pages/page-id/burial-location \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 55.726842,
    "longitude": 37.555186,
    "instructions": "Обновленные инструкции по поиску"
  }'
```

3. **Get burial location for display:**
```bash
curl -X GET http://localhost:3001/api/memorial-pages/page-id/burial-location
```

### Frontend Integration

The burial location data can be used with Yandex Maps JavaScript API for displaying interactive maps:

```javascript
// Example of using the burial location data with Yandex Maps
const burialLocation = await fetch('/api/memorial-pages/page-id/burial-location')
  .then(res => res.json());

if (burialLocation.success && burialLocation.data.latitude && burialLocation.data.longitude) {
  // Initialize Yandex Map with the coordinates
  const map = new ymaps.Map('map', {
    center: [burialLocation.data.latitude, burialLocation.data.longitude],
    zoom: 15
  });
  
  // Add placemark
  const placemark = new ymaps.Placemark([
    burialLocation.data.latitude, 
    burialLocation.data.longitude
  ], {
    balloonContent: burialLocation.data.description || burialLocation.data.address
  });
  
  map.geoObjects.add(placemark);
}
```