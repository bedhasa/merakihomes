# Architecture Decision Records

Each ADR records one significant decision: its context, the alternatives considered, the decision itself and its consequences. ADRs are immutable once accepted. To change a decision, write a new ADR that supersedes the old one.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-modular-monolith-backend.md) | Modular monolith with layered modules for the API | Proposed |
| [0002](0002-typescript-backend.md) | Migrate the backend to TypeScript incrementally | Proposed |
| [0003](0003-shared-contracts-package.md) | Shared API contracts with runtime schemas | Proposed |
| [0004](0004-app-router-real-routes.md) | Use real Next.js App Router routes for the public site | Proposed |
| [0005](0005-stateless-api-instances.md) | Stateless API instances behind a trusted proxy | Proposed |
| [0006](0006-quality-gates-and-ci.md) | ESLint, Prettier and CI as mandatory quality gates | Partly accepted (Prettier) |
| [0007](0007-raw-sql-repositories.md) | Keep `pg` with handwritten SQL in repositories (no ORM) | Proposed |

Status values: `Proposed`, `Accepted`, `Superseded by NNNN`, `Rejected`.

Template:

```md
# NNNN. Title
- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD
## Context
## Decision
## Alternatives considered
## Consequences
```
