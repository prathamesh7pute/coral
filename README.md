# Coral 🪸

[![CI](https://github.com/prathamesh7pute/coral/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/prathamesh7pute/coral/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/coral.svg)](https://www.npmjs.com/package/coral)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Coral** is a lightweight Node.js framework designed to dynamically generate RESTful API routes for Express applications using Mongoose models. It eliminates boilerplate code by automatically creating CRUD routes with built-in support for pagination, sorting, filtering, and nested sub-documents.

## Features

- ⚡ **Auto-generated CRUD**: Instantly create GET, POST, PUT, and DELETE routes.
- 🔍 **Powerful Queries**: Built-in support for `skip`, `limit`, `sort`, and `order` via query parameters.
- 📂 **Sub-document Support**: Easily manage nested Mongoose documents.
- 🛡️ **Middleware Support**: Inject custom Express middlewares into your routes.
- 🔗 **Reference Updates**: Automatically update references in related models (via `updateRef`).
- 🛠️ **Configurable**: Fine-tune available methods, pagination limits, and more.

---

## Installation

```bash
npm install coral
```

---

## Usage

### 🚀 Basic Example

Creating a full REST API for a "Product" model:

```javascript
import express from 'express';
import mongoose from 'mongoose';
import Coral from 'coral';

const app = express();
app.use(express.json());

// 1. Define Mongoose Schema & Model
const ProductSchema = new mongoose.Schema({ name: String, price: Number });
const Product = mongoose.model('Product', ProductSchema);

// 2. Initialize Coral Router
const productRouter = Coral({
  path: '/products',
  model: Product
});

// 3. Use the generated router
app.use(productRouter);

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Advanced Documentation

### 🛠️ Configuration API

The `Coral` constructor takes a configuration object. Here are the available options with examples for each:

| Property | Type | Description |
| :--- | :--- | :--- |
| `path` | `string` | The base path for the routes. |
| `model` | `Model` | The Mongoose model to bind to. |
| `methods` | `string[]` | Allowed HTTP methods. Default: `['GET', 'POST', 'PUT', 'DELETE']`. |
| `middlewares` | `RequestHandler[]` | Custom Express middlewares to run before handlers. |
| `perPage` | `number` | Default records per page for pagination. |
| `idAttribute` | `string` | Custom field used for finding records by ID. Default: `_id`. |
| `subDoc` | `SubDocConfig` | Configuration for nested sub-documents. |
| `updateRef` | `UpdateRefConfig`| Update a reference in a parent model on create. |

#### 1. Path & Model (`path`, `model`)
Define the endpoint and the Mongoose model it interacts with.
```javascript
Coral({
  path: '/api/v1/users',
  model: User
});
```

#### 2. Restrict HTTP Methods (`methods`)
If you want to create a read-only endpoint:
```javascript
Coral({
  path: '/products',
  model: Product,
  methods: ['GET'] // Only GET /products and GET /products/:id will be created
});
```

#### 3. Custom Middlewares (`middlewares`)
Secure your routes with authentication or add logging:
```javascript
const auth = (req, res, next) => {
  if (req.headers.authorization === 'secret') return next();
  res.status(401).send('Unauthorized');
};

Coral({
  path: '/secure-data',
  model: SecureModel,
  middlewares: [auth]
});
```

#### 4. Pagination Settings (`perPage`)
Control the default number of records returned for list requests:
```javascript
Coral({
  path: '/logs',
  model: Log,
  perPage: 50 // Default is 10
});
```

#### 5. Custom ID Attribute (`idAttribute`)
Use a field other than `_id` for lookup (e.g., lookup by `slug` or `email`):
```javascript
Coral({
  path: '/profiles',
  model: Profile,
  idAttribute: 'username' 
});
// Endpoint becomes: GET /profiles/:username
```

#### 6. Nested Sub-Documents (`subDoc`)
Manage embedded arrays in your Mongoose models:
```javascript
// Model: { name: String, comments: [{ body: String }] }
Coral({
  path: '/posts',
  model: Post,
  subDoc: {
    path: 'comments',
    idAttribute: '_id'
  }
});
// Generates: POST /posts/:postId/comments, DELETE /posts/:postId/comments/:commentId, etc.
```

#### 7. Reference Updates (`updateRef`)
Automatically push the ID of a newly created record into a parent model's array:
```javascript
Coral({
  path: '/articles',
  model: Article,
  updateRef: {
    model: User,
    path: 'articles', // Array field in User model
    findOneId: (req) => req.body.authorId // Find the user using this ID from request
  }
});
```

---

## 🔍 Querying & Pagination Reference

Coral supports the following query parameters for all `GET` list requests:

- `?limit=20` - Limit results.
- `?skip=10` - Skip results.
- `?page=2` - Pagination (multiplies by `perPage`).
- `?sort=createdAt&order=desc` - Sorting (order can be `asc` or `desc`).

---

## 🛡️ Security

Here are a few tips to keep your data extra secure:

- **Mass Assignment**: Use Mongoose's `strict` mode (default) and `express-validator` to ensure only the right fields (like `email` and `name`) are saved to your database.
- **Resource Protection**: Coral automatically caps `?limit=` to prevent your server from being overwhelmed. For heavy traffic, also try [express-rate-limit](https://www.npmjs.com/package/express-rate-limit).

```javascript
// Example: Using express-validator to sanitize inputs
const validateUser = [
  body('email').isEmail(),
  body('name').notEmpty(),
  (req, res, next) => {
    req.body = matchedData(req); // Only keep validated fields!
    next();
  }
];

Coral({ path: '/users', model: User, middlewares: [validateUser] });
```

---

## Developer Setup

To contribute or run tests locally:

1. **Clone the repo**: `git clone https://github.com/prathamesh7pute/coral.git`
2. **Install deps**: `npm install`
3. **Build**: `npm run build`
4. **Check**: `npm run check` (Lint & format)
5. **Test**: `npm test`

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
