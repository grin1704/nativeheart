# Деплой исправления VK OAuth на продакшен

## Что исправлено
- Миграция с старого VK OAuth на новый VK ID OAuth 2.1 с PKCE
- Исправлен redirect_uri (теперь использует правильный URL для продакшена)
- Добавлены заголовки no-cache для предотвращения кэширования

## Шаги деплоя на сервер

### 1. Подключитесь к серверу

```bash
ssh root@85.117.234.124
```

### 2. Обновите код и удалите старый .next

```bash
cd /opt/nativeheart
git pull

# ВАЖНО: Удалите старый .next (он больше не в git)
rm -rf frontend/.next
```

### 3. Проверьте переменные окружения

```bash
cat .env | grep -E "VK_|FRONTEND_URL"
```

Должно быть:
```
FRONTEND_URL=https://nativeheart.ru
VK_CLIENT_ID=54530279
VK_CLIENT_SECRET=LpbQZJk9EA7TYD7UcyJC
VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback
```

Если `VK_REDIRECT_URI` неправильный или отсутствует:
```bash
nano .env
# Добавьте или исправьте строку:
# VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback
```

### 4. Пересоберите Docker образы

**ВАЖНО:** Frontend теперь собирается на сервере (`.next` больше не в git)

```bash
# Пересоберите оба сервиса
docker compose -f docker-compose.prod.yml build --no-cache backend frontend

# Если нужно собрать только frontend локально внутри контейнера:
# docker compose -f docker-compose.prod.yml run --rm frontend npm run build
```

### 5. Перезапустите контейнеры

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Проверьте логи

```bash
# Логи backend
docker compose -f docker-compose.prod.yml logs backend --tail=50

# Логи frontend
docker compose -f docker-compose.prod.yml logs frontend --tail=50
```

### 7. Проверьте статус контейнеров

```bash
docker compose -f docker-compose.prod.yml ps
```

Все контейнеры должны быть в статусе "Up".

## Проверка работы

1. Откройте https://nativeheart.ru/auth/login
2. Откройте DevTools (F12) → вкладка Console
3. Нажмите кнопку "ВКонтакте"
4. В консоли должен появиться лог: `VK Auth URL: https://id.vk.com/authorize?...`
5. Проверьте, что URL начинается с `https://id.vk.com`, а не `https://oauth.vk.com`
6. Проверьте, что `redirect_uri` содержит `https://nativeheart.ru`, а не `localhost`

## Настройка VK приложения

**ВАЖНО!** Убедитесь, что в настройках VK приложения (https://vk.com/apps?act=manage):

1. Найдите приложение с ID `54530279`
2. Включите **VK ID** (новый OAuth 2.1 с PKCE)
3. В разделе "Redirect URI" добавьте:
   - `https://nativeheart.ru/auth/vk/callback`
   - `http://localhost:3000/auth/vk/callback` (для локальной разработки)

Документация VK ID: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/api-integration/oauth-flow

## Откат (если что-то пошло не так)

```bash
cd /opt/nativeheart
git log --oneline -5  # найдите предыдущий коммит
git reset --hard <предыдущий-коммит-hash>
docker compose -f docker-compose.prod.yml build --no-cache backend frontend
docker compose -f docker-compose.prod.yml up -d
```

## Проблемы и решения

### Проблема: Контейнеры не запускаются
```bash
docker compose -f docker-compose.prod.yml logs
```

### Проблема: Всё ещё редирект на oauth.vk.com
- Очистите кэш браузера (Ctrl+Shift+Delete)
- Проверьте, что код обновился: `cat backend/dist/services/oauthService.js | grep "id.vk.com"`
- Перезапустите контейнеры: `docker compose -f docker-compose.prod.yml restart`

### Проблема: redirect_uri всё ещё localhost
- Проверьте `.env`: `cat .env | grep VK_REDIRECT_URI`
- Убедитесь, что `VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback`
- Перезапустите backend: `docker compose -f docker-compose.prod.yml restart backend`
