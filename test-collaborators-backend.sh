#!/bin/bash

# Тест бэкенд API для коллабораторов

echo "=== Тест API коллабораторов ==="
echo ""

# Получаем токен (замените на ваш)
TOKEN=$(cat <<'EOF'
# Вставьте ваш токен сюда или получите его из localStorage
# В браузере: localStorage.getItem('token')
EOF
)

# Если токен не задан, пытаемся получить из переменной окружения
if [ -z "$TOKEN" ]; then
  echo "⚠️  Токен не задан. Установите переменную TOKEN или отредактируйте скрипт."
  echo "   В браузере выполните: localStorage.getItem('token')"
  exit 1
fi

PAGE_ID="6771b69d-714c-43a9-b449-6be7292f4501"
BACKEND_URL="http://localhost:5000"

echo "1. Проверка здоровья API..."
curl -s "$BACKEND_URL/api/" | jq .
echo ""

echo "2. Проверка эндпоинта коллабораторов..."
echo "GET $BACKEND_URL/api/memorial-pages/$PAGE_ID/collaborators"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BACKEND_URL/api/memorial-pages/$PAGE_ID/collaborators" | jq .
echo ""

echo "3. Проверка приглашений пользователя..."
echo "GET $BACKEND_URL/api/my/invitations"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BACKEND_URL/api/my/invitations" | jq .
echo ""

echo "=== Конец теста ==="
