# Деплой на сервер (85.117.234.124)

## Требования на сервере
- Docker + Docker Compose
- Git

## 1. Подключиться к серверу и клонировать репозиторий

```bash
ssh root@85.117.234.124
git clone https://github.com/grin1704/nativeheart.git /opt/nativeheart
cd /opt/nativeheart
```

## 2. Создать .env файл

```bash
cp .env.production.example .env
nano .env
```

Заполнить все значения (скопировать из локального `backend/.env` + поменять URLs).

Ключевые отличия от локального .env:
- `FRONTEND_URL=https://nativeheart.ru`
- `NEXT_PUBLIC_API_URL=https://nativeheart.ru/api`
- `BACKEND_URL=http://backend:3001`
- `DATABASE_URL` — не нужен в `.env` (собирается автоматически из POSTGRES_*)

## 3. Получить SSL сертификат (первый раз)

Временно активировать упрощённый nginx конфиг:
```bash
mv nginx/conf.d/app.conf nginx/conf.d/app.conf.disabled
mv nginx/conf.d/app-init.conf.disabled nginx/conf.d/app-init.conf
```

Запустить только nginx и frontend:
```bash
docker compose -f docker-compose.prod.yml up -d postgres backend frontend nginx
```

Получить сертификат:
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d nativeheart.ru -d www.nativeheart.ru \
  --email your@email.com --agree-tos --no-eff-email
```

Вернуть основной конфиг:
```bash
mv nginx/conf.d/app-init.conf nginx/conf.d/app-init.conf.disabled
mv nginx/conf.d/app.conf.disabled nginx/conf.d/app.conf
docker compose -f docker-compose.prod.yml restart nginx
```

## 4. Запустить все сервисы

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 5. Проверить что всё работает

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --tail=50
docker compose -f docker-compose.prod.yml logs frontend --tail=50
```

Открыть https://nativeheart.ru

## Обновление после изменений в коде

```bash
cd /opt/nativeheart
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Полезные команды

```bash
# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f backend

# Перезапуск одного сервиса
docker compose -f docker-compose.prod.yml restart backend

# Войти в контейнер
docker compose -f docker-compose.prod.yml exec backend sh

# Prisma Studio (через туннель)
docker compose -f docker-compose.prod.yml exec backend npx prisma studio

# Бэкап базы данных
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U nativeheart nativeheart_db > backup.sql
```

## Настройка DNS

В панели управления доменом nativeheart.ru добавить A-записи:
- `@` → `85.117.234.124`
- `www` → `85.117.234.124`
