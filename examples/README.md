# Coral Examples

These examples are intentionally simple and focused on Coral's core routing features.
Each file is self-contained and ready to run after installing dependencies.

## Prerequisites

- Node.js 20+
- MongoDB running locally, or set `MONGO_URI`

## Install dependencies

```bash
npm install express mongoose coral
```

## Run an example

```bash
node examples/basic-crud.js
```

## Example Set

1. [`basic-crud.js`](./basic-crud.js)
- Baseline CRUD resource using schema validation and indexes.
- Covers: `path`, `model`, `perPage`, `bodyFilter`.

2. [`methods-and-middlewares.js`](./methods-and-middlewares.js)
- Restrict methods and run middleware before Coral handlers.
- Covers: `methods`, `middlewares`, `fields`, `bodyFilter`.

3. [`custom-id-attribute-and-param.js`](./custom-id-attribute-and-param.js)
- Route by business key from URL params instead of `_id`.
- Covers: `idAttribute`, `idParam`, `methods`, `middlewares`.

4. [`query-defaults-and-overrides.js`](./query-defaults-and-overrides.js)
- Apply default filters/options/projections with safe runtime overrides.
- Covers: `conditions`, `options`, `fields`, `query`, `perPage`.

5. [`pagination-and-limit-control.js`](./pagination-and-limit-control.js)
- Demonstrates page-based pagination and limit capping behavior.
- Covers: `perPage`, query runtime behavior.

6. [`body-filter.js`](./body-filter.js)
- Whitelist request body keys to prevent mass assignment.
- Covers: `bodyFilter`, `methods`.

7. [`update-ref.js`](./update-ref.js)
- Update parent references during create operations.
- Covers: `updateRef`.

8. [`subdoc-single-level.js`](./subdoc-single-level.js)
- CRUD operations for embedded arrays under a parent document.
- Covers: `subDoc`, top-level `idAttribute`, top-level `idParam`.

9. [`subdoc-multi-level.js`](./subdoc-multi-level.js)
- Nested `subDoc` configuration for multi-level embedded routing.
- Covers: recursive `subDoc.subDoc`, mixed `idParam` + `idAttribute`.

## Query Params Supported by Coral

For list routes (`GET <path>`):

- `skip`
- `limit`
- `page`
- `sort`
- `order` (`asc`, `desc`, `1`, `-1`)
- `select` (comma-separated list)

## Environment Variables

- `MONGO_URI` (optional, defaults to local MongoDB)
- `INTERNAL_API_KEY` (used by `methods-and-middlewares.js`)
