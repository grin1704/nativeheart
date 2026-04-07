# Финальные инструкции по деплою VK OAuth исправления

## Что было сделано

1. ✅ Миграция на VK ID OAuth 2.1 с PKCE
2. ✅ Исправлен redirect_uri для продакшена
3. ✅ Добавлены заголовки no-cache
4. ✅ Удалён `.next` из git (теперь собирается на сервере)
5. ✅ Обновлён Dockerfile для сборки внутри контейнера
6. ✅ Все изменения закоммичены и запушены

## Деплой на сервер (выполните на сервере)

```bash
# 1. Подключитесь к серверу
ssh root@85.117.234.124

# 2. Перейдите в проект
cd /opt/nativeheart

# 3. Обновите код
git pull

# 4. Проверьте переменные окружения
cat .env | grep -E "VK_|FRONTEND_URL"

# Должно быть:
# FRONTEND_URL=https://nativeheart.ru
# VK_CLIENT_ID=54530279
# VK_CLIENT_SECRET=LpbQZJk9EA7TYD7UcyJC
# VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback

# Если VK_REDIRECT_URI отсутствует или неправильный:
nano .env
# Добавьте: VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback

# 5. Пересоберите Docker образы (это займёт время, т.к. frontend собирается внутри)
docker compose -f docker-compose.prod.yml build --no-cache backend frontend

# 6. Перезапустите контейнеры
docker compose -f docker-compose.prod.yml up -d

# 7. Проверьте логи
docker compose -f docker-compose.prod.yml logs backend --tail=50
docker compose -f docker-compose.prod.yml logs frontend --tail=50

# 8. Проверьте статус
docker compose -f docker-compose.prod.yml ps
```

## Проверка работы

1. Откройте https://nativeheart.ru/auth/login
2. Откройте DevTools (F12) → Console
3. Нажмите кнопку "ВКонтакте"
4. В консоли должен появиться: `VK Auth URL: https://id.vk.com/authorize?...`
5. Проверьте URL:
   - ✅ Начинается с `https://id.vk.com` (не `oauth.vk.com`)
   - ✅ `redirect_uri` содержит `https://nativeheart.ru` (не `localhost`)

## Настройка VK приложения

**ОБЯЗАТЕЛЬНО!** Зайдите в настройки VK приложения:

1. Перейдите на https://vk.com/apps?act=manage
2. Найдите приложение с ID `54530279`
3. Включите **VK ID** (новый OAuth 2.1 с PKCE)
4. В разделе "Redirect URI" добавьте:
   - `https://nativeheart.ru/auth/vk/callback`
   - `http://localhost:3000/auth/vk/callback` (для локальной разработки)

Документация: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/api-integration/oauth-flow

## Если что-то пошло не так

### Проблема: Контейнеры не запускаются

```bash
docker compose -f docker-compose.prod.yml logs
```

### Проблема: Сборка frontend занимает слишком много времени

Это нормально при первой сборке. Frontend собирается внутри Docker контейнера.

### Проблема: Всё ещё редирект на oauth.vk.com

1. Очистите кэш браузера (Ctrl+Shift+Delete)
2. Проверьте, что backend обновился:
   ```bash
   docker compose -f docker-compose.prod.yml exec backend cat /app/dist/services/oauthService.js | grep "id.vk.com"
   ```
3. Если не обновился, пересоберите:
   ```bash
   docker compose -f docker-compose.prod.yml build --no-cache backend
   docker compose -f docker-compose.prod.yml up -d backend
   ```

### Проблема: redirect_uri всё ещё localhost

1. Проверьте `.env`:
   ```bash
   cat .env | grep VK_REDIRECT_URI
   ```
2. Убедитесь, что `VK_REDIRECT_URI=https://nativeheart.ru/auth/vk/callback`
3. Перезапустите backend:
   ```bash
   docker compose -f docker-compose.prod.yml restart backend
   ```

## Откат (если нужно)

```bash
cd /opt/nativeheart
git log --oneline -5  # найдите предыдущий коммит
git reset --hard <hash-предыдущего-коммита>
docker compose -f docker-compose.prod.yml build --no-cache backend frontend
docker compose -f docker-compose.prod.yml up -d
```

## Важные изменения в проекте

1. **`.next` больше не в git** - собирается на сервере при деплое
2. **Dockerfile изменён** - теперь использует multi-stage build
3. **Процесс деплоя изменился** - теперь сборка происходит на сервере, а не локально

## Обновление документации project-overview.md

После успешного деплоя обновите раздел "Продакшен деплой":

```markdown
### Деплой обновлений
Сборка происходит **на сервере** внутри Docker контейнера.

```bash
# 1. Локально — закоммитить и запушить изменения
git add -A && git commit -m "..." && git push

# 2. На сервере — обновить и пересобрать Docker образы
cd /opt/nativeheart && git pull
docker compose -f docker-compose.prod.yml build --no-cache backend frontend
docker compose -f docker-compose.prod.yml up -d
```
```

## Контакты для поддержки

Если возникнут проблемы, проверьте:
- Логи контейнеров: `docker compose -f docker-compose.prod.yml logs`
- Статус контейнеров: `docker compose -f docker-compose.prod.yml ps`
- Переменные окружения: `cat .env`
