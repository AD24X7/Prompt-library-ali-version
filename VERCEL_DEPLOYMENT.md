# Vercel Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository** - Push this project to GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **Supabase Database** - You already have this configured

## 🚀 Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Prompt Library with Supabase"
git remote add origin https://github.com/YOUR_USERNAME/prompt-library.git
git branch -M main
git push -u origin main
```

## 🔧 Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account
5. Select the `prompt-library` repository
6. Click **"Import"**

## 📝 Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Supabase connection pooler URL | `postgresql://postgres.afgnvzflqxqpccnkruml:Expertrons$$123@aws-1-us-east-2.pooler.supabase.com:5432/postgres` |
| `NODE_ENV` | `production` | - |
| `PORT` | `3000` | - |
| `FRONTEND_URL` | Your Vercel domain | `https://your-project.vercel.app` |
| `JWT_SECRET` | Strong random secret | Generate with: `openssl rand -base64 32` |

### How to add env vars in Vercel:
1. Go to **Project Settings**
2. Click **"Environment Variables"**
3. Add each variable with its value
4. Select which environments (Production, Preview, Development)
5. Click **"Save"**

## 🎯 Step 4: Deploy

Once environment variables are set:

1. Click **"Deploy"** button in Vercel dashboard
2. Or simply push to GitHub: `git push origin main`
3. Vercel will automatically trigger a new deployment

## ✅ Verification

After deployment:

```bash
# Test backend health
curl https://your-project.vercel.app/health

# Test API
curl https://your-project.vercel.app/api/categories

# Test frontend (should load React app)
open https://your-project.vercel.app
```

## 📦 Project Structure

```
prompt-library/
├── backend/              # Express API
│   ├── src/
│   ├── package.json
│   └── server-new.js
├── frontend/             # React SPA
│   ├── src/
│   ├── package.json
│   └── public/
├── vercel.json          # Vercel configuration
├── package.json         # Root package.json
└── README.md
```

## 🔄 Continuous Deployment

Every time you push to GitHub (main branch):
1. Vercel automatically builds the project
2. Installs dependencies
3. Runs `npm run build`
4. Deploys to production

## 🛠️ Build Process

Vercel executes these commands:

```bash
# Install all dependencies
npm install

# Build backend and frontend
npm run build

# Start production server
npm start
```

This is defined in `package.json` scripts.

## ⚠️ Important Notes

### Environment Variables
- **Never** commit `.env` files to GitHub
- `.env.local` is git-ignored
- Always use Vercel's environment variable dashboard

### Database Migrations
- Vercel runs migrations automatically via `npm run build`
- Supabase schema is already pushed
- New tables should be added to `backend/prisma/schema.prisma`

### Frontend Build
- React app builds to `frontend/build/`
- Vercel serves this as static assets
- API calls go to `/api/*` routes (proxied to backend)

### Backend Limits
- Max execution time: 60 seconds (configured in vercel.json)
- Memory: 1024 MB
- For long-running tasks, consider async jobs

## 🐛 Troubleshooting

### Build Fails
1. Check Vercel build logs in dashboard
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set

### API Returns 401
- Make sure `DATABASE_URL` is correct in Vercel env vars
- Check JWT_SECRET is set

### Frontend doesn't load
1. Check React build succeeded in logs
2. Verify `frontend/.env` has correct `REACT_APP_API_URL`
3. This should be `/api` for Vercel (relative URL)

### Database Connection Error
- Test connection string works locally
- Verify Supabase firewall allows Vercel IPs
- Check SESSION POOLER is being used (not direct connection)

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a strong value
- [ ] Use SESSION POOLER connection (not direct PostgreSQL)
- [ ] Add CORS restrictions if needed
- [ ] Enable Vercel project protections
- [ ] Review and delete any exposed secrets from git history

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Next Steps

After deployment, you can:
1. Add custom domain in Vercel settings
2. Set up GitHub branch preview deployments
3. Monitor analytics and logs
4. Scale database as needed
