#!/bin/bash

# 🔄 Скрипт для перезапуска всех сервисов

echo "🔄 Перезапуск Memorial Pages"
echo "============================"

# Остановка
./scripts/dev-stop.sh

echo ""
echo "⏳ Ожидание 2 секунды..."
sleep 2

echo ""
# Запуск
./scripts/dev-start.sh