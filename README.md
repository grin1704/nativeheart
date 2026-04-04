# Сервис памятных страниц

Веб-платформа для создания и управления мемориальными страницами умерших людей.

## Структура проекта

```
memorial-pages-service/
├── frontend/          # Next.js фронтенд
├── backend/           # Node.js/Express API
├── package.json       # Root package.json для workspaces
└── README.md
```

## Технологический стек

### Frontend
- **Next.js 14** - React фреймворк с SSR
- **PWA** - Progressive Web App (установка на устройства, офлайн режим)
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **React Hook Form** - Работа с формами
- **React Query** - Управление состоянием сервера

### Backend
- **Node.js + Express** - API сервер
- **TypeScript** - Типизация
- **PostgreSQL** - Основная база данных
- **Prisma** - ORM для работы с БД
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 🎯 Простой запуск (рекомендуемый)

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd memorial-pages-service

# Запустите проект одной командой
./scripts/dev-start.sh
```

Скрипт автоматически:
- Очистит занятые порты
- Установит зависимости
- Запустит backend и frontend
- Покажет полезную информацию

### 📋 Управление проектом

```bash
# Запуск проекта
./scripts/dev-start.sh

# Проверка статуса
./scripts/dev-status.sh

# Остановка
./scripts/dev-stop.sh

# Перезапуск
./scripts/dev-restart.sh

# Экстренная очистка портов
./scripts/port-cleanup.sh
```

### 🔧 Ручная установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd memorial-pages-service
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
# Backend
cp backend/.env.example backend/.env
# Отредактируйте backend/.env с вашими настройками
```

4. Настройте базу данных:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. Запустите проект в режиме разработки:
```bash
# Из корневой директории
npm run dev
```

Это запустит:
- Frontend на http://localhost:3000
- Backend API на http://localhost:3001

## Доступные команды

### Корневые команды
- `npm run dev` - Запуск frontend и backend в режиме разработки
- `npm run build` - Сборка проекта
- `npm run lint` - Проверка кода линтером
- `npm run format` - Форматирование кода

### Frontend команды
- `cd frontend && npm run dev` - Запуск только frontend
- `cd frontend && npm run build` - Сборка frontend
- `cd frontend && npm run lint` - Линтинг frontend

### Backend команды
- `cd backend && npm run dev` - Запуск только backend
- `cd backend && npm run build` - Сборка backend
- `cd backend && npm run db:migrate` - Применение миграций БД
- `cd backend && npm run db:studio` - Prisma Studio

## Архитектура

### Frontend (Next.js)
```
frontend/src/
├── app/              # App Router (Next.js 13+)
├── components/       # React компоненты
├── hooks/           # Кастомные хуки
├── services/        # API сервисы
├── types/           # TypeScript типы
└── utils/           # Утилиты
```

### Backend (Express)
```
backend/src/
├── controllers/     # Контроллеры API
├── services/        # Бизнес-логика
├── middleware/      # Express middleware
├── models/          # Модели данных
├── routes/          # API маршруты
├── utils/           # Утилиты
├── config/          # Конфигурация
└── types/           # TypeScript типы
```

## База данных

Проект использует PostgreSQL с Prisma ORM. Схема базы данных включает:

- **users** - Пользователи системы
- **memorial_pages** - Памятные страницы
- **media_files** - Медиафайлы (фото, видео)
- **memories** - Воспоминания
- **tributes** - Отзывы близких
- **burial_locations** - Места захоронения
- **collaborators** - Соавторы страниц
- **admin_users** - Администраторы
- **system_settings** - Системные настройки

## Интеграции

- **Yandex Cloud Object Storage** - Хранение медиафайлов
- **Yandex Maps API** - Отображение карт
- **Yandex.Checkout** - Обработка платежей
- **SMTP** - Отправка email уведомлений

## 📱 Progressive Web App (PWA)

Проект поддерживает установку как нативное приложение на любые устройства!

### Возможности:
- 📱 Установка на домашний экран
- 🔌 Работа офлайн
- ⚡ Быстрая загрузка
- 🎯 Быстрые действия

### Документация:
- **Быстрый старт:** `PWA_БЫСТРЫЙ_СТАРТ.md`
- **Полная документация:** `PWA_IMPLEMENTATION.md`
- **Начать работу:** `НАЧАТЬ_С_PWA.md`

### Тестирование PWA:
```bash
cd frontend
npm run build
npm start
# Откройте http://localhost:3000 и установите приложение
```

## Разработка

### Стиль кода
Проект использует ESLint и Prettier для поддержания единого стиля кода.

### Коммиты
Рекомендуется использовать conventional commits:
- `feat:` - новая функциональность
- `fix:` - исправление багов
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов

## Лицензия

Этот проект является частной разработкой.