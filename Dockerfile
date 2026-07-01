# ========== Стадия сборки ==========
FROM node:20-slim AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

# 1. Копируем package.json (из папки backend)
COPY backend/package*.json ./

# 2. Устанавливаем ВСЕ зависимости (включая dev)
RUN npm ci

# 3. Копируем исходный код (backend/ -> /app/)
COPY backend/ ./

# 4. Собираем проект (результат в /app/dist/)
RUN npm run build

# ========== Финальный образ ==========
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Устанавливаем Chromium (нужен Puppeteer'у на Encar)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 5. Копируем собранные артефакты из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Удаляем devDependencies из финального образа (TypeScript, @nestjs/cli и т.д.)
RUN npm prune --omit=dev

EXPOSE 3000

# 6. Запуск
CMD ["node", "dist/main.js"]
