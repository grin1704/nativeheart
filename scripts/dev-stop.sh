#!/bin/bash

# 🛑 Скрипт для остановки всех сервисов разработки

echo "🛑 Остановка Memorial Pages"
echo "==========================="

# Остановка по PID файлам
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   Остановка backend (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
        sleep 2
        kill -9 $BACKEND_PID 2>/dev/null || true
    fi
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   Остановка frontend (PID: $FRONTEND_PID)..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        sleep 2
        kill -9 $FRONTEND_PID 2>/dev/null || true
    fi
    rm -f .frontend.pid
fi

# Дополнительная очистка портов (на случай зависших процессов)
echo "🧹 Очистка портов..."

if lsof -ti:3000 >/dev/null 2>&1; then
    echo "   Принудительная остановка процессов на порту 3000..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
fi

if lsof -ti:3001 >/dev/null 2>&1; then
    echo "   Принудительная остановка процессов на порту 3001..."
    kill -9 $(lsof -ti:3001) 2>/dev/null || true
fi

# Очистка временных файлов
rm -f .backend.pid .frontend.pid

echo "✅ Все сервисы остановлены"
echo "🚀 Для запуска: ./scripts/dev-start.sh"