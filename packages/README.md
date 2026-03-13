# Coral v2 Package Skeleton

This directory scaffolds the planned v2 multi-package architecture without changing v1 runtime behavior.
The current repository remains the single source of truth for both `coral` and `@coral-kit/*` during v2 development.

## Planned packages

- `core`: shared abstractions, contracts, query DSL, and framework-agnostic orchestration.
- `adapter-mongoose`: compatibility adapter for current Mongoose behavior.
- `adapter-prisma`: SQL-first adapter built on Prisma.
- `adapter-knex`: SQL query-builder adapter built on Knex.
- `mcp-server`: MCP server exposing Coral tools for AI agents.

## Notes

- The root package continues to publish `coral` and keeps the `npm install coral` path unchanged.
- These packages are currently scaffolds and are marked `private`.
- Keep the current repository in its existing GitHub location until v2 is stable.
- Keep v1 package at repo root stable while implementing v2 incrementally.
- Before the first public v2 beta, move the publishable `coral` package into `packages/coral` and make the repo root non-publishable.
- Move `@coral-kit/*` packages into workspace publish flow during Phase 23.
