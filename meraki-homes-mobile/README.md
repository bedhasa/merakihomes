# Meraki Homes Mobile

Native Android and iOS customer app built with Expo SDK 58, React Native, TypeScript and Expo Router. It uses the Meraki Homes Express API and never connects to PostgreSQL directly.

## Development setup

1. Start the isolated PostgreSQL development database from the repository root with `npm run db:dev:setup` if it is not already running.
2. In a repository-root terminal, start the Express API with `npm run dev:api:devdb`. The API uses the existing `.env.dev` development configuration and listens on port 5002.
3. In this directory, install dependencies once with `npm install`.
4. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` (the mobile app must use a device-reachable backend address):
   - Android emulator: `http://10.0.2.2:5002/api`
   - Physical Android/iOS device: `http://<development-computer-LAN-IP>:5002/api` (find the IP in the Expo LAN URL or with `ipconfig`)
5. Start Expo with `npm run start`, then press `a` for Android or scan the development QR code from Expo Go. Android HTTP access to a LAN backend is enabled for development (`usesCleartextTraffic`). Physical phones must use the computer’s LAN IP, not `localhost`.

## Maps and service location picker

- The Nearby tab and the booking form both open the same in-place picker. Confirming a pin on Nearby does not create a booking; it stores the coordinates and address, uses them as the nearby search centre, and passes them into `/booking` so the selected service, package, professional, and schedule are unchanged.
- GPS permission is requested only after the customer taps **Use my current location**. The app never treats an unconfirmed GPS fix as the service address. Manual search remains available if permission is denied, GPS is off, or the fix times out.
- Search suggestions and reverse geocoding use the backend Geoapify adapter (`GET /api/location/search` and `GET /api/location/reverse`). Configure `GEOAPIFY_API_KEY` in the repository-root backend `.env` (or `.env.dev`) to enable both. Do not put that key in the mobile app. Google Places is not called from the client.
- Android uses Google Maps through `react-native-maps` 1.29.11 (`PROVIDER_GOOGLE`). Expo Go includes the native map module and Expo’s Maps API key; it does **not** apply `GOOGLE_MAPS_ANDROID_API_KEY`. For a custom key, enable **Maps SDK for Android**, set `GOOGLE_MAPS_ANDROID_API_KEY` in `.env.local`, then create a new native build (`npx expo run:android` or EAS). Restrict the key to package `com.merakihomes.mobile` and these SHA-1 fingerprints:
  - Local debug / `expo run:android`: the debug keystore (`%USERPROFILE%\.android\debug.keystore`, alias `androiddebugkey`).
  - EAS development builds: the fingerprint shown by `eas credentials` for the development profile.
  - Production / Play Store: the Play App Signing certificate SHA-1 (and the upload key if you also install those APKs directly).
  Changing the key or plugin config does nothing in an already-installed binary until you rebuild.
- iOS uses Apple Maps until a Google Maps key is configured. To use Google Maps on iOS, enable **Maps SDK for iOS**, set `GOOGLE_MAPS_IOS_API_KEY` in `.env.local`, restrict it to bundle `com.merakihomes.mobile`, and rebuild. Do not commit either key. Keep mobile keys limited to the Maps SDK APIs and the application identity; never ship a server geocoding secret in the app.
- Saved-address persistence (`POST /api/customers/me/addresses`) is unchanged. Confirming a map pin fills the current booking location fields; it does not create a stored customer address.

The development computer and physical phone need to share a network that permits API access to port 5002. Expo Go cannot reach a computer through `localhost`, `127.0.0.1`, or `10.0.2.2` from a physical phone. Restart Expo after changing `.env.local` so it reads the new public API URL. Do not put database credentials, payment secrets, or Gemini keys in this app's environment. Use HTTPS for any production API URL.

## Features connected to the API

- Live service catalogue, published packages and questionnaires.
- Customer registration/login with an 8-hour signed bearer token stored in Expo SecureStore; web sessions continue using their existing HttpOnly cookies.
- Multi-service requests, service answers, account addresses, preferred schedule, and server-validated package pricing.
- Backend eligible-worker lookup and optional customer preference; booking requests remain pending until Operations confirms them.
- Account booking history/details, status history, verified-payment summaries, reviews, and worker/schedule/price approvals.
- Guest booking lookup using the request reference and original phone number.
- Account notifications, contact form, and a server-side Gemini assistant when the backend Gemini key is configured.
- Agaz guest chat with temporary 24-hour conversations, authenticated customer history retained for up to 90 days, English/Amharic/Afaan Oromo language selection, and server-validated service/package booking suggestions.

## Integration limitations

- Online payment initiation/refunds and card/wallet storage are not implemented in this app. It shows verified payment records returned by the backend and never creates simulated payments.
- The API has no customer file-upload/storage provider or provider-to-customer chat transport. The old browser demo's fake provider chats, map markers and fabricated provider data are not exposed as live mobile features.
- Agaz returns a clear unavailable response until `GEMINI_API_KEY` is configured on the backend. The key must stay server-side. Set `GEMINI_MODEL=gemini-3.8-flash` (recommended) and `GEMINI_FALLBACK_MODEL=gemini-3-flash-preview` on the API. Daily Gemini quota exhaustion is not retried; temporary 429/503 errors use a short backoff. Language response quality still needs live review after that key is configured.

## Welcome and guest access

The first launch without a customer session or guest choice shows Log in, Create account, and Continue as guest. Guest access is stored in SecureStore (`meraki.guest.access.v1`) and survives app restarts. It is not a customer account. Sign out and End guest session both return to the welcome screen. Authenticated customers skip welcome while their token is valid.
- Customer questionnaire definitions are read from published database versions when configured. The mobile form uses the same service questions as the website while a service has no published database questionnaire.
