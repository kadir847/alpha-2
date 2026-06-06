# Alpha 2 Authentication - Quick Start Guide

## ✅ What's Fixed

The authentication system is now fully functional with:
- User registration (create new accounts)
- User login (existing users)
- JWT token generation and validation
- Session persistence across page reloads
- Enhanced error messages for better debugging

## 🚀 Getting Started

### 1. Backend Setup (Already Done)
The backend is running on `http://localhost:8000`

Check the backend is running:
```bash
curl http://localhost:8000/health
```

### 2. Frontend Setup (Already Done)
The frontend is running on `http://localhost:5173`

### 3. Database
SQLite database is created automatically at `backend/alpha2.db`

## 📝 How to Test Authentication

### Option 1: Via Web Browser (Recommended)
1. Open http://localhost:5173 in your browser
2. You'll be redirected to the login page
3. Click "Need an account?" to go to registration
4. Register with any email and password (min 8 characters)
5. You'll be logged in automatically
6. You can now access the chat interface at http://localhost:5173

### Option 2: Via Command Line
```bash
# Register a new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"password123"}'

# Get current user (replace TOKEN with access_token from login response)
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/auth/me
```

## 🔑 Key Features

- **Email Validation**: Email must be valid format
- **Password Requirements**: Minimum 8 characters
- **Auto-save Sessions**: Token persists in browser localStorage
- **Error Handling**: Clear error messages for:
  - Email already registered (409)
  - Invalid email/password (401)
  - Network errors
- **Automatic Redirect**: Logged-in users go to chat, logged-out users go to login

## 📱 Pages

- `/login` - Login page
- `/register` - Registration page  
- `/` - Chat interface (requires authentication)
- `/settings` - User settings (requires authentication)

## 🐛 Debugging

Check browser console (F12) for:
- API request/response logs
- Authentication errors
- Network issues

Console shows:
```
API Base URL: http://localhost:8000
API Request: POST /auth/register
API Response: 200 /auth/register
```

## ❌ Troubleshooting

**"Cannot connect to backend"**
- Ensure backend is running: `cd backend && uvicorn app.main:app --reload`

**"Email already registered"**
- Use a different email or clear database: `rm backend/alpha2.db`

**"Invalid email or password"**
- Check email/password are correct
- Passwords must be at least 8 characters

**"Session not persisting"**
- Browser localStorage is saved at: `window.localStorage.getItem('alpha2-auth')`
- Clear and try again if needed

## 📚 Architecture

```
Frontend (React + Zustand)
    ↓
API Client (Axios)
    ↓
Backend (FastAPI)
    ↓
Database (SQLite)
```

**Authentication Flow:**
1. User submits email/password
2. Frontend calls `/auth/register` or `/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in Zustand store + localStorage
5. Token sent in `Authorization: Bearer <token>` header
6. Backend validates token and allows access

## ✨ What's Working

- [x] User registration
- [x] User login
- [x] Session persistence
- [x] Token validation
- [x] Protected routes
- [x] Error handling
- [x] Auto-logout on invalid token

Enjoy your secure AI workspace! 🎉
