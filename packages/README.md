# Coral v2 Package Skeleton

This directory scaffolds the planned v2 multi-package architecture without changing v1 runtime behavior.

## Planned packages

- `core`: shared abstractions, contracts, query DSL, and framework-agnostic orchestration.
- `adapter-mongoose`: compatibility adapter for current Mongoose behavior.
- `adapter-prisma`: SQL-first adapter built on Prisma.
- `adapter-knex`: SQL query-builder adapter built on Knex.
- `mcp-server`: MCP server exposing Coral tools for AI agents.

## Notes

- These packages are currently scaffolds and are marked `private`.
- Keep v1 package at repo root stable while implementing v2 incrementally.
- Move packages into workspace publish flow during Phase 23.
