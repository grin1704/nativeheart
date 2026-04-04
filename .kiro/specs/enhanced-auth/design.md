# Дизайн: Расширенная авторизация

## Архитектура

### Общая схема

```
┌─────────────┐
│   Frontend  │
│   (Next.js) │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────────────────────────────────────┐
│           Backend (Express)                 │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │  Controllers │◄────►│    Services     │ │
│  └──────────────┘      └────────┬────────┘ │
│                                 │          │
│                        ┌────────▼────────┐ │
│                        │   Prisma ORM    │ │
│                        └────────┬────────┘ │
└─────────────────────────────────┼──────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   PostgreSQL DB   │
                        └───────────────────┘

┌─────────────────────────────────────────────┐
│         External Services                   │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  SMTP    │  │    VK    │  │  Yandex  │ │
│  │  Server  │  │   OAuth  │  │  OAuth   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
```

## Модель данных

### Изменения в модели User

```prisma
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String?   @map("password_hash")  // Теперь опциональный
  name                  String
  subscriptionType      String    @default("trial") @map("subscription_type")
  subscriptionExpiresAt DateTime? @map("subscription_expires_at")
  isActive              Boolean   @default(true) @map("is_active")
  
  // Верификация email
  emailVerified         Boolean   @default(false) @map("email_verified")
  verificationToken     String?   @unique @map("verification_token")
  verificationExpires   DateTime? @map("verification_expires")
  
  // Восстановление пароля
  resetToken            String?   @unique @map("reset_token")
  resetTokenExpires     DateTime? @map("reset_token_expires")
  
  // OAuth
  oauthProvider         String?   @map("oauth_provider")  // 'vk', 'yandex', null
  oauthId               String?   @map("oauth_id")
  
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  memorialPages MemorialPage[]
  mediaFiles    MediaFile[]
  collaborators Collaborator[]

  @@unique([oauthProvider, oauthId])
  @@map("users")
}
```

## Компоненты

### Backend

#### 1. Services

**authService.ts** (расширение существующего)
```typescript
class AuthService {
  // Существующие методы
  async register(data: RegisterRequest): Promise<AuthResponse>
  async login(data: LoginRequest): Promise<AuthResponse>
  async getUserById(userId: string)
  async updateSubscription(userId: string, subscriptionType: string)
  
  // Новые методы
  async verifyEmail(token: string): Promise<void>
  async resendVerificationEmail(email: string): Promise<void>
  async requestPasswordReset(email: string): Promise<void>
  async resetPassword(token: string, newPassword: string): Promise<void>
  async loginWithOAuth(provider: string, oauthId: string, email: string, name: string): Promise<AuthResponse>
}
```

**oauthService.ts** (новый)
```typescript
class OAuthService {
  // ВКонтакте
  getVKAuthUrl(redirectUri: string): string
  async getVKUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>
  
  // Яндекс
  getYandexAuthUrl(redirectUri: string): string
  async getYandexUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>
  
  // Утилиты
  private generateState(): string
  private validateState(state: string): boolean
}

interface OAuthUserInfo {
  id: string
  email: string
  name: string
}
```

**emailService.ts** (расширение существующего)
```typescript
class EmailService {
  // Существующие методы
  async sendCollaboratorInvite(data: CollaboratorInviteData): Promise<void>
  
  // Новые методы
  async sendEmailVerification(data: EmailVerificationData): Promise<void>
  async sendPasswordReset(data: PasswordResetData): Promise<void>
}

interface EmailVerificationData {
  email: string
  name: string
  verificationToken: string
}

interface PasswordResetData {
  email: string
  name: string
  resetToken: string
}
```

#### 2. Controllers

**authController.ts** (расширение существующего)
```typescript
class AuthController {
  // Существующие методы
  async register(req: Request, res: Response): Promise<void>
  async login(req: Request, res: Response): Promise<void>
  async getProfile(req: Request, res: Response): Promise<void>
  async logout(req: Request, res: Response): Promise<void>
  async updateSubscription(req: Request, res: Response): Promise<void>
  
  // Новые методы - Верификация email
  async verifyEmail(req: Request, res: Response): Promise<void>
  async resendVerification(req: Request, res: Response): Promise<void>
  
  // Новые методы - Восстановление пароля
  async requestPasswordReset(req: Request, res: Response): Promise<void>
  async resetPassword(req: Request, res: Response): Promise<void>
  
  // Новые методы - OAuth ВКонтакте
  async getVKAuthUrl(req: Request, res: Response): Promise<void>
  async vkCallback(req: Request, res: Response): Promise<void>
  
  // Новые методы - OAuth Яндекс
  async getYandexAuthUrl(req: Request, res: Response): Promise<void>
  async yandexCallback(req: Request, res: Response): Promise<void>
}
```

#### 3. Routes

**auth.ts** (расширение существующего)
```typescript
// Существующие маршруты
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/profile', authenticateToken, authController.getProfile)
router.post('/logout', authenticateToken, authController.logout)
router.patch('/subscription', authenticateToken, authController.updateSubscription)

// Новые маршруты - Верификация email
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

// Новые маршруты - Восстановление пароля
router.post('/request-password-reset', authController.requestPasswordReset)
router.post('/reset-password', authController.resetPassword)

// Новые маршруты - OAuth ВКонтакте
router.get('/vk/url', authController.getVKAuthUrl)
router.post('/vk/callback', authController.vkCallback)

// Новые маршруты - OAuth Яндекс
router.get('/yandex/url', authController.getYandexAuthUrl)
router.post('/yandex/callback', authController.yandexCallback)
```

### Frontend

#### 1. Страницы

**app/auth/verify-email/page.tsx**
- Получает token из query параметров
- Отправляет запрос на верификацию
- Показывает результат (успех/ошибка)
- Редирект на dashboard при успехе

