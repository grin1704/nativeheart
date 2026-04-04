# Сервис памятных страниц — обзор проекта

## Что это

Веб-платформа для создания и управления мемориальными страницами умерших людей. Пользователи могут создавать страницы с биографией, фото/видео галереей, воспоминаниями, отзывами, таймлайном жизни и местом захоронения на карте. Также каждой странице создаётся уникальный qr-код.

## Структура проекта

```
/
├── frontend/        # Next.js 14 (порт 3000)
├── backend/         # Node.js + Express API (порт 3001)
├── backups/         # Бэкапы проекта
├── scripts/         # Скрипты запуска/остановки
└── design/          # Дизайн-макеты и схемы
```

## Технологический стек

### Frontend (frontend/)
- Next.js 14 с App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- React Query
- PWA (next-pwa) — установка на устройства, офлайн режим
- Lucide React — иконки
- React Quill — rich text редактор биографии
- yet-another-react-lightbox — лайтбокс для галереи

### Backend (backend/)
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT аутентификация
- bcryptjs — хеширование паролей
- Nodemailer — отправка email
- Multer — загрузка файлов
- Sharp — обработка изображений (миниатюры)
- QRCode — генерация QR-кодов

## Запуск проекта

```bash
# Запуск обоих сервисов
./scripts/dev-start.sh

# Остановка
./scripts/dev-stop.sh

# Статус
./scripts/dev-status.sh

# Перезапуск
./scripts/dev-restart.sh
```

Frontend: http://localhost:3000  
Backend API: http://localhost:3001  
Admin панель: http://localhost:3000/admin/login

## Переменные окружения

### Backend (backend/.env)
- `DATABASE_URL` — PostgreSQL строка подключения
- `JWT_SECRET` — секрет для JWT токенов
- `YANDEX_CLOUD_*` — Yandex Cloud Object Storage (хранение медиафайлов)
- `YANDEX_MAPS_API_KEY` — Яндекс Карты
- `SMTP_*` — Email (настроен mail.ru)
- `VK_CLIENT_ID/SECRET` — OAuth ВКонтакте
- `YANDEX_CLIENT_ID/SECRET` — OAuth Яндекс

### Frontend (frontend/.env.local)
- `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `BACKEND_URL=http://localhost:3001`
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` — ключ Яндекс Карт

## База данных (PostgreSQL + Prisma)

Основные модели:
- `User` — пользователи (email/password + OAuth VK/Яндекс)
- `MemorialPage` — мемориальные страницы (slug, владелец, фото, биография)
- `MediaFile` — медиафайлы (фото/видео)
- `Memory` — воспоминания с фотографиями
- `Tribute` — отзывы/соболезнования с лайками
- `BurialLocation` — место захоронения (адрес + координаты)
- `Collaborator` — соавторы страниц с гранулярными правами
- `PhotoGallery` / `VideoGallery` — галереи
- `BiographyPhoto` — фото в биографии
- `TimelineEvent` — события таймлайна (год/месяц/день + локация)
- `TributeLike` — лайки отзывов
- `AdminUser` — администраторы
- `SystemSetting` — системные настройки
- `ContentModeration` — модерация контента

## Архитектура API

Frontend использует Next.js API Routes как прокси к backend:
- `frontend/src/app/api/` — API роуты Next.js (прокси)
- `backend/src/routes/` — реальные Express роуты
- `backend/src/controllers/` — контроллеры
- `backend/src/services/` — бизнес-логика

## Реализованные фичи

- Регистрация/вход (email + OAuth VK/Яндекс)
- Верификация email
- Сброс пароля
- Создание/редактирование мемориальных страниц
- Биография с rich text редактором и фотографиями
- Фото галерея (загрузка, кроппер, drag-and-drop сортировка, лайтбокс)
- Видео галерея (загрузка до 100MB + внешние видео: YouTube, VK, Rutube, vkvideo.ru)
- Воспоминания с фотографиями
- Отзывы/соболезнования с модерацией и лайками
- Таймлайн жизни (события с датой и локацией)
- Место захоронения с картой (Яндекс Карты, выбор точки)
- QR-коды для страниц
- Приватные страницы с паролем
- Соавторы с гранулярными правами доступа
- Удаление страниц
- Миниатюры для видео
- PWA (установка как приложение)
- Админ панель (пользователи, страницы, модерация, настройки)

## Хранение медиафайлов

Поддерживаются два режима:
1. Локальное хранение (`backend/uploads/`) — для разработки
2. Yandex Cloud Object Storage — для продакшена

## Бэкапы

Бэкапы хранятся в `backups/`. Создать бэкап:
```bash
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)" && mkdir -p "$BACKUP_DIR" && rsync -a --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='backups' --exclude='.DS_Store' . "$BACKUP_DIR/"
```

## Важные заметки

- Корень проекта: `/Users/grin/Yandex.Disk.localized/Kiro`
- В корне много `.md` файлов — это документация по отдельным фичам, можно игнорировать
- Миграции БД: `backend/prisma/migrations/`
- Seed данные: `backend/prisma/seed.ts`
- Команды БД: `cd backend && npm run db:migrate` / `npm run db:studio`
