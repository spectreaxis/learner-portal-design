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
DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
AUTH_PROVIDER=jwt
JWT_SECRET=your-super-secret-jwt-key-change-this
DATA_PROVIDER=prisma
APP_URL=https://api.cogniwiseai.com
FRONTEND_URL=https://cogniwiseai.com
PORT=4000
NODE_ENV=production
MPESA_ENVIRONMENT=sandbox
MPESA_SANDBOX_CONSUMER_KEY=your-key
MPESA_SANDBOX_CONSUMER_SECRET=your-secret
MPESA_SANDBOX_SHORTCODE=174379
MPESA_SANDBOX_PASSKEY=your-passkey
MPESA_PRODUCTION_CONSUMER_KEY=your-production-key
MPESA_PRODUCTION_CONSUMER_SECRET=your-production-secret
MPESA_PRODUCTION_SHORTCODE=your-shortcode
MPESA_PRODUCTION_PASSKEY=your-production-passkey
MPESA_CALLBACK_URL=https://api.cogniwiseai.com/api/payments/callback
CERTIFICATE_PRICE=500
```

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

#### Issue 3: Success
**Deployment:** Third attempt
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
NEXT_PUBLIC_API_URL=https://api.cogniwiseai.com/api
NEXTAUTH_URL=https://cogniwiseai.com
NEXTAUTH_SECRET=YY65xPgNAuzTf0ew7VoM6CGCIKxcVmxurjSQzLaoCUY=
```

**Note:** These are configured in Coolify dashboard only, NOT committed to repository.

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

#### Issue 3: Success
**Deployment:** Third attempt after disabling health checks
**Status:** ✅ Deployed successfully
**Build Time:** ~3 minutes
**SSL:** Let's Encrypt certificates generated automatically
**URLs:**
- https://cogniwiseai.com ✅
- https://www.cogniwiseai.com ✅

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
│     ┌────────────┴────────────┐         │
│     ▼                         ▼         │
│  ┌──────────┐           ┌──────────┐   │
│  │ Frontend │           │ Backend  │   │
│  │ Next.js  │           │ Express  │   │
│  │ Port 3000│           │ Port 4000│   │
│  └──────────┘           └─────┬────┘   │
└─────────────────────────────│──────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Supabase         │
                    │ PostgreSQL       │
                    │ (External)       │
                    └──────────────────┘
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
- PostgreSQL (Supabase)
- Prisma ORM
- Connection pooling enabled

**Deployment:**
- Coolify (Docker-based PaaS)
- Nixpacks build system
- Traefik reverse proxy
- Let's Encrypt SSL

### Git Commits During Deployment
```
84813c9 - Fix TypeScript compilation errors in module routes
206946e - Add axios dependency for M-Pesa service
8bd1d8f - Remove tsconfig.tsbuildinfo build cache file
fc261ce - Add comprehensive production deployment documentation
```

---

## Deployment Timeline

| Task | Duration | Status |
|------|----------|--------|
| Domain purchase (cogniwiseai.com) | - | ✅ |
| VPS provisioning (Vultr 4GB Johannesburg) | 5 min | ✅ |
| Coolify installation | 10 min | ✅ |
| DNS configuration (3 A records) | 5 min | ✅ |
| Backend deployment (3 attempts) | 60 min | ✅ |
| Frontend deployment (3 attempts) | 45 min | ✅ |
| SSL configuration (automatic) | 5 min | ✅ |
| **Total** | **~3 hours** | ✅ |

---

## Production URLs

- **Frontend:** https://cogniwiseai.com
- **Backend API:** https://api.cogniwiseai.com
- **Health Check:** https://api.cogniwiseai.com/health
- **Coolify Dashboard:** http://139.84.235.168:8000

---

## Costs

| Item | Cost |
|------|------|
| Domain (cogniwiseai.com) | $6.68/year |
| VPS (Vultr 4GB Johannesburg) | $20/month |
| Database (Supabase Free Tier) | $0/month |
| **Total** | **~$20.56/month** |

---

## Next Steps (Not Yet Completed)

### 1. M-Pesa Production Configuration
Update Daraja Portal callback URL to: `https://api.cogniwiseai.com/api/payments/callback`

Update Coolify environment variables:
```env
MPESA_ENVIRONMENT=production
# Add production credentials
```

### 2. Monitoring Setup
- Uptime monitoring
- Error tracking (Sentry)
- Server monitoring (Coolify built-in)

### 3. Security Hardening
- SSH key-only authentication
- UFW firewall configuration
- fail2ban setup
- Regular security updates

### 4. Backup Strategy
- Database backups (Supabase automatic)
- Vultr snapshots (weekly recommended)
- Configuration backups

---

## Key Learnings

1. **4GB RAM minimum required** - 2GB causes OOM during Next.js builds
2. **Johannesburg location critical** - 3x lower latency vs European servers for Kenya users (40-55ms vs 137-181ms)
3. **Nixpacks cache mount issue** - Build cache files (tsconfig.tsbuildinfo) must be gitignored
4. **Health check problems** - Coolify health check UI overrides may not work; disabling resolved 503 errors
5. **Dual remotes needed** - Local development on spectreaxis, Coolify deploys from Vincent-Omondi (private repo)
6. **Type assertions matter** - TypeScript strict mode requires `Record<string, any>` instead of `as any`

---

**Deployment Date:** October 26, 2026
**Status:** 🟢 LIVE
**Deployed By:** Vincent Omondi with Claude Sonnet 4.5
