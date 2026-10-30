# Production Deployment Record
**CogniWise AI Learner Portal - Deployed October 26, 2026 · Updated October 30, 2026**

> **October 30, 2026:** the portal moved from `cogniwiseai.com` to `learn.cogniwiseai.com`,
> and the new marketing landing page (`landing/`) now serves `cogniwiseai.com`. Server-side
> calls from the portal reach the backend through the Docker network alias `cogniwise-api`
> instead of a container IP. See [Domain Move & Internal Alias](#domain-move--internal-alias-october-30-2026).

Technical record of the production deployment including all configurations, errors encountered, and solutions implemented.

---

## Infrastructure

### Domain
- **Provider:** Namecheap
- **Domain:** cogniwiseai.com
- **Cost:** $6.68/year (first year)
- **Registrar DNS:** Configured with A records

### VPS Server
- **Provider:** Vultr Cloud Compute
- **Location:** Johannesburg, South Africa (chosen for 40-55ms latency from Kenya vs Hetzner Frankfurt's 137-181ms)
- **Specs:** 4GB RAM / 2 CPU / 80GB SSD ($20/month)
- **OS:** Ubuntu 24.04 LTS x64
- **IP:** 139.84.235.168
- **Rationale:** 4GB minimum required - 2GB causes OOM errors during Next.js builds

### DNS Records (Namecheap Advanced DNS)
```
A Record    @      139.84.235.168   # landing page
A Record    www    139.84.235.168   # landing page
A Record    learn  139.84.235.168   # learner portal (added Oct 30, 2026)
A Record    api    139.84.235.168   # backend API
```

### Platform
- **Deployment Platform:** Coolify (self-hosted PaaS)
- **Installation:** `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
- **Dashboard:** http://139.84.235.168:8000
- **Reverse Proxy:** Traefik (built-in)
- **SSL:** Let's Encrypt (automatic)

---

## Repository Configuration

### GitHub Repository
- **Owner:** Vincent-Omondi
- **Repo:** learner-portal-design
- **Visibility:** Private
- **Branch:** main
- **Structure:** Monorepo (frontend at root, backend in `backend/` subdirectory)

### Dual Remote Setup
```bash
# Spectreaxis remote (primary development)
origin: git@github_spectreaxis:spectreaxis/learner-portal-design.git

# Vincent-Omondi remote (Coolify deployment source)
vincent: git@github_vincent:Vincent-Omondi/learner-portal-design.git
```

### SSH Config (`~/.ssh/config`)
```
Host github_vincent
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_vincent

Host github_spectreaxis
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_spectreaxis
    IdentitiesOnly yes
```

### Deployment Push
```bash
git push origin main && git push vincent main
```

---

## Backend Deployment

### Configuration
- **Base Directory:** `backend/`
- **Build Pack:** Nixpacks
- **Port:** 4000
- **Domain:** api.cogniwiseai.com

### Build Commands
```bash
npm install --legacy-peer-deps
npm run build
npm start
```

### Environment Variables (Coolify)
```env
# Database (Self-hosted PostgreSQL on Coolify)
DATABASE_URL=postgresql://postgres:${PASSWORD}@${CONTAINER_NAME}:5432/learner_portal

# Authentication
AUTH_PROVIDER=jwt
JWT_SECRET=${GENERATE_RANDOM_SECRET}
DATA_PROVIDER=prisma

# Server Configuration
APP_URL=https://learn.cogniwiseai.com        # builds certificate verify links: ${APP_URL}/verify/<id>
FRONTEND_URL=https://learn.cogniwiseai.com   # CORS: the only origin allowed; must match the portal exactly
PORT=4000
NODE_ENV=production                          # see note: production reported "development" on Oct 30

# Payments (Paystack: M-Pesa, card, Pesalink)
PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=${SK_LIVE_KEY}            # sk_live_... ; the server logs a warning if a test key is used
CERTIFICATE_PRICE=5.00
CERTIFICATE_PRICE_CURRENCY=USD               # learners pay the KES equivalent at the day's rate
```

**Important Notes:**
- The backend does **not** use `API_URL`; only the portal does
- `APP_URL` was `https://api.cogniwiseai.com` until Oct 30, 2026, which pointed stored certificate
  verify links at the API. The portal builds its own verify links, so users were unaffected, but
  keep it on the portal domain
- `NODE_ENV` must actually be `production`. On Oct 30, 2026 `/health` reported `"environment":"development"`.
  In development mode the backend returns error details and stack traces to API callers, logs every
  Prisma query, and if `JWT_SECRET` is missing silently signs tokens with the public fallback
  `default-secret-change-in-production`. Confirm `JWT_SECRET` is set *before* switching, because
  production mode refuses to start without it:
  `docker exec <backend> sh -c 'test -n "$JWT_SECRET" && echo set || echo MISSING'`
- Paystack dashboard → Settings → API Keys & Webhooks → **Live Webhook URL** must be
  `https://api.cogniwiseai.com/api/payments/webhooks/paystack` (the public `api.` URL, never the
  internal `cogniwise-api` alias). The Live Callback URL can stay empty: checkout runs in a popup
  on the portal, so Paystack never redirects learners
- Payments need outbound HTTPS from the backend to `api.paystack.co` and `open.er-api.com`
  (daily USD→KES rate)
- `DATABASE_URL` uses container name (found via `docker ps` on server)
- All secrets stored in Coolify dashboard, NOT committed to git
- Set separately for Production and Preview environments

### Deployment Issues & Fixes

#### Issue 1: TypeScript Compilation Error
**Deployment:** First attempt
**Error:**
```
src/routes/module.routes.ts(60,11): error TS2698: Spread types may only be created from object types.
src/routes/module.routes.ts(64,73): error TS2531: Object is possibly 'null'.
src/routes/module.routes.ts(64,73): error TS2339: Property 'questions' does not exist on type 'never'.
```

**Root Cause:** Type assertion `as any` incompatible with strict TypeScript compiler

**Fix:** Changed type casting in `backend/src/routes/module.routes.ts` (lines 56-64)
```typescript
// Before
...(module.activities[0].content as any)
questions: ((module.certifications[0].content as any)?.questions || []) as any[]

// After
...(module.activities[0].content as Record<string, any>)
questions: ((module.certifications[0].content as Record<string, any>)?.questions || []) as any[]
```

**Commit:** `84813c9` - Fix TypeScript compilation errors in module routes

#### Issue 2: Missing axios Dependency
**Deployment:** Second attempt
**Error:**
```
src/services/mpesa.service.ts(1,19): error TS2307: Cannot find module 'axios' or its corresponding type declarations.
```

**Root Cause:** `axios` imported in `mpesa.service.ts` but not in `package.json`

**Fix:** Added to `backend/package.json`
```json
"dependencies": {
  "axios": "^1.7.9"
}
```

**Commit:** `206946e` - Add axios dependency for M-Pesa service

#### Issue 3: Trust Proxy Configuration Error
**Date:** October 27, 2026
**Error:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false or is not configured to trust this proxy
```

**Root Cause:** Rate limiter checking X-Forwarded-For header without Express trust proxy configured

**Fix:** Added trust proxy configuration in `backend/src/index.ts`
```typescript
// Trust only the first proxy (Traefik in Coolify)
app.set('trust proxy', 1);
```

**Commit:** Multiple iterations (803c044, 91c0b4d, 20d2780)

#### Issue 4: Prisma OrderBy Validation Error
**Date:** October 27, 2026
**Error:**
```
Unknown argument 'order'. Available options are marked with ?.
```

**Root Cause:** `ModuleRepository.findByIdWithDetails()` tried to order quizzes, activities, and certifications by 'order' field, but these models don't have that field in schema

**Fix:** Removed orderBy from relations without order field in `backend/src/infrastructure/database/repositories/ModuleRepository.ts`
```typescript
// Changed from:
quizzes: { orderBy: { order: 'asc' } }

// To:
quizzes: true
```

**Commit:** `cd14a64` - Fix Prisma orderBy validation errors

#### Issue 5: Seed Import Path Error
**Date:** October 27, 2026
**Error:**
```
Cannot find module '../../lib/course-data'
```

**Root Cause:** Coolify base directory is `backend/`, parent `lib/` directory not copied during build

**Fix:** Copied course data files into backend directory
```bash
cp lib/course-data.ts backend/prisma/
cp lib/types.ts backend/prisma/
```

**Commits:** `221c9ee`, `02319b9` - Move course data to backend for seeding

#### Issue 6: Success
**Deployment:** Multiple fixes applied
**Status:** ✅ Deployed successfully
**Build Time:** ~2 minutes
**Health Check:** https://api.cogniwiseai.com/health
```json
{
  "status": "ok",
  "timestamp": "2026-10-26T07:26:55.312Z",
  "providers": { "auth": "jwt", "data": "prisma" },
  "environment": "development"
}
```

---

## Frontend Deployment

### Configuration
- **Base Directory:** `/` (root)
- **Build Pack:** Nixpacks
- **Port:** 3000
- **Domains:** learn.cogniwiseai.com (was cogniwiseai.com, www.cogniwiseai.com until Oct 30, 2026)

### Build Commands
```bash
npm install
npm run build
npm start
```

### Environment Variables (Coolify)
```env
# Client-side API calls (browser)
NEXT_PUBLIC_API_URL=https://api.cogniwiseai.com/api

# Server-side API calls (NextAuth internal container communication)
# Uses the backend's Docker network alias, which survives redeploys. Never use a container IP.
API_URL=http://cogniwise-api:4000/api

# NextAuth Configuration
NEXTAUTH_URL=https://learn.cogniwiseai.com
NEXTAUTH_SECRET=${GENERATE_RANDOM_SECRET}
```

**Important Notes:**
- `NEXT_PUBLIC_API_URL` - Used by browser for client-side API calls (HTTPS)
- `API_URL` - Used by NextAuth server-side for internal Docker communication (HTTP + network alias)
  - The alias `cogniwise-api` is set on the backend app: General → Access → Edit Networking → Network aliases
  - Do **not** use the container IP: it changes on every backend redeploy and silently breaks login
  - SSL terminates at Traefik proxy, internal communication uses HTTP
- `NEXTAUTH_SECRET` - Generate using: `openssl rand -base64 32`
- Configure separately for Production and Preview environments in Coolify
- NOT committed to repository (secrets only in Coolify dashboard)

### Deployment Issues & Fixes

#### Issue 1: Docker Cache Mount Error
**Deployment:** First attempt
**Error:**
```
error mounting "/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/226/fs"
to rootfs at "/app/tsconfig.tsbuildinfo": not a directory
```

**Root Cause:** Nixpacks tried to create cache mount for `tsconfig.tsbuildinfo` file (Docker requires directories for cache mounts)

**Fix:**
```bash
rm tsconfig.tsbuildinfo
echo "tsconfig.tsbuildinfo" >> .gitignore
```

**Commit:** `8bd1d8f` - Remove tsconfig.tsbuildinfo build cache file

#### Issue 2: Build Success, 503 on Custom Domain
**Deployment:** Second attempt
**Status:** Build successful, container running
**Runtime Log:**
```
▲ Next.js 16.2.6
- Local:         http://localhost:3000
- Network:       http://10.0.1.8:3000
✓ Ready in 226ms
```

**Problem:**
- ✅ Works: http://jwxcaq2n35ywyftobsnas9oy.139.84.235.168.sslip.io
- ❌ 503: https://cogniwiseai.com

**Root Cause:** Health check configured with port 80 instead of 3000, blocking SSL certificate generation

**Fix:** Disabled health checks in Coolify (known issue: health check UI overrides don't always work properly)

#### Issue 3: CORS Error on Registration
**Date:** October 27, 2026
**Error:**
```
Access-Control-Allow-Origin header has a value 'http://localhost:3000'
that is not equal to the supplied origin
```

**Root Cause:** Backend `FRONTEND_URL` environment variable still set to `localhost:3000` instead of production domain

**Fix:** Updated backend environment variable in Coolify
```env
FRONTEND_URL=https://cogniwiseai.com
```

#### Issue 4: NextAuth Auto-Login Failure After Registration
**Date:** October 27, 2026
**Problem:** Registration succeeded but auto-login failed with timeout errors

**Root Cause:** NextAuth's `authorize()` function runs server-side (inside frontend container) and tried to call backend API via:
1. External HTTPS domain (`https://api.cogniwiseai.com`) - timeout (containers can't reach external from inside network)
2. Container hostname (`tsmkgipcclkknctzusxiczel`) - DNS resolution failed
3. HTTP to domain (`http://api.cogniwiseai.com`) - timeout

**Solution:** Used backend container's internal Docker IP address for server-side API calls

**Investigation Steps:**
```bash
# SSH into server
ssh root@139.84.235.168

# Check Docker network
docker inspect tsmkgipcclkknctzusxiczel-[TIMESTAMP] \
  --format '{{range $net,$v := .NetworkSettings.Networks}}Network: {{$net}}, IP: {{$v.IPAddress}}{{println}}{{end}}'
# Output: Network: coolify, IP: 10.0.1.12
```

**Fix:** Updated frontend environment variable
```env
# Frontend Environment Variables in Coolify
API_URL=http://10.0.1.12:4000/api  # Internal Docker network IP
```

**Updated Code:** `app/api/auth/[...nextauth]/route.ts`
```typescript
// Server-side calls use API_URL (internal Docker IP)
// Client-side calls use NEXT_PUBLIC_API_URL (external HTTPS)
const API_URL = process.env.API_URL || 'http://api.cogniwiseai.com/api';
```

**Commit:** `4493cfc` - Fix NextAuth server-side API calls to use HTTP protocol

**Key Learning:** In Coolify's Docker network:
- SSL terminates at Traefik proxy
- Internal container-to-container communication uses HTTP and internal IPs
- External traffic uses HTTPS through proxy
- Backend internal IP: `10.0.1.12:4000` (found via `docker inspect`)

> **Superseded October 30, 2026:** the IP approach broke when the backend was redeployed
> (its IP moved to `10.0.1.14`). `API_URL` now uses the network alias `cogniwise-api`.
> See [Domain Move & Internal Alias](#domain-move--internal-alias-october-30-2026).

#### Issue 5: Success
**Deployment:** All issues resolved
**Status:** ✅ Deployed successfully
**Build Time:** ~3 minutes
**SSL:** Let's Encrypt certificates generated automatically
**URLs:**
- https://cogniwiseai.com ✅
- https://www.cogniwiseai.com ✅

**Verified:**
- ✅ Registration creates user account
- ✅ Auto-login after registration works
- ✅ Manual login works
- ✅ Session persists across page reloads
- ✅ Protected routes accessible after authentication

---

## Landing Page Deployment

Marketing site for `cogniwiseai.com`, a separate Next.js app in `landing/` (see `landing/README.md`).

### Configuration
- **Base Directory:** `/landing`
- **Build Pack:** Railpack
- **Port:** 3000
- **Watch paths:** `landing/**` (only landing changes redeploy it)
- **Health check:** disabled (same reason as frontend Issue 2)
- **Domains:** `https://cogniwiseai.com`, `https://www.cogniwiseai.com` (both serve the site; the
  page's canonical tag points to the apex, so search engines index `cogniwiseai.com`)
- **Environment variables:** none

### Build Commands
```bash
npm ci
npm run build
npm run start
```

### Details
- Fully static output; it does not call the backend, so backend or portal outages don't affect it
- Next.js 16.4.3 (clears the RCE advisories affecting 16.2.x); `package.json` `engines` requires Node
  >= 20.9 so Railpack picks a supported runtime; npm lockfile (`landing/package-lock.json`)
- `next.config.mjs` pins `turbopack.root` to `landing/`, otherwise Turbopack picks up the parent
  repo as workspace root and builds can fail intermittently
- Brand facts live in `landing/lib/site.ts`: `email` (`hello@cogniwiseai.com`, the target of every
  "Book a briefing" button, so that mailbox or forward must exist) and `portalUrl`
  (`https://learn.cogniwiseai.com`, used for Sign up and Learner sign-in links)
- Colours are the portal's own palette (see `landing/DESIGN.md`)

The landing app 308-redirects `/verify/*`, `/certificate/*`, `/learn/*`, `/settings`, `/login` and
`/register` to `learn.cogniwiseai.com`, so certificates issued with `cogniwiseai.com/verify/...` links
keep working. The redirect list is in `landing/next.config.mjs`; if the portal ever moves, update it
together with `portalUrl` in `landing/lib/site.ts`.

---

## Domain Move & Internal Alias (October 30, 2026)

### Domain move
| App | Before | After |
|-----|--------|-------|
| Landing page (new) | - | `cogniwiseai.com`, `www.cogniwiseai.com` |
| Learner portal | `cogniwiseai.com`, `www.cogniwiseai.com` | `learn.cogniwiseai.com` |
| Backend API | `api.cogniwiseai.com` | unchanged |

Settings changed: DNS `learn` A record; portal `NEXTAUTH_URL=https://learn.cogniwiseai.com`;
backend `FRONTEND_URL=https://learn.cogniwiseai.com`. Each app redeployed (not just restarted).

#### Issue 1: Course modules empty after the move
**Symptom:** login worked on `learn.cogniwiseai.com` but the dashboard showed no modules.
**Root cause:** the backend still allowed only `https://cogniwiseai.com` (CORS); browser API calls
from the new origin were rejected. Login was unaffected because it runs server-side.
**Fix:** backend `FRONTEND_URL=https://learn.cogniwiseai.com`, then redeploy the backend.

#### Issue 2: Login fails with "Invalid email or password"
**Symptom:** every login returned 401; registration still worked. The backend log showed **no**
`POST /api/auth/login` at all.
**Root cause:** the backend redeploy in Issue 1 created a new container with a new internal IP
(`10.0.1.12` became `10.0.1.14`). The portal's `API_URL` still pointed at the old IP, so the
server-side NextAuth call failed. `authorize()` catches the error and returns `null`, which NextAuth
reports as invalid credentials.
**Fix (permanent):** a Docker network alias that stays the same across deploys.
1. Backend → General → Access → Edit Networking → Network aliases: `cogniwise-api` → Redeploy backend
2. Verify from the server:
   ```bash
   BACKEND=$(docker ps --format '{{.Names}}' | grep tsmkgipcclkknctzusxiczel | head -1)
   PORTAL=$(docker ps --format '{{.Names}}' | grep jwxcaq2n35ywyftobsnas9oy | head -1)
   docker inspect "$BACKEND" --format '{{json .NetworkSettings.Networks.coolify.Aliases}}'   # includes "cogniwise-api"
   docker exec "$PORTAL" node -e "fetch('http://cogniwise-api:4000/health').then(r=>r.text()).then(console.log)"
   ```
3. Portal `API_URL=http://cogniwise-api:4000/api` → **Redeploy** portal
4. Confirm the running portal picked it up (a new container timestamp, and the variable inside it):
   ```bash
   docker exec "$PORTAL" printenv API_URL   # http://cogniwise-api:4000/api
   ```
   During the fix, login kept failing after the variable was changed because the portal had not
   been redeployed: the old container (`...-20261030T051655`) was still running with
   `API_URL=http://10.0.1.12:4000/api`. Saving an env var in Coolify does nothing until a Redeploy.

**Note:** the backend's plain Coolify name (`tsmkgipcclkknctzusxiczel`, without the timestamp) does
**not** resolve; Coolify only registers the timestamped container name, hence the custom alias.
Saving the alias shows a "Validating DNS failed" toast about the app's public domains. It is
unrelated to the alias, and the setting still saves.

---

## Database Deployment

### Configuration
- **Type:** PostgreSQL 18 Alpine
- **Deployment:** Self-hosted on Coolify
- **Service Name:** learner-portal-db
- **Internal Port:** 5432
- **Storage:** Persistent volume mounted in Coolify

### Connection Pattern
**Internal Docker Network (Backend):**
```
postgresql://postgres:${PASSWORD}@${CONTAINER_NAME}:5432/learner_portal
```

**From Local Development (SSH Tunnel):**
```bash
# Create SSH tunnel to access production database
ssh -L 5432:${CONTAINER_NAME}:5432 root@${VPS_IP} -N

# Connection string for local .env
DATABASE_URL="postgresql://postgres:${PASSWORD}@localhost:5432/learner_portal"
```

### Migration from Supabase to Self-Hosted PostgreSQL

**Date:** October 27, 2026

**Reason for Migration:**
Supabase free tier pauses databases after 7 days of inactivity, causing 503 errors on registration/login in production. Self-hosted PostgreSQL on Coolify provides:
- No automatic pausing
- Full control over database
- Faster internal Docker network communication
- Same cost (included in VPS)

**Migration Steps:**

1. **Created PostgreSQL Resource in Coolify**
   - Resources → New Resource → PostgreSQL
   - Version: `postgres:18-alpine`
   - Set strong password via Coolify UI
   - Persistent volume automatically mounted

2. **Updated Backend Environment Variables**
   - Changed `DATABASE_URL` from Supabase pooled connection to internal container address
   - Format: `postgresql://postgres:PASSWORD@CONTAINER_NAME:5432/learner_portal`

3. **Ran Migrations via SSH**
   ```bash
   # SSH into server
   ssh root@${VPS_IP}

   # Find backend container
   docker ps | grep backend

   # Execute inside backend container
   docker exec -it ${BACKEND_CONTAINER} /bin/bash

   # Run migrations and seed
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. **Verified Seed Data**
   - ✅ 2 modules created (AI/ML Foundations, Building AI Models)
   - ✅ 12 lessons seeded
   - ✅ Demo learner account created
   - ✅ Database accessible from backend container

### Database Schema
Applied via Prisma migrations (`backend/prisma/migrations/`):
- **Learner** - User accounts
- **Module** - Course modules
- **Lesson** - Module lessons
- **Progress** - Learner progress tracking
- **Quiz** - Module quizzes
- **QuizSubmission** - Learner quiz attempts
- **Activity** - Hands-on exercises
- **Certification** - Final module assessments
- **Certificate** - Earned certificates
- **Payment** - Certificate payment attempts (Paystack), one row per attempt

### Database Backup Strategy
- **Coolify Built-in:** Automatic container snapshots
- **Manual Backups:** `docker exec ${CONTAINER} pg_dump -U postgres learner_portal > backup.sql`
- **Restore:** `docker exec -i ${CONTAINER} psql -U postgres learner_portal < backup.sql`

---

## Technical Details

### Architecture
```
┌─────────────────────────────────────────┐
│         Namecheap DNS                   │
│  @, www, learn, api → 139.84.235.168    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Vultr VPS (Johannesburg)            │
│  ┌───────────────────────────────────┐  │
│  │        Coolify / Traefik          │  │
│  │  (Reverse Proxy + SSL Manager)    │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│     ┌────────────┴──────────┐           │
│     ▼                       ▼           │
│  ┌──────────┐         ┌──────────┐     │
│  │ Frontend │         │ Backend  │     │
│  │ Next.js  │◄────────┤ Express  │     │
│  │ :3000    │  API    │ :4000    │     │
│  └──────────┘         └─────┬────┘     │
│                             │           │
│                             ▼           │
│                      ┌──────────────┐   │
│                      │  PostgreSQL  │   │
│                      │  18 Alpine   │   │
│                      │  :5432       │   │
│                      └──────────────┘   │
│  (All containers on 'coolify' network)  │
└─────────────────────────────────────────┘

Internal Docker Communication:
- Frontend → Backend: http://cogniwise-api:4000 (Docker network alias)
- Backend → Database: postgresql://postgres@wnvgablpoq3v1v29qudhhzmr:5432
- External → Landing: https://cogniwiseai.com (via Traefik)
- External → Frontend: https://learn.cogniwiseai.com (via Traefik)
- External → Backend: https://api.cogniwiseai.com (via Traefik)
```

### Stack
**Frontend:**
- Next.js 16.4.3 (upgraded from 16.2.6 on Oct 30, 2026)
- React 19
- TypeScript 5.7.3
- Tailwind CSS 4.2.0
- NextAuth.js

**Backend:**
- Express.js 4.21.2
- TypeScript 5.7.3
- Prisma 6.1.0
- JWT Authentication

**Database:**
- PostgreSQL 18 (Self-hosted on Coolify)
- Prisma ORM
- Direct connection (no pooling needed for self-hosted)

**Landing page (`landing/`, added Oct 30, 2026):**
- Next.js 16.4.3, React 19, TypeScript 5.7.3
- Tailwind CSS 4.3, Framer Motion 13.5.1
- Statically prerendered; Railpack build

**Deployment:**
- Coolify (Docker-based PaaS)
- Nixpacks build system (portal, backend; deprecated upstream, see Next Steps), Railpack (landing)
- Traefik reverse proxy
- Let's Encrypt SSL

### Git Commits During Deployment

**Initial Deployment (October 26, 2026):**
```
84813c9 - Fix TypeScript compilation errors in module routes
206946e - Add axios dependency for M-Pesa service
8bd1d8f - Remove tsconfig.tsbuildinfo build cache file
fc261ce - Add comprehensive production deployment documentation
```

**Database Migration & Fixes (October 27, 2026):**
```
20d2780 - Production-ready architecture for Coolify deployment
84813c9 - Fix TypeScript compilation errors in module routes
cd14a64 - Fix Prisma orderBy validation errors
221c9ee - Move course-data to backend for seeding
02319b9 - Copy types.ts to backend for seed script
4493cfc - Fix NextAuth server-side API calls to use HTTP protocol
```

**Landing Page & Domain Move (October 30, 2026):**
```
0b10d7a - Add cogniwiseai.com marketing landing page
a3f443c - Use the learner portal's colour palette on the landing page
57b243a - Add Cogniwise mark as portal favicon and on certificates (also fixes certificate PDF layout)
e5b42ad - Use the Cogniwise mark as the portal logo
```
The `cogniwise-api` alias and the env var changes were made in Coolify, not in git.

---

## Deployment Timeline

### Initial Deployment (October 26, 2026)
| Task | Duration | Status |
|------|----------|--------|
| Domain purchase (cogniwiseai.com) | - | ✅ |
| VPS provisioning (Vultr 4GB Johannesburg) | 5 min | ✅ |
| Coolify installation | 10 min | ✅ |
| DNS configuration (3 A records) | 5 min | ✅ |
| Backend deployment (3 attempts) | 60 min | ✅ |
| Frontend deployment (3 attempts) | 45 min | ✅ |
| SSL configuration (automatic) | 5 min | ✅ |
| **Subtotal** | **~2.5 hours** | ✅ |

### Database Migration & Fixes (October 27, 2026)
| Task | Duration | Status |
|------|----------|--------|
| PostgreSQL setup in Coolify | 5 min | ✅ |
| Database migration & seeding | 15 min | ✅ |
| Fix trust proxy configuration | 10 min | ✅ |
| Fix Prisma orderBy errors | 10 min | ✅ |
| Fix seed import paths | 10 min | ✅ |
| Debug & fix CORS issues | 15 min | ✅ |
| Debug & fix NextAuth auto-login | 60 min | ✅ |
| Update documentation | 30 min | ✅ |
| **Subtotal** | **~2.5 hours** | ✅ |

### Landing Page & Domain Move (October 30, 2026)
| Task | Status |
|------|--------|
| Landing page deployed to cogniwiseai.com | ✅ |
| Portal moved to learn.cogniwiseai.com | ✅ |
| Backend CORS updated (FRONTEND_URL) | ✅ |
| Login outage fixed with `cogniwise-api` network alias | ✅ |

### Total Deployment Time
| Phase | Time | Status |
|-------|------|--------|
| Initial deployment (Oct 26) | 2.5 hours | ✅ |
| Database migration & fixes (Oct 27) | 2.5 hours | ✅ |
| **Grand Total** | **~5 hours** | ✅ |

---

## Production URLs

- **Landing page:** https://cogniwiseai.com
- **Learner portal:** https://learn.cogniwiseai.com
- **Backend API:** https://api.cogniwiseai.com
- **Health Check:** https://api.cogniwiseai.com/health
- **Coolify Dashboard:** http://139.84.235.168:8000

---

## Costs

| Item | Cost | Notes |
|------|------|-------|
| Domain (cogniwiseai.com) | $6.68/year | Namecheap |
| VPS (Vultr 4GB Johannesburg) | $20/month | Includes hosting for frontend, backend, database, Coolify |
| Database | $0 | Self-hosted PostgreSQL on VPS (no additional cost) |
| SSL Certificates | $0 | Let's Encrypt (automatic via Coolify) |
| **Total** | **~$20.56/month** | ($6.68/12 + $20) |

**Cost Savings vs Supabase:**
- Supabase free tier pauses after 7 days inactivity
- Self-hosted has no pausing, better performance via internal Docker network
- Same monthly cost since database runs on existing VPS

---

## Next Steps (Remaining Tasks)

### 1. Paystack Go-Live (in this order)
The backend refuses to start in production without `PAYSTACK_SECRET_KEY`, and migrations are run
by hand, so the order matters.

1. [ ] **Paystack dashboard** (Live mode) → Settings → API Keys & Webhooks: set the Live Webhook URL
   to `https://api.cogniwiseai.com/api/payments/webhooks/paystack` and save. Leave the Live Callback
   URL empty. Optionally add the business logo under Preferences
2. [ ] **Coolify, backend env:** delete every `MPESA_*` variable and the old `CERTIFICATE_PRICE=500`,
   then add `PAYMENT_PROVIDER=paystack`, `PAYSTACK_SECRET_KEY=sk_live_...`, `CERTIFICATE_PRICE=5.00`,
   `CERTIFICATE_PRICE_CURRENCY=USD`. Do not redeploy yet. The frontend needs no new variables
3. [ ] **Deploy:** merge `feat/paystack-payments` into `main`, then
   `git push origin main && git push vincent main`. Coolify builds both apps
4. [ ] **Migrate** as soon as the backend is up. Until then payment and verify requests fail:
   ```bash
   ssh root@${VPS_IP}
   docker exec -it ${BACKEND_CONTAINER} npx prisma migrate deploy
   ```
   This replaces the old sandbox `Payment` table (`20261030153848_paystack_payments`)
5. [ ] **Check:** `curl https://api.cogniwiseai.com/health` shows `"payment":"paystack"`, and the
   backend logs show no `TEST secret key` warning
6. [ ] **Smoke test with real money:** temporarily set `CERTIFICATE_PRICE=10` and
   `CERTIFICATE_PRICE_CURRENCY=KES` (Coolify restart), pay for one certificate with M-Pesa, confirm it
   unlocks, that `/verify/<id>` works and that Paystack's dashboard shows the webhook delivered
   (Transactions → the payment → webhook log). Refund it from the dashboard, then restore the USD price
7. [ ] Ask Paystack support to enable Pesalink if it is not listed at checkout

**Rollback:** redeploy the previous commit in Coolify. The old code never used the new `Payment`
table, so no database rollback is needed.

### 2. Database Backup Automation
- [ ] Set up automated daily backups
  ```bash
  # Cron job example
  0 2 * * * docker exec ${DB_CONTAINER} pg_dump -U postgres learner_portal > /backups/db_$(date +\%Y\%m\%d).sql
  ```
- [ ] Configure Vultr snapshots (weekly recommended)
- [ ] Test backup restoration procedure

### 3. Monitoring Setup
- [ ] Uptime monitoring (UptimeRobot or similar)
- [ ] Error tracking (Sentry integration)
- [ ] Server monitoring (Coolify built-in available)
- [ ] Database performance monitoring

### 4. Security Hardening
- [x] **Upgrade the portal's Next.js from 16.2.6 to 16.4.3** (Oct 30, 2026). 16.2.x has published
      critical advisories, including unauthenticated remote code execution in the Image
      Optimization API, which the portal enables
- [ ] Set backend `NODE_ENV=production` after confirming `JWT_SECRET` is set (see Backend notes)
- [ ] Set backend `APP_URL=https://learn.cogniwiseai.com`
- [x] Login reports "Sign-in is temporarily unavailable" instead of "Invalid email or password"
      when the backend is unreachable or returns 5xx (Oct 30, 2026)
- [ ] Enable SSH key-only authentication (disable password auth)
- [ ] Configure UFW firewall (allow only 22, 80, 443, 8000)
- [ ] Install fail2ban for SSH protection
- [ ] Set up automatic security updates
- [ ] Regular dependency updates (npm audit)

### 5. Performance Optimization
- [ ] Implement Redis caching for frequently accessed data
- [ ] Add CDN for static assets
- [ ] Database query optimization
- [ ] API response compression

### 6. Content Management
- [ ] Add remaining course modules
- [ ] Upload video content
- [ ] Create quiz questions
- [x] Certificate template: logo added and PDF layout fixed (text overlapped before Oct 30, 2026)
- [ ] Confirm the certificate signatories ("Dr. Sarah Mitchell", "Prof. James Chen" in
      `components/CertificatePDF.tsx`) are real people at Cogniwise, or replace them

### 7. Housekeeping
- [ ] Create the `hello@cogniwiseai.com` mailbox or forward (landing page "Book a briefing" target)
- [x] Removed Vercel and Render remnants (Oct 30, 2026): `@vercel/analytics` and its 404ing
      script, the backend's unused `@vercel/speed-insights`, `vercel.json`, `render.yaml`
- [ ] Migrate portal and backend from Nixpacks (deprecated) to Railpack, one app at a time
- [ ] Delete any unused domain on the backend app (Coolify shows "Validating DNS failed" on save)
- [ ] Optional: on the landing app, set the `www` domain's Domain redirect to `https://cogniwiseai.com`
      (verified Oct 30, 2026: `www` currently serves the page directly with a 200)

---

## Key Learnings

### Infrastructure
1. **4GB RAM minimum required** - 2GB causes OOM during Next.js builds
2. **Johannesburg location critical** - 3x lower latency vs European servers for Kenya users (40-55ms vs 137-181ms)
3. **Self-hosted database wins** - Supabase free tier pauses after 7 days, causing production outages. Self-hosted PostgreSQL on same VPS = no additional cost, better performance, no pausing

### Docker Networking in Coolify
4. **Internal communication uses HTTP + a network alias** - SSL terminates at Traefik proxy
   - External traffic: `https://api.cogniwiseai.com` (HTTPS via Traefik)
   - Internal traffic: `http://cogniwise-api:4000` (HTTP via Docker network alias)
   - Never hardcode container IPs: every redeploy creates a new container with a new IP (this broke login on Oct 30, 2026)

5. **NextAuth server-side vs client-side** - Different API URLs needed
   - Client-side (browser): `NEXT_PUBLIC_API_URL=https://api.cogniwiseai.com/api`
   - Server-side (NextAuth): `API_URL=http://cogniwise-api:4000/api`
   - Server code runs inside container, can't reach external HTTPS from inside Docker network

6. **Trust proxy configuration required** - When behind Traefik/Nginx
   - `app.set('trust proxy', 1)` - Trust first proxy only (security best practice)
   - Needed for rate limiting with X-Forwarded-For header
   - Rate limits (`backend/src/middleware/rate-limit.middleware.ts`): failed sign-ins (20) and sign-ups (30) per client IP, signed-in learners 600 requests per account, public content 1000 per IP, all per 15 minutes
   - Sign-in reaches the backend from the portal's server, which forwards the client IP it got from Traefik (the last `X-Forwarded-For` entry). This relies on exactly one proxy in front of each app: adding another (e.g. Cloudflare) needs `trust proxy` and that forwarding updated, or every learner shares one sign-in limit

### Build & Deployment
7. **Nixpacks cache mount issue** - Build cache files (tsconfig.tsbuildinfo) must be gitignored
8. **Health check problems** - Coolify health check UI overrides may not work; disabling resolved 503 errors
9. **Dual remotes needed** - Local development on spectreaxis, Coolify deploys from Vincent-Omondi (private repo)
10. **Type assertions matter** - TypeScript strict mode requires `Record<string, any>` instead of `as any`
11. **Prisma query structure** - Only apply `orderBy` to models that have the field in schema
12. **Monorepo seed data** - Course data must be in `backend/` directory for Coolify (parent dirs not copied)

### Domain Move (October 30, 2026)
13. **Env var changes need a Redeploy** - Saving in Coolify changes nothing in the running container;
    Redeploy (not Restart), then check with `docker exec <container> printenv VAR`
14. **One domain, one app** - Remove a domain from the old app and redeploy it before adding it to the
    new one; two apps claiming the same host conflict in Traefik
15. **CORS follows the portal's address** - Backend `FRONTEND_URL` is the single allowed origin; moving
    the portal without updating it empties every browser-side API call
16. **Masked failures** - NextAuth `authorize()` used to return `null` on a network error, which shows
    "Invalid email or password". It now throws `ServiceUnavailable` and the login page says sign-in is
    temporarily unavailable; the portal's runtime logs still show `Auth error: backend unreachable at ...`
17. **Inter-container names** - Coolify container names carry a deploy timestamp and the plain UUID
    does not resolve; use a Network alias (Edit Networking) for anything another container calls

---

## Deployment Status

**Initial Deployment:** October 26, 2026
**Database Migration:** October 27, 2026
**Landing Page & Domain Move:** October 30, 2026
**Status:** 🟢 FULLY OPERATIONAL

**Verified Working:**
- ✅ User registration
- ✅ Auto-login after registration
- ✅ Manual login
- ✅ Session persistence
- ✅ Course module viewing
- ✅ Self-hosted PostgreSQL (no pausing)
- ✅ Internal Docker networking (via `cogniwise-api` alias, survives backend redeploys)
- ✅ SSL/HTTPS on all domains
- ✅ Landing page on cogniwiseai.com and www (Oct 30, 2026)
- ✅ Portal on learn.cogniwiseai.com, with old cogniwiseai.com/verify links redirecting (Oct 30, 2026)

**Deployed By:** Vincent Omondi with Claude Sonnet 4.5
