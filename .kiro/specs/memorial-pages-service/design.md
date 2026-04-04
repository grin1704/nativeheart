# Проектирование сервиса памятных страниц

## Обзор

Сервис памятных страниц представляет собой веб-приложение, состоящее из трех основных компонентов: публичного лендинга, пользовательской панели управления и административной панели. Система использует современную веб-архитектуру с разделением на фронтенд и бэкенд, интегрируется с внешними сервисами для хранения файлов, обработки платежей и отображения карт.

## Архитектура

### Общая архитектура системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Фронтенд      │    │    Бэкенд       │    │  Внешние API    │
│                 │    │                 │    │                 │
│ - Лендинг       │◄──►│ - REST API      │◄──►│ - Yandex Cloud  │
│ - Панель        │    │ - Аутентификация│    │ - Карты         │
│   пользователя  │    │ - Бизнес-логика │    │ - Платежи       │
│ - Админ-панель  │    │ - База данных   │    │ - Email         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Технологический стек

**Фронтенд:**
- React.js с TypeScript для типобезопасности
- Next.js для SSR и оптимизации SEO
- Tailwind CSS для стилизации
- React Query для управления состоянием сервера
- React Hook Form для работы с формами

**Бэкенд:**
- Node.js с Express.js или Fastify
- TypeScript для типобезопасности
- PostgreSQL для основной базы данных
- Redis для кэширования и сессий
- Prisma ORM для работы с базой данных

**Инфраструктура:**
- Yandex Cloud Object Storage для медиафайлов
- Yandex Maps API для отображения карт
- Stripe или Yandex.Checkout для платежей
- JWT для аутентификации
- Nodemailer для отправки email

## Компоненты и интерфейсы

### 1. Система аутентификации

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  subscriptionType: 'trial' | 'free' | 'premium';
  subscriptionExpiresAt: Date | null;
  createdAt: Date;
}

interface AuthService {
  register(email: string, password: string, name: string): Promise<User>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  refreshToken(token: string): Promise<string>;
  resetPassword(email: string): Promise<void>;
}
```

### 2. Управление памятными страницами

```typescript
interface MemorialPage {
  id: string;
  slug: string;
  ownerId: string;
  basicInfo: BasicInfo;
  biography: Biography;
  photoGallery: MediaFile[];
  videoGallery: MediaFile[];
  memories: Memory[];
  tributes: Tribute[];
  burialLocation: BurialLocation;
  qrCode: string;
  isPrivate: boolean;
  password?: string;
  collaborators: Collaborator[];
  createdAt: Date;
  updatedAt: Date;
}

interface BasicInfo {
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  mainPhoto: MediaFile;
}

interface Biography {
  text: string;
  photos: MediaFile[];
}

interface Memory {
  id: string;
  date: Date;
  title: string;
  description: string;
  photos: MediaFile[];
  createdAt: Date;
}

interface Tribute {
  id: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  photo?: MediaFile;
  isApproved: boolean;
  createdAt: Date;
}
```

### 3. Управление медиафайлами

```typescript
interface MediaFile {
  id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

interface MediaService {
  uploadFile(file: Buffer, metadata: FileMetadata): Promise<MediaFile>;
  deleteFile(fileId: string): Promise<void>;
  generateThumbnail(fileId: string): Promise<string>;
}
```

### 4. Система подписок

```typescript
interface SubscriptionService {
  createTrialSubscription(userId: string): Promise<Subscription>;
  upgradeToPremium(userId: string, paymentData: PaymentData): Promise<Subscription>;
  checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
  handleSubscriptionExpiry(): Promise<void>;
}

interface SubscriptionStatus {
  type: 'trial' | 'free' | 'premium';
  isActive: boolean;
  expiresAt: Date | null;
  features: FeatureAccess;
}

interface FeatureAccess {
  unlimitedBiography: boolean;
  photoGallery: boolean;
  videoGallery: boolean;
  memories: boolean;
  tributes: boolean;
  collaborators: boolean;
}
```

### 5. Административная панель

```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  createdAt: Date;
}

interface AdminPermission {
  resource: 'users' | 'memorial_pages' | 'payments' | 'settings' | 'analytics';
  actions: ('read' | 'write' | 'delete' | 'moderate')[];
}

interface AdminService {
  // Управление пользователями
  getAllUsers(filters: UserFilters, pagination: Pagination): Promise<PaginatedUsers>;
  getUserDetails(userId: string): Promise<UserDetails>;
  suspendUser(userId: string, reason: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
  
  // Управление памятными страницами
  getAllMemorialPages(filters: PageFilters, pagination: Pagination): Promise<PaginatedPages>;
  moderateMemorialPage(pageId: string, action: 'approve' | 'reject', reason?: string): Promise<void>;
  deleteMemorialPage(pageId: string, reason: string): Promise<void>;
  
  // Управление контентом
  moderateTribute(tributeId: string, action: 'approve' | 'reject'): Promise<void>;
  removeInappropriateContent(contentId: string, contentType: string): Promise<void>;
  
  // Аналитика и отчеты
  getSystemAnalytics(period: DateRange): Promise<SystemAnalytics>;
  getUserAnalytics(period: DateRange): Promise<UserAnalytics>;
  getRevenueAnalytics(period: DateRange): Promise<RevenueAnalytics>;
  
  // Глобальные настройки
  updateSystemSettings(settings: SystemSettings): Promise<void>;
  getSystemSettings(): Promise<SystemSettings>;
  
  // Управление платежами
  getPaymentHistory(filters: PaymentFilters): Promise<PaymentHistory>;
  processRefund(paymentId: string, amount: number, reason: string): Promise<void>;
}

interface SystemSettings {
  trialPeriodDays: number;
  maxFileSize: number;
  maxFilesPerPage: number;
  biographyCharLimit: number;
  allowedFileTypes: string[];
  moderationRequired: boolean;
  maintenanceMode: boolean;
  emailSettings: EmailSettings;
  paymentSettings: PaymentSettings;
}

interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalMemorialPages: number;
  activeSubscriptions: number;
  storageUsed: number;
  serverHealth: ServerHealth;
}
```
```

