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
- Nodemailer — отправка email (mail.ru SMTP, требует пароль приложения)
- Multer — загрузка файлов
- Sharp — обработка изображений (миниатюры)
- QRCode — генерация QR-кодов
- archiver — создание ZIP-архивов (экспорт QR-табличек)

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

**Важно:** после изменений в backend всегда нужно пересобирать:
```bash
cd backend && npm run build
# затем перезапустить процесс node dist/index.js
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
- `SMTP_HOST=smtp.mail.ru`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASS` — Email (mail.ru, пароль приложения, не обычный пароль)
- `VK_CLIENT_ID/SECRET` — OAuth ВКонтакте
- `YANDEX_CLIENT_ID/SECRET` — OAuth Яндекс

### Frontend (frontend/.env.local)
- `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `BACKEND_URL=http://localhost:3001`
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` — ключ Яндекс Карт

## База данных (PostgreSQL + Prisma)

Основные модели:
- `User` — пользователи (email/password + OAuth VK/Яндекс)
- `MemorialPage` — мемориальные страницы (slug, владелец, фото, биография, `isPremium`)
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
- `QrCodeBatch` — партии QR-табличек (название, количество)
- `QrCodePlate` — физические QR-таблички (token UUID, status: free/assigned, привязка к странице)

## Архитектура API

Frontend использует Next.js API Routes как прокси к backend:
- `frontend/src/app/api/` — API роуты Next.js (прокси)
- `backend/src/routes/` — реальные Express роуты
- `backend/src/controllers/` — контроллеры
- `backend/src/services/` — бизнес-логика

**Важно для клиентских компонентов:** при вызове Next.js API роутов из браузера использовать относительные URL (`/api/media/upload`), а НЕ `${NEXT_PUBLIC_API_URL}/api/...` — иначе на продакшене получится двойной `/api/api/`.

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
- Соавторы с гранулярными правами доступа (email-приглашение, страницы accept/decline)
- Удаление страниц
- Миниатюры для видео
- PWA (установка как приложение)
- Админ панель (пользователи, страницы, модерация, настройки)
- **QR-таблички** — пул физических QR-кодов для гравировки на табличках

## Система подписок и платного функционала

### Логика доступа
Доступ к функционалу страницы определяется по принципу "ИЛИ":
1. `user.subscriptionType` = `trial` или `premium` (и подписка не истекла)
2. `page.isPremium` = `true`

### Типы подписок пользователя (`subscriptionType`)
- `trial` — пробный период (14 дней), полный функционал для всех страниц
- `free` — пробный период истёк, усечённый функционал
- `premium` — платная подписка, полный функционал

### Поле `isPremium` на странице
- `false` — страница в базовом режиме (зависит от подписки владельца)
- `true` — страница оплачена, полный функционал независимо от подписки владельца

### Полный функционал включает
- Неограниченная биография
- Фото галерея
- Видео галерея
- Воспоминания
- Отзывы/соболезнования
- Соавторы

### Перевод страницы в premium
Сейчас — вручную через кнопку "→ Premium" в админке (`/admin/memorial-pages`).
В будущем — автоматически после оплаты per-page.

## Система QR-табличек

### Концепция
Физические таблички с гравированным QR-кодом изготавливаются заранее партиями. QR-код содержит URL вида `https://nativeheart.ru/qr/<uuid>`. При сканировании происходит редирект на мемориальную страницу.

### Логика назначения
- Таблички назначаются только страницам с `isPremium = true`
- При переводе страницы в premium автоматически берётся первая свободная табличка из пула
- `page.qrCodeUrl` обновляется на `https://nativeheart.ru/qr/<token>`
- Один QR-код — одна страница навсегда (не переназначается)
- Если пул пуст — страница становится premium без таблички

### Страницы и роуты
- `/qr/[token]` — SSR редирект на мемориальную страницу (или заглушка если не назначена)
- `/admin/qr-plates` — управление пулом: партии, статистика, экспорт SVG
- `POST /api/admin/memorial-pages/:pageId/upgrade` — перевод страницы в premium

### Экспорт
- Экспорт партии: ZIP-архив с отдельными `.svg` файлами (`qr-<uuid>.svg`)
- Имя файла в архиве соответствует токену таблички

### Цифровой QR vs физическая табличка
- `isPremium = false` → обычный цифровой QR (`/memorial/<slug>`), таблички не расходуются
- `isPremium = true` → QR ведёт через `/qr/<token>` → редирект на страницу

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
- Prisma клиент генерируется в корневой `node_modules` (не в `backend/node_modules`)
- После ручного применения SQL миграций нужно запускать `npx prisma generate` из корня

## Продакшен деплой

Проект задеплоен на сервер и доступен по адресу **https://nativeheart.ru**

### Сервер
- IP: `85.117.234.124`
- ОС: Ubuntu, Docker установлен
- Путь проекта на сервере: `/opt/nativeheart`
- Репозиторий: https://github.com/grin1704/nativeheart
- Диск: 9.6GB, ~3GB свободно (следить за заполнением — `.next/` в git растёт)

### Архитектура на сервере
- Хостовой Nginx (порты 80/443) — reverse proxy
- Docker контейнеры: `nativeheart_frontend` (3000), `nativeheart_backend` (3001), `nativeheart_db` (postgres)
- SSL сертификат Let's Encrypt (автообновление через certbot)
- Рядом работает другой проект: `task.oneset.ru` → `localhost:8080`

### Nginx конфиг продакшена
`/etc/nginx/sites-available/nativeheart` — проксирует `nativeheart.ru` → `localhost:3000`

### Управление на сервере
```bash
cd /opt/nativeheart

# Статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Логи
docker compose -f docker-compose.prod.yml logs backend --tail=30

# Перезапуск
docker compose -f docker-compose.prod.yml restart backend
```

### Деплой обновлений
Сборка происходит **локально**, собранные артефакты (`backend/dist/`, `frontend/.next/`) коммитятся в git.

```bash
# 1. Локально — собрать и запушить
cd backend && npm run build
cd ../frontend
NEXT_PUBLIC_API_URL=https://nativeheart.ru/api NEXT_PUBLIC_YANDEX_MAPS_API_KEY=<key> npm run build
cd ..
git add -A && git commit -m "..." && git push

# 2. На сервере — обновить и пересобрать Docker образы
cd /opt/nativeheart && git pull
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Переменные окружения на сервере
Файл `/opt/nativeheart/.env` (не в git). Ключевые отличия от локального:
- `FRONTEND_URL=https://nativeheart.ru`
- `NEXT_PUBLIC_API_URL=https://nativeheart.ru/api`
- `BACKEND_URL=http://backend:3001` (внутри Docker сети)
- `DATABASE_URL` собирается из `POSTGRES_USER/PASSWORD/DB`

### Важно для API роутов Next.js
Все server-side роуты в `frontend/src/app/api/` должны использовать `process.env.BACKEND_URL` (не `NEXT_PUBLIC_API_URL` и не `NEXT_PUBLIC_BACKEND_URL`) для обращения к backend внутри Docker сети.
