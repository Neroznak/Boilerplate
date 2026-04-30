# 🚀 Boilerplate (Fullstack, Production-ready)

Production-ready boilerplate для fullstack-приложений на базе:

- **NestJS** (API)  
- **Next.js** (Web)  
- **PostgreSQL + Prisma**  
- **Redis + BullMQ**  
- **Docker-first подход**  
- **pnpm monorepo**

**Главная цель** — быстро стартовать новый проект без компромиссов по качеству архитектуры.

---

## 📐 Архитектура
```bash

apps/
  api/        → NestJS backend
  web/        → Next.js frontend

packages/
  database/   → Prisma + DB layer
  config/     → env + validation (zod)
  shared/     → общие типы / утилиты
```



## ⚙️ Основные принципы

### 1. Monorepo (pnpm workspace)

- единая типизация между frontend и backend  
- переиспользуемые пакеты (`shared`, `config`, `database`)  
- отсутствие дублирования логики  

---

### 2. Жёсткий config через Zod

```ts
const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
});
```
**Почему:**

- fail-fast при запуске  
- никаких “undefined в проде”  
- типобезопасный доступ к env  

---

### 3. Database layer как пакет
```
`@repo/database`
```
- Prisma client инкапсулирован  
- используется как dependency в API  
- единая точка работы с БД  

**Почему:**

- изоляция инфраструктуры  
- проще тестировать  
- проще менять ORM  

---

### 4. Docker-first

Dev и Prod одинаковы по среде:

- Postgres  
- Redis  
- API  
- Web  

**Почему:**

- нет “у меня работает”  
- предсказуемый runtime  
- быстрый onboarding  

---

### 5. Очереди (BullMQ)

- Redis как брокер  
- фоновые задачи через worker  

**Почему:**

- не блокируем API  
- готовность к масштабированию  

---

### 6. Observability (минимально необходимое)

- structured logs (**nestjs-pino**)  
- request id  
- healthcheck `/health`  
- Sentry (ошибки)  

---

## 🧪 CI/CD

### GitHub Actions pipeline

- Lint  
- Prisma generate  
- Prisma validate  
- Build  
- Tests  
- Docker build  
- Docker push (Docker Hub)  

**Почему:**

- гарантируется работоспособность  
- база не ломается  
- Docker image всегда валиден  

---

## 🐳 Запуск (Dev)

```bash
docker-compose -f docker-compose.dev.yml up --build
```
**Доступ:**

- Web: http://localhost:8080  
- API: http://localhost:5000  

---

🏗 **Production (концепция)**

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```
CI уже пушит образы в Docker Hub:

- `neroznakdn/boilerplate-api`  
- `neroznakdn/boilerplate-web`  

🗄 **Работа с базой**

**Генерация клиента**
```
pnpm --filter @repo/database db:generate
```
### Миграции

```bash
pnpm --filter @repo/database db:migrate
```
### Новая схема

1. меняешь `schema.prisma`  
2. создаёшь миграцию  
3. коммитишь  

**Важно:**

- миграции всегда в репозитории  
- никаких `db push` в проде  

---

➕ **Добавление зависимостей**

**В API**

```bash
pnpm --filter api add <package>
```

**В Web**

```bash
pnpm --filter web add <package>
```
**В shared пакет**

```bash
pnpm --filter @repo/shared add <package>
```
**Почему так:**

- контроль зависимостей  
- нет “засорения” всего репозитория  

🔐 **Auth**

- JWT access token  
- refresh token через cookies  
- роли (RBAC)  
- guards  

⚙️ **Основные правила**

1. **Никаких `any` без причины**  
   Типизация — часть архитектуры  

2. **Любой env → через config**  
   Не используем `process.env` напрямую  

3. **Любая внешняя система изолирована**  
   - DB → `@repo/database`  
   - config → `@repo/config`  

4. **Docker — источник истины**  
   Если не работает в Docker — значит не работает  

5. **CI должен быть зелёным всегда**  
   Нельзя мержить сломанный pipeline  

📦 **Что уже есть**

- auth система  
- очереди  
- Redis  
- PostgreSQL  
- Prisma  
- CI/CD  
- Docker  
- базовая observability  

❗ **Что намеренно НЕ сделано**

- нет конкретного deploy (VPS / cloud)  
- нет бизнес-логики  
- нет UI-фреймворков  

**Почему:**  
boilerplate должен оставаться универсальным  

🧠 **Итог**

Это не “стартер”, а основа под production-проекты:

- масштабируемая архитектура  
- предсказуемая инфраструктура  
- минимальные компромиссы  
