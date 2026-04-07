FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники
COPY . .

# Собираем проект
RUN npm run build

# Production образ
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Копируем package.json и устанавливаем только production зависимости
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Копируем собранный проект из builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]
