# Задачи: Расширенная авторизация

## ⚠️ ВАЖНО: Перед началом работы

1. **Бэкап уже создан:** `backups/backup_20251115_235846`
2. **Восстановление:** `./backups/backup_20251115_235846/restore.sh`
3. **Инструкции:** `QUICK_RESTORE.md`
4. **НЕ использовать:** `prisma db pull` (это испортит схему!)
5. **Использовать только:** `prisma migrate dev` для изменений БД

## Фаза 1: Подготовка (Приоритет: Критический) ✅ ЗАВЕРШЕНА

### Задача 1.1: Обновление Prisma схемы ✅ ВЫПОЛНЕНО

**Описание:** Добавить новые поля в модель User

**Файлы:**
- `backend/prisma/schema.prisma`

**Изменения:**
```prisma
model User {
  // ... существующие поля ...
  
  // Верификация email
  emailVerified         Boolean   @default(false) @map("email_verified")
  verificationToken     String?   @unique @map("verification_token")
  verificationExpires   DateTime? @map("verification_expires")
  
  // Восстановление пароля
  resetToken            String?   @unique @map("reset_token")
  resetTokenExpires     DateTime? @map("reset_token_expires")
  
  // OAuth
  oauthProvider         String?   @map("oauth_provider")
  oauthId               String?   @map("oauth_id")
  
  // ... остальные поля ...
  
  @@unique([oauthProvider, oauthId])
  @@map("users")
}
```

**Команды:**
```bash
cd backend
npx prisma migrate dev --name add_auth_fields
npx prisma generate
```

**Проверка:**
```bash
# Проверить компиляцию
npm run build

# Если ошибки - откатить
cd ..
./backups/backup_20251115_235846/restore.sh
```

**Критерии приемки:**
- [ ] Миграция создана
- [ ] Миграция применена к БД
- [ ] Prisma Client перегенерирован
- [ ] Backend компилируется без ошибок
- [ ] Все существующие тесты проходят

---

### Задача 1.2: Обновление типов ✅ ВЫПОЛНЕНО

**Описание:** Обновить TypeScript типы для новых полей

**Файлы:**
- `backend/src/types/auth.ts`

