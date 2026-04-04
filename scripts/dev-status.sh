#!/bin/bash

# 📊 Скрипт для проверки статуса сервисов

echo "📊 Статус Memorial Pages"
echo "========================"

# Проверка портов
check_port() {
    local port=$1
    local service=$2
    
    if lsof -ti:$port >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port)
        echo "✅ $service (порт $port) - ЗАПУЩЕН (PID: $pid)"
        return 0
    else
        echo "❌ $service (порт $port) - ОСТАНОВЛЕН"
        return 1
    fi
}

# Проверка HTTP доступности
check_http() {
    local url=$1
    local service=$2
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        echo "🌐 $service - HTTP OK"
        return 0
    else
        echo "⚠️  $service - HTTP недоступен"
        return 1
    fi
}

echo ""
echo "🔍 Проверка портов:"
check_port 3001 "Backend"
check_port 3000 "Frontend"

echo ""
echo "🌐 Проверка HTTP доступности:"
check_http "http://localhost:3001/health" "Backend API"
check_http "http://localhost:3000" "Frontend"

echo ""
echo "📋 Полезные URL:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001/api"
echo "   Health check: http://localhost:3001/health"
echo "   Admin panel:  http://localhost:3000/admin/login"

echo ""
echo "🔧 Управление:"
echo "   Запуск:    ./scripts/dev-start.sh"
echo "   Остановка: ./scripts/dev-stop.sh"
echo "   Рестарт:   ./scripts/dev-restart.sh"