FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY dist ./dist
COPY prisma ./prisma

RUN npx prisma generate && rm -rf /root/.cache/prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
