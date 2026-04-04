-- Обновление поля permissions в таблице collaborators
-- Меняем тип с TEXT на JSONB для гранулярных прав доступа

-- Сначала добавляем новое поле
ALTER TABLE "collaborators" ADD COLUMN IF NOT EXISTS "permissions_new" JSONB;

-- Копируем данные из старого поля (конвертируем "edit"/"view" в JSON)
-- Используем CASE для конвертации строковых значений в JSON
UPDATE "collaborators" 
SET "permissions_new" = 
  CASE 
    WHEN "permissions"::text = 'edit' THEN '{"basicInfo":true,"biography":true,"gallery":true,"memories":true,"timeline":true,"tributes":true,"burialLocation":true}'::jsonb
    WHEN "permissions"::text = 'view' THEN '{"basicInfo":false,"biography":false,"gallery":false,"memories":false,"timeline":false,"tributes":false,"burialLocation":false}'::jsonb
    ELSE '{"basicInfo":true,"biography":true,"gallery":true,"memories":true,"timeline":true,"tributes":true,"burialLocation":true}'::jsonb
  END;

-- Удаляем старое поле
ALTER TABLE "collaborators" DROP COLUMN "permissions";

-- Переименовываем новое поле
ALTER TABLE "collaborators" RENAME COLUMN "permissions_new" TO "permissions";

-- Устанавливаем NOT NULL и default
ALTER TABLE "collaborators" ALTER COLUMN "permissions" SET NOT NULL;
ALTER TABLE "collaborators" ALTER COLUMN "permissions" SET DEFAULT '{"basicInfo":true,"biography":true,"gallery":true,"memories":true,"timeline":true,"tributes":true,"burialLocation":true}'::jsonb;
