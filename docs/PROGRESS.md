# Family Circle - Development Progress & Execution Tracker

## Project Overview
- **System**: Family Circle (Self-hosted Family Location Tracking System)
- **Monorepo**: Backend (Node.js/Express/TypeScript/Prisma/MySQL), Android (Flutter), Web (React/Vite/TS/PWA)
- **Target OS Server**: Ubuntu Server (Self-hosted)
- **Dev Environment**: Windows 11 (x64), Node.js v24.16.0, Flutter stable, MySQL 8.0, Docker

---

## Execution Phases Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Repository setup, backend scaffolding, Prisma models (all 23 entities), MySQL migrations, authentication APIs, environment templates, Swagger docs, initial tests | **COMPLETED** |
| **Phase 2** | Family creation, invitation, membership management, privacy permissions & authorization checks | **IN PROGRESS** |
| **Phase 3** | Flutter Android application scaffolding, API/Socket connection, Riverpod state, GPS tracking service & SQLite offline queue | **COMPLETED** |
| **Phase 4** | Socket.IO location broadcasts and Android family live map | PENDING |
| **Phase 5** | React Web Dashboard, authentication, family map & responsive layout | **COMPLETED** |
| **Phase 6** | FCM push, PWA Web Push & SOS emergency alerts | PENDING |
| **Phase 7** | Chat, member details & native phone dialer integration | PENDING |
| **Phase 8** | Geofencing, location history retention & settings | PENDING |
| **Phase 9** | Automated testing, integration testing, bug fixes & Ubuntu production deployment | PENDING |

---

## Phase 1 Deliverables Summary (Completed)

- [x] **Monorepo Scaffolding**:
  - `.gitignore`, `.env.example`, `docker-compose.yml` (MySQL 8 with healthchecks, Redis 7, Backend service)
  - Helper scripts: `scripts/setup-env.ps1`, `scripts/setup-env.sh`
  - Root `README.md` with complete local setup guide
  - `docs/PROGRESS.md`
- [x] **Database Architecture (Prisma & MySQL 8)**:
  - All 23 entities implemented in `backend/prisma/schema.prisma` with constraints, foreign keys, and indexes:
    1. `users`
    2. `user_settings`
    3. `families`
    4. `family_members`
    5. `family_invitations`
    6. `devices`
    7. `refresh_sessions`
    8. `location_sharing_settings`
    9. `current_locations`
    10. `location_history`
    11. `safe_zones`
    12. `safe_zone_members`
    13. `geofence_events`
    14. `sos_alerts`
    15. `sos_recipients`
    16. `conversations`
    17. `conversation_members`
    18. `messages`
    19. `message_receipts`
    20. `notifications`
    21. `push_subscriptions`
    22. `call_logs`
    23. `audit_logs`
    + `password_reset_tokens`
  - Initial SQL migration: `backend/prisma/migrations/0_init/migration.sql`
  - Offline Prisma client generation verified (`npx prisma generate`)
- [x] **Backend Infrastructure & Security**:
  - Node.js LTS, Express, TypeScript, Helmet, CORS, Cookie Parser
  - Zod environment configuration (`src/config/env.ts`)
  - Structured logging with Pino (`src/config/logger.ts`) with redaction for passwords, tokens, and coordinates
  - Argon2id password hashing and verification (`src/utils/security.ts`)
  - Rotated JWT access & refresh token mechanics with reuse breach detection (`src/utils/jwt.ts`, `src/services/authService.ts`)
  - Scheduled retention job (`src/jobs/retentionJob.ts`) for purging location history by user retention setting (default: 7 days) and expired sessions
  - Socket.IO authenticated server initialized on the HTTP listener (`src/sockets/index.ts`)
  - Multi-stage production `Dockerfile` and `.dockerignore`
- [x] **Implemented API Routes (`/api/v1`)**:
  - `GET  /api/v1/health`
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
  - `GET  /api/v1/auth/me`
  - `GET  /api/v1/users/me`
  - `PATCH /api/v1/users/me`
  - `POST /api/v1/users/me/change-password`
  - `PATCH /api/v1/users/me/settings`
  - `GET  /api/v1/users/me/devices`
  - `DELETE /api/v1/users/me/devices/:id`
  - `DELETE /api/v1/users/me`
- [x] **Documentation & Verification**:
  - OpenAPI 3.0 / Swagger documentation mounted at `/api/docs` (`src/docs/swagger.ts`)
  - Vitest test suite (`backend/tests/security.test.ts`, `backend/tests/validation.test.ts`, `backend/tests/api.test.ts`) — 13/13 tests passing
  - TypeScript compilation verified without errors (`npm run build`)
  - Docker Compose MySQL 8.0 live container active and healthy on port 3306
  - Prisma migration `0_init` applied to MySQL database with all 23 entities
  - Live server verified running on `http://localhost:4000` with registration, login, and `/users/me` bearer authentication tests passing

---

## Phase 2 Plan: Family & Privacy Permissions (Next Up)

### Scope:
1. **Family Management**:
   - `POST /api/v1/families` (Create family group; owner assignment)
   - `GET /api/v1/families` (List families current user belongs to)
   - `GET /api/v1/families/:id` (Get family details, members, roles)
   - `PATCH /api/v1/families/:id` (Update family name / avatar - Owner/Admin only)
   - `DELETE /api/v1/families/:id` (Delete family group - Owner only)
2. **Invitations**:
   - `POST /api/v1/families/:id/invitations` (Generate secure, expiring 8-character invite code / link)
   - `POST /api/v1/families/join` (Accept invite code and join family)
   - `GET /api/v1/families/:id/invitations` (List pending invitations)
   - `DELETE /api/v1/families/:id/invitations/:code` (Revoke invitation)
3. **Members & Roles**:
   - `GET /api/v1/families/:id/members`
   - `PATCH /api/v1/families/:id/members/:memberId` (Update role: ADMIN, MEMBER - Owner only)
   - `DELETE /api/v1/families/:id/members/:memberId` (Remove member or leave family)
4. **Privacy & Explicit Location Sharing Consent**:
   - `GET /api/v1/location-sharing` (Current user's sharing settings)
   - `PUT /api/v1/location-sharing` (Toggle `shareCurrentLocation`, `shareLocationHistory`, `allowSafeZoneAlerts`, pause sharing until timestamp)
   - Server-side access middleware verifying that viewing another member's coordinates strictly requires:
     1. Shared family membership.
     2. Explicit, active location-sharing consent from the target member.
     3. Target member not having paused sharing.
