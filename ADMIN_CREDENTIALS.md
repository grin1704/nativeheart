# 🔐 Учетные данные администратора

## Админ-панель

**URL:** http://localhost:3000/admin/login

**Супер-администратор:**
- **Email:** admin@memorial-pages.ru
- **Пароль:** MemorialAdmin2024!@#

**Модератор:**
- **Email:** moderator@memorial-pages.ru  
- **Пароль:** MemorialAdmin2024!@#

## Тестовые пользователи

**Пробный пользователь:**
- **Email:** trial@example.com
- **Пароль:** password123

**Бесплатный пользователь:**
- **Email:** free@example.com
- **Пароль:** password123

**Премиум пользователь:**
- **Email:** premium@example.com
- **Пароль:** password123

## ⚠️ Безопасность

- Эти пароли предназначены только для разработки и тестирования
- В продакшене обязательно смените пароли на уникальные
- Не коммитьте этот файл в публичный репозиторий
- Используйте переменные окружения для хранения паролей в продакшене

## 🔧 Смена пароля

Для смены пароля администратора выполните:

```bash
cd backend
node scripts/update-admin-password.js
```

Или создайте нового админа через Prisma Studio:

```bash
cd backend
npm run db:studio
```