# Technical Debt Register

| | |
|---|---|
| **Date** | 2026-11-25 (working tree of branch `Add-multi-language`) |
| **Companion** | [current-state-assessment.md](current-state-assessment.md), [refactoring-roadmap.md](refactoring-roadmap.md) |

## How to read this register

**Severity**
- **Critical:** a security vulnerability, data corruption, or a major reliability risk.
- **High:** an architectural flaw or bug that significantly affects maintainability or functionality.
- **Medium:** a code-quality or design issue that raises future development cost.
- **Low:** a minor improvement or consistency issue.

**Confidence**
- **Confirmed:** verified by reading the code. Several items were also re-checked directly.
- **Potential:** a risk that depends on deployment or data conditions we cannot observe from the repository.

**Status** is one of `Open`, `Fixed (<date>)`, `Partly fixed (<date>)`, or `Needs approval` (the fix changes business behaviour, a schema, or an API contract).

Line numbers refer to `backend/index.mjs` unless another file is named. That file uses very long lines, so a single line number can span a whole handler.

## Summary

| ID | Title | Severity | Confidence | Status |
|---|---|---|---|---|
| TD-001 | Audit log `entity_id` / `reason` swapped for reschedule and assignment | High | Confirmed | Fixed (2026-11-25) |
| TD-002 | Cancelling an item leaves its worker assignment active | High | Confirmed | Fixed (2026-11-27) |
| TD-003 | A stale (superseded) price proposal can still be accepted | High | Confirmed | Fixed (2026-11-27) |
| TD-004 | Retrying a verified demo payment falls through after COMMIT | High | Confirmed | Fixed (2026-11-25) |
| TD-005 | Booking-level transition blocked by any cancelled item | Medium | Confirmed | Needs approval |
| TD-006 | Location sharing fails with 500 for the second worker on a multi-item booking | High | Confirmed | Fixed (2026-11-27): migration 020, must be run on production |
| TD-007 | Availability check wraps past midnight and reports "scheduled" | Medium | Confirmed | Fixed (2026-11-25) |
| TD-008 | `payments.status` default violates its own CHECK | Low | Confirmed (latent) | Needs approval (migration) |
| TD-009 | Invalid UUIDs and unique violations return HTTP 500 | Medium | Confirmed | Fixed (2026-11-25) |
| TD-010 | Rate limiting is ineffective behind the proxy (`trust proxy` unset) | Critical | Confirmed in code; impact depends on topology | Needs approval |
| TD-011 | Unverified phone lookup exposes bookings; reference + phone enables payments and receipts | Critical | Confirmed | Fixed (2026-11-27): reference + phone only, no PII on receipts, demo payments off in production |
| TD-012 | Public professional endpoints expose exact live coordinates | High | Confirmed | Fixed (2026-11-27) |
| TD-013 | Next.js API proxy: header pass-through, no timeout, `content-encoding`, `..` segments | Medium | Confirmed | Partly fixed (2026-11-25): timeout, encoding, `..` segments; header allow-list open |
| TD-014 | Worker-change proposal can create several proposals per request | Medium | Potential | Open |
| TD-015 | Idempotency keys are global and replay does not verify the payload | Medium | Confirmed | Open |
| TD-016 | Session tokens cannot be revoked; mobile logout is a no-op | Medium | Confirmed | Open |
| TD-017 | Staff login leaks account existence by timing; no per-account lockout | Low | Potential | Open |
| TD-018 | Upload parsing runs before auth; content type not checked; errors return 500 | Medium | Confirmed | Partly fixed (2026-11-25): no body read without a staff session; 400 on malformed input. Magic bytes and async write open |
| TD-019 | No security headers (CSP, HSTS) on the Next.js site | Medium | Potential | Open |
| TD-020 | Uploads stored on local disk | High | Potential (depends on volume) | Open |
| TD-021 | No graceful shutdown; DB pool has no timeouts | Medium | Confirmed | Partly fixed (2026-11-25): graceful shutdown, connect timeout. `statement_timeout` open |
| TD-022 | Gemini request can block more than 100 s; cleanup DELETE runs on every chat | Low | Confirmed | Open |
| TD-023 | Professional login ignores `worker_auth.is_active` | Low | Confirmed | Fixed (2026-11-25) |
| TD-024 | `seed-demo` and `smoke-live` run transactions on the pool; smoke cleanup order | Medium | Confirmed | Fixed (2026-11-25), not yet run against a live DB |
| TD-025 | `create-staff` and `migrate-sqlite-to-postgres` apply migrations silently | Medium | Confirmed | Needs approval |
| TD-026 | Migration runner: no lock or checksum; exclusion constraint never tested | Medium | Confirmed | Open |
| TD-027 | Status columns without CHECK constraints | Medium | Confirmed | Needs approval (migration) |
| TD-028 | Missing FKs and indexes | Low | Confirmed | Needs approval (migration) |
| TD-029 | Overlapping legacy and new tables; code reads only one | Medium | Confirmed | Open |
| TD-030 | Displayed prices come from a hard-coded table and a ×120 FX constant | High | Confirmed | Needs approval |
| TD-031 | `backend/index.mjs` is a monolith with no layering | High | Confirmed | Open |
| TD-032 | Two divergent `POST /api/bookings` handlers | High | Confirmed | Open |
| TD-033 | Two booking state machines plus a third derivation | High | Confirmed | Open |
| TD-034 | Duplicated eligibility, time and geo helpers | Medium | Confirmed | Open |
| TD-035 | Duplicated endpoints (register, worker approval) and inline validation | Medium | Confirmed | Open |
| TD-036 | Inconsistent response shapes, error codes and status codes | Medium | Confirmed | Open |
| TD-037 | Three independent type systems for the same API | High | Confirmed | Open |
| TD-038 | `shared/` mixes concerns; production code depends on mock data | Medium | Confirmed | Open |
| TD-039 | App Router used as a shell around a client state router | Medium | Confirmed | Open |
| TD-040 | God components and minified-style source files | Medium | Confirmed | Open |
| TD-041 | Dead prototype code (≈7,500 lines in the end) | Medium | Confirmed | Fixed (2026-11-25) |
| TD-042 | Management UI ignores permissions; no global 401 handling | Medium | Confirmed | Open |
| TD-043 | Undefined management hosting; conflicting `vercel.json` files | Medium | Confirmed | Open |
| TD-044 | No linter or formatter; backend not typechecked | Medium | Confirmed | Open |
| TD-045 | No active CI | High | Confirmed | Open |
| TD-046 | No structured logging, request ids or metrics | Medium | Confirmed | Open |
| TD-047 | Mobile dependency and configuration hygiene | Low | Confirmed | Open |
| TD-048 | Mobile duplicates API types and formatting; second fetch wrapper | Medium | Confirmed | Open |
| TD-049 | Hard-coded English in a bilingual product | Low | Confirmed | Open |
| TD-050 | Template leftovers and stale docs | Low | Confirmed | Open |
| TD-051 | PII written into the audit `actor` column | Low | Confirmed | Open |
| TD-052 | Unbounded in-memory maps (rate limiter, geocode cache) | Medium | Confirmed | Partly fixed (2026-11-25): limiter keys pruned. Geocode cache uncapped |
| TD-053 | Writes and their audit rows not in one transaction; unguarded ROLLBACK | Low | Confirmed | Open |
| TD-054 | Minor frontend behaviour bugs | Low | Confirmed / Potential | Open |

