This is a [Next.js](https://nextjs.org) app for the Resident Directory frontend.

## Running

```bash
npm install
npm run dev
```

## Environment

Create a `.env` (already managed by the platform) or use `.env.example` as reference.

- `NEXT_PUBLIC_API_BASE_URL` - Base URL of the FastAPI backend (e.g. `http://localhost:3001`)

## Backend API assumptions

This frontend expects these backend endpoints (work-item contract):

- `POST /auth/login` -> `{ token, role, user: { id, email, displayName } }`
- Directory:
  - `GET /residents?q=&visibility=`
  - `GET /residents/{id}`
- Current user:
  - `GET /me/profile`
  - `PATCH /me/profile`
- Announcements:
  - `GET /announcements`
- Contact requests:
  - `GET /contact-requests`
  - `POST /contact-requests`
  - `PATCH /contact-requests/{id}`
- Admin (role = admin):
  - `GET/POST /admin/residents`
  - `DELETE /admin/residents/{id}`
  - `GET/POST /admin/announcements`
  - `DELETE /admin/announcements/{id}`
  - `GET /admin/audit-log`

If your backend uses different paths, update the corresponding modules in `src/features/**/api.ts` and `src/contexts/AuthContext.tsx`.
