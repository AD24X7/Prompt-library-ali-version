# How to Get Connection Pooler URL from Supabase Dashboard

## 🔗 Step-by-Step Guide

### Step 1: Login to Supabase
1. Go to https://supabase.com
2. Click **Login** (top right)
3. Enter your email and password
4. Click on your project

### Step 2: Navigate to Database Settings
After logging in, you'll see your project dashboard:

1. **Click on "Settings"** (bottom left sidebar)
   - Or look for gear icon ⚙️

2. **Select "Database"** from the left menu

### Step 3: Find Connection Pooling Section
On the Database settings page, scroll down until you see:

**"Connection pooling"** section

This section looks like:
```
Connection pooling

Our connection pooler is useful when you have many clients making frequent, short-lived requests to a database. You can read more about connection pooling in the docs.

URI

Session mode
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@5432-aws-[REGION].pooler.supabase.com:5432/postgres

Transaction mode
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@5432-aws-[REGION].pooler.supabase.com:6543/postgres
```

### Step 4: Copy the Connection String

For your setup, copy the **"Session mode"** string (first one)

It will look like:
```
postgresql://postgres.YOUR-PROJECT-REF:YOUR-PASSWORD@5432-aws-us-east-1.pooler.supabase.com:5432/postgres
```

---

## ✅ What to Copy

You need this part with actual values:
```
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@5432-aws-[YOUR-REGION].pooler.supabase.com:5432/postgres
```

Where:
- `[YOUR-PROJECT-REF]` = Something like `afgnvzflqxqpccnkruml`
- `[YOUR-PASSWORD]` = `Expertrons$$123`
- `[YOUR-REGION]` = Like `us-east-1` or `eu-west-1`

---

## 🔍 Alternative: Direct Connection String for Reference

If you also see "Direct Connection" above Connection Pooling:

```
Direct connections

Non-pooled connections

URI

postgresql://postgres:[PASSWORD]@db.afgnvzflqxqpccnkruml.supabase.co:5432/postgres
```

⚠️ **Don't use this one** - it's what failed (port 5432 blocked). Use the **pooler** instead.

---

## 📋 Complete Dashboard Navigation Map

```
Supabase Dashboard
├── Your Project Name
├── Settings ⚙️
│   ├── General
│   ├── Authentication
│   ├── Database ← YOU ARE HERE
│   │   ├── Connection string
│   │   ├── Direct connections
│   │   ├── Connection pooling ← COPY FROM HERE
│   │   │   ├── Session mode ← USE THIS ONE
│   │   │   └── Transaction mode
│   │   └── Database settings
│   └── ...
```

---

## 📸 Screenshot Description

On the **Database** settings page, look for:

1. A section titled "Connection pooling"
2. Two boxes: "Session mode" and "Transaction mode"
3. Under "Session mode", you'll see a text box with the full connection string
4. There's a **copy button** (usually a clipboard icon) next to it

---

## 🚀 Once You Have It

1. **Copy the Session mode URL**
2. **Go to your project** → `backend/.env`
3. **Replace DATABASE_URL with:**
   ```
   DATABASE_URL="postgresql://postgres.PROJECT-REF:PASSWORD@5432-aws-REGION.pooler.supabase.com:5432/postgres"
   ```

4. **Test connection:**
   ```bash
   cd backend
   npx prisma db push --skip-generate
   ```

---

## ❓ Need More Help?

If you can't find it:
1. Make sure you're logged in to Supabase
2. Make sure you selected the correct project
3. Try refreshing the page (Cmd+R on Mac)
4. Check if "Settings" is visible in the left sidebar

If still stuck, you can paste a screenshot or tell me what you see on your screen!