---

## Correctness bugs

### TD-001: Audit log `entity_id` and `reason` swapped
- **Problem:** The two INSERTs bind `[actor, reason, bookingId, …]` to `VALUES($1,…,$2,$3,…)` for the columns `(actor, action, entity_type, entity_id, reason, …)`. As a result, `entity_id` holds the free-text reason and `reason` holds the booking id.
- **Evidence:** `backend/index.mjs:469` (`booking.reschedule_proposed`), `backend/index.mjs:602` (`worker.assigned`).
- **Why it matters:** The audit trail for two of the most important operational actions is corrupted. The booking activity feed filters on `entity_id = bookingId` (L466), so these events never appear there. Nothing errors, because `audit_logs.entity_id` is TEXT.
- **Severity:** High. **Recommendation:** Reorder the parameters and add a regression test that asserts on `entity_id`. A one-off data fix that swaps the two columns for these two `action` values in existing rows should be reviewed separately.
- **Risk:** None for the code fix. The data fix needs approval and a backup.

### TD-002: Item cancellation leaves the assignment active
- **Problem:** The item-level cancel releases `worker_reservations` but never cancels `booking_assignments`. The booking-level cancel does both.
- **Evidence:** `index.mjs:630` (item level) vs `index.mjs:683` (booking level). Availability treats `assignment_status IN ('assigned','confirmed','in_progress')` as busy (`index.mjs:105`).
- **Why it matters:** The cancelled worker stays blocked for that slot and still appears on the customer's booking detail.
- **Severity:** High. **Recommendation:** Inside the same transaction, set the item's active assignments to `cancelled`, mirroring L683.
- **Risk:** This changes operational behaviour, so it needs approval. Confirm with operations that cancelling an item should free its worker.

### TD-003: Superseded price proposals can be accepted
- **Problem:** Sending a new price proposal inserts another `'sent'` row and never supersedes the earlier ones. Acceptance takes any `'sent'` proposal for the customer.
- **Evidence:** `index.mjs:479` (insert; no `superseded` status exists anywhere in `backend/`); acceptance query around `index.mjs:541`.
- **Why it matters:** A customer can accept an older, cheaper quote after staff revised it.
- **Severity:** High. **Recommendation:** When inserting a new proposal, set the item's earlier open proposals to a terminal state (`withdrawn`/`superseded`; check the status CHECK constraint first). Alternatively, accept only the latest proposal.
- **Risk:** It may need a migration if the CHECK does not allow a superseded state. Needs approval.

