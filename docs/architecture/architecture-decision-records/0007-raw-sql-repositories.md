# 0007. Keep `pg` with handwritten SQL in repositories (no ORM)

- Status: Proposed
- Date: 2026-11-25

## Context

The backend uses `pg` with parameterized SQL. No injection was found. The schema and queries depend on PostgreSQL-specific features:

- the `btree_gist` exclusion constraint on reservations;
- partial unique indexes;
- `pg_advisory_xact_lock` and `FOR UPDATE OF` for assignment;
- `json_agg` / `FILTER` for read models;
- `make_interval` and `tstzrange` for availability.

The problem is *where* SQL lives (inside route handlers, duplicated) and the lack of typed row mapping, not the use of SQL itself.

## Decision

Keep `pg` and SQL.

- Each module gets a `*.repository.ts` of plain functions that take a `Queryable` (a pool or transaction client) and return typed, camelCase objects.
- Transactions are opened by services through `withTransaction`.
- Migrations stay as forward-only SQL files, and the migrator gets an advisory lock and checksums.
- Optionally, row types can be generated from the live schema later (for example with `kanel` or `pgtyped`) if handwritten types prove hard to maintain.

## Alternatives considered

- **Prisma.** Weak support for exclusion constraints, advisory locks and partial indexes (these would need raw SQL anyway). Its own migration system would conflict with the existing 19 SQL migrations.
- **Drizzle / Kysely** (typed query builders). Reasonable, and Kysely in particular fits well. Rejected for now because rewriting about 150 queries carries real regression risk for limited gain. Kysely can be adopted for new modules later without conflict.
- **TypeORM / Sequelize.** Rejected: heavy, and they push toward active-record patterns that hide transactions.

## Consequences

- Full PostgreSQL capability, with no query-rewrite risk.
- Row types are written by hand and must be kept in sync with migrations. Integration tests catch drift.
- SQL review skill remains a team requirement.
