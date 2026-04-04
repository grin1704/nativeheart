# Timeline Feature - Дизайн

## Архитектура

### 1. База данных (Prisma Schema)

```prisma
model TimelineEvent {
  id              String        @id @default(uuid())
  memorialPageId  String
  memorialPage    MemorialPage  @relation(fields: [memorialPageId], references: [id], onDelete: Cascade)
  year            Int
  description     String        @db.Text
  order           Int           @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([memorialPageId])
  @@map("timeline_events")
}
```

### 2. Backend Services

**TimelineService** (`backend/src/services/timelineService.ts`):
- `getTimelineEvents(pageId)` - получить все события страницы
- `createTimelineEvent(pageId, data)` - создать событие
- `updateTimelineEvent(eventId, data)` - обновить событие
- `deleteTimelineEvent(eventId)` - удалить событие
- `reorderTimelineEvents(pageId, eventIds)` - изменить порядок

**TimelineController** (`backend/src/controllers/timelineController.ts`):
- Обработка HTTP запросов
- Валидация прав доступа (только владелец/коллаборатор)
- Вызов методов сервиса

### 3. API Routes (Next.js)

**Frontend API Routes**:
- `frontend/src/app/api/memorial-pages/[id]/timeline/route.ts` - GET, POST
- `frontend/src/app/api/memorial-pages/[id]/timeline/[eventId]/route.ts` - PUT, DELETE
- `frontend/src/app/api/memorial-pages/[id]/timeline/reorder/route.ts` - PUT

### 4. Frontend Components

**TimelineEditor** (`frontend/src/components/editor/TimelineEditor.tsx`):
```typescript
interface TimelineEvent {
  id: string;
  year: number;
  description: string;
  order: number;
}

interface TimelineEditorProps {
  pageId: string;
  events: TimelineEvent[];
  onUpdate: () => void;
}
```

Функционал:
- Drag-and-drop для изменения порядка (react-beautiful-dnd или @dnd-kit)
- Форма добавления/редактирования события
- Кнопки удаления
- Автосохранение при изменении порядка

**MemorialTimeline** (`frontend/src/components/memorial/MemorialTimeline.tsx`):
```typescript
interface MemorialTimelineProps {
  events: TimelineEvent[];
}
```

Функционал:
- Отображение событий в хронологическом порядке
- Вертикальная линия с маркерами
- Адаптивный дизайн

### 5. Типы (TypeScript)

Добавить в `frontend/src/types/index.ts`:
```typescript
export interface TimelineEvent {
  id: string;
  memorialPageId: string;
  year: number;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

## Валидация

**Backend** (`backend/src/validation/timeline.ts`):
```typescript
- year: число от 1800 до (текущий год + 10)
- description: строка, 1-500 символов, обязательное
- order: число >= 0
```

## Стили

**CSS** (в `frontend/src/app/globals.css` или отдельный модуль):
- Вертикальная линия: border-left с цветом #d4c5b9
- Кружки-маркеры: круглые div с border
- Карточки событий: бежевый фон (#f5f1ed), тень, скругленные углы
- Год: крупный шрифт (24-32px), цвет #8b7355
- Описание: обычный текст, цвет #4a4a4a

## Интеграция

1. Добавить `TimelineEditor` в `frontend/src/app/dashboard/edit/[id]/page.tsx`
2. Добавить `MemorialTimeline` в `frontend/src/components/MemorialPageView.tsx`
3. Обновить `MemorialPage` модель в Prisma для связи с `TimelineEvent`
4. Добавить роуты в `backend/src/routes/timeline.ts`