### TD-004: Retrying a verified demo payment
- **Problem:** When the idempotency key matches an existing *verified* payment, the handler COMMITs and then continues outside the transaction and lock. The retry ends with 400 (balance) or 409 (unique) instead of replaying the receipt.
- **Evidence:** `index.mjs:392`: `if(old){await client.query('COMMIT');if(old.status!=='verified')return …;}`, then execution falls through.
- **Why it matters:** Idempotent retries, the whole point of the key, fail on the success path. The extra queries also run against a client whose transaction has already ended.
- **Severity:** High. **Recommendation:** On a verified replay, rebuild and return the stored receipt (`200`, same body shape as the receipt lookup).
- **Risk:** Low. It is confined to the replay branch.

### TD-005: Booking transition blocked by cancelled items
- **Problem:** A booking-level transition requires *every* item to be in the "from" state, so one cancelled item permanently blocks `in_progress` or `completed`.
- **Evidence:** `index.mjs:688`.
- **Severity:** Medium. **Recommendation:** Exclude terminal (cancelled) items from the precondition.
- **Risk:** Business rule change, so it needs approval.

### TD-006: Multi-worker location sharing collides with a per-booking unique index
- **Problem:** The open-session unique index is on `(booking_id)`, but the code models sessions per `(booking_id, worker_id)`. The second worker's consent INSERT raises 23505, which the error handler maps to 500. Two simultaneous first consents race the same way.
- **Evidence:** `backend/migrations/018_professional_location_and_live_tracking.sql:72-74`; `backend/professionals.mjs:685-711`; error handler `index.mjs:887` (maps only 23503 and 23514).
- **Severity:** High (the feature is broken for multi-item bookings). **Recommendation:** New migration: drop the index and recreate it on `(booking_id, worker_id)`. Map 23505 to 409. Add a test with two workers.
- **Risk:** Schema migration, so it needs approval. It is additive and safe on existing data, because the existing index is stricter.

### TD-007: Availability window wraps past midnight
- **Problem:** `a.end_time >= ($4::time + make_interval(mins=>$5))`. A 23:00 start lasting 120 min wraps to 01:00, so it counts as "scheduled". The copy in `professionals.mjs:324` already guards with `($4::time + interval) >= $4::time`.
- **Evidence:** `index.mjs:102` vs `professionals.mjs:324`.
- **Severity:** Medium. **Recommendation:** Apply the same guard, and later move both copies into one query (TD-034).
- **Risk:** Low. The change only makes a false "available" more conservative.

### TD-008: `payments.status` default rejected by its own CHECK
- **Evidence:** `backend/migrations/001_initial.sql:38`: `DEFAULT 'pending' CHECK(status IN ('initiated','pending_verification','verified',…))`. Latent, because the only insert sets the status explicitly.
- **Severity:** Low. **Recommendation:** Migration to `SET DEFAULT 'initiated'`. Needs approval.

### TD-009: Database errors returned as 500
- **Problem:** The global error handler maps only 23503 and 23514. An invalid UUID in a path parameter (22P02, for example `GET /api/management/bookings/abc`) and a duplicate key (23505, for example staff creation with an existing email at L708) both become 500.
- **Severity:** Medium. **Recommendation:** Map 22P02 → 400 and 23505 → 409 in the error handler; validate UUID params at the route.
- **Risk:** Status codes change from 500 to 4xx, which corrects the contract.

### TD-014: Worker-change proposal fan-out
- **Problem:** The proposal `INSERT … SELECT … GROUP BY i.id, a.worker_id` can create one proposal per active assignment when `replaceWorkerId` is null.
- **Evidence:** `index.mjs:488-492`.
- **Severity:** Medium (potential; this needs a reproduction test). **Recommendation:** Write a test first, then constrain the query.

## Security

### TD-010: Rate limiting collapses behind the proxy
- **Problem:** The limiter keys on `req.ip` (`index.mjs:76`), and `app.set('trust proxy', …)` is never called (no match in `backend/`). In production, web traffic arrives through the Next.js route-handler proxy and Railway's edge, so `req.ip` is a proxy address shared by every user.
- **Why it matters:**
  - Security: per-client brute-force protection on customer, staff and professional login is effectively absent, because it becomes one global bucket.
  - Availability: about 8 failed logins in 15 minutes across *all* users locks everyone out of login (`authLimit = createRateLimit(8, 15*60_000)`, L130). Booking lookup and contact have the same problem.