**Изменения:**
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionType: string;
  subscriptionExpiresAt: Date | null;
  emailVerified: boolean;
  oauthProvider: string | null;
  oauthId: string | null;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
}
```

**Критерии приемки:**
- [ ] Типы обновлены
- [ ] TypeScript компилируется без ошибок

---

## Фаза 2: Верификация Email (Приоритет: Высокий) ✅ ЗАВЕРШЕНА

### Задача 2.1: Backend - Email Service

**Описание:** Добавить методы отправки писем для верификации

**Файлы:**
- `backend/src/services/emailService.ts`

**Новые методы:**
```typescript
async sendEmailVerification(data: {
  email: string;
  name: string;
  verificationToken: string;
}): Promise<void>
```

**Email шаблон:**
- Тема: "Подтвердите ваш email"
- Ссылка: `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`
- Срок действия: 24 часа

**Критерии приемки:**
- [ ] Метод реализован
- [ ] Email отправляется корректно
- [ ] Шаблон письма красивый и понятный

---

### Задача 2.2: Backend - Auth Service (Верификация)

**Описание:** Добавить методы верификации email

**Файлы:**
- `backend/src/services/authService.ts`

**Новые методы:**
```typescript
async verifyEmail(token: string): Promise<void>
async resendVerificationEmail(email: string): Promise<void>
```

**Логика:**
1. Найти пользователя по токену
2. Проверить срок действия токена
3. Обновить `emailVerified = true`
4. Очистить `verificationToken` и `verificationExpires`

**Критерии приемки:**
- [ ] Методы реализованы
- [ ] Проверка срока действия работает
- [ ] Обработка ошибок корректна
- [ ] Unit тесты написаны

---

### Задача 2.3: Backend - Auth Controller (Верификация)

**Описание:** Добавить endpoints для верификации

**Файлы:**
- `backend/src/controllers/authController.ts`

**Новые методы:**
```typescript
async verifyEmail(req: Request, res: Response): Promise<void>
async resendVerification(req: Request, res: Response): Promise<void>
```

**Критерии приемки:**
- [ ] Endpoints реализованы
- [ ] Валидация входных данных
- [ ] Обработка ошибок
- [ ] Логирование

---

### Задача 2.4: Backend - Routes (Верификация)

**Описание:** Добавить маршруты для верификации

**Файлы:**
- `backend/src/routes/auth.ts`

**Новые маршруты:**
```typescript
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)
```

**Критерии приемки:**
- [ ] Маршруты добавлены
- [ ] Маршруты работают

---

### Задача 2.5: Frontend - Страница верификации

**Описание:** Создать страницу подтверждения email

**Файлы:**
- `frontend/src/app/auth/verify-email/page.tsx`

**Функционал:**
1. Получить token из query параметров
2. Отправить запрос на backend
3. Показать результат (успех/ошибка)
4. Редирект на dashboard при успехе

**Критерии приемки:**
- [ ] Страница создана
- [ ] UI красивый и понятный
- [ ] Обработка ошибок
- [ ] Редирект работает

---

### Задача 2.6: Frontend - API Route (Верификация)

**Описание:** Создать API route для верификации

**Файлы:**
- `frontend/src/app/api/auth/verify-email/route.ts`

**Функционал:**
- Проксирование запроса на backend

**Критерии приемки:**
- [ ] API route создан
- [ ] Запросы проксируются корректно

---

### Задача 2.7: Обновление регистрации

**Описание:** Добавить отправку письма при регистрации

**Файлы:**
- `backend/src/services/authService.ts` (метод `register`)

**Изменения:**
1. Генерировать `verificationToken`
2. Установить `verificationExpires` (24 часа)
3. Отправить письмо с токеном
4. Установить `emailVerified = false`

**Критерии приемки:**
- [ ] Письмо отправляется при регистрации
- [ ] Токен генерируется корректно
- [ ] Срок действия устанавливается

---

## Фаза 3: Восстановление пароля (Приоритет: Высокий) ✅ ЗАВЕРШЕНА

### Задача 3.1: Backend - Email Service (Пароль)

**Описание:** Добавить метод отправки письма для восстановления пароля

**Файлы:**
- `backend/src/services/emailService.ts`

**Новый метод:**
```typescript
async sendPasswordReset(data: {
  email: string;
  name: string;
  resetToken: string;
}): Promise<void>
```

**Email шаблон:**
- Тема: "Восстановление пароля"
- Ссылка: `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`
- Срок действия: 1 час

**Критерии приемки:**
- [ ] Метод реализован
- [ ] Email отправляется корректно
- [ ] Шаблон письма красивый и понятный

---

### Задача 3.2: Backend - Auth Service (Пароль)

**Описание:** Добавить методы восстановления пароля

**Файлы:**
- `backend/src/services/authService.ts`

**Новые методы:**
```typescript
async requestPasswordReset(email: string): Promise<void>
async resetPassword(token: string, newPassword: string): Promise<void>
```

**Логика requestPasswordReset:**
1. Найти пользователя по email
2. Генерировать `resetToken`
3. Установить `resetTokenExpires` (1 час)
4. Отправить письмо

**Логика resetPassword:**
1. Найти пользователя по токену
2. Проверить срок действия
3. Хешировать новый пароль
4. Обновить `passwordHash`
5. Очистить `resetToken` и `resetTokenExpires`

**Критерии приемки:**
- [ ] Методы реализованы
- [ ] Проверка срока действия работает
- [ ] Пароль хешируется корректно
- [ ] Unit тесты написаны

---

### Задача 3.3: Backend - Auth Controller (Пароль)

**Описание:** Добавить endpoints для восстановления пароля

**Файлы:**
- `backend/src/controllers/authController.ts`

**Новые методы:**
```typescript
async requestPasswordReset(req: Request, res: Response): Promise<void>
async resetPassword(req: Request, res: Response): Promise<void>
```

**Критерии приемки:**
- [ ] Endpoints реализованы
- [ ] Валидация входных данных
- [ ] Обработка ошибок
- [ ] Логирование

---

### Задача 3.4: Backend - Routes (Пароль)

**Описание:** Добавить маршруты для восстановления пароля

**Файлы:**
- `backend/src/routes/auth.ts`

**Новые маршруты:**
```typescript
router.post('/request-password-reset', authController.requestPasswordReset)
router.post('/reset-password', authController.resetPassword)
```

**Критерии приемки:**
- [ ] Маршруты добавлены
- [ ] Маршруты работают

---

### Задача 3.5: Frontend - Страница "Забыли пароль"

**Описание:** Создать страницу запроса восстановления пароля

**Файлы:**
- `frontend/src/app/auth/forgot-password/page.tsx`

**Функционал:**
1. Форма с полем email
2. Отправка запроса на backend
3. Показ сообщения об отправке письма

**Критерии приемки:**
- [ ] Страница создана
- [ ] UI красивый и понятный
- [ ] Валидация email
- [ ] Обработка ошибок

---

### Задача 3.6: Frontend - Страница сброса пароля

**Описание:** Создать страницу установки нового пароля

**Файлы:**
- `frontend/src/app/auth/reset-password/page.tsx`

**Функционал:**
1. Получить token из query параметров
2. Форма с полем нового пароля
3. Отправка запроса на backend
4. Редирект на login при успехе

**Критерии приемки:**
- [ ] Страница создана
- [ ] UI красивый и понятный
- [ ] Валидация пароля
- [ ] Обработка ошибок
- [ ] Редирект работает

---

### Задача 3.7: Frontend - API Routes (Пароль)

**Описание:** Создать API routes для восстановления пароля

**Файлы:**
- `frontend/src/app/api/auth/request-password-reset/route.ts`
- `frontend/src/app/api/auth/reset-password/route.ts`

**Функционал:**
- Проксирование запросов на backend

**Критерии приемки:**
- [ ] API routes созданы
- [ ] Запросы проксируются корректно

---

### Задача 3.8: Добавление ссылки на форму входа

**Описание:** Добавить ссылку "Забыли пароль?" на страницу входа

**Файлы:**
- `frontend/src/app/auth/login/page.tsx`

**Критерии приемки:**
- [ ] Ссылка добавлена
- [ ] Ссылка ведет на `/auth/forgot-password`

---

## Фаза 4: OAuth ВКонтакте (Приоритет: Средний)

### Задача 4.1: Backend - OAuth Service (VK)

**Описание:** Создать сервис для работы с VK OAuth

**Файлы:**
- `backend/src/services/oauthService.ts` (новый файл)

**Методы:**
```typescript
getVKAuthUrl(redirectUri: string): string
async getVKUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>
```

**Критерии приемки:**
- [ ] Сервис создан
- [ ] Генерация auth URL работает
- [ ] Получение данных пользователя работает
- [ ] Обработка ошибок

---

### Задача 4.2: Backend - Auth Service (OAuth)

**Описание:** Добавить метод входа через OAuth

**Файлы:**
- `backend/src/services/authService.ts`

**Новый метод:**
```typescript
async loginWithOAuth(
  provider: string,
  oauthId: string,
  email: string,
  name: string
): Promise<AuthResponse>
```

**Логика:**
1. Найти пользователя по `oauthProvider` + `oauthId`
2. Если не найден - создать нового пользователя
3. Генерировать JWT токен
4. Вернуть `{ user, token }`

**Критерии приемки:**
- [ ] Метод реализован
- [ ] Создание нового пользователя работает
- [ ] Вход существующего пользователя работает
- [ ] Unit тесты написаны

---

### Задача 4.3: Backend - Auth Controller (VK)

**Описание:** Добавить endpoints для VK OAuth

**Файлы:**
- `backend/src/controllers/authController.ts`

**Новые методы:**
```typescript
async getVKAuthUrl(req: Request, res: Response): Promise<void>
async vkCallback(req: Request, res: Response): Promise<void>
```

**Критерии приемки:**
- [ ] Endpoints реализованы
- [ ] Обработка ошибок
- [ ] Логирование

---

### Задача 4.4: Backend - Routes (VK)

**Описание:** Добавить маршруты для VK OAuth

**Файлы:**
- `backend/src/routes/auth.ts`

**Новые маршруты:**
```typescript
router.get('/vk/url', authController.getVKAuthUrl)
router.post('/vk/callback', authController.vkCallback)
```

**Критерии приемки:**
- [ ] Маршруты добавлены
- [ ] Маршруты работают

---

### Задача 4.5: Frontend - Страница VK callback

**Описание:** Создать страницу обработки callback от VK

**Файлы:**
- `frontend/src/app/auth/vk/callback/page.tsx`

**Функционал:**
1. Получить code из query параметров
2. Отправить code на backend
3. Сохранить токен в localStorage
4. Редирект на dashboard

**Критерии приемки:**
- [ ] Страница создана
- [ ] Обработка code работает
- [ ] Токен сохраняется
- [ ] Редирект работает

---

### Задача 4.6: Frontend - API Routes (VK)

**Описание:** Создать API routes для VK OAuth

**Файлы:**
- `frontend/src/app/api/auth/vk/url/route.ts`
- `frontend/src/app/api/auth/vk/callback/route.ts`

**Функционал:**
- Проксирование запросов на backend

**Критерии приемки:**
- [ ] API routes созданы
- [ ] Запросы проксируются корректно

---

### Задача 4.7: Добавление кнопки "Войти через VK"

**Описание:** Добавить кнопку на страницы входа и регистрации

**Файлы:**
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/auth/register/page.tsx`

