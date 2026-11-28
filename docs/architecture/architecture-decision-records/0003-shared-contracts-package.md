# 0003. Shared API contracts with runtime schemas

- Status: Proposed
- Date: 2026-11-25

## Context

The same API shapes are defined in three places:

1. SQL aliases in the backend.
2. `shared/api.ts` and `shared/types.ts`. The latter still contains prototype types such as `Booking.cleanersCount`, and `ServiceCategory` lacks the `currency` field.
3. `meraki-homes-mobile/src/lib/types.ts`.

`ApiError` is defined twice. Validation is handwritten in each of about 95 handlers, and the regexes are repeated in the clients. Drift has already happened (TD-037, TD-048).

## Decision

Create `shared/contracts/`, organized by module (`bookings.ts`, `catalogue.ts`, `customers.ts`, …). It exports:

- **zod schemas** for request bodies and query strings, plus response schemas for the endpoints the clients consume.
- **Types inferred** from those schemas (`z.infer`).
- The **error envelope** and the stable **error-code enum**.

The server validates input with these schemas at the route layer. The clients import the types, and they may use the schemas for form validation.

`shared/types.ts` is retired type by type as screens move to contract types. The mobile app imports from `@shared/contracts` (the alias already exists in `meraki-homes-mobile/tsconfig.json`), and `src/lib/types.ts` is deleted.

`shared/` stays a source directory consumed through path aliases. It is **not** converted into npm workspace packages for now (see [proposed-repository-structure.md](../proposed-repository-structure.md)).

## Alternatives considered

- **OpenAPI-first with generated clients.** Strong for public APIs. Rejected for now: all three consumers are first-party TypeScript, and code generation adds tooling and review overhead.
- **Types only, no runtime schemas.** Rejected: it does not remove the handwritten validation or prevent runtime drift.
- **valibot / TypeBox.** Both are viable. valibot is smaller for mobile. zod was chosen for ecosystem familiarity. Revisit if mobile bundle size becomes a concern.
- **tRPC.** Rejected: it would change the transport and contract style for every client at once.

## Consequences

- Adds one runtime dependency (`zod`) to the server and clients.
- Contract changes become visible in one diff, and breaking changes for mobile are easier to spot.
- `shared/` must stay free of server-only code, React components and mock data (enforced by lint).
