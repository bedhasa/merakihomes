# Meraki Homes

Meraki Homes runs as two Vite/React frontends and one Express API. Both frontends call the same API; only the API connects to PostgreSQL.

Application code is grouped by area: `backend/` contains the Express API, migrations, and database utilities; `frontend/src/website/` and `frontend/src/booking/` contain the public/customer app; `management/src/` and `management/app/` contain the separate staff portal; `shared/` contains types, API client, catalogue data, and formatting used by both frontends.

## Windows setup

Prerequisites: Node.js 22, npm, and Docker Desktop for Windows with its Linux container engine running.

1. In PowerShell, from the repository root, create a private local `.env` with random database and session credentials:

   ```powershell
   npm run env:local
   ```

2. The `.env` file is ignored by Git. If you create it manually from `.env.example`, replace the database password in both `POSTGRES_PASSWORD` and `DATABASE_URL`, and set a private `SESSION_SECRET` of at least 32 characters.
3. Open Docker Desktop, wait until its engine is ready, then start PostgreSQL:

   ```powershell
   npm run db:up
   docker compose ps
   ```

   The database listens on `localhost:5432` and persists in the named Docker volume `meraki_pgdata`. `npm run db:down` stops the container but keeps this volume.
4. Create the first staff administrator through the private server-side bootstrap command. Set `BOOTSTRAP_STAFF_NAME`, `BOOTSTRAP_STAFF_EMAIL`, and `BOOTSTRAP_STAFF_PASSWORD` in `.env`, then run `npm run staff:bootstrap`. It refuses to create a second bootstrap admin. Remove the bootstrap password from `.env` after use.
   For additional staff, set `STAFF_NAME`, `STAFF_EMAIL`, `STAFF_PASSWORD`, and `STAFF_ROLE` (`admin` or `operations`) in the server environment and run `npm run staff:create`. Staff accounts are provisioned server-side; no staff registration route exists.
5. Start the three processes together:

   ```powershell
   npm run dev:all
   ```

   Or open three PowerShell terminals and run the folder-specific commands below.

## Applications and ports

| Application | URL | Routes |
| --- | --- | --- |
| Public website and customer portal | `http://localhost:3000` | `/`, `/about`, `/services`, `/services/:id`, `/team`, `/contact`, `/faq`, `/blog`, `/booking`, `/booking/:id`, `/login`, `/register`, `/my-account`, `/my-account/bookings`, `/track-booking` |
| Staff management portal | `http://localhost:3004` | `/login`, `/dashboard`, `/bookings`, `/customers`, `/services`, `/contact-submissions` |
| Express API | `http://localhost:5000` | `/api/...` endpoints below |
| PostgreSQL | `localhost:5432` | Docker-managed; never accessed directly by browser code |

Each application folder has its own `package.json`, so `npm run dev` starts the right process from that folder:

```powershell
cd frontend; npm run dev       # public website and customer booking (port 3000)
cd ..\management; npm run dev # staff portal (port 3004)
cd ..\backend; npm run dev    # Express API (API_PORT, normally 5000)
```

From the repository root, `npm run dev` still starts only the public frontend; use `npm run dev:all` to launch all three areas. Both Vite servers load the root `.env` and proxy `/api` to `API_PORT`. Start PostgreSQL first, or the API process exits when database connection/migrations fail.

The Compose and `.env.example` defaults use PostgreSQL port 5432 and API port 5000. If either port is occupied, set `POSTGRES_HOST_PORT` and `API_PORT` in `.env`; make sure `DATABASE_URL` uses the selected PostgreSQL host port. Vite's `/api` proxy follows `API_PORT`.

## Database and migrations

The backend lives in `backend/` and uses PostgreSQL via the `pg` driver. Numbered SQL migrations in `backend/migrations/` run transactionally at API startup and are tracked in `schema_migrations`. They create the service catalogue, customers and contacts/addresses, customer credentials, staff roles/permissions, workers and qualifications/availability, bookings and status history, assignments, quotations, payments/refunds, price-change requests, contact submissions, complaints, restrictions, notifications, and audit logs. Catalogue seed data is added only when the services table is empty. Foreign keys restrict deletion of booking and financial history.

The previous local SQLite file is not removed or overwritten. To copy its supported service, booking, status-history, contact, and audit data into PostgreSQL, start PostgreSQL and run:

```powershell
$env:SQLITE_SOURCE = ".\\data\\meraki.sqlite"
npm run migrate:sqlite
Remove-Item Env:SQLITE_SOURCE
```

The script inserts into PostgreSQL without deleting the SQLite source and does not overwrite rows already present. Keep a separate backup before any migration and compare the printed row counts. The local SQLite database currently used by the previous demo remains available for rollback.

Use `npm run db:migrate` to apply numbered migrations and seed the service catalogue, `npm run db:verify` to check services, constraints, and indexes, and `npm run db:smoke` to create a temporary guest booking through the live API, verify staff retrieval before and after an API process restart, then remove the temporary records.

## Authentication and privacy

