# Supabase Setup Guide

## ✅ Configuration Status

### Database Connection
- **Database URL**: `postgresql://postgres:Expertrons$$123@db.afgnvzflqxqpccnkruml.supabase.co:5432/postgres`
- **Provider**: PostgreSQL
- **Location**: `.env` file (backend folder)

### Schema Status
- **Provider**: PostgreSQL (compatible)
- **Models**: 5 data models (User, Category, Prompt, Review, UserActivity)
- **Location**: `backend/prisma/schema.prisma`

### Backend Configuration
- **ORM**: Prisma v5.22.0
- **Database Package**: @prisma/client
- **Port**: 5000 (configured in .env)

---

## 🚀 Deployment Steps

### Step 1: Verify Environment Variables
```bash
cd backend
cat .env
```
Expected output:
```
DATABASE_URL="postgresql://postgres:Expertrons$$123@db.afgnvzflqxqpccnkruml.supabase.co:5432/postgres"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your_jwt_secret_key_here_change_in_production"
```

### Step 2: Install Dependencies (if needed)
```bash
npm install
# Removes sqlite3, uses PostgreSQL drivers
```

### Step 3: Generate Prisma Client
```bash
npm run db:generate
```

### Step 4: Push Schema to Supabase
```bash
npm run prisma db push
# This creates all tables in Supabase PostgreSQL
```

### Step 5: Seed Sample Data (Optional)
```bash
npm run db:seed
```

### Step 6: Start Backend
```bash
npm run dev
# Server will run on port 5000
```

---

## 🔌 Network Connectivity

### Current Status
- ❌ **DNS Resolution**: `db.afgnvzflqxqpccnkruml.supabase.co` cannot be resolved
- **Error**: `Can't reach database server at db.afgnvzflqxqpccnkruml.supabase.co:5432`

### Troubleshooting Steps

#### Option 1: Check Network Connectivity
```bash
# Test DNS resolution
nslookup db.afgnvzflqxqpccnkruml.supabase.co
dig db.afgnvzflqxqpccnkruml.supabase.co

# Test TCP connection
telnet db.afgnvzflqxqpccnkruml.supabase.co 5432
```

#### Option 2: Try Session Pooler
If Direct Connection fails, use **Session Pooler** connection string:
- Get from Supabase Dashboard → Connection Pooling → Session mode
- Format: `postgresql://postgres.[project-ref]:[password]@5432-aws-[region].pooler.supabase.com:5432/postgres`
- Update `.env` with this URL

#### Option 3: Use VPN/Proxy
- Connect to VPN if your network blocks external connections
- Configure proxy settings if needed

#### Option 4: Alternative - Local SQLite (Development)
```bash
# Fallback to local development
DATABASE_URL="file:./dev.db"
```

---

## 📊 Supabase Dashboard Actions

### Verify in Supabase Console:
1. Go to https://supabase.com
2. Login to your project
3. Navigate to **SQL Editor**
4. Check if tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Monitor Migrations:
1. Go to **Migrations** tab
2. You should see migration history after successful `db push`

---

## 🔐 Security Notes

### Current JWT Secret
- Current: `your_jwt_secret_key_here_change_in_production`
- **TODO**: Change in production environment

### Database Credentials
- Username: `postgres`
- Password: `Expertrons$$123`
- **TODO**: Rotate credentials in production

---

## 📝 Files Modified for Supabase

1. **backend/prisma/schema.prisma**
   - Provider: Changed to PostgreSQL
   - Removed SQLite-specific `@db.Text` annotations
   - Added JSON support for UserActivity.details

2. **backend/.env**
   - DATABASE_URL: Supabase PostgreSQL connection string

3. **backend/package.json**
   - Removed: sqlite3 dependency
   - Kept: @prisma/client for PostgreSQL

---

## ✨ Next Steps

Once network connectivity is established:

1. Run `npm run prisma db push` to create tables
2. Run `npm run db:seed` to add sample data
3. Run `npm run dev` to start backend
4. Test API endpoints
5. Start frontend: `npm run dev` (from frontend folder)

---

## 📞 Support

If you continue to get `Can't reach database server` error:
1. Check if Supabase instance is running
2. Verify connection credentials in Supabase dashboard
3. Test network connectivity to Supabase servers
4. Try Session Pooler connection instead
5. Contact Supabase support if infrastructure issue
