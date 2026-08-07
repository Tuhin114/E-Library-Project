# E-Library — Frontend

React (Vite) client using Tailwind, shadcn/ui, Redux Toolkit, React Router.

## Setup

```bash
cp .env.example .env   # then fill in real values
npm install
npm run dev             # http://localhost:5173
```

## Structure

```
src/
├── api/          # axios instance + API call modules (authApi.js added M3)
├── app/          # app-level providers/config, if needed
├── assets/       # static assets (images, icons)
├── components/
│   ├── ui/         # shadcn/ui primitives (Button, Input, Card...)
│   ├── forms/       # feature forms (RegisterForm, LoginForm — from M3)
│   ├── layout/       # layout shells (AuthLayout — from M10)
│   ├── common/       # shared building blocks (Toaster, Spinner)
│   └── auth/          # auth-specific composite components
├── hooks/         # reusable hooks (useAuth — from M6)
├── lib/            # utils.js (shadcn cn helper), misc small libs
├── pages/          # route-level pages (pages/auth/* — from M3)
├── routes/         # React Router config + guards (from M5)
├── services/        # thin wrappers around api/ calls, used by components
├── store/           # Redux store + slices
├── styles/          # globals.css (Tailwind + design tokens)
├── types/            # shared JS-doc/type shapes
├── utils/            # generic helpers
├── App.jsx
└── main.jsx
```

## Design system

- Dark theme by default (`class="dark"` on `<html>`), Inter font, blue accent (`--primary`).
- Design tokens live in `src/styles/globals.css` as HSL CSS variables consumed by `tailwind.config.js`.
- New UI primitives should be added via the shadcn/ui CLI so they follow `components.json` and land in `components/ui/`.
