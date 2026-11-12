# Family Circle

> A production-oriented, secure, self-hosted Family Location Tracking System.

Family Circle provides real-time location sharing, geofencing, safe-zone alerts, family chat, and emergency SOS alerts with transparent privacy controls—built for self-hosted Ubuntu servers, Android devices, and modern web browsers.

---

## Architecture & Technology Stack

- **Backend (`/backend`)**:
  - Node.js LTS, Express.js, TypeScript
  - Prisma ORM & MySQL 8.0
  - Socket.IO authenticated real-time broadcasts
  - JWT authentication with secure rotated refresh tokens
  - Argon2id password hashing
  - Zod request validation
  - Structured request logging with Pino (with automatic token and coordinate redaction)
  - Interactive OpenAPI/Swagger documentation (`/api/docs`)
  - Automated background retention purges

- **Android App (`/android`)** *(Upcoming in Phase 3 & 4)*:
  - Flutter & Dart
  - Riverpod state management, Dio HTTP client, go_router
  - Foreground location service with persistent notification
  - flutter_map (OpenStreetMap tile provider)
  - SQLite offline queued locations with deduplication

- **Web Dashboard / PWA (`/web`)** *(Upcoming in Phase 5)*:
  - React 18, Vite, TypeScript, Tailwind CSS
  - TanStack Query, Zustand, React-Leaflet
  - Standards-based Web Push (VAPID) service worker

---

## Monorepo Layout

```text
family-circle/
├── backend/                   # Express.js + Prisma + Socket.IO API
│   ├── prisma/                # Prisma schema and MySQL migrations
│   │   ├── migrations/        # Initial 0_init SQL migration
│   │   └── schema.prisma      # 23 entities with indexes & constraints
│   ├── src/
│   │   ├── config/            # Strict Zod environment & Pino logger
│   │   ├── controllers/       # Auth & User HTTP controllers
│   │   ├── docs/              # OpenAPI 3.0 Swagger specifications
│   │   ├── jobs/              # Scheduled data retention & token purges
│   │   ├── middleware/        # Auth, validation, error handler, rate limiters
│   │   ├── repositories/      # Database access layers
│   │   ├── routes/            # Express v1 route definitions
│   │   ├── services/          # Business logic & security
│   │   ├── sockets/           # Socket.IO authenticated connections
│   │   ├── types/             # Common TypeScript interfaces
│   │   ├── utils/             # Argon2id, JWT, and response helpers
│   │   ├── validators/        # Zod validation schemas
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server bootstrap & graceful shutdown
│   ├── tests/                 # Vitest security, validation & API tests
│   ├── Dockerfile
│   └── package.json
├── android/                   # Flutter Android application (Phase 3)
├── web/                       # React PWA Web Dashboard (Phase 5)
├── docs/
│   └── PROGRESS.md            # Multi-phase development execution tracker
├── scripts/                   # Environment & deployment scripts
├── docker-compose.yml         # MySQL 8, Redis, and Backend orchestration
├── .env.example               # Environment variables template
└── README.md
```

---

## Quickstart (Local Backend Setup)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v20/v24)
- **Docker**: For running MySQL 8 locally, or a local MySQL 8 instance
- **npm**: v10+

### 2. Environment Configuration
Copy the `.env.example` file to `backend/.env`:

```bash
# Windows PowerShell
.\scripts\setup-env.ps1

# Linux / macOS
chmod +x ./scripts/setup-env.sh
./scripts/setup-env.sh
```

Ensure your `.env` contains secure random values for JWT secrets.

### 3. Start Database via Docker Compose
Start the MySQL 8 database service:

```bash
docker compose up -d mysql
```

This starts MySQL with database `family_circle` and user `family_user` on port `3306`. The initial migration at `backend/prisma/migrations/0_init/migration.sql` is automatically mounted to initialize all 23 database tables.

### 4. Install Dependencies & Generate Prisma Client
```bash
cd backend
npm install
npx prisma generate
```

### 5. Run Database Migrations (Optional if MySQL was initialized directly)
```bash
npx prisma migrate dev --name init
```

### 6. Run Automated Tests
```bash
npm test
```

### 7. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:4000`:
- **Health Check**: `GET http://localhost:4000/api/v1/health`
- **Swagger Documentation**: `http://localhost:4000/api/docs`
- **Socket.IO Endpoint**: `ws://localhost:4000`

---

## REST API Overview (v1)

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user with default privacy & location settings |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password; returns access & refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token and obtain new short-lived access token |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh session |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token |
| `POST` | `/api/v1/auth/reset-password` | Reset password using single-use token |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile |

### User Profile & Devices
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/me` | Get profile, preferences, and family memberships |
| `PATCH` | `/api/v1/users/me` | Update name, phone number, and avatar URL |
| `POST` | `/api/v1/users/me/change-password` | Change password with old password verification |
| `PATCH` | `/api/v1/users/me/settings` | Update theme, retention days, and alerts |
| `GET` | `/api/v1/users/me/devices` | List registered devices |
| `DELETE` | `/api/v1/users/me/devices/:id` | Unregister a device |
| `DELETE` | `/api/v1/users/me` | Delete account and personal data permanently |

---

## Security & Privacy Architecture

- **Argon2id Hashing**: Industry-standard memory-hard password hashing.
- **Refresh Token Rotation & Reuse Detection**: Refresh tokens are single-use; if a revoked token is presented, all sessions for the user are immediately revoked.
- **Zero Coordinate Logging**: Pino logger explicitly redacts `latitude`, `longitude`, `coords`, `password`, and `token` fields from all request and server logs.
- **Configurable Retention**: Location history is automatically purged based on individual user settings (default: 7 days).
- **Independent Consent**: Location sharing settings are explicitly stored and evaluated per user.

---

## Development Progress
Track ongoing phase implementations in [docs/PROGRESS.md](file:///e:/family-tracking-system/docs/PROGRESS.md).

