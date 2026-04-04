#!/bin/bash

echo "🧪 Простой тест создания памятной страницы..."
echo

# 1. Регистрация пользователя
echo "1. Регистрация пользователя..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@example.com\",\"password\":\"testpass123\",\"name\":\"Test User\"}")

echo "Ответ регистрации: $REGISTER_RESPONSE"

# Извлекаем токен из ответа
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Не удалось получить токен"
  exit 1
fi

echo "✅ Токен получен: ${TOKEN:0:20}..."
echo

# 2. Создание памятной страницы
echo "2. Создание памятной страницы..."
MEMORIAL_RESPONSE=$(curl -s -X POST http://localhost:3002/api/memorial-pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "Иван Иванович Иванов",
    "birthDate": "1950-05-15",
    "deathDate": "2023-10-01",
    "shortDescription": "Любящий отец и дедушка"
  }')

echo "Ответ создания: $MEMORIAL_RESPONSE"

# Извлекаем ID и slug
MEMORIAL_ID=$(echo $MEMORIAL_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
MEMORIAL_SLUG=$(echo $MEMORIAL_RESPONSE | grep -o '"slug":"[^"]*"' | cut -d'"' -f4)

if [ -n "$MEMORIAL_ID" ] && [ -n "$MEMORIAL_SLUG" ]; then
  echo "✅ Памятная страница создана:"
  echo "   ID: $MEMORIAL_ID"
  echo "   Slug: $MEMORIAL_SLUG"
  echo "   URL: http://localhost:3001/memorial/$MEMORIAL_SLUG"
  echo
  
  # 3. Получение созданной страницы
  echo "3. Проверка созданной страницы..."
  GET_RESPONSE=$(curl -s -X GET http://localhost:3002/api/memorial-pages/$MEMORIAL_ID \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Ответ получения: $GET_RESPONSE"
  echo
  echo "🎉 Все тесты прошли успешно!"
else
  echo "❌ Не удалось создать памятную страницу"
fi