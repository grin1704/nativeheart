#!/bin/bash

echo "🚀 Настройка PostgreSQL для боевой среды..."
echo

# Проверяем, установлен ли PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не найден. Установите PostgreSQL:"
    echo "   brew install postgresql"
    echo "   brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL найден"

# Проверяем, запущен ли PostgreSQL
if ! pg_isready -q; then
    echo "🔄 Запускаем PostgreSQL..."
    brew services start postgresql
    sleep 3
fi

echo "✅ PostgreSQL запущен"

# Создаем пользователя и базу данных
echo "📝 Создание пользователя и базы данных..."

# Создаем пользователя (если не существует)
psql postgres -c "CREATE USER memorial_user WITH PASSWORD 'memorial_pass';" 2>/dev/null || echo "ℹ️  Пользователь memorial_user уже существует"

# Создаем базу данных (если не существует)
psql postgres -c "CREATE DATABASE memorial_pages_db OWNER memorial_user;" 2>/dev/null || echo "ℹ️  База данных memorial_pages_db уже существует"

# Даем права пользователю
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE memorial_pages_db TO memorial_user;" 2>/dev/null

echo "✅ База данных настроена"

# Переходим в папку backend и выполняем миграции
echo "🔄 Выполнение миграций Prisma..."
cd backend

# Удаляем старые миграции SQLite
rm -rf prisma/migrations

# Создаем новую миграцию для PostgreSQL
npx prisma migrate dev --name init_postgresql

# Генерируем Prisma клиент
npx prisma generate

echo "✅ Миграции выполнены"
echo "🎉 PostgreSQL готов к использованию!"
echo
echo "📝 Настройки подключения:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: memorial_pages_db"
echo "   User: memorial_user"
echo "   Password: memorial_pass"