# Система аутентификации - Готова к использованию

## ✅ Реализованные компоненты

### 1. Регистрация пользователей с валидацией email
- **Endpoint:** `POST /api/auth/register`
- **Валидация:** Email формат, пароль минимум 6 символов, имя 2-100 символов
- **Автоматическое создание:** Trial подписка на 14 дней

### 2. Система входа с JWT токенами
- **Endpoint:** `POST /api/auth/login`
- **Безопасность:** bcrypt хеширование паролей (12 rounds)
- **JWT токены:** Срок действия 7 дней (настраивается)

### 3. Middleware для проверки аутентификации
- `authenticateToken` - проверка JWT токена
- `optionalAuth` - опциональная аутентификация
- Автоматическое добавление пользователя в `req.user`

### 4. Система подписок (trial/free/premium)
- **Trial:** 14 дней, все функции доступны
- **Free:** Базовые функции
- **Premium:** Все функции без ограничений
- **Endpoint:** `PATCH /api/auth/subscription` - переключение подписки

### 5. Middleware для проверки доступа по подписке
- `requireSubscription(feature)` - проверка доступа к функции
- Автоматический расчет доступных функций в `req.featureAccess`

## 🔧 API Endpoints

```bash
# Регистрация
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя Пользователя"
}

# Вход
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Профиль (требует токен)
GET /api/auth/profile
Headers: Authorization: Bearer <token>

# Обновление подписки (требует токен)
PATCH /api/auth/subscription
{
  "subscriptionType": "premium" // trial, free, premium
}

# Выход
POST /api/auth/logout
Headers: Authorization: Bearer <token>
```

## 🛡️ Использование middleware

```typescript
import { authenticateToken, requireSubscription } from './middleware/auth';

// Защищенный маршрут
router.get('/protected', authenticateToken, handler);

// Маршрут с проверкой подписки
router.post('/premium-feature', 
  authenticateToken, 
  requireSubscription('photoGallery'), 
  handler
);
```

## 🚀 Запуск для тестирования

1. **Запустить PostgreSQL:**
   ```bash
   # Через Docker
   docker-compose up -d postgres
   
   # Или установить локально и обновить DATABASE_URL в .env
   ```

2. **Настроить базу данных:**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

3. **Запустить сервер:**
   ```bash
   npm run dev
   ```

4. **Тестировать API:**
   ```bash
   # Проверка здоровья
   curl http://localhost:3001/health
   
   # Регистрация
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

## 📋 Требования выполнены

- ✅ **2.1** - Регистрация с валидацией email
- ✅ **2.2** - Вход с JWT токенами  
- ✅ **2.3** - Middleware аутентификации
- ✅ **12.1** - Система подписок с переключением
- ✅ **12.2** - Middleware проверки доступа по подписке

## 🔐 Безопасность

- Пароли хешируются с bcrypt (12 rounds)
- JWT токены с настраиваемым сроком действия
- Валидация всех входных данных с Joi
- Защита от несанкционированного доступа
- Автоматическая проверка истечения подписок