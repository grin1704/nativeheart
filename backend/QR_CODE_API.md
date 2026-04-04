# QR Code API Documentation

## Overview

API для генерации и управления QR-кодами памятных страниц. QR-коды автоматически генерируются при создании страницы и содержат ссылку на публичную страницу.

## Base URL
```
http://localhost:5000/api/qr-code
```

## Endpoints

### 1. Get QR Code Data

Получение данных QR-кода для памятной страницы.

**Endpoint:** `GET /api/qr-code/:pageId`

**Parameters:**
- `pageId` (path, required) - UUID памятной страницы

**Query Parameters:**
- `format` (optional) - Формат QR-кода: `png`, `svg` (default: `png`)
- `size` (optional) - Размер в пикселях: 100-1000 (default: `300`)
- `margin` (optional) - Отступ: 0-10 (default: `2`)
- `darkColor` (optional) - Цвет темных элементов в формате hex (default: `#000000`)
- `lightColor` (optional) - Цвет светлых элементов в формате hex (default: `#FFFFFF`)

**Headers:**
- `Authorization: Bearer <token>` (optional для владельца/соавтора)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/memorial/ivan-petrov-1950-2020",
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "format": "png",
    "size": 300
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/qr-code/123e4567-e89b-12d3-a456-426614174000?format=svg&size=500" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Download QR Code

Скачивание QR-кода в виде файла.

**Endpoint:** `GET /api/qr-code/:pageId/download`

**Parameters:**
- `pageId` (path, required) - UUID памятной страницы

**Query Parameters:**
- `format` (optional) - Формат файла: `png`, `svg` (default: `png`)
- `size` (optional) - Размер в пикселях: 100-1000 (default: `300`)
- `margin` (optional) - Отступ: 0-10 (default: `2`)
- `darkColor` (optional) - Цвет темных элементов в формате hex
- `lightColor` (optional) - Цвет светлых элементов в формате hex

**Headers:**
- `Authorization: Bearer <token>` (optional для владельца/соавтора)

**Response:**
- Content-Type: `image/png` или `image/svg+xml`
- Content-Disposition: `attachment; filename="qr-code-{slug}.{format}"`
- Binary data

**Example:**
```bash
curl -X GET "http://localhost:5000/api/qr-code/123e4567-e89b-12d3-a456-426614174000/download?format=png&size=400" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o qr-code.png
```

### 3. Regenerate QR Code

Перегенерация QR-кода (полезно при изменении slug страницы).

**Endpoint:** `POST /api/qr-code/:pageId/regenerate`

**Parameters:**
- `pageId` (path, required) - UUID памятной страницы

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "http://localhost:3000/memorial/new-slug",
    "message": "QR-код успешно обновлен"
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/qr-code/123e4567-e89b-12d3-a456-426614174000/regenerate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Public QR Code

Получение QR-кода для публичной страницы по slug.

**Endpoint:** `GET /api/qr-code/public/:slug`

**Parameters:**
- `slug` (path, required) - Slug памятной страницы

**Query Parameters:**
- `format` (optional) - Формат QR-кода: `png`, `svg` (default: `png`)
- `size` (optional) - Размер в пикселях: 100-1000 (default: `300`)
- `margin` (optional) - Отступ: 0-10 (default: `2`)
- `darkColor` (optional) - Цвет темных элементов в формате hex
- `lightColor` (optional) - Цвет светлых элементов в формате hex

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/memorial/ivan-petrov-1950-2020",
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "format": "png",
    "size": 300
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/qr-code/public/ivan-petrov-1950-2020?format=svg&size=400"
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Неподдерживаемый формат. Доступны: png, svg"
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
  "message": "У вас нет доступа к этой странице"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Памятная страница не найдена"
}
```

## Features

### Automatic QR Code Generation
- QR-код автоматически генерируется при создании памятной страницы
- URL QR-кода сохраняется в поле `qrCodeUrl` в базе данных
- QR-код содержит ссылку на публичную страницу: `{FRONTEND_URL}/memorial/{slug}`

### Customization Options
- **Формат**: PNG (по умолчанию) или SVG
- **Размер**: от 100 до 1000 пикселей
- **Отступы**: от 0 до 10 единиц
- **Цвета**: настраиваемые цвета для темных и светлых элементов

### Access Control
- Владельцы и соавторы могут получать QR-коды своих страниц
- Публичный доступ к QR-кодам через slug
- Приватные страницы требуют аутентификации

### File Download
- Скачивание QR-кода в виде файла
- Автоматическое именование файлов: `qr-code-{slug}.{format}`
- Поддержка различных форматов и размеров

## Environment Variables

Убедитесь, что установлена переменная окружения:

```env
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### JavaScript/Frontend Integration

```javascript
// Получение QR-кода для отображения
async function getQRCode(pageId, options = {}) {
  const params = new URLSearchParams(options);
  const response = await fetch(`/api/qr-code/${pageId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.dataUrl; // Base64 data URL для отображения
}

// Скачивание QR-кода
async function downloadQRCode(pageId, format = 'png') {
  const response = await fetch(`/api/qr-code/${pageId}/download?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-code.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Отображение QR-кода в HTML
function displayQRCode(dataUrl) {
  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = 'QR Code';
  document.getElementById('qr-container').appendChild(img);
}
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

function QRCodeDisplay({ pageId, token }) {
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQRCode() {
      try {
        const response = await fetch(`/api/qr-code/${pageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setQRCode(data.data);
      } catch (error) {
        console.error('Failed to fetch QR code:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQRCode();
  }, [pageId, token]);

  const handleDownload = async (format) => {
    try {
      const response = await fetch(`/api/qr-code/${pageId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  if (loading) return <div>Загрузка QR-кода...</div>;
  if (!qrCode) return <div>Не удалось загрузить QR-код</div>;

  return (
    <div className="qr-code-container">
      <img src={qrCode.dataUrl} alt="QR Code" />
      <div className="qr-actions">
        <button onClick={() => handleDownload('png')}>
          Скачать PNG
        </button>
        <button onClick={() => handleDownload('svg')}>
          Скачать SVG
        </button>
      </div>
      <p>Ссылка: {qrCode.url}</p>
    </div>
  );
}
```

## Testing

Для тестирования API используйте файл `test-qr-code.js`:

```bash
node test-qr-code.js
```

Тест проверяет:
- Генерацию QR-кода с базовыми настройками
- Генерацию с пользовательскими параметрами
- Скачивание QR-кода в файл
- Перегенерацию QR-кода
- Публичный доступ к QR-коду
- Обработку ошибок и валидацию

## Notes

- QR-коды генерируются в реальном времени при каждом запросе
- URL QR-кода сохраняется в базе данных для быстрого доступа
- При изменении slug страницы QR-код автоматически обновляется
- Поддерживаются только форматы PNG и SVG
- Максимальный размер QR-кода ограничен 1000 пикселями для производительности