This is a [Next.js](https://nextjs.org) app for the Resident Directory frontend.

## Running

```bash
npm install
npm run dev
```

## Environment

Create a `.env` (already managed by the platform) or use `.env.example` as reference.

- `NEXT_PUBLIC_API_BASE_URL` - Base URL of the FastAPI backend (e.g. `http://localhost:3001`)

## Backend API assumptions (aligned)

This frontend expects these backend endpoints (current backend implementation):

Auth:
- `POST /auth/login` (OAuth2 password flow: `application/x-www-form-urlencoded`, fields `username`, `password`)
  - returns `{ access_token, token_type }`
- `GET /auth/me` (Bearer token)
  - returns `{ id, email, roles: string[] }`

Residents:
- `GET /residents/directory?q=&tag=&building=` (Bearer token)
- `GET /residents/me/profile` (Bearer token)
- `PATCH /residents/me/profile` (Bearer token)
- `PATCH /residents/me/privacy` (Bearer token)

Announcements:
- `GET /announcements` (Bearer token)
- Admin: `GET /announcements?include_unpublished=true` (Bearer token + admin role)
- Admin: `POST /announcements` (Bearer token + admin role)
- Admin: `DELETE /announcements/{id}` (Bearer token + admin role)

Messaging (contact requests):
- `GET /messaging/contact-requests/inbox` (Bearer token)
- `GET /messaging/contact-requests/outbox` (Bearer token)
- `POST /messaging/contact-requests` (Bearer token)
- `POST /messaging/contact-requests/{id}/respond` (Bearer token)

Admin tools:
- `POST /admin/bootstrap-admin?email=...&password=...` (no auth; intended for local/dev)
- `POST /admin/import` (Bearer token + admin role)
- `POST /admin/export` (Bearer token + admin role)
- `GET /admin/audit-logs` (Bearer token + admin role)

If your backend uses different paths, update the corresponding modules in:
- `src/contexts/AuthContext.tsx`
- `src/features/**/api.ts`
- `src/lib/types.ts`
