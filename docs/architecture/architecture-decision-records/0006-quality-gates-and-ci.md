# 0006. ESLint, Prettier and CI as mandatory quality gates

- Status: Proposed
- Date: 2026-11-25

## Context

The only static check is `tsc --noEmit` (`npm run lint`), and it does not cover the backend. There is no formatter. As a result, three core files (`backend/index.mjs`, `management/src/ManagementApp.tsx`, `management/src/BookingDetailModal.tsx`) are written as minified-style lines of up to 4,000 characters, which makes diffs unreviewable.

There is no active CI. `.github/workflows/ci.yml.proposed` exists but is not enabled, and it targets Node 20 while some scripts need Node 22.

## Decision

1. **Prettier** for formatting the whole repository (printWidth 110, singleQuote, trailingComma all). The first formatting run lands as a **separate, behaviour-neutral commit**, listed in `.git-blame-ignore-revs`, after in-flight branches merge.
2. **ESLint** (flat config) with:
   - `typescript-eslint` recommended rules.
   - `react-hooks`.
   - `import/no-cycle`.
   - `no-restricted-imports` to enforce the architecture's dependency rules: clients must not import `backend/`; `shared/` must not import React or mock data; a module may import only another module's `index.ts`; `domain` files must not import `pg` or `express`.
   - `no-console` in application code, except through the logger.
3. **Scripts:**
   - `npm run format` / `format:check`.
   - `npm run lint` becomes ESLint.
   - `npm run typecheck` (root + backend + mobile).
   - `npm run check` runs everything.
4. **CI** (GitHub Actions, Node 22):
   - `npm ci` (root and mobile).
   - `format:check`, `lint`, `typecheck`.
   - `npm test`, which includes `i18n:check`.
   - `npm run build`.
   - A job with a PostgreSQL 16 service that runs migrations from empty and the exclusion-constraint tests.
   - `npm audit --audit-level=high`.
   - Required for merges to `main`.
5. **Pre-commit:** none at first. CI is the gate; local hooks are optional for developers. Adding husky and lint-staged can come later if the team wants it.

## Alternatives considered

- **Biome** (one fast tool covering formatting and linting). Attractive, but its import-boundary rules are less mature than ESLint's. Reconsider later.
- **Format only the changed files.** Rejected: it would leave the minified files unreadable indefinitely.

## Consequences

- One large formatting diff, isolated and ignored by blame.
- New dev dependencies: eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-import, prettier.
- Merges are blocked on red CI, so the existing green baseline (46/46 tests) must be kept.
