# Display Auth Status Use Case

**Original Request**: Show current authentication state and user menu in application header

**Display Auth Status** is a UI presentation operation that renders the current user's authentication status, profile information, and provides access to account management options. This use case operates within the Identity area and enables users to view their authentication state and access profile/security settings.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from AuthStatus.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Persistent authentication state visibility and quick access to account management
- **User Benefit**: Always know login status, quick access to profile/logout

### Scope Definition
- **Primary Actor**: Any User (authenticated or not)
- **Scope**: Authentication state display and user menu presentation
- **Level**: User Interface Component

---

## UI Presentation

### Presentation Type
- **UI Type**: WIDGET
- **Access Method**: Persistent component in application header/navigation

- **Component Type**: Reusable widget
- **Used In**: Application header, navigation bar (all authenticated pages)
- **Props Required**: Navigation callbacks (onNavigateToProfile, onNavigateToSecurity, onNavigateToLogin, onNavigateToRegister), showFullControls flag
- **Key UI Elements**:
  - **Unauthenticated State**:
    - IconButton: "Sign In" with LoginIcon
    - IconButton: "Sign Up" with PersonAdd icon
    - Text: "Not signed in" (if showFullControls=false)
  - **Loading State**:
    - Avatar: Person icon placeholder
    - Text: "Loading..."
  - **Authenticated State**:
    - Avatar: User profile picture or initials
    - Text: Name (body2)
    - Text: DisplayName (body2, fontWeight: medium)
    - Text: Email with verified checkmark icon (if emailConfirmed)
    - Chip: "2FA" badge (if twoFactorEnabled, success color)
    - Chip: "Verify Email" badge (if !emailConfirmed, warning color)
    - Menu: Dropdown with profile options
  - **User Menu Items**:
    - MenuItem: "Profile Settings" with Person icon
    - MenuItem: "Security & Privacy" with Security icon
    - Divider
    - MenuItem: LogoutButton component

### UI State Requirements
- **Data Dependencies**: useAuth hook (user, isAuthenticated, isLoading states)
- **State Scope**: Global auth context, local menu state (anchorEl for dropdown)
- **API Calls**: None (reads from auth context)
- **State Management**: Auth Context for user data, React useState for menu open/close

### UI Behavior & Flow
- **User Interactions**:
  - **Unauthenticated**:
    1. User sees login/register icons (or "Not signed in" text)
    2. Click icons to navigate to login/register pages
  - **Authenticated**:
    1. User sees avatar, displayName, email, badges
    2. Click avatar/info to open dropdown menu
    3. Select menu option (Profile, Security, or Logout)
    4. Navigate to selected page or execute action
- **Validation Feedback**: N/A (display only)
- **Loading States**: Shows loading spinner/placeholder while auth state loads
- **Success Handling**: N/A (display component)
- **Error Handling**: N/A (gracefully handles missing data)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: None (pure UI presentation component)
- **Domain Entities**: None (consumes UserDto from context)
- **Domain Services**: None
- **Infrastructure Dependencies**: Auth Context provider

### Hexagonal Architecture
- **Primary Port Operation**: N/A (UI component)
- **Secondary Port Dependencies**: None
- **Adapter Requirements**: React Context integration

### DDD Alignment
- **Bounded Context**: Identity (UI layer)
- **Ubiquitous Language**: Authentication status, user profile, session state
- **Business Invariants**: None (display only)
- **Domain Events**: None (consumes events indirectly via context)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - user object (UserDto | null) from Auth Context
  - isAuthenticated (boolean) from Auth Context
  - isLoading (boolean) from Auth Context
  - Navigation callbacks (optional functions)
  - showFullControls (boolean, default: true)
- **Input Validation**: None required
- **Preconditions**: Auth Context provider exists in component tree

### Business Logic
- **Business Rules**:
  - Show loading state while auth status is being determined
  - Show login/register actions if not authenticated
  - Show user info and menu if authenticated
  - Display security badges (2FA, email verification) prominently
  - Email verified indicator (checkmark) for confirmed emails
  - Warning indicator for unverified emails
- **Processing Steps**:
  1. Read auth state from useAuth hook
  2. Determine display mode (loading, unauthenticated, authenticated)
  3. Render appropriate UI elements
  4. Handle menu interactions (open/close, navigation)
- **Domain Coordination**: None (pure UI)
- **Validation Logic**: None

### Output Specification
- **Output Data**: Rendered React component (JSX)
- **Output Format**: Material-UI components (Avatar, Menu, IconButton, Chip, Typography)
- **Postconditions**: User understands current auth state