**Критерии приемки:**
- [ ] Кнопка добавлена
- [ ] Кнопка работает
- [ ] UI красивый

---

### Задача 4.8: Настройка VK приложения

**Описание:** Создать и настроить приложение ВКонтакте

**Шаги:**
1. Создать приложение на https://vk.com/apps?act=manage
2. Получить Client ID и Client Secret
3. Настроить Redirect URI
4. Добавить переменные в `.env`

**Критерии приемки:**
- [ ] Приложение создано
- [ ] Переменные добавлены в `.env`
- [ ] Документация обновлена

---

## Фаза 5: OAuth Яндекс (Приоритет: Средний)

### Задача 5.1: Backend - OAuth Service (Yandex)

**Описание:** Добавить методы для Яндекс OAuth

**Файлы:**
- `backend/src/services/oauthService.ts`

**Новые методы:**
```typescript
getYandexAuthUrl(redirectUri: string): string
async getYandexUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>
```

**Критерии приемки:**
- [ ] Методы реализованы
- [ ] Генерация auth URL работает
- [ ] Получение данных пользователя работает

---

### Задача 5.2: Backend - Auth Controller (Yandex)

**Описание:** Добавить endpoints для Яндекс OAuth

**Файлы:**
- `backend/src/controllers/authController.ts`

