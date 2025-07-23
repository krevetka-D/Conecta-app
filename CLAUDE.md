# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Conecta Alicante** is a full-stack mobile application designed for Erasmus students, freelancers, and entrepreneurs in Alicante, Spain. The app provides networking, resource management, and community features.

**Tech Stack:**
- **Frontend**: React Native (Expo SDK 53) with React Navigation v6
- **Backend**: Node.js with Express.js and MongoDB
- **Real-time**: Socket.io for chat and live features
- **Authentication**: JWT with access/refresh token pattern

## Essential Commands

### Frontend Development
```bash
cd frontend
npm start          # Start Expo development server
npm run web        # Run web version
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS simulator
npm test           # Run Jest tests
npm run lint       # Run ESLint checks
```

### Backend Development
```bash
cd backend
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run db:indexes # Create MongoDB indexes (run after schema changes)
npm run db:optimize # Optimize database performance
node scripts/createTestUser.js # Create test user for development
```

### Combined Development Workflow
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### Testing Individual Components
```bash
# Frontend - Run specific test file
cd frontend && npm test -- __tests__/specific.test.tsx

# Backend - Test specific endpoint
cd backend && curl -X GET http://localhost:5001/api/v1/health
```

## High-Level Architecture

### Frontend Architecture

**State Management Pattern:**
The app uses React Context API with three main contexts:
- `AuthContext`: Manages authentication state and user data
- `ThemeContext`: Handles theme preferences
- `AppContext`: Manages global app state

**Navigation Structure:**
```
RootNavigator
├── AuthNavigator (unauthenticated users)
│   ├── Welcome
│   ├── Login
│   └── Register
├── OnboardingNavigator (new users)
│   ├── PathSelection
│   └── PrioritySelection
└── MainNavigator (authenticated users)
    ├── Dashboard (Tab)
    ├── Forums (Stack)
    ├── Events (Stack)
    ├── Chat (Stack)
    └── Profile (Tab)
```

**Service Layer Pattern:**
All API calls go through service files in `frontend/src/services/`:
- Services use a centralized Axios client with interceptors
- Automatic token refresh on 401 responses
- Request/response logging in development

### Backend Architecture

**Request Flow:**
1. **Routes** (`/routes/*.js`) define endpoints
2. **Middleware** (`/middleware/*.js`) handles auth, validation, caching
3. **Controllers** (`/controllers/*.js`) process business logic
4. **Models** (`/models/*.js`) interact with MongoDB

**Key Middleware Pipeline:**
```javascript
app.use(authMiddleware)      // JWT validation
app.use(validationMiddleware) // Input sanitization
app.use(cacheMiddleware)     // Response caching
app.use(performanceMiddleware) // Performance monitoring
```

**Socket.io Integration:**
- Centralized socket handling in `/socket/socketHandlers.js`
- Room-based architecture for chat features
- User presence tracking with Redis (when configured)

### Cross-Cutting Concerns

**Authentication Flow:**
1. User logs in → Backend generates access (15m) + refresh (7d) tokens
2. Frontend stores tokens in AsyncStorage
3. API client automatically attaches access token to requests
4. On 401, client uses refresh token to get new access token
5. If refresh fails, user is logged out

**Real-time Features:**
- Socket.io connections authenticated via JWT
- Chat rooms use MongoDB for persistence + Socket.io for real-time
- Online status tracked in memory (or Redis if configured)

**Performance Optimizations:**
- Frontend: `OptimizedList` component for large lists
- Backend: Response caching with `cacheMiddleware`
- Database: Compound indexes on frequently queried fields
- Images: Lazy loading with `CachedImage` component

## Critical Development Patterns

### Adding New Features

**Frontend Screen Pattern:**
```javascript
// 1. Create screen in /screens/feature/
// 2. Add styles in /styles/screens/feature/
// 3. Create service in /services/
// 4. Add navigation in appropriate navigator
// 5. Update TabBar if needed
```

**Backend Endpoint Pattern:**
```javascript
// 1. Create model in /models/
// 2. Create controller in /controllers/
// 3. Create routes in /routes/
// 4. Add routes to /routes/api.js
// 5. Run npm run db:indexes if new indexes needed
```

### Database Indexing Strategy
The app uses compound indexes for performance. After modifying schemas:
```bash
cd backend && npm run db:indexes
```

Key indexes:
- User: email (unique), username (unique)
- Chat: roomId + createdAt (for message queries)
- Events: startDate + status (for upcoming events)

### Error Handling Pattern
- Frontend: ErrorBoundary components wrap major sections
- Backend: Async errors caught by errorMiddleware
- Socket.io: Errors emitted as 'error' events to clients

### Security Considerations
- Environment variables for sensitive data
- Helmet.js for security headers
- Rate limiting on authentication endpoints
- MongoDB injection prevention via Mongoose
- Input sanitization on all endpoints

## Environment Configuration

**Required Environment Variables:**

Backend (.env):
```
NODE_ENV=development|production
PORT=5001
MONGO_URI=mongodb://localhost:27017/conecta_alicante
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:8081
```

Frontend (uses config files):
- Development: `frontend/src/config/development.js`
- Production: Configure in `app.json` for Expo builds

## Common Development Tasks

### Running Database Migrations
```bash
cd backend
node scripts/migrateOnboarding.js  # Migrate user onboarding data
node scripts/optimizeDatabase.js    # General optimization
```

### Debugging Socket.io Connections
1. Check browser console for connection errors
2. Verify JWT token is being sent
3. Check backend logs for socket authentication
4. Use Socket.io admin UI (if enabled)

### Building for Production

**Mobile (iOS/Android):**
```bash
cd frontend
eas build --platform ios     # iOS build
eas build --platform android  # Android build
```

**Web:**
```bash
cd frontend
npm run build:web
```

**Backend:**
```bash
cd backend
npm start  # Uses PM2 configuration in ecosystem.js
```

## Performance Monitoring

The backend includes performance monitoring endpoints:
- `GET /api/v1/admin/performance` - System metrics
- `GET /api/v1/health` - Basic health check

Frontend performance tracked via:
- React DevTools Profiler
- Expo performance monitor
- Custom performance utilities in `/frontend/src/utils/performance.js`