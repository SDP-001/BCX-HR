# ByteCodX HR Platform

ByteCodX combines a public corporate site with a role-based HR operations portal. It uses Next.js, TypeScript, Tailwind CSS, and SQLite.

## Features

- Public company pages with an animated ByteCodX wordmark, full-page route transitions, scroll-triggered reveals, a pointer-reactive 3D workforce hero, and executive profiles
- Lazy-loaded Three.js particle scene with cursor lighting, click bursts, scroll convergence, and a CSS fallback; viewport-triggered heading and section reveals with reduced-motion and browser-support fallbacks
- Signed, HTTP-only `bytecodx_token` sessions
- Portal dashboard, HR modules, role-based permissions, reporting, and audit history
- User profile photos shown with names across the portal, with self-service photo updates
- Employee lifecycle, attendance, leave, tasks, projects, recruitment, and applications
- Shared animated button styles with reduced-motion support

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Configure `SESSION_SECRET` and `INITIAL_ADMIN_PASSWORD` in `.env.local`.
4. Run `npm run dev` and open http://localhost:6001.

## Executive accounts

On a new database, the app provisions CEO, CTO, COO, CSO, and CMO accounts using the configured initial password. The login names are `ceo@bytecodx.com`, `cto@bytecodx.com`, `coo@bytecodx.com`, `cso@bytecodx.com`, and `cmo@bytecodx.com`. Existing `.io` addresses, the former `cmp@bytecodx.com` address, and legacy phone numbers are retained as sign-in aliases during migration.

Never use demo credentials in production. Set a strong `INITIAL_ADMIN_PASSWORD` and `SESSION_SECRET` before initializing production data.

## Database and deployment

The SQLite database is stored at `data/bytecodx.db` and schema migrations run when the app loads. Production requires a persistent writable filesystem for SQLite, or a separately configured database migration before deploying to a serverless environment.