### Error Scenarios
- **Missing User Data**: Gracefully shows "Not signed in" or loading state
- **Missing Auth Context**: Component fails to mount (development error)
- **Navigation Callback Missing**: Menu items disabled or hidden

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface AuthStatusProps {
    onNavigateToProfile?: () => void
    onNavigateToSecurity?: () => void
    onNavigateToLogin?: () => void
    onNavigateToRegister?: () => void
    showFullControls?: boolean
  }
  ```
- **Data Access Patterns**: Read-only access to Auth Context
- **External Integration**: None
- **Performance Requirements**: Instant rendering, no API calls

### Architecture Compliance
- **Layer Responsibilities**: Presentation layer only, no business logic
- **Dependency Direction**: Depends on Auth Context (inward)
- **Interface Abstractions**: UserDto interface from domain
- **KISS Validation**: Simple conditional rendering based on auth state

### Testing Strategy
- **Unit Testing**:
  - Test rendering in loading state
  - Test rendering in unauthenticated state
  - Test rendering in authenticated state
  - Test 2FA badge display
  - Test email verification badge display
  - Test menu open/close
  - Test navigation callbacks
- **Integration Testing**:
  - Test with actual Auth Context
  - Test state updates when auth changes
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given unauthenticated user, When component renders, Then login/register buttons shown
  - Given authenticated user, When component renders, Then avatar and user menu shown
  - Given user with 2FA enabled, When component renders, Then "2FA" badge displayed
  - Given user with unverified email, When component renders, Then "Verify Email" warning shown

---

## Acceptance Criteria

- **AC-01**: Loading state displays correctly
  - **Given**: Auth state is loading (isLoading=true)
  - **When**: Component renders
  - **Then**: Avatar placeholder with "Loading..." text is shown

- **AC-02**: Unauthenticated state with controls
  - **Given**: User not authenticated (isAuthenticated=false) and showFullControls=true
  - **When**: Component renders
  - **Then**: Login and Register icon buttons are displayed

- **AC-03**: Unauthenticated state without controls
  - **Given**: User not authenticated and showFullControls=false
  - **When**: Component renders
  - **Then**: "Not signed in" text is displayed

- **AC-04**: Authenticated user info display
  - **Given**: User is authenticated with displayName="GameMaster" and email="gm@test.com"
  - **When**: Component renders
  - **Then**: Avatar shows "G", displayName "GameMaster" and email "gm@test.com" are displayed

- **AC-05**: Email verified indicator
  - **Given**: User is authenticated with emailConfirmed=true
  - **When**: Component renders
  - **Then**: Checkmark icon (green) appears next to email

- **AC-06**: Email verification warning
  - **Given**: User is authenticated with emailConfirmed=false
  - **When**: Component renders
  - **Then**: "Verify Email" warning chip (orange) is displayed

- **AC-07**: 2FA enabled badge
  - **Given**: User is authenticated with twoFactorEnabled=true
  - **When**: Component renders
  - **Then**: "2FA" success badge (green) is displayed

- **AC-08**: User menu functionality
  - **Given**: Authenticated user clicks on avatar/user info
  - **When**: Click event fires
  - **Then**: Dropdown menu opens with Profile Settings, Security & Privacy, and Logout options

- **AC-09**: Menu navigation
  - **Given**: User menu is open
  - **When**: User clicks "Profile Settings"
  - **Then**: onNavigateToProfile callback is executed, menu closes

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Stateless React component with Auth Context consumption
- **Code Organization**: Component in src/components/auth/AuthStatus.tsx
- **Testing Approach**: RTL for component rendering and interactions

### Dependencies
- **Technical Dependencies**:
  - React useAuth custom hook
  - Material-UI Avatar, Menu, MenuItem, IconButton, Chip, Typography
  - Material-UI Icons (Person, Security, CheckCircle, Warning, Login, PersonAdd, Logout)
  - LogoutButton component
- **Area Dependencies**: None
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Pure UI component, no cross-area concerns
- **Interface Design**: Flexible props for navigation callbacks, optional controls
- **Error Handling**: Graceful degradation for missing data or callbacks
- **UX Considerations**:
  - Avatar shows first letter of username
  - Profile picture if available
  - Clear visual indicators for security status (2FA, email verification)
  - Responsive design (hide username/email on small screens)

---

This Display Auth Status use case provides comprehensive implementation guidance for authentication state presentation within the Identity area while maintaining excellent user experience and clear security indicators.
