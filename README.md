# Signal Lab

Signal Lab is a small observability playground built for the assignment in `ASSIGNMENT.md`. It lets a reviewer trigger synthetic backend scenarios from a Next.js UI and inspect the resulting data in PostgreSQL, Prometheus, Grafana, Loki, and Sentry.

## Stack

- Frontend: Next.js App Router, Tailwind CSS, shadcn-style UI primitives, TanStack Query, React Hook Form
- Backend: NestJS
- Data: PostgreSQL 16, Prisma
- Observability: Prometheus, Grafana, Loki, Promtail, Sentry-ready integration
- Infra: Docker Compose

## Repository Layout

```text
apps/
  backend/
  frontend/
prisma/
infra/
.cursor/
.execution/
```

## Prerequisites

- Docker Desktop with `docker compose`
- Node.js 22+
- Corepack enabled if you want to run the workspace locally without Docker
- Optional: a real `SENTRY_DSN` if you want end-to-end Sentry verification instead of placeholder configuration

## Environment

1. Copy `.env.example` to `.env`.
2. Adjust `SENTRY_DSN` if you have a real project.
3. Keep `DOCKER_DATABASE_URL` pointing to the `postgres` container for Compose runs.

## Run

```bash
docker compose up -d
```

This starts:

- frontend at `http://localhost:3000`
- backend at `http://localhost:3001`
- Swagger at `http://localhost:3001/api/docs`
- metrics at `http://localhost:3001/metrics`
- Grafana at `http://localhost:3100`
- convenience redirect to Grafana at `http://localhost:3000/grafana`
- Prometheus at `http://localhost:9090`
- PostgreSQL at `localhost:5432`

## Verification Walkthrough

1. Open `http://localhost:3000`.
2. Trigger `success` and verify a green `completed` badge appears in the history.
3. Trigger `system_error` and verify a red `failed` badge and an error toast appear.
4. Open `http://localhost:3001/metrics` and check:
   - `scenario_runs_total`
   - `scenario_run_duration_seconds`
   - `http_requests_total`
5. Open `http://localhost:3100` and inspect the **Signal Lab Overview** dashboard. `http://localhost:3000/grafana` can be used as a redirect entrypoint if needed.
6. In Grafana Explore, query Loki with:

```text
{app="signal-lab"}
```

7. If `SENTRY_DSN` is configured and `sentry.io` is reachable from your environment, confirm the `system_error` scenario appears as a captured exception in Sentry.

## Scenario Types

- `success`: completes normally, records metrics, and writes an info log
- `validation_error`: returns `400`, records a failed run, and writes a warn log
- `system_error`: returns `500`, records a failed run, writes an error log, and captures Sentry
- `slow_request`: sleeps 2-5 seconds to create a latency spike
- `teapot`: bonus path returning `418` with `signal: 42`

## Local Non-Docker Validation

These commands were used to validate the code structure:

```bash
corepack pnpm install --no-frozen-lockfile
corepack pnpm --filter backend prisma:generate
corepack pnpm --filter backend lint
corepack pnpm --filter backend build
corepack pnpm --filter frontend lint
corepack pnpm --filter frontend build
```

## Stop

```bash
docker compose down
```

To remove persistent volumes too:

```bash
docker compose down -v
```

## AI Layer

The repository includes a project-level Cursor AI layer:

- rules in `.cursor/rules/`
- custom skills in `.cursor/skills/`
- reusable commands in `.cursor/commands/`
- hooks in `.cursor/hooks.json`
- orchestrator runtime examples in `.execution/`

See `AI_LAYER.md` for the detailed explanation of why each artifact exists and when to use it.
