# 0005. Stateless API instances behind a trusted proxy

- Status: Proposed
- Date: 2026-11-25

## Context

The API keeps four kinds of state in process memory or on local disk:

- The per-IP rate-limit table (`backend/index.mjs:76`), which grows without bound.
- The geocoding cache and throttle (`index.mjs:20`).
- `agazInFlight` (`index.mjs:20`).
- Uploaded images in `UPLOAD_DIR` on local disk (`index.mjs:123`, `773`).

Express never sets `trust proxy`, so behind the Next.js proxy and Railway's edge `req.ip` is a proxy address. Every user then shares one rate-limit bucket (TD-010). On Railway, local disk is lost on redeploy unless a volume is mounted (TD-020), and a volume pins the service to one instance.

## Decision

1. **Trusted proxy.** Set `app.set('trust proxy', <hop count or CIDR list>)` from configuration (`TRUST_PROXY`), with the value matching the real topology. The Next.js proxy replaces `X-Forwarded-For` with the connecting client IP, taken from the platform-provided header, instead of passing the client's own value through.
2. **Rate limiting.** Use a `RateLimitStore` interface with two implementations: in-memory (with expiry pruning) for development and single-instance deployments, and PostgreSQL (`rate_limit_buckets(key, window_start, count)` with an atomic upsert) for multi-instance deployments. Login limits are keyed by IP **and** by account identifier.
3. **Uploads.** Use a `FileStorage` port with a local-disk adapter for development and an S3-compatible adapter (Cloudflare R2, AWS S3 or Railway object storage) for production. Files are recorded in `file_attachments`. URLs stay `/api/uploads/:id`, served from storage, so the client contract is unchanged.
4. **Caches.** The geocode cache stays per instance with a size cap. It is a best-effort cache, and a miss just costs one provider call. The `agazInFlight` duplicate guard becomes a per-conversation row lock or advisory lock.
5. **Lifecycle.** Graceful shutdown on SIGTERM (`server.close()`, then `pool.end()`), plus pool `connectionTimeoutMillis` and `idleTimeoutMillis` and a server-side `statement_timeout`, all configured from the environment.

Until items 2 and 3 ship, the deployment runs **exactly one** API instance, and this constraint is documented in the README.

## Alternatives considered

- **Redis for rate limits and caches.** Rejected for now: it is new infrastructure for a low-traffic API, and PostgreSQL is already there. Reconsider if rate-limit writes become measurable load.
- **A platform or WAF rate limiter only.** It is a useful complement, but per-account login limits still need application knowledge.
- **A Railway volume for uploads.** Acceptable short term, but it blocks horizontal scaling and has no CDN.

## Consequences

- The API can scale horizontally, and redeploys stop losing images.
- One more migration (`rate_limit_buckets`), one new dependency (an S3 client) and storage credentials to manage.
- Getting `trust proxy` wrong would allow IP spoofing, so the value must be verified against real request headers in staging before it is enabled.
