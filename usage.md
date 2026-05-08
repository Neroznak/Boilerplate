# Boilerplate — Инструкция по применлению

## 1. Первый запуск

```bash
pnpm install
```

Запустить dev-окружение:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

После запуска:

- Web: `http://localhost:8080`
- API: `http://localhost:5000`
- Healthcheck: `http://localhost:5000/health`

---

## 2. Обычный запуск проекта

Если зависимости и Docker-образы уже собраны:

```bash
docker-compose -f docker-compose.dev.yml up
```

Если были изменения в Dockerfile, зависимостях или env:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 3. Остановка проекта

```bash
docker-compose -f docker-compose.dev.yml down
```

Остановить и удалить volumes, включая БД:

```bash
docker-compose -f docker-compose.dev.yml down -v
```

Использовать осторожно: данные PostgreSQL будут удалены.

---

## 4. Когда нужен rebuild

Rebuild нужен, если изменилось:

- `Dockerfile`
- `docker-compose.*.yml`
- `package.json`
- `pnpm-lock.yaml`
- зависимости внутри `apps/*` или `packages/*`
- переменные окружения, которые читаются при старте контейнера

Команда:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 5. Когда rebuild НЕ нужен

Rebuild обычно не нужен, если изменился только код:

- NestJS controllers/services/modules
- Next.js страницы/components
- Prisma schema без смены зависимостей
- shared types/utils

Достаточно обычного запуска:

```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 6. Добавление зависимостей

### В API

```bash
pnpm --filter api add <package>
```

Dev-зависимость:

```bash
pnpm --filter api add -D <package>
```

### В Web

```bash
pnpm --filter web add <package>
```

### В shared

```bash
pnpm --filter @repo/shared add <package>
```

### В database

```bash
pnpm --filter @repo/database add <package>
```

После добавления зависимости обычно нужен rebuild Docker-контейнеров.

---

## 7. Работа с env

Все переменные должны проходить через `@repo/config`.

Нельзя использовать напрямую:

```ts
process.env.JWT_SECRET
```

Нужно использовать config-пакет.

После изменения `.env` перезапустить контейнеры:

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

---

## 8. Работа с базой данных

### Генерация Prisma Client

```bash
pnpm --filter @repo/database db:generate
```

### Создание миграции

После изменения `schema.prisma`:

```bash
pnpm --filter @repo/database db:migrate
```

Миграции обязательно коммитить в репозиторий.

### Проверка Prisma schema

```bash
pnpm --filter @repo/database db:validate
```

### Важно

В production не использовать:

```bash
prisma db push
```

Только миграции.

---

## 9. Когда нужно обновлять базу

Обновление БД нужно, если изменилось:

- `schema.prisma`
- модели
- связи
- enum
- индексы
- constraints
- миграции

Порядок:

```bash
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:generate
```

После этого перезапустить API.

---

## 10. Перезапуск отдельных сервисов

Перезапустить только API:

```bash
docker-compose -f docker-compose.dev.yml restart api
```

Перезапустить только Web:

```bash
docker-compose -f docker-compose.dev.yml restart web
```

Перезапустить Redis:

```bash
docker-compose -f docker-compose.dev.yml restart redis
```

Перезапустить PostgreSQL:

```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

---

## 11. Очереди BullMQ

Redis должен быть запущен.

Если менялась логика worker’ов или задач:

```bash
docker-compose -f docker-compose.dev.yml restart api
```

Если менялся Redis config:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 12. Проверка перед коммитом

Перед коммитом желательно выполнить:

```bash
pnpm lint
pnpm test
pnpm build
pnpm --filter @repo/database db:validate
```

---

## 13. Production-запуск

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Обновление production:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 14. Правила разработки

- Env только через `@repo/config`
- БД только через `@repo/database`
- Общие типы — в `@repo/shared`
- Не использовать `any` без причины
- Не коммитить сломанные миграции
- Не мержить, если CI красный
- Docker — источник истины

---

## 15. Типовые сценарии

### Изменил backend-код

```bash
docker-compose -f docker-compose.dev.yml restart api
```

### Изменил frontend-код

Обычно ничего делать не нужно, Next.js обновится сам.

Если не обновилось:

```bash
docker-compose -f docker-compose.dev.yml restart web
```

### Добавил npm-пакет

```bash
pnpm --filter api add <package>
docker-compose -f docker-compose.dev.yml up --build
```

### Изменил Prisma schema

```bash
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:generate
docker-compose -f docker-compose.dev.yml restart api
```

### Изменил `.env`

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Хочу полностью пересоздать окружение

```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

---

## Коротко

```bash
pnpm install
docker-compose -f docker-compose.dev.yml up --build
```

При изменении кода — обычный restart.

При изменении зависимостей, Docker или env — rebuild.

При изменении БД — миграция + generate + restart API.
