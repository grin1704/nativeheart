#!/bin/bash

# Скрипт восстановления из бэкапа перед обновлением дизайна
# Использование: ./restore-design-backup.sh

set -e

BACKUP_FILE="backups/backup_before_design_update_20251124_200913.tar.gz"
RESTORE_DIR="restore_temp_$(date +%s)"

echo "🔄 Восстановление из бэкапа..."
echo "📦 Файл: $BACKUP_FILE"

# Проверка существования бэкапа
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Ошибка: Файл бэкапа не найден!"
    exit 1
fi

# Создание временной директории
echo "📁 Создание временной директории..."
mkdir -p "$RESTORE_DIR"

# Распаковка бэкапа
echo "📦 Распаковка бэкапа..."
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Подтверждение
echo ""
echo "⚠️  ВНИМАНИЕ! Это действие перезапишет текущие файлы."
echo "Вы уверены, что хотите продолжить? (yes/no)"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Отменено пользователем"
    rm -rf "$RESTORE_DIR"
    exit 0
fi

# Восстановление frontend
echo "🔄 Восстановление frontend..."
if [ -d "$RESTORE_DIR/frontend" ]; then
    cp -r "$RESTORE_DIR/frontend/src" frontend/
    cp "$RESTORE_DIR/frontend/package.json" frontend/ 2>/dev/null || true
    cp "$RESTORE_DIR/frontend/globals.css" frontend/src/app/ 2>/dev/null || true
    echo "✅ Frontend восстановлен"
fi

# Восстановление backend
echo "🔄 Восстановление backend..."
if [ -d "$RESTORE_DIR/backend" ]; then
    cp -r "$RESTORE_DIR/backend/src" backend/
    cp -r "$RESTORE_DIR/backend/prisma" backend/
    cp "$RESTORE_DIR/backend/package.json" backend/ 2>/dev/null || true
    echo "✅ Backend восстановлен"
fi

# Очистка
echo "🧹 Очистка временных файлов..."
rm -rf "$RESTORE_DIR"

echo ""
echo "✅ Восстановление завершено!"
echo ""
echo "📝 Следующие шаги:"
echo "1. cd frontend && npm install"
echo "2. cd backend && npm install"
echo "3. Перезапустить серверы"
echo ""
