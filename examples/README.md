# Coral Examples

These examples are organized as practical API scenarios, not toy snippets.

- JS examples focus on core Coral configuration.
- TS examples show auth and S3 integration patterns inspired by older Coral-based apps, modernized for current Node and AWS SDK standards.

## Prerequisites

- Node.js 20+
- MongoDB running locally or available at `MONGO_URI`

### Core dependencies (all examples)

```bash
npm install express mongoose coral
```

### Extra dependencies (TypeScript auth + S3 examples)

```bash
npm install bcryptjs jsonwebtoken @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install -D tsx typescript
```

## Run examples

### JavaScript

```bash
node examples/basic-crud.js
```

### TypeScript

```bash
npx tsx examples/auth-jwt-protected-routes.ts
npx tsx examples/s3-presigned-upload.ts
```

## Example Index

### JavaScript

1. [`basic-crud.js`](./basic-crud.js)
- Default CRUD routes with validated product schema.
- Covers: `path`, `model`, `perPage`, `bodyFilter`.

2. [`methods-and-middlewares.js`](./methods-and-middlewares.js)
- API-key protected routes with restricted methods.
- Covers: `methods`, `middlewares`, `fields`, `bodyFilter`.

3. [`custom-id-attribute-and-param.js`](./custom-id-attribute-and-param.js)
- Tenant-scoped settings using route param mapping.
- Covers: `idAttribute`, `idParam`, `methods`, `middlewares`.

4. [`query-defaults-and-overrides.js`](./query-defaults-and-overrides.js)
- Default filtering/sorting/projection and runtime overrides.
- Covers: `conditions`, `options`, `fields`, `query`, `perPage`.

5. [`pagination-and-limit-control.js`](./pagination-and-limit-control.js)
- Page-based navigation and safe limit caps.
- Covers: `perPage`, query runtime behavior.

6. [`body-filter.js`](./body-filter.js)
- Prevent mass-assignment of internal-only fields.
- Covers: `bodyFilter`, `methods`.

7. [`update-ref.js`](./update-ref.js)
- Parent-child reference updates on create.
- Covers: `updateRef`.

8. [`subdoc-single-level.js`](./subdoc-single-level.js)
- Embedded comment operations under parent document.
- Covers: `subDoc`, top-level `idAttribute`, top-level `idParam`.

9. [`subdoc-multi-level.js`](./subdoc-multi-level.js)
- Nested replies under specific comments.
- Covers: recursive `subDoc.subDoc`, mixed `idParam` + `idAttribute`.

### TypeScript

10. [`auth-jwt-protected-routes.ts`](./auth-jwt-protected-routes.ts)
- Signup/login + Bearer auth middleware + ownership checks.
- Covers: `middlewares`, `methods`, `bodyFilter`, admin-only route pattern.

11. [`s3-presigned-upload.ts`](./s3-presigned-upload.ts)
- AWS S3 presigned upload URL endpoint + Coral media metadata CRUD.
- Covers: auth middleware + S3 + `idAttribute` with business key.

## Query Params Supported by Coral

For list routes (`GET <path>`):

- `skip`
- `limit`
- `page`
- `sort`
- `order` (`asc`, `desc`, `1`, `-1`)
- `select` (comma-separated list)

## Environment Variables used by advanced examples

- `MONGO_URI`
- `JWT_SECRET`
- `INTERNAL_API_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and optional `AWS_SESSION_TOKEN`)
