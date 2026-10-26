# 🔑 Get Supabase Credentials - Visual Guide

Based on your screenshot showing the **"cwails"** project.

---

## 📍 You Are Here:

```
Supabase Dashboard
└── Project: cwails
    └── Settings (⚙️ - left sidebar, highlighted green)
        └── General (← YOU ARE CURRENTLY ON THIS PAGE)
```

---

## 🎯 Step-by-Step Instructions

### **Step 1: Navigate to Database Settings**

Look at the **left sidebar** under Settings:

```
⚙️ Settings
   ├── General        ← YOU ARE HERE
   ├── Infrastructure
   ├── Database      ← CLICK THIS ONE
   ├── API
   ├── Storage
   ├── Auth
   ├── Edge Functions
   ├── Integrations
   └── Add Ons
```

**➡️ Click on "Database"**

---

### **Step 2: Find Connection String Section**

Once on the Database page, scroll down until you see these sections:

```
Database Settings Page:
├── General
│   └── Database name, timezone, etc.
├── Connection string      ← YOU NEED THIS
│   ├── Dropdown: "Connection string" → Change to "Connection pooling"
│   ├── Mode: "Session" → Change to "Transaction"
│   └── URI: postgresql://... (this is what you need)
├── Connection pooling
└── Database password      ← YOU ALSO NEED THIS
```

---

### **Step 3: Get Connection Pooling String**

In the **"Connection string"** section:

1. **Dropdown at top:**
   - Currently says: "Connection string"
   - **Change to:** "Connection pooling" ✅

2. **Mode dropdown:**
   - Currently says: "Session"
   - **Change to:** "Transaction" ✅

3. **Copy the URI** - It will look like:
   ```
   postgresql://postgres.dcqpmbwqbdciedrmlkjr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

**⚠️ Notice:** It says `[YOUR-PASSWORD]` - you need to replace this!

---

### **Step 4: Get Your Database Password**

On the **same page** (Database settings), scroll down to:

**"Database password"** section:

1. Click **"Reset database password"** button
2. **A new password will be generated**
3. **COPY IT IMMEDIATELY** - you won't see it again!
4. Save it somewhere safe (password manager recommended)

**Example password:** `MySecurePass123!@#`

---

### **Step 5: Build Your Final DATABASE_URL**

Take the connection string and replace `[YOUR-PASSWORD]`:

**Before:**
```
postgresql://postgres.dcqpmbwqbdciedrmlkjr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**After (example):**
```
postgresql://postgres.dcqpmbwqbdciedrmlkjr:MySecurePass123!@#@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ✅ Update Your .env File

Open `backend/.env` and update the DATABASE_URL:

**If using the "cwails" project (from screenshot):**

1. **Comment out** Option 1 (current EU database)
2. **Uncomment** Option 2 and add your password:

```env
# PROVIDER CONFIGURATION
AUTH_PROVIDER=jwt
DATA_PROVIDER=prisma

# OPTION 1: EU West database (comment this out)
# DATABASE_URL="postgresql://postgres.ohxrbyewujwlqtnheglm:.$n$_WUgek83zme@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# OPTION 2: US East "cwails" project (uncomment and add password)
DATABASE_URL="postgresql://postgres.dcqpmbwqbdciedrmlkjr:MySecurePass123!@#@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

JWT_SECRET="YY65xPgNAuzTf0ew7VoM6CGCIKxcVmxurjSQzLaoCUY="
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

---

## 🧪 Test Your Connection

Run this test script:

```bash
cd backend
chmod +x test-db-connection.sh
./test-db-connection.sh
```

If it shows **✅ SUCCESS**, you're ready to go!

If it shows **❌ FAILED**, double-check:
1. Password is correct (no extra spaces)
2. Connection string matches exactly
3. Database project is active in Supabase

---

## 🚀 Next Steps After Success

Once your connection works:

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations (creates tables)
npx prisma migrate deploy

# 4. Seed database with initial data
npx prisma db seed

# 5. Start development server
npm run dev
```

---

## 📊 Quick Reference

**Your Project Details (from screenshot):**
- **Name:** cwails
- **Project ID:** dcqpmbwqbdciedrmlkjr
- **Region:** us-east-1 (US East - North Virginia)
- **Port (pooling):** 6543
- **Database:** postgres

**Connection String Template:**
```
postgresql://postgres.{PROJECT_ID}:{PASSWORD}@aws-0-{REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**For your project:**
```
postgresql://postgres.dcqpmbwqbdciedrmlkjr:{YOUR_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🆘 Troubleshooting

**Q: I don't see "Connection pooling" option**
- **A:** Make sure you're on the Database page, not API page

**Q: The connection string doesn't have port 6543**
- **A:** You're looking at "Direct connection" - switch to "Connection pooling"

**Q: I forgot my password**
- **A:** Just reset it! Settings → Database → Reset database password

**Q: Connection still fails after reset**
- **A:** Wait 30 seconds after reset, then try again (database needs to update)

---

**Ready to proceed?** Follow the steps above and you'll have your credentials! 🎉
