#!/bin/bash
# Quick Vercel Deployment Setup

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "📦 Initializing git repository..."
  git init
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
  echo ""
  echo "❌ Git remote not configured!"
  echo ""
  echo "Add your GitHub repo with:"
  echo "  git remote add origin https://github.com/YOUR_USERNAME/prompt-library.git"
  echo ""
  exit 1
fi

REMOTE_URL=$(git remote get-url origin)
echo "✅ Git remote configured: $REMOTE_URL"
echo ""

# Check required files
echo "✅ Checking deployment files..."
[ -f vercel.json ] && echo "  ✓ vercel.json" || echo "  ✗ vercel.json missing"
[ -f .vercelignore ] && echo "  ✓ .vercelignore" || echo "  ✗ .vercelignore missing"
[ -f VERCEL_DEPLOYMENT.md ] && echo "  ✓ VERCEL_DEPLOYMENT.md" || echo "  ✗ VERCEL_DEPLOYMENT.md missing"
[ -f backend/package.json ] && echo "  ✓ backend/package.json" || echo "  ✗ backend/package.json missing"
[ -f frontend/package.json ] && echo "  ✓ frontend/package.json" || echo "  ✗ frontend/package.json missing"

echo ""
echo "📝 Required Environment Variables (add in Vercel Dashboard):"
echo "  - DATABASE_URL (Supabase connection pooler URL)"
echo "  - NODE_ENV=production"
echo "  - PORT=3000"
echo "  - FRONTEND_URL=https://your-domain.vercel.app"
echo "  - JWT_SECRET=<generate with: openssl rand -base64 32>"

echo ""
echo "🔄 Deployment Steps:"
echo "  1. Commit and push: git add . && git commit -m 'Setup Vercel deployment' && git push"
echo "  2. Go to https://vercel.com/dashboard"
echo "  3. Click 'New Project' → Import Git Repository"
echo "  4. Select 'prompt-library'"
echo "  5. Add Environment Variables in Settings"
echo "  6. Click Deploy!"

echo ""
echo "✨ After deployment, test with:"
echo "  curl https://your-project.vercel.app/health"
echo ""
