# База данных Memorial Pages

## Обзор

Этот проект использует PostgreSQL в качестве основной базы данных и Prisma в качестве ORM. База данных содержит все необходимые таблицы для функционирования сервиса памятных страниц.

## Структура базы данных

### Основные сущности

1. **users** - Пользователи системы
2. **memorial_pages** - Памятные страницы
3. **media_files** - Медиафайлы (фото, видео)
4. **memories** - Воспоминания
5. **tributes** - Отзывы близких
6. **burial_locations** - Места захоронения
7. **collaborators** - Соавторы страниц

### Административные сущности

1. **admin_users** - Администраторы системы
2. **admin_permissions** - Права администраторов
3. **system_settings** - Системные настройки
4. **admin_audit_logs** - Логи действий администраторов
5. **content_moderation** - Модерация контента

## Настройка

### 1. Установка PostgreSQL

```bash
# macOS (с Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
```

### 2. Создание базы данных

```sql
-- Подключитесь к PostgreSQL как суперпользователь
sudo -u postgres psql

-- Создайте базу данных
CREATE DATABASE memorial_pages_db;

-- Создайте пользователя (опционально)
CREATE USER memorial_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE memorial_pages_db TO memorial_user;
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте подключение к базе данных:

```bash
cp .env.example .env
```

Обновите `DATABASE_URL` в файле `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/memorial_pages_db?schema=public"
```

### 4. Выполнение миграций

```bash
# Генерация Prisma Client
npm run db:generate

# Выполнение миграций
npm run db:migrate

# Заполнение тестовыми данными
npm run db:seed
```

## Команды для работы с базой данных

```bash
# Генерация Prisma Client
npm run db:generate

# Создание новой миграции
npx prisma migrate dev --name migration_name

# Выполнение миграций в продакшене
npx prisma migrate deploy

# Сброс базы данных (только для разработки!)
npx prisma migrate reset

# Заполнение базы тестовыми данными
npm run db:seed

# Открытие Prisma Studio для просмотра данных
npm run db:studio
```

## Тестовые данные

После выполнения команды `npm run db:seed` в базе данных будут созданы:

### Администраторы
- **Супер-администратор**: admin@memorial-pages.ru / admin123
- **Модератор**: moderator@memorial-pages.ru / admin123

### Тестовые пользователи
- **Пробный**: trial@example.com / password123
- **Бесплатный**: free@example.com / password123
- **Премиум**: premium@example.com / password123

### Тестовые данные
- 2 памятные страницы
- 3 медиафайла
- 2 воспоминания
- 2 отзыва
- 1 место захоронения
- Системные настройки

## Схема базы данных

```mermaid
erDiagram
    users ||--o{ memorial_pages : owns
    users ||--o{ media_files : uploads
    users ||--o{ collaborators : collaborates
    
    memorial_pages ||--o{ memories : contains
    memorial_pages ||--o{ tributes : receives
    memorial_pages ||--o| burial_locations : has
    memorial_pages ||--o{ collaborators : shared_with
    memorial_pages ||--o{ media_files : contains
    
    memories ||--o{ media_files : includes
    tributes ||--o| media_files : includes
    
    admin_users ||--o{ admin_permissions : has
    admin_users ||--o{ admin_audit_logs : creates
    admin_users ||--o{ content_moderation : moderates
```

## Индексы и производительность

Основные индексы созданы автоматически для:
- Первичных ключей
- Уникальных полей (email, slug)
- Внешних ключей

Для улучшения производительности рекомендуется добавить дополнительные индексы:

```sql
-- Индекс для поиска по типу подписки
CREATE INDEX idx_users_subscription_type ON users(subscription_type);

-- Индекс для поиска по дате создания
CREATE INDEX idx_memorial_pages_created_at ON memorial_pages(created_at);

-- Индекс для поиска неодобренных отзывов
CREATE INDEX idx_tributes_approval ON tributes(is_approved, created_at);
```

## Резервное копирование

### Создание резервной копии

```bash
# Полная резервная копия
pg_dump -h localhost -U username -d memorial_pages_db > backup.sql

# Только схема
pg_dump -h localhost -U username -d memorial_pages_db --schema-only > schema.sql

# Только данные
pg_dump -h localhost -U username -d memorial_pages_db --data-only > data.sql
```

### Восстановление из резервной копии

```bash
# Восстановление полной резервной копии
psql -h localhost -U username -d memorial_pages_db < backup.sql
```

## Мониторинг

Для мониторинга состояния базы данных используйте:

```typescript
import { testDatabaseConnection, getDatabaseHealth, getDatabaseStats } from '../utils/database';

// Проверка подключения
const isConnected = await testDatabaseConnection();

// Получение статуса здоровья
const health = await getDatabaseHealth();

// Получение статистики
const stats = await getDatabaseStats();
```

## Безопасность

1. **Пароли**: Все пароли хешируются с помощью bcrypt
2. **SQL-инъекции**: Prisma автоматически защищает от SQL-инъекций
3. **Права доступа**: Используйте отдельного пользователя БД с минимальными правами
4. **Шифрование**: Настройте SSL для подключения к базе данных в продакшене

## Troubleshooting

### Проблемы с подключением

```bash
# Проверка статуса PostgreSQL
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Проверка портов
lsof -i :5432
```

### Проблемы с миграциями

```bash
# Сброс состояния миграций (осторожно!)
npx prisma migrate reset

# Принудительное выполнение миграции
npx prisma db push
```

### Проблемы с правами доступа

```sql
-- Предоставление всех прав пользователю
GRANT ALL PRIVILEGES ON DATABASE memorial_pages_db TO memorial_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO memorial_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO memorial_user;
```