- **Severity:** Critical (confirmed in code). The exact production effect depends on how many proxy IPs Railway and Vercel present.
- **Recommendation:** Set `trust proxy` to the exact hop count or the trusted CIDRs of the deployment. Make the Next.js proxy *replace* `X-Forwarded-For` with the connecting client IP instead of forwarding the client's value (TD-013). Move limiter state to a shared store before running more than one instance (ADR-0005).
- **Risk:** A wrong hop count lets clients spoof their IP, so this needs the deployment topology confirmed. Needs approval.

### TD-011: Unverified phone lookup and demo payment by reference + phone
- **Problem:**
  - `POST /api/bookings/lookup` with `mode: 'phone'` returns up to 50 bookings (reference, status, service, requested time, amounts) for **any** phone number, with no verification. The code says so: `'Demo lookup: the phone number is not verified.'`
  - Reference + phone then allows `POST /api/bookings/:reference/demo-payment`, which writes `status='verified'` payment rows that reduce the balance shown to staff, and `POST /api/payments/receipt-lookup`, which returns the customer's name and phone.
- **Evidence:** `index.mjs:386`, `index.mjs:387-415`, `index.mjs:416`.
- **Why it matters:** Personal data and home-visit schedules are disclosed to anyone who knows or guesses a phone number. Ethiopian mobile numbers come from a small, enumerable space. The only throttle is the per-IP limiter, which is itself broken (TD-010).
- **Severity:** Critical once real customer data is present.
- **Recommendation:**
  - (a) Disable phone-mode lookup, or require a one-time code sent to the phone.
  - (b) Require reference **and** phone for any lookup, and return no PII in receipts.
  - (c) Gate demo-payment behind a feature flag that is off in production.
- **Risk:** It changes a customer-facing flow, so it needs a product decision.

### TD-012: Exact professional coordinates on public endpoints
- **Problem:** `GET /api/professionals/nearby` and `GET /api/professionals/:id` are unauthenticated. They return unrounded live device coordinates for opted-in professionals, which can be refreshed about every 1.25 s. Migration 018 calls this an "approximate working position", but the code applies no fuzzing.
- **Evidence:** `backend/professionals.mjs:103-118`; `018_professional_location_and_live_tracking.sql:10-11`.
- **Severity:** High (privacy and physical safety). **Recommendation:** Round public coordinates (for example to 3 decimals, about 100 m) or return only `distanceKm`. Keep exact positions for the consented booking-sharing flow.
- **Risk:** Public API response change, so it needs approval.

### TD-013: Next.js API proxy hardening
- **Evidence:** `frontend/app/api/[...path]/route.ts:17-31`.
  - All client headers are copied (only `host`, `connection` and `content-length` are removed), including a client-supplied `X-Forwarded-For`.
  - `fetch` has no timeout.
  - The upstream `content-encoding` header is kept although Node's `fetch` has already decompressed the body.
  - `..` path segments are not rejected.
  - `loadEnvConfig(process.cwd())` loads `frontend/`, not the repo root.
- **Severity:** Medium. **Recommendation:** Add a 30 s timeout (longer for `/agaz/chat`), strip `accept-encoding`/`content-encoding`, reject `.` and `..` segments, and allow-list forwarded headers once TD-010 is decided.

### TD-015: Idempotency scope
- **Problem:** Keys are globally unique, not scoped to a customer or endpoint, and a replay does not verify that the payload matches. The multi-item replay returns `startingEstimate` computed from the *new* request.
- **Evidence:** `index.mjs:353`, `368`, `376`, `383`, `392`.
- **Severity:** Medium. **Recommendation:** Store a request hash with the key; return 422 when the same key arrives with a different payload; return the stored estimate.

### TD-016: Token revocation
- **Problem:** Stateless HMAC tokens are valid for 8 h. Logout clears the cookie only; the mobile logout is a no-op (`index.mjs:217`). A stolen token stays valid until it expires. Staff are partly protected because `is_active` is re-checked per request.
- **Severity:** Medium. **Recommendation:** Add a per-principal `session_version` (or a sessions table). Include it in the token, bump it on logout or password change, and check it in the auth middleware, which already queries the DB.

### TD-017: Staff login timing and lockout
- **Problem:** scrypt runs only when the account exists, so response timing reveals which emails are registered. There is no per-account lockout.
- **Severity:** Low (potential). **Recommendation:** Run scrypt against a dummy hash when the account is missing. Add per-account failure counting once TD-010 is fixed.

### TD-018: Upload handling
- **Problem:**
  - `express.raw({type:'*/*', limit:'12mb'})` runs before `staffAuth` (`index.mjs:127`), so anonymous clients can make the server read 12 MB bodies, although the size check is 6 MB (L770).
  - The type comes from the `Content-Type` header only, with no magic-byte check.
  - `writeFileSync` blocks the event loop.
  - Malformed `X-Filename` or JSON input throws, which returns 500 (L761, L764).
  - Paths are safe: the server generates UUID names, and GET validates them with a regex and an `uploadDir` prefix check.
