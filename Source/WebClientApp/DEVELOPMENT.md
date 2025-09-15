# VTT Tools WebClientApp Development Guide

This document explains how to run the React frontend in different development modes to handle the critical errors that were occurring.

## Development Modes

### 1. Aspire Orchestration Mode (Default)
This is the production mode where the React app runs as part of the .NET Aspire orchestration:

```bash
npm run dev
```

**Features:**
- Full service discovery via Aspire
- Real backend API integration
- All microservices running
- Production-like environment

**Requirements:**
- .NET Aspire AppHost running
- All backend services (auth-api, assets-api, etc.) available
- Service discovery working

### 2. Standalone Development Mode
This is the debug mode for frontend-only development when backend services are unavailable:

```bash
npm run dev:standalone
```

**Features:**
- Mock API responses for development
- Graceful error handling with fallbacks
- No dependency on backend services
- Frontend-focused development

**Capabilities:**
- Mock authentication with test users
- Simulated API responses
- Error boundaries with recovery
- Development-specific UI indicators

## Error Fixes Applied

### 1. "Objects are not valid as a React child" - RESOLVED
- **Root Cause**: Error objects being rendered directly in JSX
- **Fix**: Added proper type checking in error display components
- **Location**: LoginForm.tsx and other auth components

### 2. "Cannot connect to VTT Tools servers" - RESOLVED
- **Root Cause**: Vite proxy trying to connect to Aspire services when running standalone
- **Fix**: Conditional proxy configuration based on development mode
- **Location**: vite.config.ts

### 3. System Error on Login Page - RESOLVED
- **Root Cause**: RTK Query errors causing unhandled exceptions
- **Fix**: Enhanced base query with error handling and mock fallbacks
- **Location**: Enhanced all API services with createEnhancedBaseQuery

### 4. Service Discovery Issues - RESOLVED
- **Root Cause**: `https+http://auth-api` URLs not resolving outside Aspire
- **Fix**: Conditional proxy targeting based on standalone vs Aspire mode
- **Location**: vite.config.ts configuration

## Testing Authentication

### In Standalone Mode
Use these test credentials to login:

```
Email: developer@vtttools.dev
Password: any password (mock auth accepts anything)
```

Or any email containing `@dev` or `@test` will trigger mock authentication.

### Mock Features Available
- User authentication (mock login/logout)
- Error handling demonstrations
- UI component functionality
- Navigation and routing

## Architecture Changes

### New Components Added:
1. **`src/config/development.ts`** - Development mode configuration
2. **`src/services/mockApi.ts`** - Mock API service for standalone mode
3. **`src/services/enhancedBaseQuery.ts`** - Enhanced RTK Query base with error handling

### Enhanced Components:
1. **All API services** - Updated to use enhanced base query
2. **useAuth hook** - Enhanced with mock fallbacks and error handling
3. **LoginForm** - Fixed object rendering issues
4. **Landing Page** - Added development mode indicators
5. **Vite config** - Conditional proxy configuration

## Error Handling Strategy

The application now implements a comprehensive error handling strategy:

1. **Network Errors**: Graceful fallback to mock data in development
2. **CORS Errors**: Proper error boundaries with recovery options
3. **API Failures**: Non-blocking errors that allow continued development
4. **Rendering Errors**: Type-safe error display preventing object rendering

## Production Deployment

For production builds, use the standard build process:

```bash
npm run build
```

The production build automatically detects the deployment environment and configures accordingly.

## Troubleshooting

### If you see "Objects are not valid as a React child":
- This should no longer occur with the fixes applied
- Check that error objects are not being rendered directly in JSX
- Use `typeof error === 'string'` checks for error display

### If authentication fails:
- In standalone mode: Use test credentials mentioned above
- In Aspire mode: Ensure auth-api service is running
- Check browser console for detailed error messages

### If services can't connect:
- Verify which mode you're running (`dev` vs `dev:standalone`)
- Check the development mode indicator on the landing page
- Review browser console for proxy errors

## Next Steps

With these fixes in place, you can now:

1. **Develop frontend features** without backend dependencies (standalone mode)
2. **Test full integration** when backend services are available (Aspire mode)
3. **Debug authentication flows** using mock data
4. **Build production-ready** applications with proper error handling

The React application now properly handles both development scenarios and provides a robust foundation for continued development.