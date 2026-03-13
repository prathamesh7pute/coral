# Coral v2 Product-Line and Versioning Policy

Last updated: 2026-03-13

## Scope

This policy defines package roles, versioning rules, and deprecation behavior for `coral` and `@coral-kit/*` during Coral v2 delivery.

## Product lines

- `coral` is the stable default package for existing users and remains installable via `npm install coral`.
- `@coral-kit/*` is the v2 platform surface for core abstractions, adapters, and MCP tooling.
- The current repository remains the source of truth for both lines until v2 is stable.

## Repository and publish model

- During active v2 development, do not transfer the GitHub repository.
- Keep root `coral` publishable while `@coral-kit/*` matures.
- Before the first public v2 beta, move publishable `coral` into `packages/coral` and make repo root non-publishable so all publishable packages live under `packages/`.
- Keep package metadata (`repository`, `homepage`, `bugs`) pointed to the current repository path until post-v2 transfer work begins.

## Versioning rules

- `coral` follows independent semantic versioning focused on end-user stability.
- `@coral-kit/*` shares a synchronized major version line to reduce compatibility ambiguity across adapters and core packages.
- Minor and patch releases for scoped packages may be independent when there is no cross-package compatibility impact.
- Any cross-package breaking change in `@coral-kit/*` requires a coordinated major release note.

## Compatibility expectations

- Non-breaking changes:
  - New optional fields in responses.
  - New optional config keys.
  - New adapter capabilities that do not alter existing defaults.
- Breaking changes:
  - Removing or renaming public exports.
  - Changing default route behavior in a way that alters user-visible responses.
  - Removing accepted request fields without a deprecation window.

## Deprecation policy

- Deprecations must be announced in docs and release notes before removal.
- Minimum deprecation window is the later of:
  - two minor releases, or
  - 90 days.
- Removals happen only in a major release unless there is a critical security reason.
- Deprecated behavior should emit a clear runtime warning where practical and a migration path in docs.

## Release process requirements

- No release without passing:
  - `npm run check:ci`
  - package tests for changed packages
  - package smoke checks for publish artifacts
- Phase 23 introduces full workspace release automation for scoped packages from the current repository path.

## Post-v2 transition

- Repository transfer to `coral-kit` is a post-v2 operational task.
- After transfer, update metadata URLs and trusted publisher settings.
- Verify redirects and publish automation after the move before next release.
