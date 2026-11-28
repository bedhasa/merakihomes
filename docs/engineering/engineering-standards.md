# Engineering Standards

| | |
|---|---|
| **Status** | Adopted for all new and changed code (2026-11-25). Existing code is brought into line as it is touched, following the [refactoring roadmap](../architecture/refactoring-roadmap.md). |
| **Architecture** | [target-architecture.md](../architecture/target-architecture.md), ADRs in [architecture-decision-records/](../architecture/architecture-decision-records/) |

Rules marked **(tooling pending)** become automated once ADR-0006 (ESLint, Prettier, CI) lands. Until then they are enforced in review.

---

## 1. General principles

1. **Readable over clever.** One statement per line. Name intermediate values. No minified-style code.
2. **Small units.** Functions above roughly 40 lines, or nesting deeper than 3 levels, need a reason. Files above roughly 300 lines should be split by responsibility.
3. **Business rules live in one place.** Before writing a rule (a status transition, a price, eligibility, validation), search for an existing one. If there are two, merge them; do not add a third.
4. **No behaviour changes inside refactors.** A refactor PR keeps behaviour identical and the tests unchanged. Behaviour changes go in their own PR with their own tests.
5. **Leave it better.** When you touch a file, fix the formatting and the obvious local debt in that file (separate commit if large).

## 2. Naming

| Thing | Convention | Example |
|---|---|---|
| Files (TS modules) | kebab-case or `<module>.<layer>.ts` in the backend | `bookings.service.ts`, `lifecycle.domain.ts` |
| React components | PascalCase file and export | `RequestFlow.tsx` |
| Hooks | `useX` | `useApiErrorMessage` |
| Functions | verbs | `findEligibleWorkers`, `proposeReschedule` |
| Booleans | `is/has/can/should` | `isDemo`, `hasSchedule` |
| Constants | `UPPER_SNAKE` for true constants, collected per module | `MAX_ITEMS_PER_BOOKING = 8` |
| DB tables and columns | snake_case, plural tables | `booking_items.item_status` |
| JSON over the wire | camelCase | `requestedStart` |
| Error codes | `UPPER_SNAKE`, namespaced by domain | `BOOKING_SERVICE_UNAVAILABLE` |
| Permissions | `resource.action` | `bookings.manage` |

Use the domain vocabulary consistently: **booking** (customer request), **item** (one service line in a booking), **assignment** (worker ↔ item), **reservation** (time hold), **proposal** (staff change awaiting customer approval), **professional** (worker in their own app).

## 3. File organization and module boundaries

The layout is in [proposed-repository-structure.md](../architecture/proposed-repository-structure.md). The rules are:

- **Backend:** `routes` → `service` → `domain` / `repository`. Only `routes` touches `req`/`res`. Only `repository` writes SQL. `domain` does no I/O.
- **Cross-module imports** go through `modules/<name>/index.ts` only. **(tooling pending)**
- **Clients never import from `backend/`.** Shared wire types come from `shared/contracts`.
- **`shared/`** contains no server code, no React components and no mock data.
- **Tests** sit next to the code they test (`*.test.ts` or `__tests__/`). The backend integration harness lives in `backend/test/`.

## 4. Functions, classes and dependency injection

- Prefer **plain functions and modules** over classes. Use a class only when it holds state or implements a port with several adapters.
- **Explicit dependencies:** pass collaborators in as parameters (`createApp({pool, storage, clock})`, `findBooking(q, input)`). No service locators. No module-level singletons except configuration and the logger.
- **Pass time in:** domain functions take `now: Date` instead of calling `Date.now()`, so they can be tested deterministically.
- Pass a parameter object once a function needs more than 3 parameters.

## 5. Types and interfaces

- TypeScript `strict: true` for all new code. Backend migration follows ADR-0002.
- **No `any`.** Use `unknown` plus narrowing at the boundaries. `as` casts need a comment explaining why they are safe.
- Wire types are **inferred from `shared/contracts` schemas** (ADR-0003). Do not hand-write duplicates.
- Model states as string-literal unions shared with the DB CHECK constraints (`type ItemStatus = 'pending' | 'pending_confirmation' | …`).
- Money is handled in **integer minor units (cents)** in code; the DB stores `NUMERIC(12,2)`. Never use floating-point arithmetic on money.

