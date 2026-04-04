#!/bin/bash

# Скрипт для генерации PWA иконок
# Требует ImageMagick: brew install imagemagick

echo "🎨 Генерация PWA иконок..."

# Проверка наличия ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick не установлен"
    echo "Установите: brew install imagemagick"
    exit 1
fi

# Создание базовой иконки (если нет исходника)
if [ ! -f "frontend/public/icon-source.png" ]; then
    echo "📝 Создание базовой иконки..."
    convert -size 512x512 xc:#000000 \
        -gravity center \
        -pointsize 200 \
        -fill white \
        -annotate +0+0 "П" \
        frontend/public/icon-source.png
fi

# Генерация иконок разных размеров
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
    echo "  Создание icon-${size}x${size}.png..."
    convert frontend/public/icon-source.png \
        -resize ${size}x${size} \
        frontend/public/icon-${size}x${size}.png
done

# Создание favicon
echo "  Создание favicon.ico..."
convert frontend/public/icon-192x192.png \
    -resize 32x32 \
    frontend/public/favicon.ico

echo "✅ Иконки созданы!"
echo ""
echo "⚠️  Замените icon-source.png на ваш логотип и запустите скрипт снова"
