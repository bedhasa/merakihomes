# Refactoring Roadmap

| | |
|---|---|
| **Date** | 2026-11-25 |
| **Inputs** | [technical-debt-register.md](technical-debt-register.md) (TD-xxx), [target-architecture.md](target-architecture.md), ADRs |
| **Baseline** | `tsc` root ✅ · `tsc` mobile ✅ · `npm test` 46 pass / 0 fail / 1 skip · `npm run build` ✅ |

## Working rules

- **Small, separately reviewable changes.** Each task leaves the suite green and the build passing.
- **Characterization tests come before any risky restructuring.** Every bug fix gets a regression test.
- **The in-progress i18n work on `Add-multi-language` is preserved.** Restructuring that touches the same files (`backend/index.mjs` module extraction, frontend routing, Prettier) waits until that branch is committed or merged.
- **Approval gates.** Tasks marked 🔒 change business behaviour, a public API, the schema, security behaviour or the operator workflow. They wait for explicit approval.

**Legend:**

| Mark | Meaning |
|---|---|
| ✅ | Done in this pass |
| 🔒 | Needs approval |
| ⏳ | Blocked by the i18n branch merge |
| ▫️ | Not started |

**Risk** describes the chance of a regression or of an operational effect.

---

## Decision log (2026-11-27)

The project owner made these decisions. They supersede the 🔒 markers on the matching rows below.

| Topic | Decision | Roadmap / TD |
|---|---|---|
| Production build | **Done:** catch-all page set to `force-dynamic`. Every page returned 500 under `next start` before this. | — |
| Hero WebM | Re-encode VP9 at a higher CRF (about 38) so the WebM is smaller than the MP4. | — |
| Client IP for rate limits | **Approved:** the website proxy passes the visitor IP in a header signed with a shared secret; the API trusts Railway's single hop for direct (mobile) traffic. **First step:** temporary header logging, deployed once to confirm Railway's forwarding headers. | 1.11, 6.6 / TD-010 |
| Booking lookup | **Approved:** reference + phone only. Phone-only lookup is removed, and receipts no longer include the customer's name or phone. | 1.12 / TD-011 |
| Demo payments | **Approved:** `DEMO_PAYMENTS_ENABLED`, off by default in production. The live site shows "our team will confirm payment with you" instead. | 1.12 / TD-011 |
| Professional location | **Approved:** public endpoints return coordinates rounded to about 100 m plus distance. Exact location stays limited to consented booking sharing. | 1.13 / TD-012 |
| Item cancellation | **Approved:** cancelling an item also cancels its active worker assignments. | 1.14 / TD-002 |
| Price quotes | **Approved:** a new quote withdraws earlier open quotes for that item. | 1.15 / TD-003 |
| Displayed prices | **Approved:** show "From ETB X" from the lowest active package; "Price after review" when there is none. Remove the hard-coded demo table and the ×120 conversion. | 4.10 / TD-030 |
| Migrations | **Approved:** location-sharing index per (booking, worker) (1.16 / TD-006). **Not now:** integrity CHECKs (4.2, 4.3), performance indexes (4.4), audit-row repair. | |
| Tooling | **Approved:** Prettier, as one formatting-only commit. **Not now:** ESLint (2.5), CI (5.2), zod contracts (2.6). | 2.2 |
| Amharic gaps | **Approved:** move the remaining text into the catalogs with Amharic drafts, marked for native-speaker review before launch. | TD-049 |

---

## Phase 1: Critical security and reliability issues

