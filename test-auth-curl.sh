#!/bin/bash

echo "🧪 Тестирование системы аутентификации Memorial Pages"
echo "=================================================="

BASE_URL="http://localhost:3001"

# Проверяем, что сервер запущен
echo "1️⃣ Проверяем работу сервера..."
HEALTH_CHECK=$(curl -s "$BASE_URL/health")
if [[ $? -eq 0 ]]; then
    echo "✅ Сервер работает: $HEALTH_CHECK"
else
    echo "❌ Сервер не отвечает. Убедитесь, что сервер запущен: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Тестируем регистрацию пользователя..."

# Генерируем уникальный email
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\",\"name\":\"Тестовый Пользователь\"}")

echo "Ответ регистрации: $REGISTER_RESPONSE"

# Извлекаем токен из ответа (простой способ)
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$TOKEN" ]]; then
    echo "✅ Регистрация успешна! Получен токен: ${TOKEN:0:20}..."
else
    echo "❌ Ошибка регистрации"
    exit 1
fi

echo ""
echo "3️⃣ Тестируем вход в систему..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")

echo "Ответ входа: $LOGIN_RESPONSE"

echo ""
echo "4️⃣ Тестируем получение профиля..."

PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Профиль пользователя: $PROFILE_RESPONSE"

echo ""
echo "5️⃣ Тестируем обновление подписки..."

SUBSCRIPTION_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/auth/subscription" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"subscriptionType":"premium"}')

echo "Обновление подписки: $SUBSCRIPTION_RESPONSE"

echo ""
echo "6️⃣ Тестируем доступ без токена..."

NO_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile")
echo "Доступ без токена: $NO_TOKEN_RESPONSE"

echo ""
echo "7️⃣ Тестируем доступ с неверным токеном..."

INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer invalid-token")
echo "Доступ с неверным токеном: $INVALID_TOKEN_RESPONSE"

echo ""
echo "🎉 Тестирование завершено!"
echo ""
echo "📋 Для полного тестирования:"
echo "   1. Убедитесь, что сервер запущен: cd backend && npm run dev"
echo "   2. Убедитесь, что база данных настроена: cd backend && npm run db:migrate"
echo "   3. Запустите этот скрипт: ./test-auth-curl.sh"