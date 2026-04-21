# Signal Lab AI Layer

## Rules

| Rule file | Purpose |
| --- | --- |
| `.cursor/rules/stack-constraints.mdc` | Locks the mandatory stack and expected repo structure. |
| `.cursor/rules/frontend-patterns.mdc` | Keeps frontend work on Next.js App Router, TanStack Query, RHF, and shadcn-style primitives. |
| `.cursor/rules/backend-observability.mdc` | Forces metrics/logs/Sentry thinking for backend changes. |
| `.cursor/rules/prisma-patterns.mdc` | Keeps Prisma schema and migrations consistent. |
| `.cursor/rules/error-handling.mdc` | Aligns backend/frontend error behavior and reviewer-facing messages. |

## Custom Skills

| Skill | When to use |
| --- | --- |
| `signal-lab-observability` | Add or review metrics, logs, Sentry, Grafana, Loki, and walkthrough readiness. |
| `signal-lab-nest-endpoint` | Build or change NestJS endpoints, DTOs, services, Swagger, and Prisma-backed flows. |
| `signal-lab-frontend-runner` | Build or refine the scenario runner UI, form, history, and observability links. |
| `signal-lab-orchestrator` | Run PRDs through phased execution with `context.json`, resume, and fast/default task routing. |

## Commands

| Command | Purpose |
| --- | --- |
| `/add-endpoint` | Standard workflow for adding or extending a NestJS endpoint. |
| `/check-obs` | Review whether a change is observability-ready. |
| `/health-check` | Check whether the repo is ready for the demo walkthrough. |
| `/run-prd` | Execute a PRD through the orchestrator flow. |

## Hooks

| Hook | Trigger | Problem solved |
| --- | --- | --- |
| `.cursor/hooks/prisma-migration-reminder.mjs` | `postToolUse` after file edits | Reminds the agent to keep Prisma schema, migration, and generated client in sync. |
| `.cursor/hooks/endpoint-observability-reminder.mjs` | `postToolUse` after file edits | Reminds the agent that endpoint changes also need metrics, logs, Sentry, frontend, and docs alignment. |

## Marketplace Skills

Enable these marketplace skills for new chats in this repo:

| Skill | Why it belongs here |
| --- | --- |
| `next-best-practices` | Reinforces App Router and modern Next patterns. |
| `shadcn-ui` | Speeds up consistent UI component work. |
| `tailwind-design-system` | Helps keep Tailwind utility usage coherent and reusable. |
| `nestjs-best-practices` | Supports module/controller/service structure and API hygiene. |
| `prisma-orm` | Covers schema/client workflows and safe Prisma usage. |
| `docker-expert` | Helps troubleshoot compose and container workflows. |
| `postgresql-table-design` | Useful for schema evolution beyond the initial `ScenarioRun` model. |

## Why custom skills still matter

Marketplace skills know the generic tools. The custom Signal Lab skills capture project-specific behavior that marketplace skills do not know by default:

- exact verification URLs and walkthrough expectations
- required metric names and logging fields
- Signal Lab scenario semantics, including `teapot`
- the repo’s PRD-driven orchestrator workflow and `.execution` state format

## Orchestrator

- Skill path: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- Coordination prompts: `.cursor/skills/signal-lab-orchestrator/COORDINATION.md`
- Template state file: `.cursor/skills/signal-lab-orchestrator/context.template.json`
- Example resume state: `.execution/example-run/context.json`