**Новые методы:**
```typescript
async getYandexAuthUrl(req: Request, res: Response): Promise<void>
async yandexCallback(req: Request, res: Response): Promise<void>
```

**Критерии приемки:**
- [ ] Endpoints реализованы
- [ ] Обработка ошибок

---

### Задача 5.3: Backend - Routes (Yandex)

**Описание:** Добавить маршруты для Яндекс OAuth

**Файлы:**
- `backend/src/routes/auth.ts`

**Новые маршруты:**
```typescript
router.get('/yandex/url', authController.getYandexAuthUrl)
router.post('/yandex/callback', authController.yandexCallback)
```

**Критерии приемки:**
- [ ] Маршруты добавлены
- [ ] Маршруты работают

---

### Задача 5.4: Frontend - Страница Yandex callback

**Описание:** Создать страницу обработки callback от Яндекс

**Файлы:**
- `frontend/src/app/auth/yandex/callback/page.tsx`

**Функционал:**
- Аналогично VK callback

**Критерии приемки:**
- [ ] Страница создана
- [ ] Обработка работает

---

### Задача 5.5: Frontend - API Routes (Yandex)

**Описание:** Создать API routes для Яндекс OAuth

**Файлы:**
- `frontend/src/app/api/auth/yandex/url/route.ts`
- `frontend/src/app/api/auth/yandex/callback/route.ts`

**Функционал:**
- Проксирование запросов на backend

**Критерии приемки:**
- [ ] API routes созданы
- [ ] Запросы проксируются корректно

---

### Задача 5.6: Добавление кнопки "Войти через Яндекс"

**Описание:** Добавить кнопку на страницы входа и регистрации

