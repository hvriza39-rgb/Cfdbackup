# Crypto Broker Dashboard (Next.js)

A modern, responsive crypto trading user dashboard built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Public pages
- `/` (Landing)
- `/signup`
- `/login`
- `/forgot-password` (placeholder)

## Protected pages (auth required)
- `/dashboard`
- `/deposit`
- `/withdrawal`
- `/trade`
- `/settings/profile`
- `/settings/kyc`
- `/settings/account`
- `/settings/security`
- `/admin/kyc`

## Auth flow (demo)
- Signup redirects to `/login` after success
- Login stores a JWT in `localStorage.token` and a `token` cookie
- Protected routes read the JWT and reject expired tokens (1 hour)
- Any 401 response clears auth and redirects to the correct login page

## Required env vars
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL` (optional override)
- `ADMIN_PASSWORD` (optional override)

## Run
```bash
npm install
npm run dev
```
