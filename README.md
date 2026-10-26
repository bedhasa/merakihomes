
# Meraki Homes

Meraki Homes is an Ethiopian home-services platform with a Next.js customer website and booking journey, a separate Vite staff portal, and an Express API backed by PostgreSQL.

## Applications

| Area | Technology | Local URL |
| --- | --- | --- |
| Public website and booking | Next.js App Router | `http://localhost:3000` |
| Staff management portal | Vite + React | `http://localhost:3004` |
| API | Express | `http://localhost:5000` (or `API_PORT` from `.env`) |
| Database | PostgreSQL through Docker Compose | `localhost:5432` |

The public app lives in `frontend/app` and reuses customer UI modules under `frontend/src`. The `frontend/app/api/[...path]` Route Handler forwards `/api/*` requests to the existing Express API, preserving its authentication cookies and API contracts. The staff portal remains in `management/` and continues to use the same API and database.

## Local setup

1. Install Node.js 20.9+ and Docker Desktop.
2. Copy `.env.example` to `.env`; set PostgreSQL and session credentials.
3. Install dependencies with `npm install`.
4. Start PostgreSQL and initialize the database:

   ```sh
   npm run db:up
   npm run db:migrate
   npm run db:seed-demo
   npm run db:verify
   ```

5. In separate terminals, start the API, customer website, and staff portal:

   ```sh
   npm run dev:api
   npm run dev
   npm run dev:management
   ```

   `npm run dev:all` starts all three applications together. Keep `API_PORT` consistent with the API process; the Next.js server reads the workspace `.env` and proxies customer requests to that port.

## Environment variables

- `DATABASE_URL`, `API_PORT`, and `SESSION_SECRET` are server-side settings. Never prefix secrets with `NEXT_PUBLIC_`.
- `API_BASE_URL` can override the API origin for a deployed Next.js server. Otherwise the proxy uses `http://127.0.0.1:${API_PORT || 5000}`.
- `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` are optional public map settings. The default uses OpenStreetMap tiles and attribution.
- `GEOAPIFY_API_KEY` is optional and remains on the Express server.

## Checks

```sh
npm run lint
npm test
npm run build
npm run db:smoke
```

The production build creates the Next.js app in `frontend/.next` and the existing management Vite bundle in `dist-management`. `npm run build` builds both frontends. `npm run start:web` serves the public Next.js app; run the Express API and management Vite app separately in production.

Booking requests remain distinct from confirmed appointments. Demo package prices, worker records, and simulated payment outcomes are clearly labeled; real payment processing and worker verification require their respective providers and operating procedures.
