#!/bin/bash

# 🧹 Скрипт для очистки занятых портов (экстренная помощь)

echo "🧹 Экстренная очистка портов"
echo "============================"

ports=(3000 3001 3002 3003 5432)

for port in "${ports[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "🔍 Найдены процессы на порту $port:"
        lsof -i:$port
        echo ""
        
        read -p "❓ Остановить процессы на порту $port? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "⏹️  Остановка процессов на порту $port..."
            kill -9 $(lsof -ti:$port) 2>/dev/null || true
            echo "✅ Порт $port очищен"
        else
            echo "⏭️  Пропуск порта $port"
        fi
        echo ""
    else
        echo "✅ Порт $port свободен"
    fi
done

echo "🎯 Очистка завершена!"
echo "🚀 Теперь можно запустить: ./scripts/dev-start.sh"