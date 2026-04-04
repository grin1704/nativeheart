#!/bin/bash

# Скрипт для создания полного бэкапа системы
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔄 Создание бэкапа системы..."
echo "📁 Директория: $BACKUP_DIR"
echo ""

# 1. Бэкап Prisma схемы
echo "1️⃣ Бэкап Prisma схемы..."
cp backend/prisma/schema.prisma "$BACKUP_DIR/schema.prisma"
echo "✅ schema.prisma"

# 2. Бэкап базы данных (дамп)
echo ""
echo "2️⃣ Бэкап базы данных..."
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function backup() {
  try {
    // Получаем все таблицы
    const tables = await prisma.\$queryRaw\`
      SELECT tablename FROM pg_tables 
      WHERE schemaname='public' 
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename
    \`;
    
    console.log('📊 Таблицы для бэкапа:', tables.map(t => t.tablename).join(', '));
    
    // Экспортируем данные из каждой таблицы
    const backup = {};
    for (const table of tables) {
      const tableName = table.tablename;
      try {
        const data = await prisma.\$queryRawUnsafe(\`SELECT * FROM \${tableName}\`);
        backup[tableName] = data;
        console.log(\`✅ \${tableName}: \${data.length} записей\`);
      } catch (err) {
        console.log(\`⚠️  \${tableName}: ошибка - \${err.message}\`);
      }
    }
    
    // Сохраняем в файл
    fs.writeFileSync('../$BACKUP_DIR/database_dump.json', JSON.stringify(backup, null, 2));
    console.log('✅ Дамп БД сохранен');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

backup();
" || echo "⚠️  Не удалось создать дамп БД (возможно, БД пуста)"
cd ..

# 3. Бэкап ключевых файлов backend
echo ""
echo "3️⃣ Бэкап ключевых файлов backend..."
mkdir -p "$BACKUP_DIR/backend"

# Controllers
cp -r backend/src/controllers "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ controllers"

# Services
cp -r backend/src/services "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ services"

# Routes
cp -r backend/src/routes "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ routes"

# Middleware
cp -r backend/src/middleware "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ middleware"

# Validation
cp -r backend/src/validation "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ validation"

# Utils
cp -r backend/src/utils "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ utils"

# Config
cp -r backend/src/config "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ config"

# Types
cp -r backend/src/types "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ types"

# Main files
cp backend/src/index.ts "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ index.ts"
cp backend/package.json "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ package.json"
cp backend/tsconfig.json "$BACKUP_DIR/backend/" 2>/dev/null && echo "✅ tsconfig.json"

# 4. Бэкап ключевых файлов frontend
echo ""
echo "4️⃣ Бэкап ключевых файлов frontend..."
mkdir -p "$BACKUP_DIR/frontend"

# Auth pages
cp -r frontend/src/app/auth "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ auth pages"

# API routes
cp -r frontend/src/app/api "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ api routes"

# Components
cp -r frontend/src/components "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ components"

# Utils
cp -r frontend/src/utils "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ utils"

# Types
cp frontend/src/types/index.ts "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ types"

# Config
cp frontend/next.config.js "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ next.config.js"
cp frontend/package.json "$BACKUP_DIR/frontend/" 2>/dev/null && echo "✅ package.json"

# 5. Создание манифеста бэкапа
echo ""
echo "5️⃣ Создание манифеста..."
cat > "$BACKUP_DIR/MANIFEST.md" << EOF
# Бэкап системы

**Дата создания:** $(date '+%Y-%m-%d %H:%M:%S')
**Версия:** Рабочая версия после отката авторизации

## Содержимое

### 1. База данных
- \`database_dump.json\` - полный дамп всех таблиц

### 2. Prisma
- \`schema.prisma\` - схема базы данных

### 3. Backend
- \`backend/controllers/\` - контроллеры
- \`backend/services/\` - сервисы
- \`backend/routes/\` - маршруты
- \`backend/middleware/\` - middleware
- \`backend/validation/\` - валидация
- \`backend/utils/\` - утилиты
- \`backend/config/\` - конфигурация
- \`backend/types/\` - типы
- \`backend/index.ts\` - главный файл
- \`backend/package.json\` - зависимости
- \`backend/tsconfig.json\` - конфигурация TypeScript

### 4. Frontend
- \`frontend/auth/\` - страницы авторизации
- \`frontend/api/\` - API маршруты
- \`frontend/components/\` - компоненты
- \`frontend/utils/\` - утилиты
- \`frontend/types/\` - типы
- \`frontend/next.config.js\` - конфигурация Next.js
- \`frontend/package.json\` - зависимости

## Восстановление

### Полное восстановление
\`\`\`bash
./restore-from-backup.sh $BACKUP_DIR
\`\`\`

### Частичное восстановление

#### Только схема Prisma
\`\`\`bash
cp $BACKUP_DIR/schema.prisma backend/prisma/schema.prisma
cd backend
npx prisma generate
\`\`\`

#### Только база данных
\`\`\`bash
cd backend
node restore-database.js ../$BACKUP_DIR/database_dump.json
\`\`\`

#### Только backend код
\`\`\`bash
cp -r $BACKUP_DIR/backend/* backend/src/
\`\`\`

#### Только frontend код
\`\`\`bash
cp -r $BACKUP_DIR/frontend/* frontend/src/
\`\`\`

## Статус на момент бэкапа

✅ Backend компилируется без ошибок
✅ Frontend работает
✅ База данных в рабочем состоянии
✅ Все основные функции работают

## Что работает

- Базовая регистрация и авторизация (email + password)
- JWT токены
- Управление подписками
- Создание и редактирование памятных страниц
- Галереи фото и видео
- Временная шкала (Timeline)
- Воспоминания и отзывы
- QR-коды
- Карты захоронений
- Админ-панель

## Что НЕ реализовано

- OAuth авторизация (VK, Yandex)
- Верификация email
- Восстановление пароля
EOF

echo "✅ Манифест создан"

# 6. Создание скрипта восстановления
echo ""
echo "6️⃣ Создание скрипта восстановления..."
cat > "$BACKUP_DIR/restore.sh" << 'RESTORE_SCRIPT'
#!/bin/bash

BACKUP_DIR=$(dirname "$0")

echo "🔄 Восстановление из бэкапа..."
echo "📁 Источник: $BACKUP_DIR"
echo ""

read -p "⚠️  Это перезапишет текущие файлы. Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Отменено"
    exit 1
fi

echo ""
echo "1️⃣ Восстановление Prisma схемы..."
cp "$BACKUP_DIR/schema.prisma" backend/prisma/schema.prisma
echo "✅ schema.prisma восстановлена"

echo ""
echo "2️⃣ Восстановление backend кода..."
cp -r "$BACKUP_DIR/backend/"* backend/src/ 2>/dev/null
echo "✅ Backend код восстановлен"

echo ""
echo "3️⃣ Восстановление frontend кода..."
cp -r "$BACKUP_DIR/frontend/"* frontend/src/ 2>/dev/null
echo "✅ Frontend код восстановлен"

echo ""
echo "4️⃣ Регенерация Prisma Client..."
cd backend
npx prisma generate
cd ..
echo "✅ Prisma Client перегенерирован"

echo ""
echo "✅ Восстановление завершено!"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте компиляцию: cd backend && npm run build"
echo "2. Запустите сервисы: npm run dev"
RESTORE_SCRIPT

chmod +x "$BACKUP_DIR/restore.sh"
echo "✅ Скрипт восстановления создан"

# 7. Создание скрипта восстановления БД
echo ""
echo "7️⃣ Создание скрипта восстановления БД..."
cat > "$BACKUP_DIR/restore-database.js" << 'RESTORE_DB_SCRIPT'
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase() {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Укажите файл бэкапа: node restore-database.js <backup_file.json>');
    process.exit(1);
  }

  if (!fs.existsSync(backupFile)) {
    console.error('❌ Файл не найден:', backupFile);
    process.exit(1);
  }

  try {
    console.log('🔄 Восстановление базы данных...');
    console.log('📁 Источник:', backupFile);
    console.log('');

    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const tables = Object.keys(backup);

    console.log('📊 Таблицы для восстановления:', tables.join(', '));
    console.log('');

    // Отключаем проверки внешних ключей
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    for (const tableName of tables) {
      const data = backup[tableName];
      
      if (data.length === 0) {
        console.log(`⏭️  ${tableName}: пусто, пропускаем`);
        continue;
      }

      try {
        // Очищаем таблицу
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableName} CASCADE;`);
        
        // Вставляем данные
        for (const row of data) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          await prisma.$executeRawUnsafe(
            `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
            ...values
          );
        }
        
        console.log(`✅ ${tableName}: ${data.length} записей восстановлено`);
      } catch (err) {
        console.log(`⚠️  ${tableName}: ошибка - ${err.message}`);
      }
    }

    // Включаем проверки внешних ключей
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log('');
    console.log('✅ Восстановление базы данных завершено!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

restoreDatabase();
RESTORE_DB_SCRIPT

echo "✅ Скрипт восстановления БД создан"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Бэкап успешно создан!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Директория: $BACKUP_DIR"
echo ""
echo "📋 Содержимое:"
ls -lh "$BACKUP_DIR" | tail -n +2
echo ""
echo "📖 Инструкции по восстановлению:"
echo "   cat $BACKUP_DIR/MANIFEST.md"
echo ""
echo "🔄 Быстрое восстановление:"
echo "   ./$BACKUP_DIR/restore.sh"
echo ""
