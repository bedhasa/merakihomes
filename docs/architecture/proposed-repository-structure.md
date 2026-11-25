# Proposed Repository Structure

| | |
|---|---|
| **Date** | 2026-11-25 |
| **Status** | Proposed. It follows [target-architecture.md](target-architecture.md) and ADRs 0001–0007. |

## Guiding choices

- **Keep the four application directories where they are:** `backend/`, `frontend/`, `management/` and `meraki-homes-mobile/`. Renaming them to `apps/*` would mean changing Vercel, Railway, EAS, Metro, tsconfig paths and scripts, and it would conflict with in-flight branches. None of that solves an actual problem we found. Clarity comes from what is *inside* each application.
- **Keep `shared/` as one source directory consumed through path aliases** (`@shared/*`), with subfolders that have clear responsibilities. Converting it into npm workspace packages can come later if publishing or versioning is ever needed.
- **Move nothing just for tidiness.** Every move below has a named debt item behind it.

## Target tree

```
merakihomes/
├── backend/                         Express API (modular monolith, ADR-0001)
│   ├── src/
│   │   ├── server.ts                Process entry: load config, connect, listen, graceful shutdown
│   │   ├── app.ts                   createApp({pool, ...}): composition root, registers module routes
│   │   ├── platform/                Cross-cutting infrastructure; never imports modules/
│   │   │   ├── config/              Validated environment (fail fast); feature flags (DEMO_*)
│   │   │   ├── db/                  createPool, withTransaction, Queryable type, migrator (lock + checksum)
│   │   │   ├── http/                errors (typed), errorHandler, asyncRoute, validate(schema), cors,
│   │   │   │                        securityHeaders, requestId, rateLimit (+ stores)
│   │   │   ├── auth/                passwords (scrypt), tokens (HMAC + session_version), cookies,
│   │   │   │                        requireCustomer / requireStaff(permission) / requireProfessional
│   │   │   ├── i18n/                (today's backend/i18n.mjs) localized API messages
│   │   │   ├── logging/             Structured logger with redaction
│   │   │   ├── storage/             FileStorage port + local and S3 adapters
│   │   │   └── time/                Addis Ababa time helpers (one copy of addisTimeParts)
│   │   └── modules/
│   │       ├── catalogue/           services, packages, questionnaires
│   │       ├── customers/           accounts, auth (cookie + bearer transports), addresses
│   │       ├── bookings/            request creation, lookup, lifecycle, proposals, approvals, reviews
│   │       │   ├── bookings.routes.ts         customer and public routes
│   │       │   ├── bookings.admin.routes.ts   /api/management/bookings/*
│   │       │   ├── bookings.service.ts
│   │       │   ├── lifecycle.domain.ts        the ONE booking/item state machine
│   │       │   ├── estimate.domain.ts
│   │       │   ├── bookings.repository.ts
│   │       │   ├── bookings.queries.ts        read models for staff screens
│   │       │   ├── index.ts                   public API of the module
│   │       │   └── __tests__/
│   │       ├── workforce/           workers, eligibility (the ONE availability query), assignments
│   │       ├── professionals/       professional self-service, nearby, location sharing
│   │       ├── payments/            demo payments, receipts, PaymentProvider port
│   │       ├── staff/               staff auth, RBAC, staff admin
│   │       ├── content/             promotions, contact submissions, uploads
│   │       ├── assistant/           Agaz (today's agaz-gemini.mjs becomes gemini.adapter.ts)
│   │       ├── location/            geocoding (today's geo.mjs becomes geo.domain.ts + geoapify.adapter.ts)
│   │       └── audit/               audit.record(), audit search
│   ├── migrations/                  Forward-only SQL (unchanged location)
│   ├── scripts/                     seed-demo, create-staff, verify-db, smoke-live, legacy sqlite tools
│   ├── test/                        Shared test harness (PGlite pool factory, fixtures, factories)
│   └── tsconfig.json
│
├── frontend/                        Next.js public site (ADR-0004)
│   ├── app/[locale]/
│   │   ├── page.tsx                 Home (Server Component)
│   │   ├── about/ contact/ faq/
│   │   ├── services/page.tsx        Server-fetched catalogue
│   │   ├── services/[id]/page.tsx   notFound() for unknown ids, generateMetadata
│   │   ├── booking/page.tsx         Client island: RequestFlow
│   │   ├── account/ track/          Client islands
│   │   ├── not-found.tsx  sitemap.ts  robots.ts
│   ├── app/api/[...path]/route.ts   Hardened reverse proxy (timeouts, header allow-list)
│   ├── proxy.ts                     next-intl middleware
│   └── src/
│       ├── features/                Feature folders (component + hooks + local logic)
│       │   ├── booking/             RequestFlow split into steps/ + useBookingForm reducer
│       │   ├── account/
│       │   ├── tracking/
│       │   ├── assistant/
│       │   └── marketing/           home sections, about, services pages
│       ├── components/              Presentational, app-agnostic UI (buttons, cards, BrandMark)
│       ├── i18n/                    next-intl config, translateDynamic, useApiErrorMessage
│       └── lib/                     Web-only helpers (theme, analytics)
│
├── management/                      Staff portal (Vite SPA)
│   ├── app/                         Vite entry (index.html, main.tsx)
│   └── src/
│       ├── App.tsx                  Shell + router (react-router or a small typed route table)
│       ├── auth/                    StaffSessionProvider, usePermission, 401 → login redirect
│       ├── pages/                   One file per page (Dashboard, Bookings, Payments, Staff, ...)
│       ├── features/bookings/       BookingDetailModal split into panels
│       └── components/              ConfirmDialog, ImageUploadField, errorText (one copy)
│
├── meraki-homes-mobile/             Expo app (customer + professional)
│   ├── app/                         expo-router screens (unchanged)
│   └── src/
│       ├── lib/                     api.ts (one fetch wrapper incl. professional), query.ts
│       ├── components/              Native UI only
│       └── context/                 AuthContext
│
├── shared/                          Client-safe code shared by all apps; no server code, no React, no mocks
│   ├── contracts/                   zod schemas + inferred types + error codes, per module (ADR-0003)
│   ├── api-client/                  Typed fetch client used by web + management (split by audience:
│   │                                customer.ts, management.ts; image compression moves to management)
│   ├── formatting/                  Locale-aware money/date/number formatting (today's utils/formatters.ts)
│   ├── reference/                   Real reference data, e.g. ADDIS_NEIGHBORHOODS (moved out of mocks)
│   └── locales/                     en/am catalogs, config, loader (unchanged)
│
├── scripts/                         Repo-level dev orchestration (dev-all, env, i18n checks)
├── docs/
│   ├── architecture/                Assessment, debt register, target architecture, ADRs, roadmap
│   ├── engineering/                 Engineering standards
│   └── operations/                  Deployment, migrations, runbooks (to be written)
├── .github/workflows/ci.yml
├── docker-compose.yml, docker-compose.dev.yml
├── eslint.config.js, .prettierrc, .git-blame-ignore-revs
└── package.json                     Renamed from "react-example" to "meraki-homes"
```

