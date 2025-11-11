# Platform Infrastructure Area

**Platform Infrastructure** is a cross-cutting technical area that provides foundational UI services, error handling mechanisms, and theming capabilities for the VTTTools application. This area handles application-wide concerns like layout structure, error boundaries, theme management, and global UI state.

---

## Change Log
- *2025-01-02* — **1.0.0** — Area specification created from React component analysis

---

## Area Overview

### Purpose
Platform Infrastructure provides the foundational infrastructure services that support all other features across the VTTTools application, including:
- Consistent application layout structure with header, footer, and navigation
- Comprehensive error handling with user-friendly error displays and recovery mechanisms
- Theme management supporting light/dark modes with Material-UI integration
- Global UI state management for notifications, modals, and loading states

### Bounded Context
This area is a **Supporting Subdomain** focused on technical infrastructure rather than business domain logic. It provides reusable platform services that other areas depend on but contains no domain-specific business rules.

### Business Value
- **User Experience**: Consistent, professional UI layout across all pages
- **Reliability**: Graceful error handling prevents application crashes and improves user confidence
- **Accessibility**: Theme switching and consistent styling improve usability
- **Developer Productivity**: Reusable components and centralized error handling reduce development time

---

## Domain Concepts

### Core Entities
1. **AppLayout**: Container component providing consistent application structure
2. **ErrorBoundary**: React error boundary with fallback UI and recovery options
3. **NetworkStatus**: Real-time network connectivity monitor with automatic retries
4. **GlobalErrorDisplay**: Centralized error notification and management system
5. **VTTThemeProvider**: Theme context provider with Material-UI theme configuration

### Value Objects
1. **Theme Configuration**: Color palettes, typography scales, spacing system
2. **Error State**: Error type, message, context, retry metadata
3. **Network Status**: Online status, connectivity, latency, retry count
4. **UI State**: Sidebar states, loading indicators, modal visibility

### Domain Services
1. **Error Handling Service** (`errorHandling.ts`): Global error processing, retry logic, user-friendly messaging
2. **Theme Service** (Redux `uiSlice`): Theme state management, theme toggle actions

---

## Features

### 1. Application Layout
**Type**: UI Infrastructure
**Description**: Provides consistent application structure with header, navigation, content area, and footer across all pages.

**Use Cases**:
- Render Application Layout
- Toggle Theme
- Navigate To Route

### 2. Error Handling
**Type**: Technical Infrastructure
**Description**: Comprehensive error detection, display, and recovery system handling React errors, network failures, asset loading errors, and validation failures.

**Use Cases**:
- Handle React Errors
- Display Network Status
- Handle Asset Loading Errors
- Recover From Encounter Errors
- Display Global Errors
- Validate Forms
- Display Service Unavailable

### 3. Theme Management
**Type**: UI Infrastructure
**Description**: Manages application theme state and provides Material-UI theme configuration for light and dark modes.

**Use Cases**:
- Provide Theme Context

---

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Error Handling**: React Error Boundaries + Custom Error Framework

### Integration Points
1. **Redux Store**: `uiSlice` for theme state, notifications, modals
2. **Redux Store**: `errorSlice` for error state management
3. **React Router**: Navigation integration in AppLayout
4. **Auth Context**: User authentication state in AppLayout header
5. **Material-UI**: Theme provider wrapping entire application

### External Dependencies
- `@mui/material`: Material-UI components and theming
- `@mui/icons-material`: Icon library
- `react-router-dom`: Routing
- `@reduxjs/toolkit`: State management

---

## Area Boundaries

### Responsibilities (What This Area DOES Handle)
✅ Application-wide layout structure (header, footer, navigation)
✅ Error boundary implementation and error recovery UI
✅ Network connectivity monitoring and status display
✅ Global error notification display and management
✅ Theme state management and Material-UI theme configuration
✅ Global UI state (notifications, modals, loading indicators)

### Non-Responsibilities (What This Area DOES NOT Handle)
❌ Domain-specific business logic (handled by domain areas)
❌ Authentication logic (handled by Security area)
❌ API communication details (handled by domain services)
❌ Data persistence (handled by infrastructure layer)
❌ Feature-specific validation rules (handled by domain areas)

### Dependencies
- **Depends On**: None (foundational area)
- **Depended On By**: All other areas (Security, Adventures, Encounters, etc.)

---

## Cross-Cutting Concerns

### Error Handling Strategy
The Platform Infrastructure area provides a unified error handling framework used across all features:

1. **Error Types**: `network`, `validation`, `authentication`, `authorization`, `asset_loading`, `encounter_save`, `encounter_load`, `system`
2. **Error Processing**: Centralized error classification, user-friendly message generation, retry capability detection
3. **Error Display**: Global error notifications, error boundaries with fallback UI, network status indicators
4. **Error Recovery**: Automatic retry with exponential backoff, manual retry buttons, navigation to safe states

### Theme Management
All areas use the centralized theme system:
- **Theme Modes**: Light and dark modes
- **Color Palette**: Studio Professional color scheme (Primary Blue #2563EB, Secondary Purple #7C3AED)
- **Typography**: Inter font family with consistent type scale
- **Component Styling**: Material-UI component customizations for buttons, cards, forms

### Layout Integration
All feature pages use the AppLayout component:
- **Header**: Branding, theme toggle, authentication controls
- **Content**: Flexible main content area (`children` prop)
- **Footer**: Links and copyright information

---

## Implementation Notes

### Current Implementation Status
✅ **Implemented**:
- AppLayout with header, footer, user menu
- ErrorBoundary with custom fallback UI
- NetworkStatus with connectivity monitoring
- GlobalErrorDisplay with notification stack
- ServiceUnavailablePage for service errors
- VTTThemeProvider with Material-UI theme
- Error handling utilities (`errorHandling.ts`)
- UI state management (`uiSlice.ts`)

### Code Locations
- **Components**: `Source/WebClientApp/src/components/layout/`, `error/`, `theme/`
- **Utilities**: `Source/WebClientApp/src/utils/errorHandling.ts`
- **State**: `Source/WebClientApp/src/store/slices/uiSlice.ts`, `errorSlice.ts`
- **Hooks**: `Source/WebClientApp/src/hooks/useAuth.tsx`

### Testing Strategy
- **Unit Tests**: Component rendering, error classification, theme state management
- **Integration Tests**: Error boundary behavior, network status monitoring, theme switching
- **Visual Tests**: Layout responsiveness, theme consistency, error display clarity

---

This Platform Infrastructure area provides essential foundational services enabling consistent UX, reliable error handling, and professional visual design across the VTTTools application.
