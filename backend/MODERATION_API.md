# API модерации контента

## Обзор

API модерации контента предоставляет администраторам возможность управлять пользовательским контентом, включая памятные страницы, отзывы и воспоминания. Система поддерживает одобрение, отклонение и удаление неподходящего контента.

## Аутентификация

Все endpoints требуют аутентификации администратора с соответствующими правами доступа:

```
Authorization: Bearer <admin_token>
```

## Права доступа

- `moderation:read` - просмотр статистики и очереди модерации
- `moderation:write` - одобрение и отклонение контента
- `moderation:delete` - удаление неподходящего контента

## Endpoints

### 1. Получить статистику модерации

```http
GET /api/admin/moderation/stats
```

**Ответ:**
```json
{
  "pendingMemorialPages": 5,
  "pendingTributes": 12,
  "pendingMemories": 3,
  "totalModerated": 150
}
```

### 2. Получить очередь модерации

```http
GET /api/admin/moderation/queue
```

**Параметры запроса:**
- `contentType` (optional): `memorial_page`, `tribute`, `memory`
- `status` (optional): `pending`, `approved`, `rejected` (по умолчанию: `pending`)
- `page` (optional): номер страницы (по умолчанию: 1)
- `limit` (optional): количество элементов на странице (по умолчанию: 20)

**Пример запроса:**
```http
GET /api/admin/moderation/queue?contentType=tribute&status=pending&page=1&limit=10
```

**Ответ:**
```json
{
  "items": [
    {
      "id": "mod-123",
      "contentType": "tribute",
      "contentId": "tribute-456",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z",
      "content": {
        "id": "tribute-456",
        "authorName": "Иван Иванов",
        "authorEmail": "ivan@example.com",
        "text": "Текст отзыва...",
        "memorialPage": {
          "id": "page-789",
          "fullName": "Петр Петров",
          "slug": "petr-petrov"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "total": 25,
  "totalPages": 3
}
```

### 3. Одобрить контент

```http
POST /api/admin/moderation/{moderationId}/approve
```

**Тело запроса:**
```json
{
  "reason": "Контент соответствует правилам сообщества"
}
```

**Ответ:**
```json
{
  "message": "Контент успешно одобрен"
}
```

### 4. Отклонить контент

```http
POST /api/admin/moderation/{moderationId}/reject
```

**Тело запроса:**
```json
{
  "reason": "Содержит неподходящий контент"
}
```

**Ответ:**
```json
{
  "message": "Контент отклонен"
}
```

### 5. Удалить неподходящий контент

```http
DELETE /api/admin/moderation/{contentType}/{contentId}
```

**Параметры пути:**
- `contentType`: `memorial_page`, `tribute`, `memory`
- `contentId`: ID контента для удаления

**Тело запроса:**
```json
{
  "reason": "Нарушение правил сообщества"
}
```

**Ответ:**
```json
{
  "message": "Неподходящий контент удален"
}
```

### 6. Получить историю модерации

```http
GET /api/admin/moderation/history/{contentType}/{contentId}
```

**Параметры пути:**
- `contentType`: `memorial_page`, `tribute`, `memory`
- `contentId`: ID контента

**Ответ:**
```json
[
  {
    "id": "mod-123",
    "contentType": "tribute",
    "contentId": "tribute-456",
    "status": "approved",
    "createdAt": "2024-01-15T10:30:00Z",
    "moderatedAt": "2024-01-15T11:00:00Z",
    "moderatorId": "admin-789",
    "reason": "Контент одобрен"
  }
]
```

### 7. Массовое одобрение

```http
POST /api/admin/moderation/bulk/approve
```

**Тело запроса:**
```json
{
  "moderationIds": ["mod-123", "mod-456", "mod-789"],
  "reason": "Массовое одобрение качественного контента"
}
```

**Ответ:**
```json
{
  "message": "Обработано: 3 одобрено, 0 ошибок",
  "successful": 3,
  "failed": 0
}
```

### 8. Массовое отклонение

```http
POST /api/admin/moderation/bulk/reject
```

**Тело запроса:**
```json
{
  "moderationIds": ["mod-123", "mod-456"],
  "reason": "Содержит спам или неподходящий контент"
}
```

**Ответ:**
```json
{
  "message": "Обработано: 2 отклонено, 0 ошибок",
  "successful": 2,
  "failed": 0
}
```

## Типы контента

### Memorial Page (Памятная страница)
```json
{
  "id": "page-123",
  "fullName": "Иван Иванович Иванов",
  "slug": "ivan-ivanov-1950-2023",
  "biographyText": "Биография...",
  "owner": {
    "id": "user-456",
    "name": "Анна Иванова",
    "email": "anna@example.com"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Tribute (Отзыв)
```json
{
  "id": "tribute-123",
  "authorName": "Петр Петров",
  "authorEmail": "petr@example.com",
  "text": "Текст отзыва...",
  "memorialPage": {
    "id": "page-456",
    "fullName": "Иван Иванов",
    "slug": "ivan-ivanov"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Memory (Воспоминание)
```json
{
  "id": "memory-123",
  "title": "Детство",
  "description": "Описание воспоминания...",
  "date": "1970-05-15",
  "memorialPage": {
    "id": "page-456",
    "fullName": "Иван Иванов",
    "slug": "ivan-ivanov"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Не авторизован
- `403` - Недостаточно прав доступа
- `404` - Элемент модерации не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Модерация отзывов

```javascript
// Получить все ожидающие отзывы
const response = await fetch('/api/admin/moderation/queue?contentType=tribute&status=pending');
const { items } = await response.json();

// Одобрить отзыв
await fetch(`/api/admin/moderation/${items[0].id}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'Качественный отзыв' })
});
```

### Массовая обработка

```javascript
// Выбрать несколько элементов для одобрения
const selectedIds = ['mod-123', 'mod-456', 'mod-789'];

// Массовое одобрение
await fetch('/api/admin/moderation/bulk/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moderationIds: selectedIds,
    reason: 'Качественный контент'
  })
});
```

## Автоматическая модерация

Система поддерживает автоматическое создание записей модерации при создании нового контента. Это можно настроить через системные настройки:

```json
{
  "key": "moderation_required",
  "value": { "value": true },
  "description": "Требуется ли модерация для новых отзывов"
}
```

## Уведомления

При изменении статуса модерации система автоматически:
- Обновляет статус контента (для отзывов)
- Создает записи в журнале аудита
- Может отправлять уведомления пользователям (в будущих версиях)

## Безопасность

- Все действия модерации логируются в `admin_audit_logs`
- Удаленный контент нельзя восстановить
- Массовые операции имеют ограничения по количеству элементов
- Требуются соответствующие права доступа для каждого действия