**app/auth/forgot-password/page.tsx**
- Форма с полем email
- Отправка запроса на восстановление
- Показ сообщения об отправке письма

**app/auth/reset-password/page.tsx**
- Получает token из query параметров
- Форма с полем нового пароля
- Отправка запроса на сброс пароля
- Редирект на login при успехе

**app/auth/vk/callback/page.tsx**
- Получает code из query параметров
- Отправляет code на backend
- Сохраняет токен в localStorage
- Редирект на dashboard

**app/auth/yandex/callback/page.tsx**
- Аналогично VK callback

#### 2. API Routes

**app/api/auth/verify-email/route.ts**
```typescript
POST /api/auth/verify-email
Body: { token: string }
Response: { message: string }
```

**app/api/auth/resend-verification/route.ts**
```typescript
POST /api/auth/resend-verification
Body: { email: string }
Response: { message: string }
```

**app/api/auth/request-password-reset/route.ts**
```typescript
POST /api/auth/request-password-reset
Body: { email: string }
Response: { message: string }
```

**app/api/auth/reset-password/route.ts**
```typescript
POST /api/auth/reset-password
Body: { token: string, password: string }
Response: { message: string }
```

**app/api/auth/vk/url/route.ts**
```typescript
GET /api/auth/vk/url
Response: { authUrl: string }
```

**app/api/auth/vk/callback/route.ts**
```typescript
POST /api/auth/vk/callback
Body: { code: string }
Response: { user, token }
```

**app/api/auth/yandex/url/route.ts**
```typescript
GET /api/auth/yandex/url
Response: { authUrl: string }
```

**app/api/auth/yandex/callback/route.ts**
```typescript
POST /api/auth/yandex/callback
Body: { code: string }
Response: { user, token }
```

## Потоки данных

### 1. Верификация email

```
Регистрация
    ↓
Создание пользователя (emailVerified = false)
    ↓
Генерация verificationToken
    ↓
Отправка письма с ссылкой
    ↓
Пользователь кликает на ссылку
    ↓
Frontend: /auth/verify-email?token=xxx
    ↓
Backend: POST /api/auth/verify-email
    ↓
Проверка токена и срока действия
    ↓
Обновление emailVerified = true
    ↓
Успех / Ошибка
```

### 2. Восстановление пароля

```
Пользователь забыл пароль
    ↓
Frontend: /auth/forgot-password
    ↓
Ввод email
    ↓
Backend: POST /api/auth/request-password-reset
    ↓
Генерация resetToken
    ↓
Отправка письма с ссылкой
    ↓
Пользователь кликает на ссылку
    ↓
Frontend: /auth/reset-password?token=xxx
    ↓
Ввод нового пароля
    ↓
Backend: POST /api/auth/reset-password
    ↓
Проверка токена и срока действия
    ↓
Хеширование и сохранение нового пароля
    ↓
Очистка resetToken
    ↓
Успех / Ошибка
```

### 3. OAuth авторизация

```
Пользователь кликает "Войти через VK"
    ↓
Frontend: GET /api/auth/vk/url
    ↓
Backend: Генерация authUrl с state
    ↓
Редирект на VK
    ↓
Пользователь авторизуется на VK
    ↓
VK редиректит на callback с code
    ↓
Frontend: /auth/vk/callback?code=xxx&state=yyy
    ↓
Frontend: POST /api/auth/vk/callback { code }
    ↓
Backend: Обмен code на access_token
    ↓
Backend: Получение данных пользователя от VK
    ↓
Backend: Поиск пользователя по oauthProvider + oauthId
    ↓
Если не найден → создание нового пользователя
    ↓
Генерация JWT токена
    ↓
Возврат { user, token }
    ↓
Frontend: Сохранение токена, редирект на dashboard
```

## Безопасность

### 1. Генерация токенов

```typescript
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### 2. Проверка срока действия

```typescript
function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
```

### 3. OAuth state параметр

```typescript
// Генерация
const state = crypto.randomBytes(16).toString('hex');
// Сохранение в сессии или JWT
// Проверка при callback
```

## Обработка ошибок

### Типы ошибок

1. **Токен не найден** - 400 Bad Request
2. **Токен истек** - 400 Bad Request
3. **Email уже подтвержден** - 400 Bad Request
4. **Пользователь не найден** - 404 Not Found
5. **OAuth ошибка** - 400 Bad Request
6. **Email не отправлен** - 500 Internal Server Error

### Логирование

```typescript
console.error('Email verification failed:', {
  email: user.email,
  error: error.message,
  timestamp: new Date()
});
```

## Тестирование

### Unit тесты

- Генерация токенов
- Проверка срока действия
- Валидация email
- OAuth URL генерация

### Integration тесты

- Полный flow верификации email
- Полный flow восстановления пароля
- Полный flow OAuth авторизации

### E2E тесты

- Регистрация → Верификация → Вход
- Забыл пароль → Восстановление → Вход
- OAuth вход → Создание аккаунта → Dashboard

## Миграция

### Шаг 1: Создание миграции

```bash
cd backend
npx prisma migrate dev --name add_auth_fields
```

### Шаг 2: Применение миграции

```bash
npx prisma migrate deploy
```

### Шаг 3: Генерация Prisma Client

```bash
npx prisma generate
```

⚠️ **ВАЖНО:** НЕ использовать `prisma db pull`!

## Откат изменений

Если что-то пошло не так:

```bash
# Полное восстановление
./backups/backup_20251115_235846/restore.sh

# Или только схема
cp backups/backup_20251115_235846/schema.prisma backend/prisma/schema.prisma
cd backend
npx prisma generate
```