## Responsibilities and rules

| Directory | Responsibility | Rules |
|---|---|---|
| `backend/src/platform/` | Infrastructure every module needs | Must not import from `modules/`. No business rules. |
| `backend/src/modules/<m>/` | One business capability end to end | Other modules import only `index.ts`. Owns its tables. |
| `*.routes.ts` | HTTP mapping | No SQL, no business rules, no transactions. |
| `*.service.ts` | Use cases, transactions, ownership checks, audit | No `req`/`res`. |
| `*.domain.ts` | Pure business rules | No I/O, no framework imports; `now` is passed in. |
| `*.repository.ts` / `*.queries.ts` | SQL | Parameterized only; returns camelCase typed objects. |
| `*.adapter.ts` | Third-party APIs | Timeouts and retries; no provider types leak out. |
| `backend/migrations/` | Schema history | Forward-only; never edit an applied file. |
| `backend/scripts/` | Operator tools | Never apply migrations implicitly; refuse non-local DBs unless `--allow-remote`. |
| `backend/test/` | Test harness | Fixtures and factories, not production code. |
| `frontend/src/features/` | A user-facing capability | Features may use `components/`, `shared/`; not each other's internals. |
| `frontend/src/components/` | Reusable presentational UI | No data fetching. |
| `shared/contracts/` | Wire contracts | Zero runtime dependencies besides zod. |
| `shared/api-client/` | Browser fetch client | Imports contracts; no React. |
| Tests | Next to the code (`__tests__/` or `*.test.ts`) | Integration harness lives in `backend/test/`. |
| Configuration | Environment variables, validated in `backend/src/platform/config` | `.env.example` is the documented catalog. |

## Files removed (TD-041)

Removed on 2026-11-25 after approval. The details are in the [roadmap implementation log](refactoring-roadmap.md#2026-11-25-dead-code-removal-21-approved). `CustomerView.tsx` was deleted entirely, and `App.tsx` now loads `RequestFlow` directly. The root `metadata.json` and the `vercel.json` decision remain open.

| Path | Reason |
|---|---|
| `frontend/src/booking/steps/` | Not imported anywhere |
| Unreachable parts of `frontend/src/booking/CustomerView.tsx` (keep only the RequestFlow pass-through, or call RequestFlow directly from the booking route) | Never rendered |
| `frontend/src/assistant/{DateSeparator,EmptyChatState}.tsx`, `mockResponses.ts`, `frontend/src/website/home/StatisticsSection.tsx` | Not imported |
| `management/src/{AdminView,WorkerView,AuditReportView,LiveOperationsPanel}.tsx`, `management/src/cms/`, `management/src/safety/` | Not imported |
| `shared/data/auditData.ts`, `shared/data/timeSlots.ts`, the mock parts of `shared/data/mockServices.ts` | Used only by dead code (move `ADDIS_NEIGHBORHOODS` and the FX constant first) |
| `meraki-homes-mobile/{index.html,vite.config.ts,metadata.json}`, `src/{main.tsx,App.tsx,index.css}`, `src/context/AppContext.tsx`, `src/types/index.ts`, `src/components/{BookingModal,HomeTab,ServicesTab,NearbyTab,BookingsTab,ProfileTab,ProviderModal,ChatModal,ReceiptModal,Header,PhoneFrame,BottomNav}.tsx` | AI Studio web prototype; imports modules that no longer exist |
| Root `metadata.json`, one of the two `vercel.json` files (after confirming which one the Vercel project uses) | Template leftover / conflicting configuration |

## Migration order

The structure is reached incrementally, in this order (details in the [refactoring roadmap](refactoring-roadmap.md)):

1. Dead-code removal and Prettier, so that later diffs are readable.
2. `backend/src/platform/` extracted from `index.mjs`. The routes stay in place.
3. Modules extracted one at a time, in increasing order of risk: content → location → assistant → catalogue → staff → customers → payments → professionals → workforce → bookings.
4. `shared/contracts/` grows alongside each module.
5. Frontend routes migrate page by page (ADR-0004).