- **Severity:** Medium. **Recommendation:** Authenticate before parsing the body; set the limit to 6 MB; sniff magic bytes; use async writes; return 400 for malformed input.

### TD-019: Missing HTTP security headers on the website
- **Problem:** `frontend/next.config.ts` and `frontend/vercel.json` set no CSP, HSTS or frame-ancestors. The API itself does set `nosniff`, `X-Frame-Options` and related headers (`index.mjs:121`).
- **Severity:** Medium (potential; the edge may add them). **Recommendation:** Add `headers()` in `next.config.ts`, starting with a report-only CSP.

### TD-023: Professional login ignores credential `is_active`
- **Evidence:** `backend/professionals.mjs:130-145`. The login query does not filter `worker_auth.is_active`, although `workerAuth` checks `credentialActive` (L88).
- **Severity:** Low (the next request is rejected). **Recommendation:** Add `AND a.is_active` to the login query.

### TD-051: PII in the audit `actor` column
- **Problem:** Customer names and emails are written to `audit_logs.actor` (`index.mjs:411`, `429`, `551`, `567`), and worker phone numbers go into metadata (L704).
- **Severity:** Low. **Recommendation:** Store actor type plus id, and define a retention policy.

## Reliability and operations

### TD-020: Uploads on local disk
- **Problem:** `writeFileSync(resolve(uploadDir, …))` with `UPLOAD_DIR` defaulting to `backend/uploads` (`index.mjs:123`, `773`). Without a mounted Railway volume, every redeploy deletes all promotion, service and worker images, and the API cannot run more than one instance. Uploads are not recorded in `file_attachments`.
- **Severity:** High (potential; confirm whether a volume is mounted). **Recommendation:** Use S3-compatible object storage behind a small storage port (ADR-0005).

### TD-021: Shutdown and pool configuration
- **Problem:** `app.listen` has no error handler; there is no SIGTERM/SIGINT handling, `server.close()` or `pool.end()`. The pool has no `connectionTimeoutMillis`, `idleTimeoutMillis` or `statement_timeout` (`index.mjs:24`, `899-901`).
- **Severity:** Medium. **Recommendation:** Add graceful shutdown and conservative pool timeouts configured from the environment.

### TD-022: Assistant latency and hot-path cleanup
- **Problem:** A 12 s timeout × 3 attempts × up to 3 models, plus backoff, gives a worst case above 100 s for one request. `DELETE FROM agaz_conversations WHERE expires_at<=now()` runs on every chat and conversation list (L241, L251). The stored `language` can be `'auto'` instead of the resolved language (L281).
- **Severity:** Low. **Recommendation:** Add an overall deadline, move the cleanup to a scheduled job, and store the resolved language.

### TD-024: Operational scripts misuse transactions
- **Problem:** `BEGIN`/`COMMIT` are issued through `pool.query`, so the statements are not guaranteed to share a connection (`backend/seed-demo.mjs:18,55`; `backend/smoke-live.mjs:106,114`). `smoke-live` runs against the **real** `DATABASE_URL` and deletes `bookings` without first deleting `booking_items` and the item history, so cleanup can fail and leave test rows behind.
- **Severity:** Medium. **Recommendation:** Use a checked-out client and delete children first.

### TD-025: Scripts that migrate implicitly
- **Problem:** `backend/create-staff.mjs:16` and `backend/migrate-sqlite-to-postgres.mjs:17` call `migrate(pool)`. Running them against production applies pending migrations, contrary to the manual-migration policy (`index.mjs:893-897`).
- **Severity:** Medium. **Recommendation:** Check `schema_migrations` and refuse to run if migrations are pending, instead of applying them. Needs approval (operator workflow change).

### TD-026: Migration runner
- **Problem:** No advisory lock, so two processes can race. No checksum, so edited migrations go unnoticed. A reused numeric prefix is silently skipped. Tests skip `btree_gist` and the reservation exclusion constraint (`skipBtreeGist`, `index.mjs:57`). `verify-db.mjs:22` only requires migration 006.
- **Severity:** Medium. **Recommendation:** Take `pg_advisory_lock` around the run, store a checksum, fail on a duplicate prefix, and run one test job against real PostgreSQL 16.

### TD-046: Observability
- **Problem:** Logging is `console.log`/`console.error` with the message only (`index.mjs:887`); structured logs exist only for Gemini. There are no request ids, latency metrics or error tracking.
- **Severity:** Medium. **Recommendation:** Structured JSON logger with request ids and PII redaction, and error tracking.

### TD-052: Unbounded in-memory maps
- **Problem:** The limiter's `Map` never deletes IP keys (`index.mjs:76`), and `geocodeCache` (L20) grows without eviction. Both are per process.
- **Severity:** Medium. **Recommendation:** Prune expired keys and cap the cache size. Move to shared stores when scaling (ADR-0005).

