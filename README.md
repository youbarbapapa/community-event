# Neighbourhood Commons

Next.js 16 application that helps Islington residents discover and manage council, library, and community events. Community members can submit events, organisation admins can claim institutions and publish official programming, and volunteer moderators keep data trustworthy.

## Tech stack

- Next.js 16 App Router with React Server Components
- Tailwind CSS 4 with custom design tokens (light/dark)
- NextAuth.js v5 + Google OAuth + Prisma adapter
- Prisma ORM with Vercel Postgres (see `prisma/schema.prisma`)
- Mapbox GL JS for event maps + postcode lookup
- FullCalendar for the calendar view
- TanStack Query + SessionProvider wrappers for client state

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL`, Google OAuth credentials, `NEXTAUTH_SECRET`, and a `NEXT_PUBLIC_MAPBOX_TOKEN` (required for the interactive maps).

3. **Database**
   - Update `prisma/schema.prisma` if needed.
   - Push schema to your database:
     ```bash
     npm run db:push
     ```
   - Generate the Prisma client (also runs automatically on `npm install`):
     ```bash
     npm run db:generate
     ```

4. **Development server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to view the app.

## Project structure highlights

- `src/app` – App Router routes (home, /events, /events/new, /institutions, /admin).
- `src/components` – UI primitives, sections, map/calendar widgets, forms.
- `src/data` – Mock data powering the current UI (replace with actual queries later).
- `src/lib` – Prisma client, NextAuth configuration, utilities.
- `SPEC.md` – Full product specification aligned with the requirements discussion.

## Next steps

- Hook the mock data up to real Prisma queries once the database is seeded.
- Build server actions / route handlers for creating events and institutions.
- Flesh out admin workflows (claim approvals, moderation queue actions).
- Add automated tests + Playwright smoke tests before shipping to Vercel.
