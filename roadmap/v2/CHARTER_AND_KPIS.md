# Coral v2 Charter and KPIs

Last updated: 2026-03-13

## Mission

Deliver Coral v2 as a database-agnostic API platform that keeps existing `coral` users stable while enabling a modern `@coral-kit/*` ecosystem for adapters and AI-native API tooling.

## Product intent

- Keep `npm install coral` as the safest default path for current users.
- Build a composable v2 platform under `@coral-kit/*`.
- Make Coral APIs machine-discoverable and tool-friendly for agents (OpenAPI, JSON Schema, MCP).

## Success metrics

### Adoption

- At least 30% of new v2 usage starts with scoped packages (`@coral-kit/*`) within 90 days of v2.0.0.
- Keep `coral` install continuity with no forced migration during alpha/beta phases.

### Compatibility and quality

- Zero unplanned breaking changes to `coral` during v2 alpha and beta.
- 100% passing CI on required checks (`npm run check:ci`, tests for changed packages).
- 100% coverage on critical paths in changed packages.

### Multi-DB execution

- Contract test compliance for `@coral-kit/adapter-mongoose` and at least one SQL adapter before beta exit.
- Published adapter capability matrix with explicit fallback behavior for unsupported features.

### Agent readiness

- OpenAPI 3.1 generation validated in CI.
- MCP transport integration tests passing for stdio and streamable HTTP before RC exit.
- Stable operation IDs across non-breaking releases.

## Non-goals for v2.0

- No full orchestration framework for multi-agent planning/execution in v2.0.
- No requirement to move the GitHub repo during active v2 delivery.
- No forced replacement of Mongoose workflows for existing users.

## Constraints

- Single repository remains source of truth until v2 GA + post-v2 operations.
- Root package `coral` remains publishable during early v2 phases.
- Scoped packages remain private until they are release-ready.

## Milestone gates

- Alpha gate: phases 01-10 complete with Mongoose parity.
- Beta gate: phases 11-18 complete with adapter and MCP readiness.
- RC gate: phases 19-22 complete with agent and security hardening.
- GA gate: phases 23-24 complete with migration and release automation.

## Ownership and review cadence

- Roadmap owner: core maintainers.
- KPI review cadence: every two weeks during active v2 development.
- KPI status source: milestone issue checklist and CI history.
