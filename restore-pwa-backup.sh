#!/bin/bash

# Скрипт восстановления из бэкапа PWA
BACKUP_DIR="backups/pwa-implementation_20251130_013707"

echo "🔄 Восстановление проекта из бэкапа..."

# Проверка существования бэкапа
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Бэкап не найден: $BACKUP_DIR"
    exit 1
fi

# Подтверждение
read -p "⚠️  Это удалит текущие frontend и backend. Продолжить? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 0
fi

# Удаление текущих директорий
echo "🗑️  Удаление текущих директорий..."
rm -rf frontend backend

# Восстановление из архивов
echo "📦 Восстановление frontend..."
tar -xzf "$BACKUP_DIR/frontend-backup.tar.gz"

echo "📦 Восстановление backend..."
tar -xzf "$BACKUP_DIR/backend-backup.tar.gz"

# Восстановление корневых файлов
echo "📄 Восстановление корневых файлов..."
cp "$BACKUP_DIR/package.json" . 2>/dev/null || true
cp "$BACKUP_DIR/package-lock.json" . 2>/dev/null || true

# Установка зависимостей
echo "📥 Установка зависимостей..."
npm install

echo "✅ Восстановление завершено!"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте .env файлы в backend/"
echo "2. Запустите проект: npm run dev"
