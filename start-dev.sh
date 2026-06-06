#!/bin/bash

# Alpha 2 Development Server Startup Script

set -e

echo "🚀 Alpha 2 - Starting Development Environment"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "${YELLOW}Setting up backend environment...${NC}"
    cp backend/.env.example backend/.env
    echo "${GREEN}✓ Backend .env created${NC}"
fi

# Install backend dependencies if not already installed
if [ ! -d "backend/venv" ]; then
    echo "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    deactivate
    cd ..
    echo "${GREEN}✓ Backend dependencies installed${NC}"
fi

# Install frontend dependencies if not already installed
if [ ! -d "frontend/node_modules" ]; then
    echo "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install > /dev/null 2>&1
    cd ..
    echo "${GREEN}✓ Frontend dependencies installed${NC}"
fi

echo ""
echo "${BLUE}Starting servers...${NC}"
echo ""

# Start backend in background
echo "${GREEN}Backend:${NC} http://localhost:8000"
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/alpha2-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start frontend in background
echo "${GREEN}Frontend:${NC} http://localhost:5173"
cd frontend
npm run dev > /tmp/alpha2-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "${GREEN}✨ Development servers started!${NC}"
echo ""
echo "${BLUE}Access your application:${NC}"
echo "  🌐 http://localhost:5173"
echo ""
echo "${BLUE}Logs:${NC}"
echo "  Backend:  tail -f /tmp/alpha2-backend.log"
echo "  Frontend: tail -f /tmp/alpha2-frontend.log"
echo ""
echo "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
