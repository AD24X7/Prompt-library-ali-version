#!/bin/bash

# Prompt Library - Startup Script
# This script starts both backend and frontend servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Prompt Library Startup${NC}"
echo "================================"

# Kill any existing processes on ports 5000 and 3000
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend
echo -e "${GREEN}Starting Backend Server...${NC}"
cd "$SCRIPT_DIR/backend"
node server-new.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Check backend status
if curl -s http://localhost:5000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend started but health check may be failing (possible database issue)${NC}"
    echo "   Check logs: tail -f /tmp/backend.log"
fi

# Start frontend
echo -e "${GREEN}Starting Frontend Application...${NC}"
cd "$SCRIPT_DIR/frontend"
npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 5

# Check frontend status
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is starting (may take a moment)${NC}"
    echo "   Check logs: tail -f /tmp/frontend.log"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:5000"
echo "API:       http://localhost:5000/api"
echo "Health:    http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""
echo "Log files:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}Shutting down...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

wait
