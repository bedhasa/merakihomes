# 0004. Use real Next.js App Router routes for the public site

- Status: Proposed
- Date: 2026-11-25

## Context

The public site has a single catch-all route, `frontend/app/[locale]/[[...slug]]/page.tsx`. It renders one client component, `frontend/src/App.tsx`, which keeps the current path in React state and picks a view with `if/else`. `MarketingView.tsx` runs a second page state machine inside that.

Effects (TD-039):

- Unknown URLs return HTTP 200 instead of 404.
- Navigation uses `<button onClick>`, which crawlers cannot follow.
- The service catalogue is fetched client-side, so service pages arrive as loading placeholders.
- There is no sitemap or hreflang.
- Every route ships every view, because only the booking view is code-split.
- The path is held in three places: the URL, App's state and MarketingView's state.

## Decision

Migrate page by page to real App Router segments under `app/[locale]/`:

1. `/`, `/about`, `/contact`, `/faq`: Server Components with static messages.
2. `/services` and `/services/[id]`: Server Components that fetch the catalogue on the server (revalidated), call `notFound()` for unknown ids, and have per-page `generateMetadata`.
3. `/booking`: a client island (the existing `RequestFlow`), loaded only on this route.
4. `/account` and `/track`: client islands.
5. Add `sitemap.ts`, `robots.ts`, hreflang `alternates`, and a real `not-found.tsx` with a 404 status.

Navigation uses `next-intl`'s `<Link>`. Each migrated path is removed from the `App.tsx` `pageByPath` map. When the map is empty, `App.tsx` and the catch-all route are deleted.

## Alternatives considered

- **Keep the SPA shell.** Rejected: SEO and performance are measurable business costs for a marketplace that depends on discoverability.
- **Big-bang rewrite of all pages.** Rejected: high risk and conflicts with the in-progress i18n work in the same files.

## Consequences

- Better SEO, real HTTP status codes and smaller per-route bundles.
- During the migration, the catch-all route serves only the pages not yet migrated. Real segments take precedence over the optional catch-all, so the two coexist safely.
- The work must start after the i18n branch merges, because both touch the same components.