| # | Task | Objective | Files | Expected outcome | Depends on | Risk | Validation | Status |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Fix swapped audit parameters (TD-001) | Correct audit trail | `backend/index.mjs:469`, `:602` | `entity_id` holds the booking id; events appear in the activity feed | — | Low | Regression test asserting `entity_id`/`reason` | ✅ |
| 1.2 | Verified demo-payment replay (TD-004) | Make the idempotent retry return the stored receipt | `index.mjs:392` | Same key → 200 with the original receipt | — | Low | Regression test: double POST with the same key | ✅ |
| 1.3 | Map PG 22P02 → 400 and 23505 → 409 (TD-009) | Stop 500s for client errors | `index.mjs` error handler | Malformed ids → 400; duplicates → 409 | — | Low | Regression tests | ✅ |
| 1.4 | Midnight wrap in availability (TD-007) | Prevent false "available" | `index.mjs:102` | Overnight windows are no longer reported as scheduled | — | Low | Test with a late-evening availability window | ✅ |
| 1.5 | Next.js proxy hardening, part 1 (TD-013) | Add a timeout, fix encoding, reject `.`/`..` segments | `frontend/app/api/[...path]/route.ts` | No hung functions; no double-decoding; no path escape | — | Low | Build + manual request | ✅ |
| 1.6 | Bound rate-limiter memory (TD-052) | Stop unbounded Map growth | `index.mjs:76` | Expired keys pruned | — | Low | Existing rate-limit behaviour unchanged (tests) | ✅ |
| 1.7 | Graceful shutdown and pool timeouts (TD-021) | Safe deploys, no stuck connections | `index.mjs:22-25`, bootstrap | SIGTERM drains; pool fails fast | — | Low | Manual start/stop; tests | ✅ |
| 1.8 | Fix script transactions and smoke cleanup (TD-024) | Atomic seeds; clean smoke runs | `backend/seed-demo.mjs`, `backend/smoke-live.mjs` | Statements share one client; children deleted first | — | Low | `node --check`; seed run on the local dev DB | ✅ |
| 1.9 | Professional login honours `worker_auth.is_active` (TD-023) | Deactivated credentials cannot log in | `backend/professionals.mjs:130-145` | 401 at login instead of a token that fails later | — | Low | Regression test | ✅ |
| 1.10 | Upload hardening, part 1 (TD-018) | Don't read bodies for anonymous uploads; 400 on malformed input | `index.mjs:125-129`, upload handler | 401 before parsing; 400 for a bad filename or JSON | — | Low | Regression tests | ✅ |
| 1.11 | `trust proxy` + X-Forwarded-For handling (TD-010) | Per-client rate limits | `index.mjs`, proxy route, env | Limits apply per client | Confirm the Railway/Vercel hop count | **High** (a wrong value allows spoofing) | Staging: log `req.ip`, `X-Forwarded-For` | 🔒 |
| 1.12 | Gate phone lookup and demo payment (TD-011) | Stop PII disclosure | `index.mjs:386-416`, `RequestStatusLookup.tsx` | `DEMO_PHONE_LOOKUP_ENABLED`, `DEMO_PAYMENTS_ENABLED` flags, off in production; receipts without PII | Product decision | Medium (customer-facing) | API tests per flag state | 🔒 |
| 1.13 | Round public professional coordinates (TD-012) | Protect professionals' locations | `backend/professionals.mjs:103-118` | ~100 m precision on public endpoints | Product decision | Medium (public API) | Existing nearby tests + a new precision test | 🔒 |
| 1.14 | Item cancel also cancels assignments (TD-002) | Free the worker | `index.mjs:630` | Worker available again; not shown on the booking | Ops confirmation | Medium | Regression test | 🔒 |
| 1.15 | Supersede earlier price proposals (TD-003) | Prevent accepting a stale price | `index.mjs:479`, `:541`; maybe a migration | Only the latest proposal is actionable | Check the status CHECK constraint | Medium | Regression test | 🔒 |
| 1.16 | Location-sharing index per (booking, worker) + 23505 → 409 (TD-006) | Multi-worker bookings work | New migration `020_*`, `professionals.mjs` | The second worker can share | 1.3 | Medium (migration) | Two-worker test; migration on a copy of production | 🔒 |
| 1.17 | Uploads to object storage (TD-020, ADR-0005) | Survive redeploys | `index.mjs` upload, new storage adapter | Images persist | Choose a provider and credentials | Medium | Integration test with the local adapter; staging upload | 🔒 |
| 1.18 | Operator scripts must not migrate (TD-025) | Respect the manual-migration policy | `backend/create-staff.mjs`, `migrate-sqlite-to-postgres.mjs` | The script refuses when migrations are pending | Operator agreement | Low | Run against the local DB | 🔒 |

