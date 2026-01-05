#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 Prompt Library - Full Stack Starter               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node server-new.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "📦 Starting Backend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$SCRIPT_DIR/backend"

# Start backend in background
node server-new.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend is running (PID: $BACKEND_PID)"
    echo "   URL: http://localhost:5000"
    echo "   Health: http://localhost:5000/health"
    echo "   API: http://localhost:5000/api"
    
    # Show first few lines of backend log
    echo ""
    echo "Backend Log:"
    head -3 /tmp/backend.log | sed 's/^/   /'
else
    echo "❌ Backend failed to start"
    cat /tmp/backend.log
    exit 1
fi

echo ""
echo "📱 Starting Frontend Application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$SCRIPT_DIR/frontend"

# Start frontend in background
npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start (this may take 30-60 seconds)..."
sleep 10

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend is starting (PID: $FRONTEND_PID)"
    echo "   URL: http://localhost:3000"
else
    echo "⚠️  Frontend startup status unclear"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 All Systems Running!                     ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Frontend:  http://localhost:3000                             ║"
echo "║  Backend:   http://localhost:5000                             ║"
echo "║  API:       http://localhost:5000/api                         ║"
echo "║                                                                ║"
echo "║  📊 Real-time Logs:                                           ║"
echo "║     Backend:  tail -f /tmp/backend.log                        ║"
echo "║     Frontend: tail -f /tmp/frontend.log                       ║"
echo "║                                                                ║"
echo "║  ℹ️  Status:                                                   ║"
echo "║     • Database: Connection issues detected                    ║"
echo "║     • Using: Mock data mode for testing                       ║"
echo "║     • Once DB is available, restart backend                  ║"
echo "║                                                                ║"
echo "║  ⌨️  Commands:                                                 ║"
echo "║     • Stop: Press Ctrl+C in terminal                         ║"
echo "║     • Restart Backend: cd backend && npm run dev             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null

# Cleanup on exit
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM EXIT
