# Coral v2 Roadmap

Last updated: 2026-02-26

## Goals

- Make Coral database-agnostic with a stable adapter contract.
- Keep v1 users safe with migration-friendly compatibility.
- Make Coral first-class for AI agents (OpenAPI + MCP + structured contracts).
- Keep code quality strict and publish-ready at every stage.

## Non-negotiable quality gates (apply to every phase)

- `npm run check:ci` passes.
- Typecheck passes for changed packages.
- Tests for changed packages stay at 100% coverage on critical paths.
- No breaking public API change without migration note.
- Release artifacts are reproducible (`npm pack` smoke checks in CI).

## Delivery tracks

- Track A: Core and adapters.
- Track B: AI/MCP and agent ergonomics.
- Track C: Security, release engineering, and docs.

## 24 Granular Phases

### Phase 01 - Charter and boundaries
- Define v2 success metrics: adoption, DB coverage, AI toolability, migration effort.
- Lock explicit non-goals for v2.0.
- Exit criteria: approved charter doc and decision record.

### Phase 02 - v1 behavior freeze
- Add golden tests and response snapshots for current v1 behavior.
- Tag baseline fixtures used for compatibility checks.
- Exit criteria: parity suite can detect v2 drift.

### Phase 03 - Monorepo layout bootstrap
- Introduce package folders: `core`, adapters, `mcp-server`.
- Keep v1 runtime untouched while scaffolding v2.
- Exit criteria: folders and package metadata committed.

### Phase 04 - Public API compatibility policy
- Define semantic versioning rules per package.
- Define deprecation windows and removal policy.
- Exit criteria: policy doc referenced by CONTRIBUTING and releases.

### Phase 05 - Canonical Coral query DSL
- Specify neutral filter/sort/pagination/select DSL independent of DB.
- Document unsupported/adapter-specific features.
- Exit criteria: DSL spec with examples and edge-case matrix.

### Phase 06 - Capability model
- Define adapter capability flags (`transactions`, `relations`, `subDoc`, `bulkWrite`, etc.).
- Define fallback behavior when capability is absent.
- Exit criteria: capability contract in `@coral/core`.

### Phase 07 - Adapter interface v1
- Implement `CoralAdapter` contract and shared error shape.
- Add strict request/response types and normalized error codes.
- Exit criteria: compile-safe adapter SDK published in repo.

### Phase 08 - Adapter contract tests
- Build shared adapter compliance suite.
- Add fixtures for CRUD/query/pagination/error parity.
- Exit criteria: adapter test harness reusable by all adapters.

### Phase 09 - Mongoose adapter extraction
- Move current Mongoose-specific logic to `@coral/adapter-mongoose`.
- Preserve existing behavior for current users.
- Exit criteria: v1 behavior parity passes.

### Phase 10 - Mongoose parity hardening
- Run old and new pipelines side-by-side in tests.
- Fix drift in status codes, pagination semantics, and edge cases.
- Exit criteria: zero parity regressions.

### Phase 11 - Prisma adapter MVP
- Build `@coral/adapter-prisma` for SQL-first target (SQLite/Postgres first).
- Implement CRUD + filtering + pagination + sorting.
- Exit criteria: contract tests green for supported providers.

### Phase 12 - Prisma advanced flows
- Add relation includes/selects, nested writes, and transaction wrappers.
- Define provider constraints and version policy.
- Exit criteria: advanced scenarios covered and documented.

### Phase 13 - Prisma compatibility policy
- Document Prisma Mongo version caveats and migration limitations.
- Provide explicit supported-version table.
- Exit criteria: compatibility matrix merged into docs.

### Phase 14 - Knex adapter MVP
- Build `@coral/adapter-knex` for SQL teams needing query-builder control.
- Provide schema mapping strategy and safe defaults.
- Exit criteria: Postgres MVP passes adapter contract tests.

### Phase 15 - Knex dialect expansion
- Extend to MySQL/SQLite/MariaDB.
- Add dialect-specific behavior tests.
- Exit criteria: dialect matrix stable in CI.

### Phase 16 - Validation and input safety
- Add JSON Schema/Zod validation layer for requests.
- Enforce strict query/field allowlists.
- Exit criteria: invalid-input tests and fuzz checks pass.

### Phase 17 - OpenAPI and schema generation
- Generate OpenAPI 3.1 + JSON Schema from Coral routes/config.
- Keep operation IDs stable for agents and SDKs.
- Exit criteria: generated spec validates in CI.

### Phase 18 - MCP server package
- Build `@coral/mcp-server` with stdio and streamable HTTP transports.
- Expose route tools with strict input/output schema.
- Exit criteria: integration tests for both transports pass.

### Phase 19 - Agent repo standards
- Add `AGENTS.md`, `.codex/skills/*`, and `llms.txt`.
- Add contributor guidance for agent-safe modifications.
- Exit criteria: agent onboarding docs complete and linked.

### Phase 20 - Multi-agent workflow templates
- Provide planner/executor/reviewer templates for API evolution tasks.
- Include guardrail prompts for destructive operations.
- Exit criteria: runnable examples and test fixtures available.

### Phase 21 - Tracing and observability
- Add structured logs, request IDs, tool IDs, audit spans.
- Add hooks for OpenTelemetry export.
- Exit criteria: trace assertions in integration tests.

### Phase 22 - Security and supply chain hardening
- Add dependency policies, audit gates, CodeQL, provenance checks.
- Add query depth/size/rate safeguards.
- Exit criteria: security gates required in CI.

### Phase 23 - Release engineering and packaging
- Add Changesets (or equivalent), release notes automation, multi-package publish flow.
- Add package smoke tests (`npm pack` + install verification).
- Exit criteria: reproducible release pipeline from tag to publish.

### Phase 24 - Migration and GA launch
- Publish v1 -> v2 migration guide and adapter cookbook.
- Run beta/RC feedback loop and finalize v2.0.0 checklist.
- Exit criteria: GA release with docs, examples, and migration tooling.

## Milestone checkpoints

- Alpha: Phases 01-10 complete (core + mongoose parity).
- Beta: Phases 11-18 complete (prisma/knex/openapi/mcp).
- RC: Phases 19-22 complete (agent readiness + security + observability).
- GA: Phases 23-24 complete (release + migration + launch).
