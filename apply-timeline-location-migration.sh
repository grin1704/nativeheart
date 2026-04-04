#!/bin/bash

echo "Применение миграции для добавления поля 'location' в timeline_events..."

cd backend

# Применяем миграцию
psql $DATABASE_URL -f prisma/migrations/add_timeline_location/migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Миграция успешно применена"
    
    # Генерируем Prisma Client
    echo "Генерация Prisma Client..."
    npx prisma generate
    
    echo "✅ Готово! Поле 'location' добавлено в таблицу timeline_events"
else
    echo "❌ Ошибка при применении миграции"
    exit 1
fi
