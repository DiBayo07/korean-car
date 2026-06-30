# Encar Proxy Backend

NestJS backend — прокси-агрегатор данных с [Encar.com](https://www.encar.com).

## Архитектура

```
src/
├── controllers/     # REST API endpoints
├── services/        # Бизнес-логика
├── parsers/         # Преобразование JSON Encar → наш формат
├── clients/         # HTTP + headless browser клиенты
├── cache/           # Redis-кеширование
├── queue/           # Очередь запросов к Encar
├── utils/           # User-Agent, retry, query builder
└── types/           # TypeScript типы
```

## API

### Поиск

```
GET /api/search?type=car|moto&brand=&model=&priceFrom=&priceTo=&yearFrom=&yearTo=&page=1&limit=20
```

Ответ:

```json
{
  "total": 1234,
  "page": 1,
  "items": [
    {
      "id": "38217645",
      "title": "Hyundai Grandeur",
      "price": 28500000,
      "year": 2022,
      "mileage": 31500,
      "fuel": "Gasoline",
      "transmission": "Automatic",
      "images": ["https://ci.encar.com/..."],
      "source": "encar"
    }
  ]
}
```

### Детали объявления

```
GET /api/item/:id?type=car|moto
```

### Health check

```
GET /api/health
```

## Запуск локально

```bash
cd backend
npm install
npm run start:dev
```

## Docker

```bash
cd backend
docker-compose up --build
```

Backend: `http://localhost:3000`  
Redis: `localhost:6379`

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `REDIS_HOST` | — | Redis host (без него — in-memory кеш) |
| `REDIS_PORT` | 6379 | Redis port |
| `CACHE_SEARCH_TTL_MS` | 900000 | TTL кеша поиска (15 мин) |
| `CACHE_DETAIL_TTL_MS` | 1800000 | TTL кеша деталей (30 мин) |
| `ENCAR_QUEUE_CONCURRENCY` | 8 | Параллельных запросов к Encar |
| `ENCAR_REQUEST_DELAY_MS` | 300 | Задержка между запросами |
| `BROWSER_POOL_SIZE` | 3 | Пул headless страниц |
| `KRW_TO_USD_RATE` | 1350 | Курс для legacy-ответов |
| `CORS_ORIGIN` | * | Разрешённые origins |

## Как это работает

1. Клиент отправляет запрос на `/api/search`
2. Backend проверяет Redis-кеш
3. Если нет в кеше — запрос ставится в очередь
4. Encar JSON API (`api.encar.com`) — основной источник
5. При блокировке (403/429) — fallback через Puppeteer (headless Chromium)
6. Данные парсятся и возвращаются в едином JSON-формате

## Производительность

- API принимает 100+ одновременных запросов
- Очередь ограничивает исходящие запросы к Encar (защита от блокировки)
- Redis кеширует результаты 10–30 минут
- Retry с экспоненциальной задержкой при ошибках
- Ротация User-Agent и сохранение session cookies
