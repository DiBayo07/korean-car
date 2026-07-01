# ========== Стадия сборки ==========
FROM node:20-slim AS builder

WORKDIR /app

# Python и build-essential нужны для сборки native-модуля better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3
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

# Устанавливаем Chromium и зависимости для better-sqlite3
RUN apt-get update && apt-get install -y \
    chromium \
    python3 \
    build-essential \
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

ENV PYTHON=/usr/bin/python3
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 5. Создаём папку для SQLite БД
RUN mkdir -p /app/data

# 6. Копируем собранные артефакты из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data
COPY --from=builder /app/dist ./dist

# 7. Пересобираем better-sqlite3 под целевую архитектуру (нужно после копирования node_modules)
RUN npm rebuild better-sqlite3

# Удаляем devDependencies из финального образа
RUN npm prune --omit=dev

EXPOSE 3000

# 8. Запуск
CMD ["node", "dist/main.js"]
