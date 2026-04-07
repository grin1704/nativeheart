FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

RUN npx prisma generate && rm -rf /root/.cache/prisma

# Remove dev dependencies after build
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
