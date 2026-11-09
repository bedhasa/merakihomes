
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

### Mobile development database and pgAdmin

The mobile app writes through the Express API to the isolated `meraki_homes_dev` PostgreSQL database. Customer sign-ups, sign-ins, saved addresses, and guest booking requests are stored there. Start or update the local database and pgAdmin with:

```sh
npm run db:dev:setup
npm run dev:api:devdb
```

Open pgAdmin at `http://localhost:5050`. The local pgAdmin login is `admin@merakihomes.com`; its generated password is stored in the ignored `.env.dev` file. The `Meraki Homes Dev` server is preloaded. On first connect, use the database password from `.env.dev` for user `meraki_dev`. The pgAdmin and PostgreSQL host ports bind to localhost only.

## Environment variables

- `DATABASE_URL`, `API_PORT`, and `SESSION_SECRET` are server-side settings. Never prefix secrets with `NEXT_PUBLIC_`.
- `API_BASE_URL` can override the API origin for a deployed Next.js server. Otherwise the proxy uses `http://127.0.0.1:${API_PORT || 5000}`.
- `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` are optional public map settings. The default uses OpenStreetMap tiles and attribution.
- `GEOAPIFY_API_KEY` is optional and remains on the Express server. Address search returns a configuration error instead of invented results when the key is missing.
- `GEMINI_API_KEY` is required for Agaz and remains on the Express server. Set `GEMINI_MODEL` (recommended: `gemini-3.8-flash`) and optional `GEMINI_FALLBACK_MODEL` (`gemini-3-flash-preview`). New Gemini API projects reject `gemini-2.5-flash` with HTTP 404. Do not put Gemini or Geoapify keys in the mobile app.
- Mobile Google Maps keys (`GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY`) are native build-time values in `meraki-homes-mobile/.env.local`. They are injected into Android/iOS config only, never into JS `extra`. Expo Go uses Expo’s Maps credentials; a custom key requires `npx expo run:android` or an EAS development/production build after the key changes. Restrict the Android key to package `com.merakihomes.mobile` and the SHA-1 of the debug keystore for local development, plus the Play App Signing / EAS production certificate for store builds.

## Checks

```sh
npm run lint
npm test
npm run build
npm run db:smoke
```

The production build creates the Next.js app in `frontend/.next` and the existing management Vite bundle in `dist-management`. `npm run build` builds both frontends. `npm run start:web` serves the public Next.js app; run the Express API and management Vite app separately in production.

Booking requests remain distinct from confirmed appointments. Demo package prices, worker records, and simulated payment outcomes are clearly labeled; real payment processing and worker verification require their respective providers and operating procedures.
