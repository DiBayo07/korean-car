# Сборка (builder)
FROM node:20-slim AS builder

WORKDIR /app

# 1. Копируем package.json ИЗ ПАПКИ backend
COPY backend/package*.json ./

ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci

# 2. Копируем ВЕСЬ код из папки backend
COPY backend/ ./

# 3. Запускаем сборку (она создаст папку /app/dist)
RUN npm run build

# --- Финальный образ ---
FROM node:20-slim

WORKDIR /app

# Установка Chromium (как у вас было)
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

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Копируем package.json для продакшн-зависимостей (ОПЯТЬ ИЗ ПАПКИ backend)
COPY backend/package*.json ./

# 5. Устанавливаем только продакшн-зависимости
RUN npm ci --omit=dev

# 6. Копируем СОБРАННУЮ папку dist из стадии builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 7. Запускаем собранный файл
CMD ["node", "dist/main.js"]