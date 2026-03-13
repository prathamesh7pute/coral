# Coral v2 Milestone Issue List

Last updated: 2026-03-13

Use this file as a ready-to-create issue backlog. Each item is intentionally small and maps to one or two roadmap phases.

## Alpha milestone (core extraction + mongoose parity)

- [x] V2-001: Write v2 charter and KPI document.
- [ ] V2-002: Add v1 golden behavior tests for CRUD and query paths.
- [x] V2-003: Add npm workspaces, monorepo package skeleton, and contributor notes while keeping root `coral` publishable.
- [x] V2-004: Publish product-line, semver, and deprecation policy for `coral` and `@coral-kit/*`.
- [ ] V2-005: Define canonical Coral query DSL spec.
- [ ] V2-006: Define adapter capability model and fallback rules.
- [ ] V2-007: Implement `CoralAdapter` interface in `@coral-kit/core`.
- [ ] V2-008: Build reusable adapter compliance test harness.
- [ ] V2-009: Extract Mongoose runtime into `@coral-kit/adapter-mongoose`.
- [ ] V2-010: Add parity test suite to ensure v1 behavior is unchanged.

Exit criteria:
- Mongoose adapter passes contract suite.
- Existing consumers can run without breaking API changes.

Completed references:
- V2-001: [`roadmap/v2/CHARTER_AND_KPIS.md`](roadmap/v2/CHARTER_AND_KPIS.md)
- V2-003: workspace and package scaffold in `packages/*`, root workspaces config, and updated contributor guidance.
- V2-004: [`roadmap/v2/PRODUCT_LINE_AND_VERSIONING_POLICY.md`](roadmap/v2/PRODUCT_LINE_AND_VERSIONING_POLICY.md)

## Beta milestone (multi-DB + OpenAPI + MCP)

- [ ] V2-011: Implement Prisma adapter MVP (SQLite + Postgres).
- [ ] V2-012: Add Prisma advanced features (relations, nested writes, tx).
- [ ] V2-013: Publish Prisma compatibility policy (including Mongo caveats).
- [ ] V2-014: Implement Knex adapter MVP (Postgres).
- [ ] V2-015: Add Knex dialect support (MySQL, SQLite, MariaDB).
- [ ] V2-016: Add validation layer (JSON Schema or Zod) for requests.
- [ ] V2-017: Generate OpenAPI 3.1 with stable operation IDs.
- [ ] V2-018: Implement `@coral-kit/mcp-server` with stdio + HTTP transports.

Exit criteria:
- Prisma and Knex adapters pass contract tests for supported DBs.
- OpenAPI and MCP integration tests are green.

## RC milestone (AI and production hardening)

- [ ] V2-019: Add `AGENTS.md`, `.codex/skills`, and `llms.txt`.
- [ ] V2-020: Add multi-agent templates (planner/executor/reviewer patterns).
- [ ] V2-021: Add tracing, request correlation IDs, and audit events.
- [ ] V2-022: Add security and supply-chain gates (audit, CodeQL, provenance).

Exit criteria:
- AI/agent docs and templates are usable end-to-end.
- Security gates are mandatory in CI for release branches.

## GA milestone (publish + migration)

- [ ] V2-023: Implement workspace release automation, scoped publish flow from the current repo, and package smoke tests.
- [ ] V2-024: Publish migration guide, cookbook, and launch checklist.

Exit criteria:
- Tag-to-publish flow is reproducible.
- Migration from v1 to v2 is documented and validated.

## Post-v2 operational backlog

- [ ] OPS-001: Transfer the repository to the `coral-kit` GitHub org after v2 GA.
- [ ] OPS-002: Update package metadata, trusted publisher settings, and release automation after the repo transfer.

## Suggested labels

- `v2`
- `milestone:alpha` / `milestone:beta` / `milestone:rc` / `milestone:ga`
- `area:core` / `area:adapter` / `area:mcp` / `area:docs` / `area:security`
- `type:feature` / `type:tech-debt` / `type:docs`

## Suggested issue template fields

- Problem statement
- Scope
- Out of scope
- Acceptance criteria
- Test plan
- Rollback plan
