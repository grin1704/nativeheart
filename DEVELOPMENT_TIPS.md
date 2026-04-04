# 💡 Советы по разработке Memorial Pages

## 🚀 Быстрый запуск проекта

### Рекомендуемый способ
```bash
# Одна команда для запуска всего проекта
npm run dev
# или
./scripts/dev-start.sh
```

### Альтернативные способы
```bash
# Через npm скрипты
npm run start      # Запуск
npm run stop       # Остановка
npm run restart    # Перезапуск
npm run status     # Проверка статуса
npm run cleanup    # Очистка портов
```

## 🔧 Решение частых проблем

### 1. Порт занят (EADDRINUSE)
**Проблема:** `Error: listen EADDRINUSE: address already in use :::3001`

**Решение:**
```bash
# Автоматическая очистка
npm run cleanup

# Или принудительная остановка
npm run stop
```

### 2. Зависшие процессы
**Проблема:** Процессы не останавливаются корректно

**Решение:**
```bash
# Проверка статуса
npm run status

# Принудительная остановка
./scripts/dev-stop.sh

# Экстренная очистка
./scripts/port-cleanup.sh
```

### 3. Проблемы с зависимостями
**Проблема:** Ошибки при запуске из-за отсутствующих пакетов

**Решение:**
```bash
# Переустановка зависимостей
rm -rf frontend/node_modules backend/node_modules
npm install

# Запуск (автоматически установит зависимости)
npm run dev
```

### 4. База данных не подключается
**Проблема:** Ошибки подключения к PostgreSQL

**Решение:**
```bash
# Проверьте настройки в backend/.env
cat backend/.env

# Убедитесь, что PostgreSQL запущен
brew services start postgresql
# или
sudo systemctl start postgresql
```

## 🎯 Лучшие практики

### Ежедневная работа
1. **Всегда используйте скрипты** вместо ручного запуска
2. **Проверяйте статус** перед началом работы: `npm run status`
3. **Корректно останавливайте** проект: `npm run stop`

### При проблемах
1. **Сначала проверьте статус:** `npm run status`
2. **Попробуйте перезапуск:** `npm run restart`
3. **При зависших процессах:** `npm run cleanup`
4. **В крайнем случае:** ручная очистка портов

### Работа с портами
- **3000** - Frontend (Next.js)
- **3001** - Backend (Express)
- **5432** - PostgreSQL (если локально)

## 📊 Мониторинг

### Проверка работоспособности
```bash
# Статус всех сервисов
npm run status

# Проверка конкретных URL
curl http://localhost:3001/health
curl http://localhost:3000
```

### Логи и отладка
```bash
# Логи backend (в отдельном терминале)
cd backend && npm run dev

# Логи frontend (в отдельном терминале)
cd frontend && npm run dev
```

## 🛠️ Полезные команды

### Управление проектом
```bash
npm run dev        # Запуск проекта
npm run stop       # Остановка
npm run restart    # Перезапуск
npm run status     # Проверка статуса
npm run cleanup    # Очистка портов
```

### Разработка
```bash
npm run lint       # Проверка кода
npm run format     # Форматирование
npm run build      # Сборка для продакшена
```

### База данных (backend)
```bash
cd backend
npm run db:migrate    # Применить миграции
npm run db:seed       # Заполнить тестовыми данными
npm run db:studio     # Открыть Prisma Studio
npm run db:reset      # Сброс БД
```

## 🚨 Экстренные ситуации

### Все зависло
```bash
# Принудительная остановка всего
./scripts/dev-stop.sh

# Очистка всех портов
./scripts/port-cleanup.sh

# Перезапуск системы (macOS)
sudo reboot
```

### Проблемы с правами доступа
```bash
# Сделать скрипты исполняемыми
chmod +x scripts/*.sh

# Проверить права
ls -la scripts/
```

### Полная переустановка
```bash
# Удаление всех зависимостей
rm -rf node_modules frontend/node_modules backend/node_modules
rm -f package-lock.json frontend/package-lock.json backend/package-lock.json

# Переустановка
npm install

# Запуск
npm run dev
```

## 📱 Полезные URL

После запуска доступны:
- **Главная:** http://localhost:3000
- **Админ-панель:** http://localhost:3000/admin/login
- **API документация:** http://localhost:3001/api
- **Health check:** http://localhost:3001/health

## 🔑 Тестовые данные

**Администратор:**
- Email: `admin@memorial-pages.ru`
- Пароль: `MemorialAdmin2024!@#`

**Тестовые пользователи:**
- `trial@example.com` / `password123`
- `free@example.com` / `password123`
- `premium@example.com` / `password123`

## 💡 Дополнительные советы

1. **Используйте два терминала:** один для команд, другой для логов
2. **Добавьте алиасы в .zshrc/.bashrc:**
   ```bash
   alias mps-start="cd ~/path/to/project && npm run dev"
   alias mps-stop="cd ~/path/to/project && npm run stop"
   alias mps-status="cd ~/path/to/project && npm run status"
   ```
3. **Настройте IDE:** добавьте задачи для запуска/остановки
4. **Используйте Git hooks:** автоматическая остановка при переключении веток