# Исправление проблемы VK OAuth на продакшене

## Проблема
На https://nativeheart.ru/auth/login при входе через ВКонтакте редирект идёт на:
- `https://oauth.vk.com/authorize` (старый формат) вместо `https://id.vk.com/authorize`
- `redirect_uri=http://localhost:3000` вместо `https://nativeheart.ru`

## Причина
На продакшен-сервере используется старая версия кода без VK ID OAuth 2.1.

## Решение

### 1. Локально - обновлены файлы (уже сделано)
- `backend/src/services/oauthService.ts` - использует VK ID OAuth 2.1
- `frontend/src/app/auth/login/page.tsx` - добавлены заголовки no-cache
- `frontend/src/app/api/auth/vk/url/route.ts` - добавлены заголовки no-cache

### 2. Локально - соберите и закоммитьте

```bash
# Соберите backend
cd backend && npm run build && cd ..

# Соберите frontend для продакшена
cd frontend
NEXT_PUBLIC_API_URL=https://nativeheart.ru/api NEXT_PUBLIC_YANDEX_MAPS_API_KEY=45bc2843-bef5-4486-bd3d-773576d96f1b npm run build
cd ..

# Закоммитьте изменения
git add -A
git commit -m "Fix VK OAuth: migrate to VK ID OAuth 2.1 with PKCE"
git push
```

### 3. На сервере - обновите код

```bash
# Подключитесь к серверу
ssh root@85.117.234.124

# Перейдите в проект
cd /opt/nativeheart

# Обновите код
git pull

# Проверьте переменные окружения
cat .env | grep VK_

# Должно быть:
# VK_CLIENT_ID=54530279
# VK_CLIENT_SECRET=LpbQZJk9EA7TYD7UcyJC
# VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback

# Если VK_REDIRECT_URI неправильный, исправьте:
nano .env
# Измените VK_REDIRECT_URI на https://nativeheart.ru/auth/vk/callback

# Пересоберите Docker образы
docker compose -f docker-compose.prod.yml build --no-cache backend frontend

# Перезапустите контейнеры
docker compose -f docker-compose.prod.yml up -d

# Проверьте логи
docker compose -f docker-compose.prod.yml logs backend --tail=50
docker compose -f docker-compose.prod.yml logs frontend --tail=50
```

### 3. Очистите кэш браузера

В браузере:
1. Откройте DevTools (F12)
2. Правый клик на кнопке обновления → "Очистить кэш и жёсткая перезагрузка"
3. Или: Settings → Privacy → Clear browsing data → Cached images and files

### 4. Обновите настройки VK приложения

**ВАЖНО!** Перейдите на https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/api-integration/oauth-flow

В настройках VK приложения (https://vk.com/apps?act=manage):
1. Найдите приложение с ID `54530279`
2. Включите **VK ID** (новый OAuth 2.1 с PKCE)
3. Добавьте Redirect URI:
   - Для разработки: `http://localhost:3000/auth/vk/callback`
   - Для продакшена: `https://nativeheart.ru/auth/vk/callback`

### 5. Переменные окружения

**Локально** (`backend/.env`):
```env
VK_CLIENT_ID=54530279
VK_CLIENT_SECRET=LpbQZJk9EA7TYD7UcyJC
VK_REDIRECT_URI=http://localhost:3000/auth/vk/callback
```

**На сервере** (`/opt/nativeheart/.env`):
```env
VK_CLIENT_ID=54530279
VK_CLIENT_SECRET=LpbQZJk9EA7TYD7UcyJC
VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback
FRONTEND_URL=https://nativeheart.ru
```

## Тестирование

1. Откройте http://localhost:3000/auth/login
2. Нажмите кнопку "ВКонтакте"
3. В консоли браузера должен появиться лог: `VK Auth URL: https://id.vk.com/authorize?...`
4. Проверьте, что URL начинается с `https://id.vk.com`, а не `https://oauth.vk.com`

## Дополнительная диагностика

Если проблема сохраняется:

```bash
# Проверьте, что backend использует правильный код
cat backend/dist/services/oauthService.js | grep "id.vk.com"

# Должно вывести строку с https://id.vk.com/authorize
```

## Важно

После любых изменений в backend всегда:
1. Пересобирайте: `cd backend && npm run build`
2. Перезапускайте процесс
