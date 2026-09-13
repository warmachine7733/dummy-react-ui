# Dummy React UI

A small React app for testing HTTP request interception and mocking. The home page contains the original GET, POST, PUT, and DELETE examples.

## Multi-Step Flow

Open `/flow/profile` directly or select **Open Multi-Step Flow** on the home page. The flow uses JSONPlaceholder so it works without a local backend. Every request includes a `flowEndpoint` query parameter containing the logical API endpoint, which makes each request easy to identify or match in browser developer tools.

| Route | Requests |
| --- | --- |
| `/flow/profile` | `GET /api/flow/profile` |
| `/flow/address` | `GET /api/flow/address`, then `PUT /api/flow/address` on Continue |
| `/flow/preferences` | `GET /api/flow/preferences`, then `PATCH /api/flow/preferences` on Continue |
| `/flow/review` | Concurrent GET requests for `/api/flow/review/profile`, `/api/flow/review/address`, and `/api/flow/review/preferences` |
| `/flow/complete` | `POST /api/flow/complete`, followed by `GET /api/flow/status` |

For example, the logical `GET /api/flow/profile` call appears on the network as:

```text
GET https://jsonplaceholder.typicode.com/users/1?flowEndpoint=%2Fapi%2Fflow%2Fprofile
```

## Development

```bash
npm install
npm start
```

The development server runs at `http://localhost:4000` and supports direct navigation to flow routes.

Create a production bundle with:

```bash
npm run build
```
