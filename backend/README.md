# E-Library — Backend

Node.js / Express / MongoDB API server.

## Setup

```bash
cp .env.example .env   # then fill in real values
npm install
npm run dev             # starts with nodemon on http://localhost:5000
```

## Structure

```
src/
├── config/       # env, cors, and other static configuration
├── controllers/  # request handlers (added from M3)
├── database/     # MongoDB connection logic
├── middleware/   # auth, error handling, rate limiting (added from M5)
├── models/       # Mongoose schemas (added from M2)
├── routes/       # Express routers (added from M3)
├── services/     # business logic, decoupled from controllers
├── validators/   # Zod request validation schemas
├── utils/        # shared helpers
├── constants/    # enums, fixed values (e.g. roles)
├── app.js        # Express app: middleware + routes
└── server.js     # entry point: DB connection + HTTP server
```

## Health check

```
GET /api/health -> { success: true, message: "E-Library API is running" }
```
