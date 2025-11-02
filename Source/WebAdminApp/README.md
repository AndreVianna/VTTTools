# VTT Tools - Admin Web Application

React-based administrative interface for VTT Tools backend management.

## Features

- Admin Dashboard - Health monitoring, system metrics, recent activity
- User Management - Search, lock/unlock, role assignment
- Audit Log Viewer - Query, filter, export audit trails
- System Configuration - Feature flags, security settings, maintenance mode
- Public Library Management - Upload/publish system-owned content

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Material-UI 7** - Component library
- **Redux Toolkit 2.9** - State management
- **React Router 7** - Routing
- **Vite 7** - Build tool
- **Vitest 3** - Unit testing
- **Playwright** - E2E testing

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 5174)
npm run dev

# Start in standalone mode (without Aspire)
npm run dev:standalone

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint
npm run lint:fix
```

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # API services
├── store/           # Redux store and slices
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── config/          # Configuration files
├── App.tsx          # Root component
├── main.tsx         # Entry point
└── theme.ts         # MUI theme configuration
```

## Admin Port

- **Dev**: http://localhost:5193
- **Preview**: http://localhost:4193
- **Prod**: https://admin.vtttools.com
