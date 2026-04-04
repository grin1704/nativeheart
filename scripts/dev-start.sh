#!/bin/bash

# 🚀 Скрипт для запуска проекта в режиме разработки
# Автоматически очищает порты и запускает оба сервиса

set -e

echo "🚀 Запуск Memorial Pages в режиме разработки"
echo "============================================="

# Функция для остановки процессов на портах
cleanup_ports() {
    echo "🧹 Очистка портов..."
    
    # Остановка процессов на порту 3000 (frontend)
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "   Остановка процессов на порту 3000..."
        kill -9 $(lsof -ti:3000) 2>/dev/null || true
    fi
    
    # Остановка процессов на порту 3001 (backend)
    if lsof -ti:3001 >/dev/null 2>&1; then
        echo "   Остановка процессов на порту 3001..."
        kill -9 $(lsof -ti:3001) 2>/dev/null || true
    fi
    
    echo "✅ Порты очищены"
}

# Функция для проверки зависимостей
check_dependencies() {
    echo "📦 Проверка зависимостей..."
    
    if [ ! -d "backend/node_modules" ]; then
        echo "   Установка зависимостей backend..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        echo "   Установка зависимостей frontend..."
        cd frontend && npm install && cd ..
    fi
    
    echo "✅ Зависимости готовы"
}

# Функция для запуска сервисов
start_services() {
    echo "🚀 Запуск сервисов..."
    
    # Запуск backend в фоне
    echo "   Запуск backend на порту 3001..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Ждем немного, чтобы backend успел запуститься
    sleep 3
    
    # Запуск frontend в фоне
    echo "   Запуск frontend на порту 3000..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Сохраняем PID процессов для последующей остановки
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    echo ""
    echo "✅ Сервисы запущены!"
    echo ""
    echo "🌐 Доступные URL:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Admin:    http://localhost:3000/admin/login"
    echo ""
    echo "🔑 Админ данные:"
    echo "   Email:    admin@memorial-pages.ru"
    echo "   Пароль:   MemorialAdmin2024!@#"
    echo ""
    echo "⏹️  Для остановки: ./scripts/dev-stop.sh"
    echo "📊 Для мониторинга: ./scripts/dev-status.sh"
}

# Обработка сигнала прерывания (Ctrl+C)
trap 'echo ""; echo "🛑 Остановка сервисов..."; ./scripts/dev-stop.sh; exit 0' INT

# Основная логика
cleanup_ports
check_dependencies
start_services

# Ожидание (чтобы скрипт не завершился)
echo "💡 Нажмите Ctrl+C для остановки всех сервисов"
wait