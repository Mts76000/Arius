FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 8081

CMD ["pnpm", "exec", "expo", "start", "--web", "--port", "8081"]