### TD-053: Transaction boundaries for audit rows
- **Problem:** Several management writes run the change and its audit row as separate pool queries (L453–459, 488–494, 563–567, 704, 708–715, 795–796). Several `ROLLBACK` calls have no `.catch`, so a broken connection masks the original error.
- **Severity:** Low. **Recommendation:** A `withTransaction(pool, fn)` helper used everywhere.

## Data layer

### TD-027: Status columns without CHECK constraints
- **Problem:** `booking_assignments.assignment_status` (001:35) has no CHECK, yet the one-active-assignment partial index (012:17-19) and every availability query depend on its exact literals. Also unchecked: `payments.payment_stage`, `refunds.status`, `notifications.status/channel`, `worker_services.qualification_status`, and others.
- **Severity:** Medium. **Recommendation:** Add CHECK constraints using `NOT VALID` followed by `VALIDATE` after a data audit. Needs approval.

### TD-028: Missing FKs and indexes
- **Problem:**
  - Actor/approver UUID columns with no FK: `quotations.created_by`, `refunds.requested_by/approved_by`, `worker_services.verified_by`, and others.
  - Missing indexes: `customer_addresses(customer_id)` (only a partial index exists); `audit_logs(entity_type, entity_id)`; the `worker_auth` login, which filters on `regexp_replace(phone, …)` with no expression index.
  - Duplicate index: 012:98 duplicates 003:25.
- **Severity:** Low at current volumes. **Recommendation:** One migration adding the indexes (`CREATE INDEX CONCURRENTLY` runs outside a transaction and needs runner support). Needs approval.

### TD-029: Overlapping legacy tables
- **Problem:** `worker_unavailability` vs `worker_availability_exceptions`; `booking_reschedule_proposals` vs `rescheduling_requests` vs `booking_change_proposals`; `price_change_requests` vs `booking_price_proposals`. Availability queries read only `worker_unavailability` and ignore `worker_availability_exceptions` and `worker_restrictions`.
- **Severity:** Medium. **Recommendation:** Decide the canonical table per concept (ADR needed), migrate the data, and drop the others later.

## Architecture and design

### TD-030: Displayed prices do not come from the server
- **Problem:** Before a package is chosen, the UI shows `getDemoEstimate(serviceId)` from the hard-coded `shared/demoPricing.ts`, not the DB `base_price`. The last-resort path multiplies by a constant `ETB_EXCHANGE_RATE` of 120 (`shared/utils/formatters.ts:62-72`, imported from `shared/data/mockServices.ts`). `shared/api.ts:97-112` builds `totalPriceETB: estimate*120`. The legacy booking route also hard-codes the same 8 service ids (`index.mjs:374`).
- **Evidence:** `frontend/src/booking/RequestFlow.tsx:47,132,156`; `frontend/src/website/MarketingView.tsx:123-126`; `PopularServices.tsx`.
- **Why it matters:** A customer can see one price and be quoted another. Services created by staff get no displayed price.
- **Severity:** High. **Recommendation:** Display server prices only. Store catalogue prices in ETB, or return an explicit currency from the API and drop the client FX constant.
- **Risk:** Visible pricing change, so it needs product approval.

### TD-031: Monolithic API module
- **Problem:** `createApp` spans `index.mjs:115-889`. It holds 83 routes, auth, validation, business rules, SQL and HTTP concerns in one closure. Lines reach 4,007 characters (L466); L373, L295 and L386 are each over 2,000.
- **Why it matters:** Unreviewable diffs, constant merge conflicts, no unit-testable business logic, and all of it in one closure.
- **Severity:** High. **Recommendation:** ADR-0001: split into domain modules (routes, service, repository).

### TD-032: Two divergent booking-creation handlers
- **Problem:**
  - The multi-item handler (L297) calls `next()` when `items` is not an array, falling through to a legacy single-item handler (L372).
  - The legacy handler hard-codes 8 service ids and skips the package `effective_from/to` check.
  - The two handlers accept different answer types.
  - The INSERT SQL and the replay logic are copy-pasted four times.
- **Severity:** High. **Recommendation:** Normalize the legacy body into the multi-item shape at the edge and keep one handler. Characterization tests first.

### TD-033: Duplicated state machines
- **Problem:** Item transitions `allowed` (L608) and booking transitions `transitions` (L648) disagree. For example, the booking level allows `pending → confirmed` directly, and only the booking level has `rescheduling_requested`. Parent status is derived a third time (L636–640). Confirmation logic is duplicated (L617–628 vs L656–671).
- **Severity:** High. **Recommendation:** One pure `bookingLifecycle` domain module with exhaustive unit tests; the routes call it.

