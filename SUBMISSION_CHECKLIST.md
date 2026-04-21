# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `local workspace / not set`
- **Ветка**: `[MihichN/single-lab](https://github.com/MihichN/single-lab.git)`
- **Время работы** (приблизительно): `3` часа
- **Время начала работы**: `21.04.2026 18:40`
- **Время окончания работы**: `21.04.2026 21:42` часов

---

## Запуск

```bash
# Команда запуска:
docker compose up -d

# Команда проверки:
curl http://localhost:3001/api/health
# затем открыть http://localhost:3000 и пройти walkthrough из README

# Команда остановки:
docker compose down

```

**Предусловия**: Docker Desktop с `docker compose`, Node.js 22+, Corepack для локальных pnpm-команд, опционально реальный `SENTRY_DSN`.

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ☑ | `apps/frontend/src/app/page.tsx`, `apps/frontend/src/app/layout.tsx` |
| shadcn/ui | ☑ | `apps/frontend/src/components/ui/` |
| Tailwind CSS | ☑ | `apps/frontend/src/app/globals.css` |
| TanStack Query | ☑ | `apps/frontend/src/app/providers.tsx`, `apps/frontend/src/components/scenario-dashboard.tsx` |
| React Hook Form | ☑ | `apps/frontend/src/components/scenario-dashboard.tsx` |
| NestJS | ☑ | `apps/backend/src/` |
| PostgreSQL | ☑ | `docker-compose.yml`, `prisma/schema.prisma` |
| Prisma | ☑ | `prisma/schema.prisma`, `apps/backend/src/prisma/` |
| Sentry | ☑ | `apps/backend/src/main.ts`, `apps/backend/src/common/filters/http-exception.filter.ts`, `apps/backend/src/scenarios/scenarios.service.ts` |
| Prometheus | ☑ | `apps/backend/src/metrics/`, `infra/prometheus/prometheus.yml` |
| Grafana | ☑ | `infra/grafana/` |
| Loki | ☑ | `infra/loki/config.yml`, `infra/promtail/config.yml` |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | В UI на `http://localhost:3000` запустить `success`, `slow_request` или `system_error` | `http://localhost:3001/metrics` |
| Grafana dashboard | После 2-3 запусков сценариев открыть dashboard | `http://localhost:3100` (`http://localhost:3000/grafana` можно использовать как redirect) |
| Loki log | Запустить любой сценарий, затем открыть Grafana Explore на `http://localhost:3100/explore` | Loki query `{app="signal-lab"} | json | __error__=""` |
| Sentry exception | Запустить `system_error` при заполненном `SENTRY_DSN` | В Sentry project dashboard / Issues. Live verification не завершена в текущей среде: `sentry.io` возвращал `403 Forbidden`. |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `signal-lab-observability` | Добавление и проверка метрик, логов, Sentry, Grafana/Loki walkthrough |
| 2 | `signal-lab-nest-endpoint` | Стандартный workflow для NestJS endpoint/DTO/service/Swagger/Prisma |
| 3 | `signal-lab-frontend-runner` | UI runner, RHF, TanStack Query, shadcn-совместимые компоненты |
| 4 | `signal-lab-orchestrator` | PRD orchestration с фазами, `context.json`, resume и report |

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `/add-endpoint` | Добавляет или меняет NestJS endpoint с учётом DTO, Prisma и observability |
| 2 | `/check-obs` | Проверяет observability-ready состояние изменения |
| 3 | `/health-check` | Проверяет готовность репозитория к demo walkthrough |
| 4 | `/run-prd` | Запускает PRD через orchestrator workflow |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `prisma-migration-reminder.mjs` | Напоминает синхронизировать Prisma schema, migration и client generate |
| 2 | `endpoint-observability-reminder.mjs` | Напоминает про Swagger, метрики, логи, Sentry, frontend и docs после правки endpoint |

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `.cursor/rules/stack-constraints.mdc` | Обязательный стек и структура репозитория |
| 2 | `.cursor/rules/frontend-patterns.mdc` | Next.js/TanStack Query/RHF/shadcn правила |
| 3 | `.cursor/rules/backend-observability.mdc` | Метрики, JSON logs, Sentry и стабильные verification paths |
| 4 | `.cursor/rules/prisma-patterns.mdc` | Prisma-only подход, schema + migration sync |
| 5 | `.cursor/rules/error-handling.mdc` | HTTP errors, UI toasts и связность backend/frontend контрактов |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | `next-best-practices` | Современные Next.js App Router практики |
| 2 | `shadcn-ui` | Быстрое развитие консистентных UI primitives |
| 3 | `tailwind-design-system` | Структурированное использование Tailwind utility classes |
| 4 | `nestjs-best-practices` | Стабильная архитектура controller/service/module и API hygiene |
| 5 | `prisma-orm` | Безопасная работа со schema/client/migrations |
| 6 | `docker-expert` | Compose, volumes, containers, troubleshooting |
| 7 | `postgresql-table-design` | Эволюция БД и проектирование таблиц поверх `ScenarioRun` |

**Что закрыли custom skills, чего нет в marketplace:**
- Signal Lab specific walkthrough URLs и acceptance path
- project-specific metric/log naming and scenario semantics
- `teapot` bonus flow
- PRD orchestrator state model with `.execution/*/context.json`

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/example-run/context.json`
- **Сколько фаз**: `7`
- **Какие задачи для fast model**: Prisma/schema changes, DTOs, простые endpoint edits, metric/log additions, UI wiring, focused reviews
- **Поддерживает resume**: да

---

## Скриншоты / видео

- [ https://prnt.sc/TeY32BA0DPQO ] UI приложения
- [ https://prnt.sc/TScV95bbFTIe ] Grafana dashboard с данными
- [ https://prnt.sc/Y5_Ct4dz79U8 ] Loki logs
- [ ] Sentry error

(Приложи файлы или ссылки ниже)

---

## Что не успел и что сделал бы первым при +4 часах

- Полный walkthrough для UI, Prometheus, Grafana и Loki уже проверен. Не завершена только live-проверка Sentry, потому что `sentry.io` в текущей среде возвращал `403 Forbidden`.
- При доступном Sentry первым делом подключил бы реальный `SENTRY_DSN`, повторно запустил `system_error` и приложил скриншот captured exception.
- Добавил бы smoke/e2e-проверки поверх health и scenario API.

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил, а какие заменил custom — и почему?
4. Какие hooks реально снижают ошибки в повседневной работе?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?