## Phase 2: Architectural boundary improvements

| # | Task | Objective | Files | Outcome | Depends on | Risk | Validation | Status |
|---|---|---|---|---|---|---|---|---|
| 2.1 | Remove dead code (TD-041) | Shrink the surface; free mock data and types | See [proposed-repository-structure.md](proposed-repository-structure.md#files-removed-td-041) | ≈7,500 fewer lines; mobile tsconfig uses globs | Approved 2026-11-25 | Low (zero live importers verified) | `tsc` root and mobile, build, tests | ✅ |
| 2.2 | Prettier baseline (ADR-0006) | Make the core files reviewable | Whole repo | One behaviour-neutral commit + `.git-blame-ignore-revs` | i18n merge; approval of the dev dependency | Low | Tests + build identical | ⏳🔒 |
| 2.3 | Extract `backend/src/platform/` | Separate infrastructure from routes | `index.mjs:1-135` → `platform/{db,auth,http,config}` | `createApp` composes; routes unchanged | 2.2, ADR-0002 | Low–Med | Full suite | ⏳ |
| 2.4 | `withTransaction` + typed errors | One transaction and error pattern (TD-053) | `platform/db`, `platform/http` | No hand-rolled BEGIN/ROLLBACK | 2.3 | Low | Full suite | ⏳ |
| 2.5 | ESLint with boundary rules | Enforce the dependency rules | `eslint.config.js` | CI fails on boundary violations | 2.2 | Low | `npm run lint` | ⏳🔒 |
| 2.6 | `shared/contracts` skeleton + error-code enum (ADR-0003) | One source of truth for contracts | `shared/contracts/*` | Types inferred from schemas | Approval of the zod dependency | Low | `tsc` all apps | 🔒 |
| 2.7 | Move real reference data out of mocks (TD-038) | Production code must not depend on mock data | `shared/data/mockServices.ts` → `shared/reference/`, `shared/formatting/` | `ADDIS_NEIGHBORHOODS` and the FX constant have proper homes | 2.1 | Low | `tsc`, tests | ⏳ |

## Phase 3: Module restructuring

Modules are extracted in increasing order of risk. Each extraction follows the same steps:

1. Characterization tests.
2. Move the handlers verbatim into `*.routes`.
3. Extract the repository.
4. Extract the domain.
5. Run the full suite.

| # | Task | Objective | Outcome | Depends on | Risk | Status |
|---|---|---|---|---|---|---|
| 3.1 | `content` module (promotions, contact, uploads) | First, low-risk extraction proves the pattern | Pattern documented | 2.3–2.4 | Low | ⏳ |
| 3.2 | `location` + `assistant` modules | Move `geo.mjs` and `agaz-gemini.mjs` into adapters | Ports for Geoapify and Gemini | 3.1 | Low | ⏳ |
| 3.3 | `catalogue` module | Package effectivity rule in one place | — | 3.1 | Low | ⏳ |
| 3.4 | `staff` + `audit` modules | `audit.record()` with typed actor (TD-051); `/auth/me` returns permissions (TD-042) | — | 3.1 | Low | ⏳ |
| 3.5 | `customers` module | One register/login use case with cookie and bearer transports (TD-035) | Duplicate endpoints become thin adapters; paths unchanged | 3.4 | Medium | ⏳ |
| 3.6 | `payments` module | Allocation logic in integer cents as pure domain code | — | 3.5 | Medium | ⏳ |
| 3.7 | `workforce` module + single eligibility query (TD-034) | One availability implementation | `professionals.mjs` reuses it | 3.3 | Medium | ⏳ |
| 3.8 | `professionals` module | Split `professionals.mjs` into routes, service and repository | — | 3.7 | Medium | ⏳ |
| 3.9 | `bookings` module: one creation handler (TD-032) | Merge the two `POST /api/bookings` handlers | The legacy body is normalized at the edge | Characterization tests for both payload shapes | **High** | ⏳ |
| 3.10 | `bookings`: one lifecycle state machine (TD-033) | A single, exhaustively tested transition table | Booking and item transitions consistent | 3.9; product sign-off on the reconciled table | **High** | ⏳🔒 |
| 3.11 | Management decomposition (TD-040, TD-042) | Pages in separate files; permission gating; 401 → login | Reviewable portal | 2.2, 3.4 | Medium | ⏳ |
| 3.12 | `RequestFlow` decomposition (TD-040) | Reducer plus per-step components | Testable booking wizard | 2.2, 5.5 | Medium | ⏳ |
| 3.13 | Mobile reuses contracts and formatters (TD-048) | Remove duplicated types; one fetch wrapper | — | 2.6 | Medium | ▫️ |
| 3.14 | Frontend real routes (ADR-0004, TD-039) | SEO, 404s, code-splitting | Page-by-page migration | i18n merge | Medium | ⏳ |

## Phase 4: Database and API improvements

| # | Task | Objective | Risk | Status |
|---|---|---|---|---|
| 4.1 | Migrator: advisory lock, checksum, duplicate-prefix guard (TD-026) | Safe concurrent deploys; detect edited migrations | Low | ▫️ |
| 4.2 | Migration: `payments.status` default (TD-008) | Fix a latent defect | Low | 🔒 |
| 4.3 | Migration: CHECK constraints on status columns (TD-027), `NOT VALID` then `VALIDATE` | Integrity | Medium (existing data) | 🔒 |
| 4.4 | Migration: missing indexes and FKs; drop the duplicate index (TD-028) | Performance and integrity | Low–Medium | 🔒 |
| 4.5 | ADR + plan to consolidate legacy tables (TD-029) | One table per concept; availability honours exceptions and restrictions | Medium | ▫️ |
| 4.6 | Idempotency with a request hash, 422 on mismatch; replay returns the stored estimate (TD-015) | Correct idempotency | Medium (API) | 🔒 |
| 4.7 | `session_version` token revocation; real mobile logout (TD-016) | Revocable sessions | Medium (migration + auth) | 🔒 |
| 4.8 | Machine-readable `code` on every error; API conventions for new endpoints (TD-036) | Consistent clients | Low | ▫️ |
| 4.9 | Staff login: constant-time path + per-account throttling (TD-017) | Harder account enumeration and guessing | Low | ▫️ (after 1.11) |
| 4.10 | Display server prices only; remove the ×120 FX constant (TD-030) | Customers see the price they will be quoted | Medium (visible) | 🔒 |
| 4.11 | Worker-proposal fan-out (TD-014): reproduce, then fix | Correctness | Medium | ▫️ |

## Phase 5: Testing and engineering standards

| # | Task | Objective | Risk | Status |
|---|---|---|---|---|
| 5.1 | Engineering standards document | Shared conventions | — | ✅ [engineering-standards.md](../engineering/engineering-standards.md) |
| 5.2 | Activate CI on Node 22 (ADR-0006, TD-045) | Merge gate | Low | 🔒 (outward-facing; finalize `.github/workflows/ci.yml.proposed`) |
| 5.3 | Real-PostgreSQL CI job: migrations from empty + exclusion constraint | Cover what PGlite skips | Low | ▫️ |
| 5.4 | Unit tests for the lifecycle, estimate, allocation and eligibility domain functions | Protect business rules | Low | ⏳ (after 3.x) |
| 5.5 | Component tests (Vitest + Testing Library) for RequestFlow and approvals | Frontend safety net | Low | 🔒 (new dev dependency) |
| 5.6 | Playwright E2E: guest booking → assign → approve; staff permission gating | Critical journeys | Medium (setup) | 🔒 |
| 5.7 | Replace the dead-code test in `request.test.ts` with tests of the live flow | Meaningful coverage | Low | ⏳ (with 2.1) |

## Phase 6: Performance and production readiness

| # | Task | Objective | Risk | Status |
|---|---|---|---|---|
| 6.1 | Structured logger with request ids and PII redaction (TD-046) | Operability | Low | ▫️ |
| 6.2 | Security headers on Next.js: CSP report-only, then enforce (TD-019) | Defence in depth | Medium (CSP can break maps or fonts) | ▫️ |
| 6.3 | Overall Gemini deadline; expiry cleanup as a scheduled job (TD-022) | Bounded latency | Low | ▫️ |
| 6.4 | PostgreSQL-backed rate-limit store (ADR-0005) | Multi-instance readiness | Medium | ▫️ (after 1.11) |
| 6.5 | Upload magic-byte sniffing, async writes (TD-018 part 2) | Upload robustness | Low | ▫️ |
| 6.6 | Proxy header allow-list (TD-013 part 2) | Do not forward client-controlled hop headers | Medium | ▫️ (with 1.11) |
| 6.7 | Mobile hygiene: `npm audit fix`, cleartext only in dev builds, preview → staging API (TD-047, TD-043) | Release safety | Low–Medium | 🔒 |
| 6.8 | Define management production hosting; remove the conflicting `vercel.json` (TD-043) | Deployability | Medium | 🔒 |
| 6.9 | Explain plans for the eligibility, staff bookings list and nearby queries at realistic volume | Performance evidence | Low | ▫️ |

## Phase 7: Documentation and final verification

| # | Task | Status |
|---|---|---|
| 7.1 | README: architecture overview link, accurate topology, Node 22, single-instance constraint, env var catalog | ▫️ |
| 7.2 | `docs/operations/`: deployment, production migration runbook, staff bootstrap, backup and restore | ▫️ |
| 7.3 | API reference generated from `shared/contracts` | ▫️ (after 2.6) |
| 7.4 | Contribution guide (branching, commit style, review checklist) | ▫️ |
| 7.5 | Final architecture review: boundaries match the code, no cycles, full validation suite | ▫️ |

---

## Change log

| Date | Change |
|---|---|
| 2026-11-25 | Roadmap created. Phase 1 safe items 1.1–1.10 implemented. See the "Implementation log" below. |

## Implementation log

### 2026-11-25: Phase 1 safe fixes (1.1–1.10)

All edits are surgical. They do not reformat any line and they leave the uncommitted i18n changes in the same files intact. Nothing has been committed.

| Task | Change |
|---|---|
| 1.1 | `backend/index.mjs`: reordered the bound parameters of the `booking.reschedule_proposed` and `worker.assigned` audit inserts. Existing rows written before this fix still hold swapped values. A data fix is pending approval. |
| 1.2 | `backend/index.mjs` demo-payment handler: a replay of a verified key returns the original receipt (200) **only if the key belongs to the same booking**. Otherwise it returns 409 with no receipt, because the global key scope (TD-015) would otherwise leak another customer's receipt. |
| 1.3 | `backend/index.mjs` error handler: 22P02 → 400 `INVALID_IDENTIFIER`; 23505 and 23P01 → 409 `CONFLICT`. These codes are not yet in the locale catalogs (English fallback text), because Amharic translations need a human translator. |
| 1.4 | `backend/index.mjs` `eligibleWorkers`: added the midnight-wrap guard already present in `professionals.mjs`. |
| 1.5 | `frontend/app/api/[...path]/route.ts`: 30 s upstream timeout (120 s for `/api/agaz/*`) returning 504 `UPSTREAM_TIMEOUT`; `accept-encoding` stripped from requests and `content-encoding` from responses; `.`/`..` path segments rejected with 404. |
| 1.6 | `backend/index.mjs` `createRateLimit`: lazy sweep of expired keys, at most once per window. Limits and behaviour are unchanged. |
| 1.7 | `backend/index.mjs`: pool `connectionTimeoutMillis` (env `PG_CONNECT_TIMEOUT_MS`, default 10 s); `listen` error handler; SIGTERM/SIGINT graceful shutdown (env `SHUTDOWN_TIMEOUT_MS`, default 10 s). |
| 1.8 | `backend/seed-demo.mjs`, `backend/smoke-live.mjs`: transactions run on one checked-out client; smoke cleanup deletes `payment_allocations`, item history and `booking_items` before their parents. |
| 1.9 | `backend/professionals.mjs`: the login query requires `worker_auth.is_active`. |
| 1.10 | `backend/index.mjs`: the upload body is parsed only when a valid staff session cookie is present; a malformed `X-Filename` or JSON body returns 400. |

**Tests added:** `backend/hardening.test.mjs` (6 tests). They were run against a scratch copy with the fixes reverted: tests 1–4 and 6 fail without the fixes. Test 5's anonymous-upload assertion passes either way, because the fix prevents reading the body and does not change the status code.

**Validation after the changes:**

| Command | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm test` | 53 tests: 52 pass, 0 fail, 1 skipped |
| `npm run build` | exit 0 |

**Not verified at runtime:** graceful shutdown, and `seed-demo` / `smoke-live` against a live PostgreSQL. These were only checked with `node --check` and review, because no database was running in this session.

### 2026-11-25: Dead-code removal (2.1, approved)

Before deleting anything, I built an import graph (relative, `@/` and `@shared/` imports, plus `<script src>` in HTML) and confirmed that every deleted file was imported only by other deleted files. None of the deleted files had uncommitted changes. Deletions are unstaged, so `git checkout -- <path>` restores any of them.

| Area | Removed | Notes |
|---|---|---|
| Website | `frontend/src/booking/CustomerView.tsx`, `frontend/src/booking/steps/*` (6 files), `assistant/{DateSeparator,EmptyChatState}.tsx`, `assistant/mockResponses.ts`, `website/home/StatisticsSection.tsx` | `App.tsx` now loads `RequestFlow` directly (same lazy, client-only loading). The `bookings` state, which only the dead view read, is gone. |
| Staff portal | `management/src/{AdminView,WorkerView,AuditReportView,LiveOperationsPanel}.tsx`, `cms/CmsWorkspace.tsx`, `safety/TrustSafetyWorkspace.tsx` | The bundle is byte-identical (334.53 kB), which confirms none of it shipped. |
| Mobile | AI Studio web prototype: `index.html`, `vite.config.ts`, `metadata.json`, `src/{main,App}.tsx`, `src/index.css`, `src/context/AppContext.tsx`, `src/types/index.ts`, 12 DOM components in `src/components/` | `tsconfig.json` now includes `src/**/*`, so every mobile source file is typechecked. |
| Shared | `shared/data/{auditData,timeSlots}.ts`; mock arrays in `shared/data/mockServices.ts`; 16 prototype-only types in `shared/types.ts`; `createBookingRequest` in `frontend/src/booking/request.ts` | `mockServices.ts` keeps only its two production constants (see 2.7). The test of `createBookingRequest` was removed with it: it covered only the deleted client-side booking builder. Real booking creation is covered by the API tests. |

Kept deliberately:
- Root `metadata.json` (configuration, not code).
- The unused `_legacyToken` parameters in `shared/api.ts` (harmless; remove with the API-client split).
- The duplicate logo files in `management/app/` (the Vite dev server may serve them; verify before removing).

**Validation:**

| Command | Result |
|---|---|
| `npm run lint` | exit 0 |
| Mobile `tsc --noEmit` (now with globs) | exit 0 |
| `npm test` | 52 tests: 51 pass, 0 fail, 1 skipped (one dead-code test removed) |
| Mobile `npm test` | 2 pass |
| `npm run build` | exit 0 |

**Not run:** a Metro bundle (`expo export`). The removed files were not reachable from the `expo-router` entry.
