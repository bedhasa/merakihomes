# 0002. Migrate the backend to TypeScript incrementally

- Status: Proposed
- Date: 2026-11-25

## Context

Every client (web, management, mobile) and `shared/` is written in TypeScript and typechecked. The backend is untyped ESM JavaScript (`.mjs`) and is not typechecked at all. Several defects in the debt register are the kind a type checker or typed row mappers would surface: swapped positional parameters (TD-001), inconsistent response casing (TD-036), and drift between server responses and client types (TD-037). The repo already depends on `typescript`, `tsx` and `esbuild`.

## Decision

- New backend modules (ADR-0001) are written in TypeScript (`.ts`) under `backend/src/`.
- Existing `.mjs` files keep working. `backend/tsconfig.json` sets `allowJs` and `checkJs: false` at first, so the files can coexist and be migrated one at a time.
- Development and tests run through `tsx`, which is already used by `npm test`.
- Production runs compiled JavaScript produced by `esbuild` (already a dev dependency) into `backend/dist/`. The Railway start command becomes `node backend/dist/server.js`. Running `tsx` in production is avoided.
- `strict: true` for all new files.
- The typecheck becomes part of `npm run typecheck` and CI.

## Alternatives considered

- **JSDoc + `// @ts-check` in the `.mjs` files.** Lower friction, with no build step. Rejected as the end state: the syntax is verbose for row types and generics, and people stop maintaining it. It remains acceptable as a stop-gap on files not yet migrated.
- **Run `tsx` in production.** Rejected: it adds startup cost and uses a loader not designed for production.
- **Big-bang conversion.** Rejected: too risky given the dense code and the uncommitted work in progress.

## Consequences

- A build step for the API. `railway.json` needs a build command (`npm run build:api`).
- Shared contract types (ADR-0003) can be imported by the server, closing the type loop end to end.
- During the transition, types are only as good as the boundaries that have been migrated.
