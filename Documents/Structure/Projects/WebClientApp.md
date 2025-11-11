# WebClientApp

**Type**: React Single Page Application
**Path**: Source/WebClientApp/
**Framework**: React 19.1.1 + TypeScript 5.9.2
**Layer**: UI (Primary SPA Client)

---

## Purpose

Modern React-based single page application providing the primary user interface for VTTTools. Implements all user-facing features with Material-UI components, Redux Toolkit state management, and Konva canvas for interactive encounter editing.

---

## Features Implemented

- **Authentication & User Management**: Login, register, 2FA, password reset pages with React Hook Form
- **Media Resource Management**: Media upload UI, asset display integration (in development)
- **Game Content Hierarchy**: Content management UI for epics, campaigns, adventures, encounters (in development)
- **Asset Management**: Asset library browsing and creation UI (in development)
- **Interactive Encounter Editor**: Konva-based canvas with panning, zoom, grid overlay, token placement (in progress)
- **Game Session Management**: Real-time collaboration via SignalR for chat, dice rolls, state sync (planned)

---

## Key Components

### Pages
- **LandingPage**: Hero section with call-to-action for unauthenticated users
- **LoginPage**: Authentication forms (login, register, 2FA, password reset) with form validation
- **ServiceUnavailablePage**: Error page for backend unavailability

### Authentication Components
- **SimpleLoginForm**: Login form with email/password validation
- **SimpleRegistrationForm**: Registration form with password confirmation

### Layout Components
- **AppLayout**: Main layout wrapper with ErrorBoundary, NetworkStatus, and GlobalErrorDisplay
- **VTTThemeProvider**: Material-UI theme configuration with Studio Professional color palette

### Error Components
- **ErrorBoundary**: React error boundary for graceful error handling
- **GlobalErrorDisplay**: Toast notifications for errors
- **NetworkStatus**: Connection status indicator

### State Management (Redux Toolkit)
- **authSlice**: Authentication state (user, tokens, login status)
- **errorSlice**: Global error state
- **uiSlice**: UI state (theme, modals, loading indicators)

### API Integration (RTK Query)
- REST API calls to VttTools.WebApp backend
- SignalR client integration for real-time features (in progress)

---

## Technology Stack

**Core Framework**:
- React 19.1.1
- TypeScript 5.9.2
- Vite 7.1.5 (build tool and dev server)

**UI Framework**:
- Material-UI (MUI) 7.3.2
- Emotion 11.x (CSS-in-JS styling)

**State Management**:
- Redux Toolkit 2.9.0
- RTK Query (API calls and caching)

**Routing**:
- React Router 7.9.1

**Forms**:
- React Hook Form 7.62.0

**Canvas Rendering**:
- Konva 10.0.2
- React-Konva 19.0.10

**Real-time Communication**:
- @microsoft/signalr 9.0.6

**HTTP Client**:
- Axios 1.12.1

**Testing**:
- Vitest 0.34.6 (unit tests)
- Testing Library 16.3.0 (component tests)
- Playwright 1.55.0 (E2E tests)

---

## Dependencies

**Internal**:
- None (consumes VttTools.WebApp REST API via HTTP)

**External**:
- See Technology Stack above for complete dependency list

**Consumes**:
- VttTools.WebApp REST API endpoints
- VttTools.WebApp SignalR hubs (ChatHub, GameSessionHub)

---

## Routing Structure

- `/` - LandingPage (hero section with CTA)
- `/login` - LoginPage (authentication forms)
- `/register` - LoginPage (registration flow)
- `/reset-password` - LoginPage (password reset)
- `/error/service-unavailable` - ServiceUnavailablePage
- `/dashboard` - Placeholder (redirects to `/` - future dashboard)
- `/*` - Catch-all (redirects to `/`)

---

## UI Design System

**Theme**: Studio Professional color palette with Inter font family
**Styling Approach**: Emotion CSS-in-JS with MUI styled components
**Responsive Strategy**: Mobile-first with MUI breakpoints
**Layout Pattern**: AppLayout wrapper with error boundaries

**Supported UI Types**:
- FULL_PAGE: Landing, login, dashboard
- MODAL: Future (delete confirmations, quick actions)
- FORM: Login, registration, settings
- WIDGET: Error displays, network status
- BUTTON: Logout, navigation actions

---

## Development Phase Status

**Phase 1 (Authentication)**: ✅ Complete
- Login, register, 2FA, password reset pages implemented
- React Hook Form validation
- Redux auth state management
- JWT token storage

**Phase 2 (Content Management)**: 🚧 In Progress
- Content management UI for epics, campaigns, adventures, encounters (planned)
- Asset library browsing and creation UI (planned)

**Phase 3 (Encounter Editor)**: 🚧 In Progress
- Konva canvas rendering: ✅ Complete
- Panning and zoom: ✅ Complete
- Grid overlay: 🚧 In Progress
- Token placement: 🚧 In Progress

**Phase 4 (Real-time Collaboration)**: 📋 Planned
- SignalR integration for chat, dice rolls, game state sync

---

## Build Commands

- **Development Server**: `npm run dev` (Vite dev server on port 5173)
- **Build**: `npm run build` (production build to dist/)
- **Test**: `npm run test` (Vitest unit tests)
- **E2E Test**: `npm run test:e2e` (Playwright E2E tests)
- **Lint**: `npm run lint` (ESLint)
- **Type Check**: `npm run type-check` (TypeScript compiler)

---

## Architecture Notes

- **React 19 Features**: Uses latest React 19 features (Actions, useOptimistic, etc.)
- **Type Safety**: Full TypeScript coverage with strict mode
- **Redux Best Practices**: Redux Toolkit slices, RTK Query for API calls
- **Component Architecture**: Functional components with hooks
- **Error Handling**: Global error boundaries and toast notifications
- **Real-time Ready**: SignalR client configured for WebSocket connections
- **Canvas Performance**: Konva for hardware-accelerated 2D rendering
- **Responsive Design**: Mobile-first with MUI breakpoints
- **Progressive Enhancement**: Basic functionality without JavaScript, enhanced with React
