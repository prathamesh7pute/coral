# Contributing to Coral

First off, thanks for taking the time to contribute! It's people like you who make Coral such a great tool for the community.

## How to Contribute

### 1. Identify an Issue or Feature
Check the existing issues or open a new one to discuss your ideas.

### 2. Set Up Your Environment
```bash
# Fork and clone the repository
git clone https://github.com/your-username/coral.git
cd coral

# Install dependencies
npm install
```

### 3. Make Your Changes
- Create a feature branch from `main`.
- Keep your changes focused and concise.
- Add or update tests for any behavior changes.

### 4. Verify Your Changes
```bash
# Run checks (lint, format, import sorting)
npm run check

# Run tests
npm test
```

## Repository Structure

- The root package remains the publishable `coral` package during v2 development.
- New v2 packages live under `packages/` and use the `@coral-kit/*` namespace.
- This repository stays in its current GitHub location until v2 is complete; repo transfer to the `coral-kit` org is a post-v2 operational step.
- Before the first public v2 beta, the publishable `coral` package is expected to move into `packages/coral` so every publishable package lives under `packages/`.
- v2 scope and success criteria are documented in [`roadmap/v2/CHARTER_AND_KPIS.md`](roadmap/v2/CHARTER_AND_KPIS.md).
- Product-line, semver, and deprecation policy are documented in [`roadmap/v2/PRODUCT_LINE_AND_VERSIONING_POLICY.md`](roadmap/v2/PRODUCT_LINE_AND_VERSIONING_POLICY.md).

### 5. Submit a Pull Request
- Provide a clear description of the problem and your solution.
- Link to any related issues.
- Ensure all tests and checks pass in CI.

## Development Standards
- **Commit Messages**: Use clear, imperative summaries. A `.gitmessage` template is provided for convenience.
- **Code Style**: We use Biome for linting and formatting. Run `npm run check` before committing.
- **Workspaces**: Use `npm install` at the repo root. Workspace-level checks are available via `npm run check:packages`, `npm run build:packages`, `npm run typecheck:packages`, and `npm run test:packages` as v2 packages become runnable.
- **Documentation**: If you're adding a feature, please update the `README.md`.

## Code of Conduct
By participating, you agree to abide by the project's Code of Conduct. Be respectful and constructive in all interactions.

---
*Simple, short, and sweet. Happy coding!*
