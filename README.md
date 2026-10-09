# Framax Solutions

Website and back office for [Framax Solutions](https://www.framaxsolutions.com), a small web agency building platforms for Portuguese SMBs.

The repo has two sides:

- **Public site** — agency pages in Portuguese and English, meeting booking against a live Google Calendar, discount codes, and dynamic QR codes with scan tracking.
- **Admin dashboard** (`/dashboard`, login required) — the agency's back office: clients, projects, services, quotes, invoices, payments, leads, documents, calendar, notes and to-dos. Quotes and invoices export to PDF and can be emailed to clients, who accept or decline through a client portal (`/portal/[id]`).

## Stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API routes, Supabase (Postgres, Auth, Storage, Row Level Security)
- **Integrations:** Google Calendar and Sheets, Resend (email), n8n workflows
- **Hosting:** Vercel

## Security

- `/dashboard` routes are gated by Supabase session middleware.
- API routes that read or change business data check the Supabase user on every request; hiding UI is never the only check.
- Request bodies are validated with Zod, and public endpoints such as email sending are rate limited.
- Data access is restricted per user with Postgres Row Level Security (see `supabase/`).
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy) are set in `src/middleware.ts`.

## Project layout

```
src/app/            pages, dashboard and API routes
src/components/     UI components (dashboard/, ui/, …)
src/utils/          Supabase clients, rate limiting, validation, CORS
supabase/           schema, migrations, RLS and storage policies, one-off scripts
integrations/n8n/   n8n workflow exports used for booking automation
docs/               setup notes (Google Sheets, storage cascade deletes, …)
```

## Running locally

```bash
npm install
npm run dev
```

Requires a `.env.local` with Supabase, Google and Resend credentials. It is not committed.
