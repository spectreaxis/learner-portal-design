# Production Deployment Record
**CogniWise AI Learner Portal - Deployed October 26, 2026**

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
A Record    @      139.84.235.168
A Record    www    139.84.235.168
A Record    api    139.84.235.168
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
APP_URL=https://api.cogniwiseai.com
FRONTEND_URL=https://cogniwiseai.com
PORT=4000
NODE_ENV=production

# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_SANDBOX_CONSUMER_KEY=${YOUR_SANDBOX_KEY}
MPESA_SANDBOX_CONSUMER_SECRET=${YOUR_SANDBOX_SECRET}
MPESA_SANDBOX_SHORTCODE=174379
MPESA_SANDBOX_PASSKEY=${YOUR_SANDBOX_PASSKEY}

# M-Pesa Production (fill when going live)
MPESA_PRODUCTION_CONSUMER_KEY=${YOUR_PRODUCTION_KEY}
MPESA_PRODUCTION_CONSUMER_SECRET=${YOUR_PRODUCTION_SECRET}
MPESA_PRODUCTION_SHORTCODE=${YOUR_TILL_NUMBER}
MPESA_PRODUCTION_PASSKEY=${YOUR_PRODUCTION_PASSKEY}

# Payment Settings
MPESA_CALLBACK_URL=https://api.cogniwiseai.com/api/payments/callback
CERTIFICATE_PRICE=500
```

**Important Notes:**
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
- **Domains:** cogniwiseai.com, www.cogniwiseai.com

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
API_URL=http://10.0.1.12:4000/api

# NextAuth Configuration
NEXTAUTH_URL=https://cogniwiseai.com
NEXTAUTH_SECRET=${GENERATE_RANDOM_SECRET}
```

**Important Notes:**
- `NEXT_PUBLIC_API_URL` - Used by browser for client-side API calls (HTTPS)
- `API_URL` - Used by NextAuth server-side for internal Docker communication (HTTP + internal IP)
  - Find backend IP: `docker inspect ${BACKEND_CONTAINER} --format '{{.NetworkSettings.Networks.coolify.IPAddress}}'`
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
- **Payment** - M-Pesa payment transactions

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
│  cogniwiseai.com → 139.84.235.168       │
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
- Frontend → Backend: http://10.0.1.12:4000
- Backend → Database: postgresql://postgres@wnvgablpoq3v1v29qudhhzmr:5432
- External → Frontend: https://cogniwiseai.com (via Traefik)
- External → Backend: https://api.cogniwiseai.com (via Traefik)
```

### Stack
**Frontend:**
- Next.js 16.2.6
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

**Deployment:**
- Coolify (Docker-based PaaS)
- Nixpacks build system
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

### Total Deployment Time
| Phase | Time | Status |
|-------|------|--------|
| Initial deployment (Oct 26) | 2.5 hours | ✅ |
| Database migration & fixes (Oct 27) | 2.5 hours | ✅ |
| **Grand Total** | **~5 hours** | ✅ |

---

## Production URLs

- **Frontend:** https://cogniwiseai.com
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

### 1. M-Pesa Production Configuration
- [ ] Update Daraja Portal callback URL to: `https://api.cogniwiseai.com/api/payments/callback`
- [ ] Switch to production credentials in Coolify:
  ```env
  MPESA_ENVIRONMENT=production
  MPESA_PRODUCTION_CONSUMER_KEY=${YOUR_KEY}
  MPESA_PRODUCTION_CONSUMER_SECRET=${YOUR_SECRET}
  MPESA_PRODUCTION_SHORTCODE=${YOUR_TILL}
  MPESA_PRODUCTION_PASSKEY=${YOUR_PASSKEY}
  ```
- [ ] Test payment flow in production
- [ ] Update certificate price if needed (currently KES 500)

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
- [ ] Design certificates template

---

## Key Learnings

### Infrastructure
1. **4GB RAM minimum required** - 2GB causes OOM during Next.js builds
2. **Johannesburg location critical** - 3x lower latency vs European servers for Kenya users (40-55ms vs 137-181ms)
3. **Self-hosted database wins** - Supabase free tier pauses after 7 days, causing production outages. Self-hosted PostgreSQL on same VPS = no additional cost, better performance, no pausing

### Docker Networking in Coolify
4. **Internal communication uses HTTP + IP addresses** - SSL terminates at Traefik proxy
   - External traffic: `https://api.cogniwiseai.com` (HTTPS via Traefik)
   - Internal traffic: `http://10.0.1.12:4000` (HTTP via Docker network)
   - Find container IPs: `docker inspect ${CONTAINER} --format '{{.NetworkSettings.Networks.coolify.IPAddress}}'`

5. **NextAuth server-side vs client-side** - Different API URLs needed
   - Client-side (browser): `NEXT_PUBLIC_API_URL=https://api.cogniwiseai.com/api`
   - Server-side (NextAuth): `API_URL=http://10.0.1.12:4000/api`
   - Server code runs inside container, can't reach external HTTPS from inside Docker network

6. **Trust proxy configuration required** - When behind Traefik/Nginx
   - `app.set('trust proxy', 1)` - Trust first proxy only (security best practice)
   - Needed for rate limiting with X-Forwarded-For header

### Build & Deployment
7. **Nixpacks cache mount issue** - Build cache files (tsconfig.tsbuildinfo) must be gitignored
8. **Health check problems** - Coolify health check UI overrides may not work; disabling resolved 503 errors
9. **Dual remotes needed** - Local development on spectreaxis, Coolify deploys from Vincent-Omondi (private repo)
10. **Type assertions matter** - TypeScript strict mode requires `Record<string, any>` instead of `as any`
11. **Prisma query structure** - Only apply `orderBy` to models that have the field in schema
12. **Monorepo seed data** - Course data must be in `backend/` directory for Coolify (parent dirs not copied)

---

## Deployment Status

**Initial Deployment:** October 26, 2026
**Database Migration:** October 27, 2026
**Status:** 🟢 FULLY OPERATIONAL

**Verified Working:**
- ✅ User registration
- ✅ Auto-login after registration
- ✅ Manual login
- ✅ Session persistence
- ✅ Course module viewing
- ✅ Self-hosted PostgreSQL (no pausing)
- ✅ Internal Docker networking
- ✅ SSL/HTTPS on all domains

**Deployed By:** Vincent Omondi with Claude Sonnet 4.5