## 6. Validation

- **Validate every input at the edge:** body, query, params and headers you use. Use the shared schema through `validate(schema)` middleware. Services receive typed input.
- Path-parameter UUIDs are validated before querying (malformed → 400).
- **Validate on the server even when the client validates.** Client validation is UX, not security.
- Clamp sizes: string lengths, array lengths, body size per route.
- Never trust client-supplied prices, totals, statuses or identities. Recompute them on the server. The current booking flow does this; keep it that way.

## 7. Error handling

- Services throw **typed errors** (`ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `DependencyError`). The single error middleware maps them to HTTP. **(tooling pending: `platform/http/errors`)** Until that exists, use `apiError(res, status, message, fields, code)` and always pass a `code`.
- Error response shape (stable contract):
  ```json
  { "error": { "message": "Localized, customer-safe text", "code": "BOOKING_SERVICE_UNAVAILABLE", "fields": { "phone": "phoneInvalid" } } }
  ```
- Status codes:

  | Code | Meaning |
  |---|---|
  | 400 | Validation |
  | 401 | Not signed in |
  | 403 | No permission |
  | 404 | Not found **or not owned** (do not reveal existence) |
  | 409 | Conflict or stale state |
  | 422 | Idempotency key reused with a different payload |
  | 429 | Rate limited |
  | 502/503/504 | Dependency failure |

- **Never leak internals:** no stack traces, SQL or provider messages in responses.
- PostgreSQL error codes are mapped centrally: 22P02 → 400, 23505/23P01 → 409, 23503/23514 → 400.
- Every `ROLLBACK` is guarded (`.catch(() => {})`) so that it cannot mask the original error. Use `withTransaction` once it exists.
- Clients map `error.code` to localized text (`useApiErrorMessage`). The server `message` is only a fallback.

## 8. Database access

- **Parameterized SQL only.** Never interpolate user input. Interpolating constant SQL fragments is allowed only from code-defined constants.
- **Transactions:** opened by services through a **checked-out client** (`pool.connect()`) or `withTransaction`. **Never** run `pool.query('BEGIN')`, because the pool may send each statement to a different connection.
- Lock what you check: use `SELECT … FOR UPDATE` (or an advisory lock) when a decision depends on rows another request could change concurrently.
- Audit rows are written **in the same transaction** as the change they describe.
- **Migrations:**
  - Forward-only, never edited after being applied, one concern per file.
  - Constraints added to populated tables use `NOT VALID` followed by `VALIDATE CONSTRAINT`.
  - Every status column gets a CHECK constraint. Every reference column gets an FK. Every FK or filter column used in hot queries gets an index.
  - Expand → migrate → contract for renames and removals, so old code keeps running during deploys.
  - Scripts never apply migrations implicitly. Production migrations are a manual, reviewed step.
- Never run destructive commands (`DROP`, `TRUNCATE`, unscoped `DELETE`) against shared or production databases from scripts or tests.

## 9. API design

- Resource-oriented paths; plural nouns; actions as sub-resources (`POST /bookings/:id/reschedule-proposals`).
- camelCase JSON. ISO-8601 UTC timestamps. Money as `{ amount: number, currency: 'ETB' }`, where `amount` is in major units on the wire.
- Lists: `?limit=` (default 50, max 200) and cursor or `?before=` pagination for anything that can grow.
- Mutating endpoints that can be retried by clients accept `Idempotency-Key`. The key is scoped to the resource and stored with a request hash.
- **Backward compatibility:** do not remove or rename fields used by the mobile app without an additive transition period (old and new fields side by side for at least one mobile release cycle).

## 10. Security

- **AuthN:** cookie for web and management (HttpOnly, SameSite=Lax, Secure in production); bearer token for mobile (SecureStore). No tokens in `localStorage`.
- **AuthZ:** a route-level permission check **plus** a resource-level ownership check in the service. Every customer query is scoped by `customer_id`; every professional query by an active assignment.
- **Secrets** come only from the environment. Never prefix a secret with `NEXT_PUBLIC_` or `EXPO_PUBLIC_`. Never put one in mobile `extra`. Never commit `.env*` files (except `.env.example`), and never paste real values into docs or tests.
- **PII:** do not log names, phones, emails, addresses, coordinates, tokens or assistant message content. Store actor ids in audit rows, not names or emails. Public endpoints never expose exact coordinates or another party's contact details.
- **Uploads:** authenticate before reading the body; enforce type and size; generate server-side file names.
- **Rate limits** on every unauthenticated endpoint and every login.
- **Outbound calls** always have a timeout.

## 11. Logging and observability

- One structured logger (JSON). Required fields: `level`, `event`, `requestId`, and `route`/`status`/`durationMs` for request logs. **(tooling pending: `platform/logging`)**
- Log **events**, not prose: `{"event":"booking.created","bookingId":…}`.
- Levels:

  | Level | Use |
  |---|---|
  | `error` | Needs attention |
  | `warn` | Degraded but handled (for example a provider fallback) |
  | `info` | Business events and lifecycle |
  | `debug` | Development only |

- `agaz-gemini.mjs` already follows this pattern; use it as the reference.

## 12. Comments and documentation

- Comments explain **why** (constraints, trade-offs, non-obvious invariants), not what the code does.
- Public module APIs (`index.ts`) get a short doc comment per export.
- Every significant architectural decision gets an ADR. Every confirmed defect or debt item goes in the technical-debt register with evidence.
- Every new environment variable is added to `.env.example` with a comment, and to the README table.

## 13. Testing

| Level | What | Where | Notes |
|---|---|---|---|
| Unit | Pure domain functions | Next to the code | Fast and deterministic (inject `now`) |
| API integration | Route → service → SQL | `backend/*.test.mjs` (PGlite harness) | Primary safety net; assert status codes, bodies **and** persisted rows |
| Real PostgreSQL | Migrations, exclusion constraints, concurrency | CI job with Postgres 16 | Covers what PGlite skips (`btree_gist`) |
| Component | Booking wizard, approvals | Vitest + Testing Library (proposed) | Test behaviour through the UI, not internal state |
| E2E | Critical journeys | Playwright (proposed) | Few, stable, high value |

Rules:
- **Every bug fix ships with a regression test that fails without the fix.** Example: `backend/hardening.test.mjs`, verified against a reverted copy on 2026-11-25.
- Never delete or weaken an existing assertion to make a change pass. If behaviour changes intentionally, update the test in the same PR and explain why.
- Write characterization tests **before** restructuring code without good coverage.
- Test priorities: authentication and authorization, money and payments, booking lifecycle, idempotency, data integrity, privacy.
- Tests must not touch real external services or shared databases. Live checks (`db:smoke`, live Geoapify) are opt-in and clearly labeled.

## 14. Code quality automation (ADR-0006)

| Tool | Command | Status |
|---|---|---|
| TypeScript | `npm run lint` (root), `npm --prefix meraki-homes-mobile run typecheck` | Active |
| Locale parity | `npm run i18n:check` (part of `npm test`) | Active |
| Tests | `npm test` | Active |
| Prettier | `npm run format:check` (fix with `npm run format`) | Active (not yet enforced by CI) |
| ESLint (+ boundaries, react-hooks, import/no-cycle) | `npm run lint` | Proposed |
| Dependency audit | `npm audit --audit-level=high` | Proposed in CI |
| CI | `.github/workflows/ci.yml` on Node 22 | Proposed (`ci.yml.proposed` exists) |

**Pre-merge checklist** (until CI enforces it): `npm run lint`, `npm test`, `npm run build`, mobile typecheck if mobile or `shared/` changed, and a review of `git diff` for secrets and unrelated changes.

## 15. Git and review

- Branch from `main`; use short-lived branches named `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `chore/…`.
- Commits are logically grouped and use imperative subject lines (`fix: store booking id in reschedule audit entries`). Formatting-only commits stay separate.
- PRs state what changed, why, how it was verified, and any migration or approval needs. Changes marked 🔒 in the roadmap need explicit approval before merge.
