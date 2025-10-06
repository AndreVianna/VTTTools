# Render Login Page Use Case

**Original Request**: Display authentication interface with multiple modes (login, register, 2FA, password reset)

**Render Login Page** is a UI presentation use case that displays the multi-mode authentication interface for VTT Tools. This use case operates within the Identity area and enables users to access different authentication flows through a unified, mode-based page rendering system.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from React LoginPage.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Provides unified, intuitive entry point for all authentication operations
- **User Benefit**: Single page handles all auth modes, reducing navigation complexity

### Scope Definition
- **Primary Actor**: Unauthenticated User, System
- **Scope**: Frontend UI presentation and routing integration
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: FULL_PAGE
- **Access Method**: Direct routes (/login, /register) or programmatic navigation

- **Route**: /login (default), /register, /login?email={email}&token={token}
- **Page Layout**: Centered content container with mode-specific form rendering
- **Navigation**: Direct URL access, navigation links from landing page, redirects from protected routes
- **Key UI Elements**:
  - Router: React Router integration for URL-based mode detection
  - Container: Responsive MUI Container (maxWidth="sm")
  - Form Renderer: Dynamic form component based on current mode
  - Mode State: Internal useState for managing active authentication mode
  - URL Params: searchParams and location.pathname for initial mode detection

### UI State Requirements
- **Data Dependencies**: URL query parameters (email, token), pathname for mode detection
- **State Scope**: Local component state (mode), URL state (query params)
- **API Calls**: None (pure presentation component)
- **State Management**: React useState for mode, useSearchParams for URL, useLocation for path

### UI Behavior & Flow
- **User Interactions**:
  1. User navigates to /login → renders login form
  2. User navigates to /register → renders registration form
  3. User receives reset email, clicks link → renders reset-confirm form with email+token
  4. Forms trigger mode switches (e.g., "Switch to Register" → setMode('register'))
- **Validation Feedback**: Delegated to child form components
- **Loading States**: Delegated to child form components
- **Success Handling**: Forms handle success (e.g., login redirects to dashboard)
- **Error Handling**: Forms handle errors (display inline alerts)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: None (pure UI presentation component)
- **Domain Entities**: None (no business logic)
- **Domain Services**: None
- **Infrastructure Dependencies**: React Router for URL management

### Hexagonal Architecture
- **Primary Port Operation**: N/A (UI component, not service)
- **Secondary Port Dependencies**: None
- **Adapter Requirements**: React Router integration

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Authentication modes, form rendering, route-based navigation
- **Business Invariants**: None (presentation only)
- **Domain Events**: None (delegates to child components)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - URL path: /login, /register
  - URL query params: `email` (string), `token` (string)
  - Form callbacks: mode switch functions (onSwitchToRegister, onSwitchToLogin, etc.)
- **Input Validation**: URL parameter existence checks
- **Preconditions**: React Router context available, component mounted

### Business Logic
- **Business Rules**:
  - If email AND token params present → render reset-confirm form
  - If pathname is /register → render registration form
  - Default mode is 'login'
  - After successful login with requiresTwoFactor → switch to two-factor mode
- **Processing Steps**:
  1. useEffect monitors URL changes (searchParams, pathname)
  2. Determine appropriate mode based on URL state
  3. Update local mode state
  4. Render corresponding form component
  5. Pass mode-switch callbacks to forms
- **Domain Coordination**: None (pure UI orchestration)
- **Validation Logic**: Check for email+token params, validate pathname matches

### Output Specification
- **Output Data**: Rendered authentication form component
- **Output Format**: React JSX with Material-UI components
- **Postconditions**: Appropriate form displayed based on mode

### Error Scenarios
- **Missing Router Context**: Component fails to mount (React error boundary)
- **Invalid Mode State**: Falls back to login form (default case in switch)
- **URL Parameter Mismatch**: If only email or only token provided → ignored, renders login
- **Form Render Error**: Caught by React error boundary, displays error UI

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: React functional component with router hooks
- **Data Access Patterns**: URL query parameters via useSearchParams, pathname via useLocation
- **External Integration**: React Router v6 hooks (useSearchParams, useLocation, useNavigate)
- **Performance Requirements**: Instant mode switching (<100ms), no unnecessary re-renders

### Architecture Compliance
- **Layer Responsibilities**:
  - Presentation: Mode detection, form rendering, callback coordination
  - No Application or Domain layer involvement
- **Dependency Direction**: Depends on child form components, React Router
- **Interface Abstractions**: Form components accept standardized callback props
- **KISS Validation**: Simple mode state machine, no complex logic

### Testing Strategy
- **Unit Testing**:
  - Test mode detection logic for each URL pattern
  - Test mode switching via callbacks
  - Test default mode fallback
- **Integration Testing**:
  - Test with React Router context
  - Test URL parameter parsing
  - Test form component rendering
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given user navigates to /login, When page loads, Then login form is displayed
  - Given user navigates to /register, When page loads, Then registration form is displayed
  - Given reset link with email and token, When page loads, Then password reset confirm form is displayed

---

## Acceptance Criteria

- **AC-01**: Default login mode renders correctly
  - **Given**: User navigates to /login with no query parameters
  - **When**: LoginPage component mounts
  - **Then**: SimpleLoginForm component is rendered

- **AC-02**: Registration mode renders via URL
  - **Given**: User navigates to /register
  - **When**: LoginPage component mounts
  - **Then**: SimpleRegistrationForm component is rendered

- **AC-03**: Password reset mode triggered by URL params
  - **Given**: User clicks reset link with ?email=user@test.com&token=abc123
  - **When**: LoginPage component detects both params
  - **Then**: PasswordResetConfirmForm is rendered with email and token

- **AC-04**: Two-factor mode triggered by login result
  - **Given**: User successfully logs in with 2FA enabled account
  - **When**: Login callback returns requiresTwoFactor: true
  - **Then**: Mode switches to 'two-factor' and TwoFactorVerificationForm is displayed

- **AC-05**: Mode switching works bidirectionally
  - **Given**: User is on login form
  - **When**: User clicks "Create your account" link
  - **Then**: Mode changes to 'register' and registration form displays

- **AC-06**: URL changes trigger mode updates
  - **Given**: User is on login page
  - **When**: Browser URL changes to /register (via navigation or back button)
  - **Then**: useEffect detects change and updates mode to 'register'

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React functional component with hooks
- **Code Organization**: Component in src/pages/auth/LoginPage.tsx, uses form components from src/components/auth/
- **Testing Approach**: React Testing Library for component tests, MSW for API mocking

### Dependencies
- **Technical Dependencies**:
  - React 18+
  - React Router v6 (useSearchParams, useLocation, useNavigate)
  - Material-UI components (Box, Container, Typography, Paper)
  - All auth form components (SimpleLoginForm, SimpleRegistrationForm, etc.)
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Self-contained within Identity UI layer
- **Interface Design**: Clean prop interfaces for child components with callback functions
- **Error Handling**: Delegates to child components, uses React error boundaries

---

This Render Login Page use case provides comprehensive implementation guidance for the multi-mode authentication interface within the Identity area while maintaining clean architecture and excellent user experience.