### TD-034: Duplicated helpers and queries
- **Problem:**
  - `addisTimeParts` exists in both `index.mjs:97` and `professionals.mjs:26`.
  - Haversine exists in `index.mjs:98` and `geo.mjs`.
  - The availability SQL is copied (`index.mjs:99-110` vs `professionals.mjs:303-348`).
  - Coordinate validation is written inline about 6 times, although `geo.mjs` has a validator.
  - `stopSharingForBooking` is exported (`professionals.mjs:844`) but never imported; the same UPDATE is inlined three times (`index.mjs:595`, `633`, `695`).
  - The "verified payments sum" subquery appears four times.
- **Severity:** Medium.

### TD-035: Duplicated endpoints and validation
- **Problem:**
  - `/api/customers/register` and `/api/mobile/auth/register` are near-identical (`index.mjs:207-215`); the same goes for the two login endpoints.
  - Worker approval exists in two endpoints (L511 `kind=worker` and L561).
  - Address validation is duplicated (L291 vs L292).
  - Phone and email regexes are repeated in the clients.
- **Severity:** Medium. **Recommendation:** Shared service functions with thin transport adapters (cookie vs bearer).

### TD-036: Inconsistent API conventions
- **Problem:**
  - Response key casing is mixed: snake_case in `GET /api/customers/me/bookings` (L294), management services (L711–712), and `created_at` alongside `createdAt` (L369, L384).
  - Only about 14 of 203 `apiError` calls pass a machine-readable `code`.
  - Status codes are inconsistent: an unavailable service gives 404 but an unavailable package gives 409, and a failed demo payment returns 200.
  - The upload 404 bypasses `apiError` (L783).
- **Severity:** Medium. **Recommendation:** API conventions in [engineering-standards.md](../engineering/engineering-standards.md). New code complies; existing endpoints migrate only when a client needs a change (contract preservation).

### TD-037: Three type systems
- **Problem:** Wire shapes are defined by SQL aliases in the backend, again in `shared/api.ts` and `shared/types.ts` (prototype types such as `Booking.cleanersCount` and `totalPriceETB`, plus `ServiceCategory` missing `currency`), and again in `meraki-homes-mobile/src/lib/types.ts`. `ApiError` is defined twice.
- **Severity:** High. **Recommendation:** ADR-0003: one contracts package (types plus runtime schemas) used by the server and all clients.

### TD-038: `shared/` boundaries
- **Problem:** `shared/api.ts` mixes the customer client, the staff client and browser-only image compression. Production formatting imports `ETB_EXCHANGE_RATE` from `shared/data/mockServices.ts`. The real `ADDIS_NEIGHBORHOODS` list lives in the mock module. `shared/data/auditData.ts` is dead.
- **Severity:** Medium.

### TD-039: App Router shell
- **Problem:**
  - One catch-all route (`frontend/app/[locale]/[[...slug]]/page.tsx`) renders `App.tsx`, which keeps the path in React state and picks views with `if/else` (`App.tsx:80`, `121-123`, `184-220`). `MarketingView.tsx` has a second page state machine.
  - Unknown slugs return 200 (a soft 404).
  - Navigation uses `<button onClick>`, so crawlers cannot follow links.
  - The catalogue is fetched client-side, there is no sitemap, robots file or hreflang, and only `CustomerView` is code-split.
  - The `pricing` page is unreachable.
- **Severity:** Medium (SEO, performance, maintainability). **Recommendation:** ADR-0004: migrate page by page to real segments.

### TD-040: God components and minified source
- **Problem:**
  - `management/src/ManagementApp.tsx` is 55 lines and 33.5 KB, with 12 components and 56 `useState` calls; lines reach 3,800 characters.
  - `management/src/BookingDetailModal.tsx` is 26.7 KB on 204 lines.
  - `frontend/src/booking/RequestFlow.tsx` declares about 30 `useState` hooks in one statement (L45), with inline validation and inline per-service question schemas (L26–37).
  - The management `errorText` helper is copied into 7 files.
- **Severity:** Medium. **Recommendation:** Prettier first (a mechanical, behaviour-neutral change), then decompose.

### TD-041: Dead code
- **Problem:**
  - `frontend/src/booking/CustomerView.tsx`: about 640 of 745 lines are unreachable, because App always passes `initialTab="book"`. It includes a fake wallet and local bookings.
  - `frontend/src/booking/steps/*` (not imported).
  - `frontend/src/assistant/{DateSeparator,EmptyChatState,mockResponses}`, `website/home/StatisticsSection.tsx`.
  - `management/src/{AdminView,WorkerView,AuditReportView,LiveOperationsPanel}.tsx`, `cms/`, `safety/`.
  - The AI Studio web prototype in `meraki-homes-mobile/` (`index.html`, `vite.config.ts`, `metadata.json`, `src/main.tsx`, `src/App.tsx`, `src/components/*Tab.tsx`, `BookingModal.tsx`, `src/context/AppContext.tsx`, `src/types/index.ts`). It imports modules that no longer exist and is excluded from typecheck by a hand-curated include list.
  - `createBookingRequest` in `frontend/src/booking/request.ts` is used only by its test.