## Модели данных

### Схема базы данных

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subscription_type VARCHAR(20) DEFAULT 'trial',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Памятные страницы
CREATE TABLE memorial_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  death_date DATE NOT NULL,
  main_photo_id UUID REFERENCES media_files(id),
  biography_text TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  qr_code_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Медиафайлы
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Воспоминания
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id UUID REFERENCES memorial_pages(id),
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Отзывы близких
CREATE TABLE tributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id UUID REFERENCES memorial_pages(id),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  text TEXT NOT NULL,
  photo_id UUID REFERENCES media_files(id),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Место захоронения
CREATE TABLE burial_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id UUID REFERENCES memorial_pages(id),
  address TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  instructions TEXT
);

-- Соавторы
CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_page_id UUID REFERENCES memorial_pages(id),
  user_id UUID REFERENCES users(id),
  permissions VARCHAR(50) DEFAULT 'edit',
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP
);

-- Администраторы
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'moderator',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Права администраторов
CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  resource VARCHAR(50) NOT NULL,
  actions TEXT[] NOT NULL
);

-- Системные настройки
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Логи действий администраторов
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Модерация контента
CREATE TABLE content_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'memorial_page', 'tribute', 'memory'
  content_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderator_id UUID REFERENCES admin_users(id),
  reason TEXT,
  moderated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Обработка ошибок

### Стратегия обработки ошибок

1. **Валидация данных**: Использование Joi или Zod для валидации входящих данных
2. **Централизованная обработка**: Middleware для перехвата и обработки ошибок
3. **Логирование**: Winston для структурированного логирования ошибок
4. **Пользовательские ошибки**: Кастомные классы ошибок для различных сценариев

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized access', 401);
  }
}
```

### Обработка ошибок интеграции

- **Yandex Cloud**: Retry механизм для временных сбоев загрузки
- **Платежные системы**: Обработка различных статусов платежей
- **Email сервис**: Очередь для повторной отправки писем
- **Карты**: Fallback на текстовый адрес при недоступности API

## Стратегия тестирования

### Типы тестов

1. **Unit тесты**: Jest для тестирования отдельных функций и компонентов
2. **Integration тесты**: Supertest для тестирования API endpoints
3. **E2E тесты**: Playwright для тестирования пользовательских сценариев
4. **Performance тесты**: Artillery для нагрузочного тестирования

### Покрытие тестами

- **Критический функционал**: 90%+ покрытие
  - Аутентификация и авторизация
  - Создание и редактирование страниц
  - Система подписок
  - Загрузка медиафайлов

- **Основной функционал**: 70%+ покрытие
  - CRUD операции
  - Валидация данных
  - API endpoints

- **Вспомогательный функционал**: 50%+ покрытие
  - Утилиты
  - Хелперы
  - UI компоненты

### Тестовые данные

```typescript
// Фабрики для создания тестовых данных
const UserFactory = {
  create: (overrides?: Partial<User>) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    subscriptionType: 'trial',
    ...overrides
  })
};

const MemorialPageFactory = {
  create: (overrides?: Partial<MemorialPage>) => ({
    id: faker.string.uuid(),
    slug: faker.lorem.slug(),
    fullName: faker.person.fullName(),
    birthDate: faker.date.past({ years: 80 }),
    deathDate: faker.date.past({ years: 5 }),
    ...overrides
  })
};
```

### Административная панель - Функциональность

**Дашборд администратора:**
- Общая статистика системы (пользователи, страницы, доходы)
- Графики активности и роста
- Уведомления о критических событиях
- Мониторинг состояния системы

**Управление пользователями:**
- Просмотр всех пользователей с фильтрацией и поиском
- Детальная информация о пользователе и его активности
- Блокировка/разблокировка пользователей
- Управление подписками пользователей

**Модерация контента:**
- Очередь на модерацию новых памятных страниц
- Проверка отзывов и воспоминаний
- Удаление неподходящего контента
- Система жалоб и их обработка

**Глобальные настройки:**
- Настройки пробного периода и лимитов
- Конфигурация интеграций (Yandex Cloud, платежи)
- Email шаблоны и настройки уведомлений
- Настройки безопасности и модерации

**Аналитика и отчеты:**
- Финансовые отчеты и статистика доходов
- Аналитика использования функций
- Отчеты по производительности системы
- Экспорт данных для анализа

### Безопасность

1. **Аутентификация**: JWT токены с коротким временем жизни
2. **Авторизация**: RBAC для разграничения доступа (включая админ-роли)
3. **Валидация**: Строгая валидация всех входящих данных
4. **Защита от атак**: Rate limiting, CORS, helmet.js
5. **Шифрование**: Bcrypt для паролей, шифрование чувствительных данных
6. **Аудит**: Логирование всех критических операций и действий администраторов
7. **Двухфакторная аутентификация**: Для администраторов системы

### Производительность

1. **Кэширование**: Redis для кэширования часто запрашиваемых данных
2. **Оптимизация запросов**: Индексы БД, eager loading
3. **CDN**: Для статических ресурсов и медиафайлов
4. **Сжатие**: Gzip для API ответов
5. **Lazy loading**: Для изображений и компонентов
6. **Пагинация**: Для списков с большим количеством элементов