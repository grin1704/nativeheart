#!/bin/bash

# Получаем токен из localStorage (нужно взять из браузера)
# Для теста используем curl напрямую к backend

echo "🧪 Тестирование /api/auth/me"
echo ""

# Сначала логинимся
echo "1️⃣ Логин..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"grin_av@mail.ru","password":"test123456"}')

echo "Ответ логина:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Извлекаем токен
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Не удалось получить токен"
  exit 1
fi

echo "✅ Токен получен"
echo ""

# Проверяем /api/auth/profile
echo "2️⃣ Проверка /api/auth/profile..."
curl -s http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "3️⃣ Проверка emailVerified в ответе:"
curl -s http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.user.emailVerified'
