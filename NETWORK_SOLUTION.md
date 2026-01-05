# Network Connectivity Solution

## 🔍 Diagnosis

Your network blocks **port 5432** (PostgreSQL direct connection):
- ✅ DNS resolves: `afgnvzflqxqpccnkruml.supabase.co`
- ✅ Port 443 (HTTPS) works
- ❌ Port 5432 (PostgreSQL) blocked - timeout

## ✅ Solutions (Choose One)

### **Solution 1: Use Supabase Connection Pooler (RECOMMENDED)**

Connection pooling handles the blocked port issue automatically.

#### Steps:
1. **Go to Supabase Dashboard:**
   - Login: https://supabase.com
   - Select your project
   - Click **Settings** → **Database**

2. **Find Connection Pooling:**
   - Scroll down to "Connection pooling"
   - Mode: Select **"Session"** or **"Transaction"**
   - Copy the connection string

3. **Update `.env`:**
   ```bash
   DATABASE_URL="postgresql://postgres.[project-id]:[PASSWORD]@5432-aws-[region].pooler.supabase.com:5432/postgres"
   ```
   Replace with actual values from dashboard

4. **Test connection:**
   ```bash
   cd backend
   npx prisma db push --skip-generate
   ```

### **Solution 2: Use Supabase Web Interface**

If pooler doesn't work, create schema directly in Supabase:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create tables manually (provided in schema.sql below)
3. Update frontend `.env` to point to API

### **Solution 3: Use Local SQLite (Fallback)**

If Supabase connection impossible:

```bash
# Update DATABASE_URL
DATABASE_URL="file:./dev.db"

# Run migrations
npm run db:reset

# Start server
npm run dev
```

---

## 📋 Manual Schema for Supabase SQL Editor

If you need to create tables manually, use this SQL:

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  provider TEXT DEFAULT 'email',
  password TEXT,
  verified BOOLEAN DEFAULT false,
  "verificationCode" TEXT,
  "verificationExpiry" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Prompts table
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'medium',
  "estimatedTime" TEXT DEFAULT '5-10 minutes',
  placeholders TEXT DEFAULT '',
  rating FLOAT DEFAULT 0,
  "usageCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  "authorId" TEXT REFERENCES users(id),
  FOREIGN KEY (category) REFERENCES categories(name)
);

-- Reviews table
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  rating INT NOT NULL,
  comment TEXT,
  "toolUsed" TEXT,
  "whatWorked" TEXT,
  "whatDidntWork" TEXT,
  "improvementSuggestions" TEXT,
  "testRunGraphicsLink" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  "promptId" TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id)
);

-- User activities table
CREATE TABLE user_activities (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "userId" TEXT REFERENCES users(id)
);
```

---

## 🚀 Next Steps

1. **Get Connection Pooler URL** from Supabase Dashboard
2. **Update `.env`** with new URL
3. **Test:** `npm run db:generate && npx prisma db push`
4. **Seed data:** `npm run db:seed`
5. **Start backend:** `npm run dev`

---

## 🔗 Supabase Resources

- Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- Direct Connection: https://supabase.com/docs/guides/database/connecting-to-postgres#direct-connections

---

## ⚠️ Important Notes

- **Port 5432 is blocked by network** - must use pooler or HTTPS
- **Session Pooler** is recommended for most applications
- **SSL/TLS mode** requires both port access AND certificate validation
