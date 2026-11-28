# 0001. Modular monolith with layered modules for the API

- Status: Proposed
- Date: 2026-11-25

## Context

`backend/index.mjs` contains about 775 lines inside one `createApp` closure. It holds 83 routes plus infrastructure (pool, migrator, crypto, CORS, rate limiting) and business rules. Many lines exceed 2,000 characters. `backend/professionals.mjs` adds 12 more routes and receives its dependencies as a 14-key object (`index.mjs:886`).

Consequences we observed (see the [technical-debt register](../technical-debt-register.md)):

- Booking creation is implemented twice and the two copies diverge (TD-032).
- There are two lifecycle state machines (TD-033) and two copies of the availability SQL (TD-034), and only one of those copies handles a midnight boundary (TD-007).
- Audit parameters were swapped in two places without anyone noticing (TD-001).
- None of the business rules can be unit-tested without HTTP and SQL.

The system has one PostgreSQL database whose integrity relies on cross-table transactions: advisory locks for assignment, exclusion constraints on reservations, and composite FKs. The team is small.

## Decision

Keep one deployable Express API and restructure it into **domain modules** under `backend/src/modules/<module>/`. The modules are catalogue, customers, bookings, workforce, professionals, payments, staff, content, assistant, location and audit. Shared infrastructure lives in `backend/src/platform/`.

Inside each module:

- `*.routes.ts`: HTTP only.
- `*.service.ts`: use cases, transaction boundaries, resource authorization.
- `*.domain.ts`: pure business rules.
- `*.repository.ts`: SQL only.
- `*.adapter.ts`: external APIs only.
- `index.ts`: the module's public API.

Modules call each other only through `index.ts`. The [target architecture](../target-architecture.md) §3–5 defines the dependency rules, which ESLint enforces (ADR-0006).

Migration is incremental and route-preserving. For each module:

1. Write characterization tests for its routes.
2. Move the handlers verbatim into `*.routes` and register them from `createApp`.
3. Extract the SQL into a repository and the rules into a domain file.
4. Run the full test suite after each step.

`createApp({pool})` keeps its signature, so the existing tests keep working unchanged.

## Alternatives considered

- **Technical layering only** (`routes/`, `services/`, `repositories/` at the top level). Rejected: booking logic would still be spread across global folders, and no module would own its tables.
- **Full Clean/Hexagonal with repository interfaces and in-memory fakes.** Rejected: the PGlite integration tests already exercise real SQL quickly, so interfaces over SQL would add ceremony without adding test value. Ports are used only for external services and storage.
- **Microservices.** Rejected: they would break the cross-table transactions, multiply operational cost and exceed the team's capacity.
- **A different framework (NestJS, Fastify).** Rejected for now: Express is not the problem, and a framework migration would combine two risky changes at once.

## Consequences

- Business rules become unit-testable, and duplicate implementations become visible and can be merged.
- Files become reviewable, and merge conflicts concentrate in one module instead of one file.
- Boundaries rely on lint rules and review, not on process isolation.
- There is a transition period where some routes live in modules and others in `index.mjs`.
- Because the user's in-progress i18n changes touch `backend/index.mjs`, module extraction must start **after** that branch is committed, to avoid entangling the two changes.