- Customer registration and sign-in use a password hash and an `HttpOnly`, `SameSite=Lax` customer session cookie. Customer account APIs filter bookings by the authenticated customer ID. Guest requests are not linked to accounts until identity verification is implemented; guests track requests with reference plus phone.
- Staff sign-in is a separate endpoint and cookie. There is no public staff registration. The first admin is provisioned by the private bootstrap command. Management endpoints query staff role permissions on the server for every protected operation; customer credentials cannot authorize staff requests.
- Set `SESSION_SECRET` to at least 32 random characters. Production cookies also use `Secure` when `NODE_ENV=production`. Serve production over HTTPS.
- Do not expose `DATABASE_URL`, PostgreSQL credentials, or session secret in `VITE_*` variables or frontend code.

## API overview

| Method | Path | Access / behavior |
| --- | --- | --- |
| GET | `/api/health` | Database health check |
| GET | `/api/services` | Active catalogue and starting estimates |
| GET | `/api/location/search?q=...` | Server-side Geoapify search; unavailable until `GEOAPIFY_API_KEY` is set; manual entry always works |
| POST | `/api/bookings` | Validated guest/account request; service answers and location metadata persist; stays pending |
| POST | `/api/bookings/lookup` | Minimal guest status, requires reference and phone |
| POST | `/api/customers/register`, `/api/customers/login` | Customer account only |
| GET | `/api/customers/me`, `/api/customers/me/bookings` | Own account and bookings only |
| POST | `/api/contact` | Public contact submission, persisted |
| POST | `/api/management/auth/login` | Staff sign-in; no public staff registration |
| GET | `/api/management/bookings` | Staff permission `bookings.read` |
| GET | `/api/management/bookings/:id` | Authorized booking detail, status history, reschedule proposals, and audit activity |
| PATCH | `/api/management/bookings/:id/status` | Staff permission `bookings.cancel`; reason required |
| PATCH | `/api/management/bookings/:id/location` | `bookings.manage`; verified location changes are audited |
| POST | `/api/management/bookings/:id/notes` | `bookings.manage`; internal notes and audit are committed together |
| POST | `/api/management/bookings/:id/reschedule-proposals` | `bookings.manage`; proposal is stored pending customer approval, existing schedule stays unchanged |
| GET | `/api/management/customers` | Staff permission `customers.read` |
| GET/PATCH | `/api/management/services[/:id]` | Read permission; edit requires admin `services.manage` |
| GET | `/api/management/contact-submissions` | Staff permission `contacts.read` |

## Verified behavior and outstanding business integrations

Guest booking, database-backed service retrieval, structured service answers, address search integration, Leaflet/OpenStreetMap pin selection, manual-address fallback, persistent contact submissions, reference/phone tracking, customer account registration/login and own-booking isolation, staff login, server-enforced staff permissions, booking cancellation history/audit, location review, internal notes, reschedule proposals, and service price/active-state editing are implemented. `npm test` uses PGlite (PostgreSQL-compatible embedded engine) for API integration tests; it does not verify the live Docker database.

Booking submission remains a request with a pending status; location review is tracked separately and starts pending. Operations can cancel eligible pending requests, record address review, add internal notes, and propose a reschedule. Appointment confirmation and worker assignment are intentionally unavailable until real worker qualifications/schedules, conflict-safe availability checks, and any required customer approval are wired into the Operations workflow. Reschedule proposals remain pending because guest approval/verification is not implemented. No payment provider is connected, so payment/refund screens and verification are not represented as live. Customer email/phone verification, staff password reset/MFA, complaint evidence workflows, and complete production backup/restore procedures remain follow-up work. Cancellation policy amounts and payment split policies remain unresolved in the supplied business-rules document.

For location search, set `GEOAPIFY_API_KEY` in the backend environment. The server uses Geoapify's geocoding endpoint with a five minute in-process cache and a 4 requests/second application throttle. The current free plan advertises 3,000 credits/day and up to 5 requests/second; check the provider dashboard and terms before real traffic, and keep the required attribution visible. OpenStreetMap map tiles are attributed in Leaflet; its public tile service is subject to its usage policy and is not a production SLA.

## Checks

```powershell
npm run lint
npm test
npm run build
```

The build creates `dist/` for the public application and `dist-management/` for the staff portal.

## Troubleshooting

- **Docker pipe/engine unavailable:** open Docker Desktop and wait for “Engine running”; `docker info` should show a server version before `npm run db:up`.
- **Port already in use:** stop the existing process bound to 3000, 3004, 5000, or 5432 before starting the matching service.
- **API cannot connect:** check `DATABASE_URL`, `POSTGRES_PASSWORD`, and `docker compose ps`; the API runs migrations at startup and will not run against an unavailable database.
- **Staff sign-in fails:** run `npm run staff:bootstrap` once with bootstrap variables set before an admin account exists. There is intentionally no browser-based staff registration.
- **Frontend route gives a blank page:** start the correct Vite server (`npm run dev` for port 3000; `npm run dev:management` for 3004) and inspect its terminal for build errors.
