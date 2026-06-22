FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate:prod && npm start"]
