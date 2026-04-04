FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY .next ./.next
COPY public ./public
COPY next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]
