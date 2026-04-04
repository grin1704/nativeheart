# Timeline Feature - Задачи

## Статус: 🟢 Завершено

---

## Задача 1: Модель данных и миграция
**Статус**: ✅ Завершено

### Шаги:
1. Добавить модель `TimelineEvent` в `backend/prisma/schema.prisma`
2. Добавить связь в модель `MemorialPage`
3. Создать миграцию: `npx prisma migrate dev --name add_timeline_events`
4. Обновить Prisma Client: `npx prisma generate`

### Файлы:
- `backend/prisma/schema.prisma`

---

## Задача 2: Backend - Validation
**Статус**: ✅ Завершено

### Шаги:
1. Создать `backend/src/validation/timeline.ts`
2. Добавить схемы валидации для создания/обновления событий
3. Добавить валидацию для reorder

### Файлы:
- `backend/src/validation/timeline.ts`

---

## Задача 3: Backend - Service
**Статус**: ✅ Завершено

### Шаги:
1. Создать `backend/src/services/timelineService.ts`
2. Реализовать методы:
   - `getTimelineEvents(pageId)`
   - `createTimelineEvent(pageId, data)`
   - `updateTimelineEvent(eventId, data)`
   - `deleteTimelineEvent(eventId)`
   - `reorderTimelineEvents(pageId, eventIds)`

### Файлы:
- `backend/src/services/timelineService.ts`

---

## Задача 4: Backend - Controller
**Статус**: ✅ Завершено

### Шаги:
1. Создать `backend/src/controllers/timelineController.ts`
2. Реализовать обработчики для всех операций
3. Добавить проверку прав доступа (владелец/коллаборатор)

### Файлы:
- `backend/src/controllers/timelineController.ts`

---

## Задача 5: Backend - Routes
**Статус**: ✅ Завершено

### Шаги:
1. Создать `backend/src/routes/timeline.ts`
2. Настроить роуты с middleware аутентификации
3. Подключить роуты в главный app

### Файлы:
- `backend/src/routes/timeline.ts`
- `backend/src/index.ts` (или главный файл приложения)

---

## Задача 6: Frontend - API Routes
**Статус**: ✅ Завершено

### Шаги:
1. Создать `frontend/src/app/api/memorial-pages/[id]/timeline/route.ts` (GET, POST)
2. Создать `frontend/src/app/api/memorial-pages/[id]/timeline/[eventId]/route.ts` (PUT, DELETE)
3. Создать `frontend/src/app/api/memorial-pages/[id]/timeline/reorder/route.ts` (PUT)

### Файлы:
- `frontend/src/app/api/memorial-pages/[id]/timeline/route.ts`
- `frontend/src/app/api/memorial-pages/[id]/timeline/[eventId]/route.ts`
- `frontend/src/app/api/memorial-pages/[id]/timeline/reorder/route.ts`

---

## Задача 7: Frontend - Types
**Статус**: ✅ Завершено

### Шаги:
1. Добавить интерфейс `TimelineEvent` в `frontend/src/types/index.ts`

### Файлы:
- `frontend/src/types/index.ts`

---

## Задача 8: Frontend - TimelineEditor Component
**Статус**: ✅ Завершено

### Шаги:
1. Создать `frontend/src/components/editor/TimelineEditor.tsx`
2. Реализовать:
   - Список событий с drag-and-drop
   - Форму добавления события
   - Редактирование события
   - Удаление события
   - Автосохранение порядка
3. Добавить валидацию на клиенте

### Файлы:
- `frontend/src/components/editor/TimelineEditor.tsx`

---

## Задача 9: Frontend - MemorialTimeline Component
**Статус**: ✅ Завершено

### Шаги:
1. Создать `frontend/src/components/memorial/MemorialTimeline.tsx`
2. Реализовать визуальное отображение timeline:
   - Вертикальная линия
   - Кружки-маркеры
   - Карточки с годом и описанием
3. Добавить адаптивный дизайн
4. Добавить стили (можно в globals.css или CSS модуль)

### Файлы:
- `frontend/src/components/memorial/MemorialTimeline.tsx`
- `frontend/src/app/globals.css` (или отдельный CSS модуль)

---

## Задача 10: Интеграция в Dashboard
**Статус**: ✅ Завершено

### Шаги:
1. Добавить `TimelineEditor` в страницу редактирования
2. Добавить вкладку/секцию "Хронология жизни"
3. Загрузка и сохранение данных timeline

### Файлы:
- `frontend/src/app/dashboard/edit/[id]/page.tsx`

---

## Задача 11: Интеграция в публичную страницу
**Статус**: ✅ Завершено

### Шаги:
1. Добавить `MemorialTimeline` в `MemorialPageView`
2. Загрузка данных timeline при рендере страницы
3. Условное отображение (только если есть события)

### Файлы:
- `frontend/src/components/MemorialPageView.tsx`
- `frontend/src/app/memorial/[slug]/page.tsx`

---

## Задача 12: Тестирование
**Статус**: ✅ Завершено

### Шаги:
1. Создать тестовый скрипт для API: `test-timeline-api.js`
2. Создать руководство по тестированию UI: `test-timeline-ui.md`
3. Протестировать:
   - Создание событий
   - Редактирование
   - Удаление
   - Изменение порядка
   - Отображение на публичной странице

### Файлы:
- `test-timeline-api.js`
- `test-timeline-ui.md`

---

## Задача 13: Документация
**Статус**: ✅ Завершено

### Шаги:
1. Создать `TIMELINE_API.md` с описанием API
2. Создать `TIMELINE_USER_GUIDE.md` с инструкцией для пользователей
3. Обновить основной README.md

### Файлы:
- `TIMELINE_API.md`
- `TIMELINE_USER_GUIDE.md`
- `README.md`

---

## Порядок выполнения

1. **Задачи 1-5**: Backend (база данных, сервисы, API)
2. **Задачи 6-7**: Frontend API и типы
3. **Задачи 8-9**: Frontend компоненты
4. **Задачи 10-11**: Интеграция
5. **Задачи 12-13**: Тестирование и документация

## Оценка времени
- Backend: ~2-3 часа
- Frontend: ~3-4 часа
- Интеграция и тестирование: ~1-2 часа
- **Всего**: ~6-9 часов