**Файлы:**
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/auth/register/page.tsx`

**Критерии приемки:**
- [ ] Кнопка добавлена
- [ ] Кнопка работает
- [ ] UI красивый

---

### Задача 5.7: Настройка Яндекс приложения

**Описание:** Создать и настроить приложение Яндекс

**Шаги:**
1. Создать приложение на https://oauth.yandex.ru/
2. Получить Client ID и Client Secret
3. Настроить Redirect URI
4. Добавить переменные в `.env`

**Критерии приемки:**
- [ ] Приложение создано
- [ ] Переменные добавлены в `.env`
- [ ] Документация обновлена

---

## Фаза 6: Тестирование и документация (Приоритет: Высокий)

### Задача 6.1: Unit тесты

**Описание:** Написать unit тесты для новых методов

**Файлы:**
- `backend/src/services/__tests__/authService.test.ts`
- `backend/src/services/__tests__/oauthService.test.ts`
- `backend/src/services/__tests__/emailService.test.ts`

**Критерии приемки:**
- [ ] Тесты написаны
- [ ] Покрытие > 80%
- [ ] Все тесты проходят

---

### Задача 6.2: Integration тесты

**Описание:** Написать integration тесты для API

**Файлы:**
- `backend/test-enhanced-auth.js`

**Сценарии:**
- Регистрация → Верификация email
- Восстановление пароля
- OAuth вход (VK, Yandex)

**Критерии приемки:**
- [ ] Тесты написаны
- [ ] Все сценарии покрыты
- [ ] Все тесты проходят

---

### Задача 6.3: E2E тесты

**Описание:** Написать E2E тесты для UI

**Инструменты:** Playwright или Cypress

**Сценарии:**
- Полный flow регистрации с верификацией
- Полный flow восстановления пароля
- Полный flow OAuth входа

**Критерии приемки:**
- [ ] Тесты написаны
- [ ] Все сценарии покрыты
- [ ] Все тесты проходят

---

### Задача 6.4: API документация

**Описание:** Обновить API документацию

**Файлы:**
- `backend/ENHANCED_AUTH_API.md`

**Содержание:**
- Описание всех новых endpoints
- Примеры запросов и ответов
- Коды ошибок

**Критерии приемки:**
- [ ] Документация создана
- [ ] Все endpoints описаны
- [ ] Примеры корректны

---

### Задача 6.5: Руководство пользователя

**Описание:** Создать руководство для пользователей

**Файлы:**
- `ENHANCED_AUTH_USER_GUIDE.md`

**Содержание:**
- Как подтвердить email
- Как восстановить пароль
- Как войти через VK/Яндекс

**Критерии приемки:**
- [ ] Руководство создано
- [ ] Инструкции понятны
- [ ] Скриншоты добавлены

---

### Задача 6.6: Руководство по настройке

**Описание:** Создать руководство по настройке OAuth

**Файлы:**
- `OAUTH_SETUP_GUIDE.md`

**Содержание:**
- Как создать приложение VK
- Как создать приложение Яндекс
- Как настроить переменные окружения

**Критерии приемки:**
- [ ] Руководство создано
- [ ] Инструкции понятны
- [ ] Скриншоты добавлены

---

## Чеклист перед завершением

- [ ] Все задачи выполнены
- [ ] Backend компилируется без ошибок
- [ ] Frontend работает без ошибок
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] Бэкап создан на случай проблем
- [ ] Код прошел code review
- [ ] Миграции применены к production БД

## Откат в случае проблем

Если что-то пошло не так на любом этапе:

```bash
# Полное восстановление
./backups/backup_20251115_235846/restore.sh

# Или частичное
cp backups/backup_20251115_235846/schema.prisma backend/prisma/schema.prisma
cd backend
npx prisma generate
npm run build
```

## Оценка времени

- Фаза 1 (Подготовка): 2 часа
- Фаза 2 (Верификация Email): 6 часов
- Фаза 3 (Восстановление пароля): 6 часов
- Фаза 4 (OAuth VK): 4 часа
- Фаза 5 (OAuth Яндекс): 3 часа
- Фаза 6 (Тестирование и документация): 4 часа

**Итого:** ~25 часов
