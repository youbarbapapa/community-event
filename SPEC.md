# Community Event Coordination Platform – Product Specification

## 1. Problem Statement & Vision
Local councils, libraries, and children’s centres in the UK still rely on paper schedules or scattered updates. Residents cannot easily find events, and institutions have no consistent tool to publicise programming or claim community-submitted listings. The aim is to deliver a single Next.js application, deployable on Vercel, that aggregates official and community events, surfaces them on calendar and map views, and provides lightweight role-based workflows so institutions can curate their presence.

## 2. Product Goals
- **Single source of truth** for hyper-local activities starting with Islington, but designed for any borough.
- **Fast publication loop** so community members can contribute and organisers can validate/claim listings.
- **Trust & safety** via verification flows, audit logging, and transparent distinction between official and community events.
- **Delightful discovery** through calendar, list, and map experiences optimised for parents, carers, and young people.
- **Lean operations** by leveraging hosted services (Vercel, Vercel Postgres, NextAuth, Mapbox) to minimise custom infrastructure.

### Success Metrics (initial)
1. 70% of known council/library events appear in the platform within 3 months.
2. 60% of weekly active users save ≥1 event to their calendar.
3. <48h median time for an institution claim or event verification decision.

## 3. Personas & Roles
| Role | Description | Capabilities |
| --- | --- | --- |
| **Visitor (unauthenticated)** | Curious resident browsing programming. | Browse/search events, view map, share links, request account. |
| **Community Member** | Residents who create/save events. Minimal profile (username, optional name, email). | Sign in via Google, manage profile, create/edit their own events & institutions, save events (public/private RSVP), report inaccurate data. |
| **Organisation Admin** | Council/library/children-centre staff. Can claim institutions and mark events official. | All Community Member capabilities plus create/claim institutions, manage institution profile, create official events, adopt community events linked to their institution, invite colleagues. |
| **Platform Administrator** | Internal staff (“us”) running the service. | Global moderation, approve institution claims, verify events/institutions, manage feature flags, seed data, view audit trails. |

### Role Rules
1. Any signed-in user starts as Community Member; role upgrades require admin approval.
2. Community members can found institutions; unclaimed institutions remain community-managed until claimed by an Organisation Admin.
3. Events inherit “official” badge if posted by a verified Organisation Admin for a verified institution or if claimed and approved by admins.

## 4. Use Cases
1. **Discover local events** (list + filter + map + calendar).
2. **Community submission** of missing events.
3. **Institution onboarding** (creation, verification, claiming).
4. **Event claiming workflow** for institutions to take ownership of existing community events.
5. **Personal planning** via “save to calendar”, ICS export, reminders.
6. **Moderation** to weed out spam/inaccurate info.

## 5. Functional Requirements

### 5.1 Authentication & Authorization
- Sign-in exclusively through Google OAuth (NextAuth/next-auth with Google provider); email domain hints to fast-track council-issued accounts.
- Support incremental scopes to read user profile/email only.
- Store minimal PII (email, username, optional first/last name) in Vercel Postgres via Prisma.
- Role-based access enforced server-side in Next.js Route Handlers; client uses hooks to query user session/role.
- Session persistence with HTTP-only cookies; refresh token rotation handled by NextAuth.

### 5.2 Institutions (libraries, children centres, etc.)
- Entity fields: name, slug, description, category (library, council service, children centre, community group), address, ward/borough, contact info, website, verification status, geolocation.
- Community members can propose institutions; pending status until admin review.
- Organisation admins can request claim: provide proof docs, council email, or verification token; admin dashboard resolves claims (approve/deny escalations).
- Institution profile page lists upcoming events, contact info, and claim status.
- Verified institutions unlock “official event” badge; auto-published to search/map overlays with higher prominence.

### 5.3 Events
- Required data: title, summary, start/end datetime, recurrence (single, weekly, custom Rule RFC 5545 simplified), venue (address + lat/lng), associated institution (optional), audience tags (family, toddler, teens, adults), capacity (optional), cost (free/paid, price range), accessibility attributes.
- Events default to “community” status; official once posted by verified organisation or after claim approval.
- Visibility options for RSVPs: public (“N people going”) or private (“Saved to calendar only”).
- Attachments/links: booking URL, contact phone/email, supporting docs.
- Audit log per event storing creator, last editor, claim history.
- Support soft delete plus moderation hide flag.

### 5.4 Event Discovery & Engagement
- Responsive list view with filters: date range, categories, institution, borough, tags (age groups, accessibility), free/paid.
- Creation/editing UI embeds an interactive map next to address fields; lat/lng auto-populate when user pins the location or completes postcode search powered by Mapbox geocoding. Postcode auto-complete enforces UK formatting and validates coverage before submission.
- Calendar view (month/week toggle) using server-rendered data + hydrated client interactions.
- Map view using Mapbox GL JS; clustering for dense areas; clicking pin opens event details.
- Detail page shareable via URL; includes “Save event”, “Share”, “Report issue”.
- ICS download + “Add to Google/Apple Calendar” actions via dynamic ICS endpoint.
- User dashboards: “My saved events”, “My created events”, and “Institutions I manage”.