- **Evidence:** zero importers verified with grep on 2026-11-25.
- **Why it matters:** It keeps mock data and obsolete types alive, misleads new engineers, and inflates typecheck and bundles.
- **Severity:** Medium. **Recommendation:** Delete it; git history preserves it. Needs approval, in case any prototype is kept as a design reference.

### TD-042: Management permission UX
- **Problem:** The nav shows every section to every role; only `AdminsPage` checks `role==='admin'` (`ManagementApp.tsx:53`). `/api/management/auth/me` returns no permission list. There is no global 401 handling, so an expired session leaves error states on every page. The server does enforce permissions correctly, so this is UX, not a security hole.
- **Severity:** Medium. **Recommendation:** Return `permissions[]` from `/auth/me` (an additive API change), gate the nav and actions, and redirect to login on 401.

### TD-043: Deployment ambiguity
- **Problem:** The management SPA calls relative `/api` paths that only the Vite dev server proxies; no production host or proxy is configured. The root `vercel.json` rewrites `/api` to a hard-coded Railway URL, while `frontend/vercel.json` uses the Next.js proxy, so which one applies depends on Vercel project settings. Mobile `eas.json` points preview builds at the production API.
- **Severity:** Medium. **Recommendation:** Document the actual topology and remove the unused `vercel.json`. Give management a defined host (for example served by Next.js under `/management` or a separate Vercel project with rewrites).

## Engineering standards and tooling

### TD-044: No linter or formatter; untyped backend
- **Problem:** `npm run lint` is only `tsc --noEmit`. There is no ESLint or Prettier. Backend `.mjs` files are not typechecked at all.
- **Severity:** Medium. **Recommendation:** ADR-0006.

### TD-045: No active CI
- **Problem:** `.github/workflows/ci.yml.proposed` is not enabled and targets Node 20, while `node:sqlite` (`migrate-sqlite-to-postgres.mjs`) and current Expo tooling need Node 22. Nothing prevents a broken main branch.
- **Severity:** High. **Recommendation:** Enable CI on Node 22: install, lint, typecheck (root and mobile), test, build.

### TD-047: Mobile dependency and configuration hygiene
- **Problem:**
  - `npm audit`: 8 moderate (glob, minimatch, node-forge; transitive).
  - Version skew with the web apps: React 19.3.0 vs ^19.2.8, TypeScript 6.0 vs 5.8.
  - `"react-example": "file:.."` links the entire root package.
  - `app.json:16` sets `usesCleartextTraffic: true` for all builds.
  - `react-dom` and `react-native-web` are unused.
  - The mobile `test` script downloads tsx at runtime.
- **Severity:** Low.

### TD-048: Mobile duplicates shared logic
- **Problem:** `meraki-homes-mobile/src/lib/types.ts` redefines `shared/api.ts` types. Money and dates are formatted inline with `toLocaleString()` in about 15 places. `src/lib/professionalApi.ts` is a second fetch wrapper with no timeout and no 401 handling.
- **Severity:** Medium. **Recommendation:** Consume the contracts package (ADR-0003) and the shared formatters, and merge `professionalApi` into `api()`.

### TD-049: Hard-coded English
- **Problem:** Hard-coded English in the assistant UI (`ChatHeader.tsx`, `ChatFooter.tsx`, `ChatBody.tsx`, `assistant/types.ts:59`, `useChat.ts:80-94`), `Footer.tsx:16-32`, `website/serviceDetails.ts`, and `app/error.tsx`, `not-found.tsx`, `loading.tsx`. Backend API messages support en/am, but Agaz also supports `om`.
- **Severity:** Low. This is the scope of the in-progress i18n branch.

### TD-050: Template leftovers and stale docs
- **Problem:**
  - The root package is named `react-example`.
  - The `.env.example` header describes AI Studio and Cloud Run.
  - `dist-i18n-verify/` at the repo root is not gitignored (only the mobile copy is).
  - The README describes `frontend/app/api/[...path]` but not the locale routing.
  - `metadata.json` files are AI Studio artifacts.
- **Severity:** Low.

### TD-054: Minor frontend behaviour bugs
- **Problem:**
  - `useChat.ts:74` parses JSON before checking `ok`, so a non-JSON 502 shows a raw `SyntaxError`.
  - `LanguageSwitcher.tsx:38` drops the query string, which loses the booking pre-fill.
  - "Book another" pushes the same URL, so the receipt probably stays on screen (potential).
  - The theme is applied after hydration, so dark-mode users see a flash of the light theme.
- **Severity:** Low.
