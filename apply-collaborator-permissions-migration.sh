#!/bin/bash

echo "🔄 Применение миграции прав доступа коллабораторов..."

cd backend

# Применяем миграцию
psql $DATABASE_URL -f prisma/migrations/update_collaborator_permissions/migration.sql

if [ $? -eq 0 ]; then
  echo "✅ Миграция успешно применена"
  echo ""
  echo "📝 Изменения:"
  echo "  - Поле permissions теперь хранит JSON с детальными правами"
  echo "  - Старые значения 'edit' конвертированы в полный доступ ко всем разделам"
  echo "  - Старые значения 'view' конвертированы в отсутствие доступа"
  echo ""
  echo "🎯 Теперь можно настраивать доступ к разделам:"
  echo "  - Основная информация"
  echo "  - Биография"
  echo "  - Галерея"
  echo "  - Воспоминания"
  echo "  - Хронология"
  echo "  - Отзывы"
  echo "  - Место захоронения"
else
  echo "❌ Ошибка при применении миграции"
  exit 1
fi
