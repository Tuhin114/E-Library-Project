<div align="center">

# 📚 E-Library

### A full-stack digital library platform — catalog, read, discuss, and discover books online.

Built with the **MERN** stack (MongoDB · Express · React · Node.js)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Made with React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Made with Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#-project-architecture) •
[Getting Started](#-getting-started) •
[API Reference](#-api-reference) •
[Roadmap](#-roadmap--project-status) •
[License](#-license)

</div>

---

## 📖 Overview

**E-Library** is a role-based digital library management system that lets an institution catalog books, let readers browse/search/discover them, read PDF and EPUB titles directly in the browser, track their reading progress, and participate in a community layer of reviews, discussions, and forums — all wrapped in a minimalist, dark-themed UI.

> 📌 See the [Roadmap & Project Status](#-roadmap--project-status) section for a detailed, honest breakdown of what's done, what's deferred, and what's next.

---

## ✨ Features

### 🔐 Authentication & Access Control
- JWT authentication — short-lived access token + `httpOnly` refresh-token cookie
- Silent token refresh on session expiry (no forced re-login mid-session)
- Three-role RBAC: `student`, `faculty`, `librarian` (librarian accounts are admin-provisioned)
- Register, login, logout, change password, forgot/reset password (via emailed, hashed reset token)
- Centralized error handling and toast notifications across every flow

### 📚 Digital Catalog
- Full book catalog with categories, authors, and publishers as first-class, librarian-managed entities
- Cover image, PDF, and EPUB uploads via Cloudinary
- Full-text search with filters, sorting, and pagination
- Personal library: favorites and recently-viewed history
- Status (`draft` / `published` / `archived`) and visibility enforcement at the API layer — non-librarians only ever see published content

### 📖 In-Browser Reading Experience
- Full-screen reader for **PDF** (`react-pdf`) and **EPUB** (`react-reader`) with page/chapter navigation, zoom, and font-size controls
- **DRM-lite file proxy** — book files are streamed through an authenticated backend endpoint instead of being exposed as public URLs; downloads can be blocked per-book via `visibility: restricted`
- Bookmarks (add-at-location, jump-to, delete) scoped to book *and* format
- Debounced auto-save reading progress, with **Continue Reading** picking up exactly where a reader left off
- **Personalized recommendations** — content-based scoring using favorites and view history, with a popularity fallback for new users

### 👥 Community & Interaction
- Editable profile with avatar, bio, and reusable **saved searches**
- One review + star rating per user per book, with denormalized `avgRating` folded straight into catalog browsing and a "Top Rated" sort
- Per-book discussion threads with replies and native device sharing (`navigator.share()`, clipboard fallback)
- General-purpose **discussion forum** — fixed categories, pinned threads, three sort modes, librarian moderation (lock / pin / delete), and a report queue for flagged content
- Shared rate limiting on all posting endpoints to deter spam

### 🎨 Design
- Minimalist, premium dark UI inspired by **Vercel, Linear, Clerk, Notion, and Stripe**
- `shadcn/ui`-style component primitives on top of Tailwind CSS
- Subtle motion via Framer Motion

---

## 🛠 Tech Stack

### Frontend
| | |
|---|---|
| **Core** | React 18, Vite |
| **Routing** | React Router |
| **State** | Redux Toolkit |
| **HTTP** | Axios (with silent-refresh interceptor) |
| **Forms & Validation** | React Hook Form + Zod |
| **UI** | Tailwind CSS, `shadcn/ui`-style primitives, Radix UI primitives, Lucide icons |
| **Motion** | Framer Motion |
| **Readers** | `react-pdf`, `react-reader` |

### Backend
| | |
|---|---|
| **Runtime / Framework** | Node.js, Express |
| **Database / ODM** | MongoDB, Mongoose |
| **Auth** | JWT (`jsonwebtoken`), `bcrypt` |
| **Security** | `helmet`, `express-rate-limit`, `cookie-parser`, CORS scoped to a single client origin |
| **Validation** | Zod |
| **File Storage** | Cloudinary (covers, PDFs, EPUBs — binaries never touch MongoDB or disk) |
| **Uploads** | `multer` (memory storage, streamed straight to Cloudinary) |
| **Utilities** | `slugify`, `axios` (server-side file proxying), `morgan` (dev logging) |

### Storage
- **MongoDB** — all structured data (users, catalog entities, books, reviews, discussions, forum content, reading progress, bookmarks)
- **Cloudinary** — all binary assets (cover images, PDF/EPUB files); MongoDB stores metadata only

---

## 🏗 Project Architecture

A single monorepo with clearly separated `backend/` and `frontend/` workspaces, each following a layered, single-responsibility structure.

```
e-library/
│
├── backend/
│   └── src/
│       ├── config/          # env config, CORS, Cloudinary setup
│       ├── constants/       # roles, enums
│       ├── controllers/     # request/response layer — thin, delegates to services
│       ├── database/        # Mongoose connection
│       ├── middleware/      # auth, RBAC, rate limiting, validation, error handling
│       ├── models/          # Mongoose schemas
│       ├── routes/          # route definitions per resource
│       ├── services/        # business logic — the only layer that talks to models directly
│       ├── utils/           # ApiError, ApiResponse, asyncHandler, token/reset helpers
│       ├── validators/      # Zod request schemas
│       ├── app.js           # Express app assembly (middleware stack + route mounts)
│       └── server.js        # Entry point — connects DB, then starts the HTTP server
│
├── frontend/
│   └── src/
│       ├── api/              # raw Axios calls per resource
│       ├── app/              # app-level composition
│       ├── components/
│       │   ├── ui/           # shadcn-style primitives (Button, Card, Input, Dialog…)
│       │   ├── forms/        # form components (React Hook Form + Zod)
│       │   ├── layout/       # shell, navbar, sidebar
│       │   ├── common/       # cross-cutting components (ErrorBoundary, Toaster…)
│       │   └── auth/         # auth-specific components
│       ├── hooks/             # reusable hooks (useAuth, useReadingProgress…)
│       ├── lib/                # cn(), error parsing, validation schemas
│       ├── pages/              # route-level page components
│       ├── routes/             # route table, PrivateRoute, RoleRoute
│       ├── services/           # response/error normalization for Redux & components
│       ├── store/               # Redux Toolkit store + slices
│       ├── styles/               # Tailwind directives + design tokens
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

**Architectural principles kept consistent across every phase:**
- **Controllers stay thin** — they parse the request, call a service, and shape the response via `ApiResponse`/`ApiError`. All business logic lives in `services/`.
- **One standardized response envelope** for every endpoint (see [API Reference](#-api-reference)).
- **Sanitization at the boundary** — anything that embeds a `Book` document (direct fetch, favorites, recently-viewed, discussions) is passed through a single shared sanitizer so sensitive fields (like raw file URLs) can never leak through a side path.
- **Denormalization where it matters** — e.g. `avgRating`/`reviewCount` on `Book` are recomputed on write, not aggregated on every read, so the catalog stays fast at scale.
- **Ownership rules stay consistent** — "owner or librarian" is the same delete/moderate rule everywhere it applies (reviews, discussions, forum threads).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local instance or Atlas)
- A Cloudinary account (for cover/PDF/EPUB storage)

### 1. Clone the repository
```bash
git clone https://github.com/Tuhin114/E-Library-Project.git
cd E-Library-Project
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

**Backend environment variables**
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
COOKIE_SECRET=your_cookie_secret

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional — falls back to console-logging reset links in development
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
```

> Generate strong secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and talks to the backend on `http://localhost:5000/api` by default.

### 4. Seed data (optional)
A mock data seed script is available under `backend/src/scripts/` to populate categories, authors, publishers, and books for local testing.

---

## 📡 API Reference

All routes are prefixed with `/api`. Every response follows a single standardized shape:

**Success**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable description",
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "message": "Human-readable description",
  "details": [{ "field": "email", "message": "Invalid email" }]
}
```

<details>
<summary><strong>🔐 Auth</strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Create a new student/faculty account |
| `POST` | `/auth/login` | None | Log in, receive access + refresh tokens |
| `POST` | `/auth/refresh-token` | Cookie | Reissue an access token |
| `GET` | `/auth/me` | Bearer | Fetch the current authenticated user |
| `POST` | `/auth/logout` | Bearer | Clear the refresh-token cookie |
| `PATCH` | `/auth/change-password` | Bearer | Change password (ends current session) |
| `POST` | `/auth/forgot-password` | None | Request a password reset email |
| `POST` | `/auth/reset-password/:token` | None | Complete a password reset |

</details>

<details>
<summary><strong>📚 Catalog — Books, Categories, Authors, Publishers</strong></summary>

Full CRUD for `categories`, `authors`, `publishers`, and `books` (librarian-only writes), plus search/filter/sort/pagination on `GET /books`. Book responses include `avgRating`, `reviewCount`, and a masked `digitalFiles` object (`{ available, format, sizeBytes, originalName, uploadedAt }` — no direct file URLs).

</details>

<details>
<summary><strong>📖 Reading — Files, Bookmarks, Progress, Recommendations</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/books/:id/files/:type/stream` | Authenticated, proxied file stream (`?download=true` gated by visibility) |
| `GET` / `PUT` | `/me/books/:bookId/progress` | Read / save reading progress |
| `GET` / `POST` | `/me/books/:bookId/bookmarks` | List / create a bookmark |
| `DELETE` | `/me/bookmarks/:bookmarkId` | Delete a bookmark |
| `GET` | `/me/continue-reading` | In-progress books, most recent first |
| `GET` | `/me/recommendations` | Personalized "Because you..." recommendations |

</details>

<details>
<summary><strong>👤 Profile, Reviews, Discussions & Forum</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/me/profile` | Update profile (bio, etc.) |
| `POST` / `DELETE` | `/me/profile/avatar` | Upload / remove avatar |
| `GET` / `POST` / `DELETE` | `/me/saved-searches` | Manage saved catalog searches |
| `GET` / `POST` | `/books/:id/reviews` | List / create a review |
| `PATCH` / `DELETE` | `/reviews/:id` | Edit / delete a review |
| `GET` / `POST` | `/books/:id/discussions` | Per-book discussion threads |
| `POST` | `/discussions/:id/replies` | Reply to a discussion |
| `GET` / `POST` | `/forum/threads` | List / create a forum thread |
| `PATCH` | `/forum/threads/:id/lock` \| `/pin` | Librarian moderation |
| `POST` | `/forum/threads/:id/report` \| `/forum/replies/:id/report` | Report content |
| `GET` / `PATCH` | `/forum/reports` \| `/forum/reports/:id/resolve` | Librarian report queue |

</details>

---

## 🗺 Roadmap & Project Status

<details>
<summary><strong>✅ Phase 1 — Authentication & RBAC (complete)</strong></summary>

JWT auth with silent refresh, three-role RBAC, full password lifecycle (change/forgot/reset), centralized error handling, and the shared `ApiError`/`ApiResponse`/`asyncHandler` foundation every later phase builds on.
</details>

<details>
<summary><strong>✅ Phase 2 — Digital Catalog & User Library (complete)</strong></summary>

Category/Author/Publisher master data, full book catalog CRUD, Cloudinary-backed cover/PDF/EPUB uploads, search/filter/sort/pagination, and a personal library (favorites, recently-viewed).
</details>

<details>
<summary><strong>✅ Phase 3 — Search, Discovery & Reading Experience (complete)</strong></summary>

Role-based catalog access enforcement, an in-browser PDF/EPUB reader, a DRM-lite backend file proxy (no more public file URLs), bookmarks + auto-saved reading progress + Continue Reading, and content-based personalized recommendations.
</details>

<details>
<summary><strong>🟡 Phase 4 — Community & Interaction (4 of 5 milestones complete)</strong></summary>

- ✅ Profile management (avatar, bio, saved searches)
- ✅ Ratings & reviews (with denormalized catalog scores)
- ✅ Per-book discussions + native sharing
- ✅ General discussion forum with moderation and reporting
- ⏳ **Activity History & Account Dashboard** — a unified `/me/activity` view tying together favorites, reading history, and reviews. Not yet started.
</details>

### Known limitations (by design, revisit if scope grows)
- No reply-to-a-reply anywhere (discussions or forum) — one level of nesting only
- No thread/discussion/post editing — delete-and-repost is the pattern
- Forum categories are fixed, not librarian-manageable
- No book clubs (persistent membership groups) — deliberately out of scope
- Client-side-only page titles for book pages — real crawler-visible Open Graph previews (Twitter/Discord/Slack link cards) need server-side rendering, not yet built
- No automated test suite yet (Jest/RTL/Cypress) — testing is tracked as a pre-production requirement
- Recommendations are content-based only; a ratings-driven collaborative-filtering signal is possible now that reviews exist, but hasn't been built

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Tuhin Poddar**

- GitHub: [@Tuhin114](https://github.com/Tuhin114)
- LinkedIn: [tuhin-poddar-a2a84b274](https://www.linkedin.com/in/tuhin-poddar-a2a84b274)

<div align="center">

If you find this project useful, consider giving it a ⭐

</div>