### 5.5 Administration & Moderation
- Admin dashboard (protected route) listing pending institutions, claims, events needing review.
- Bulk approval tooling for recurring official feeds (CSV upload/manual entry optional).
- Flag/review queue fed by “Report issue” submissions or automated heuristics (duplicate detection).
- Role management UI for upgrading/downgrading users.
- Metrics snapshot (events added per week, official vs community ratio).

## 6. Data Model (initial ERD)
- **User** (id, email, username, firstName?, lastName?, role, avatarUrl, createdAt, updatedAt).
- **Institution** (id, name, slug, category, description, contactEmail, phone, website, address fields, lat, lng, borough, verificationStatus, createdByUserId).
- **InstitutionClaim** (id, institutionId, userId, status, evidenceUrl, notes, reviewedByAdminId, reviewedAt).
- **Event** (id, institutionId?, createdByUserId, title, summary, startAt, endAt, recurrenceRule?, address, lat, lng, borough, status [community|official|hidden], audienceTags[], costType, priceMin?, priceMax?, accessibilityTags[], capacity?, bookingUrl, officialVerifiedAt, lastEditedByUserId).
- **EventAttendee** (id, eventId, userId, visibility [public|private], createdAt).
- **Report** (id, targetType, targetId, reason, description, createdByUserId, status, resolvedByUserId, resolvedAt).
- **AuditLog** (id, actorUserId, entityType, entityId, action, payload JSONB, createdAt).

## 7. Architecture & Tech Stack
- **Frontend/Backend**: Next.js (target latest stable release at implementation time; currently 16 App Router with Cache Components & Turbopack by default) plus React Server Components; leverage Next 16 improvements such as Cache Components/PPR, stable Turbopack bundling, enhanced routing/prefetching, and refined caching APIs (`updateTag`, `revalidateTag`) for fast navigation.
- **Database**: Vercel Postgres + Prisma ORM; edge-friendly queries where possible.
- **Authentication**: NextAuth v5, Google OAuth provider, Prisma adapter for session persistence.
- **Maps**: Mapbox GL JS (client) with geocoding via Mapbox API (server-side proxy to avoid exposing token).
- **Calendar**: `@fullcalendar/react` for interactive views or custom calendar built with `react-aria` primitives.
- **Component library**: Tailwind CSS with Radix UI primitives for accessibility.
- **State/Data fetching**: React Query (TanStack) or Next.js Server Actions for mutations; leverage caching via `next/cache`.
- **Infrastructure**: Deploy on Vercel (Production); use Vercel KV or Upstash Redis for caching rate limits, queue tasks (notifications).
- **Email/Notifications**: Resend or Vercel Integration for transactional emails (claim updates, approvals).

> Implementation note: during setup, pin each dependency (Next.js, Prisma, NextAuth, Tailwind, TanStack Query, Mapbox SDK, etc.) to the most recent stable major/minor release available to ensure we benefit from the latest features and security patches; automate periodic `npm outdated` checks.

## 8. Non-Functional Requirements
- **Performance**: Core pages <2.5s Largest Contentful Paint on 4G; map view lazy-load heavy assets.
- **Availability**: 99.5% uptime target; rely on Vercel multi-region plus Postgres high availability.
- **Localization**: Start with English (UK) but design copy for future localisation; store borough/city references in DB for filtering.
- **Security**: Enforce HTTPS, store secrets via Vercel encrypted environment variables, audit admin actions, rate-limit event creation & institution claims (per IP + per account).
- **Privacy/GDPR**: Minimal PII, allow users to delete account/data export, privacy policy covering Google OAuth use and email notifications.
- **Accessibility & Theming**: WCAG 2.1 AA compliance; dual light/dark themes with modern, minimal aesthetic tailored to 25–45 demographic (muted palette, strong typography, large tap targets); map interactions consider keyboard navigation and high-contrast options.
- **Scalability**: Partition events by borough, index on geolocation + startAt; support >50k events without noticeable degradation.

## 9. Milestones / Phased Delivery
1. **MVP (Islington)**: Auth, community event creation, list/calendar view, basic map, admin verification UI.
2. **Institution Workflows**: Claims, official badge, multi-admin invites, audit logging.
3. **Engagement Enhancements**: Notifications, ICS exports, RSVP privacy controls.
4. **Expansion**: Multi-borough filters, import feeds, analytics dashboard.

## 10. Open Items & Decisions
1. **Institution verification evidence**: Organisations must contact `mathieu.bayou@gmail.com` (or dedicated contact form piping to that inbox) to submit proof. Admin manually reviews and records supporting evidence in the claim record.
2. **Attendee privacy**: Continue collecting attendee counts internally but hide public RSVP numbers until thresholds/policies are defined to avoid privacy leaks in small groups.
3. **Moderation capacity**: Recruit and onboard community moderators (volunteer or contracted). Define tooling in admin dashboard for moderator-specific permissions and SLAs once staffing confirmed.

This specification will guide the subsequent implementation of the Next.js application and ensures alignment on scope, architecture, and deliverables.
