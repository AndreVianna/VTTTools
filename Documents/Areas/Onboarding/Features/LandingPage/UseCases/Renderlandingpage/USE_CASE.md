# Render Landing Page Use Case

**Original Request**: Onboarding area landing page orchestration from React implementation

**Render Landing Page** is a presentation orchestration use case that coordinates the display of appropriate content based on user authentication state. This use case operates within the Onboarding area and enables both authenticated users and visitors to see contextually appropriate landing content on the root route.

---

## Change Log
- *2025-10-03* — **1.0.1** — Updated to reflect Dashboard Preview now shows quick action cards (see DisplayDashboardPreview v1.1.0)
- *2025-01-15* — **1.0.0** — Use case specification created from React implementation analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Landing Page
- **Owning Area**: Onboarding
- **Business Value**: Provide seamless, contextually appropriate landing experience that maximizes engagement for both visitor conversion and authenticated user retention
- **User Benefit**: Users see relevant content immediately without confusion or unnecessary navigation

### Scope Definition
- **Primary Actor**: Any user accessing the application (authenticated or visitor)
- **Scope**: Landing page orchestration and conditional rendering
- **Level**: User goal level

---

## UI Presentation

### Presentation Type
- **UI Type**: FULL_PAGE
- **Access Method**: Direct URL navigation to root path

- **Route**: /
- **Page Layout**: Container with conditional content rendering based on authentication state
- **Navigation**: Default landing route, accessible from application header, direct URL entry
- **Key UI Elements**:
  - Container: Material-UI Container (maxWidth: lg) with vertical padding
  - Conditional Branch: isAuthenticated check determines content rendering
  - Hero Section: Displayed when user is NOT authenticated (visitor mode)
  - Dashboard Preview: Displayed when user IS authenticated (member mode)

### UI State Requirements
- **Data Dependencies**: Authentication state (isAuthenticated, user.userName)
- **State Scope**: Global authentication context from Identity area
- **API Calls**: None (reads from existing auth context)
- **State Management**: useAuth hook from Identity context provider

### UI Behavior & Flow
- **User Interactions**:
  1. User navigates to root URL (/)
  2. Component reads authentication state from useAuth hook
  3. Component conditionally renders Hero Section OR Dashboard Preview
  4. **If not authenticated**: User interacts with Hero CTAs (Start Creating → /register, Explore Features → /login)
  5. **If authenticated**: User interacts with quick action cards (Encounter Editor clickable, others show phase status)
- **Validation Feedback**: N/A (no form validation in orchestration)
- **Loading States**: Authentication context loading handled by Identity area
- **Success Handling**: Successful auth state read triggers appropriate content rendering
- **Error Handling**: Auth context errors handled by Identity area; fallback to visitor mode

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: N/A (pure presentation component)
- **Domain Entities**: None (consumes Identity User state via context)
- **Domain Services**: None
- **Infrastructure Dependencies**: React Router for navigation, Identity AuthContext

### Hexagonal Architecture
- **Primary Port Operation**: N/A (UI presentation layer)
- **Secondary Port Dependencies**: IAuthenticationContext (Identity area)
- **Adapter Requirements**: React component adapter consuming auth context

### DDD Alignment
- **Bounded Context**: Onboarding
- **Ubiquitous Language**: Landing Page, Hero Section, Dashboard Preview, Visitor, Authenticated User
- **Business Invariants**: None (presentation logic only)
- **Domain Events**: None (read-only presentation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Authentication state from Identity context (isAuthenticated: boolean, user?: User)
- **Input Validation**: None required (trust Identity area validation)
- **Preconditions**:
  - React Router initialized and routing to /
  - Identity AuthContext provider available in component tree
  - useAuth hook accessible

### Business Logic
- **Business Rules**:
  - If isAuthenticated === true → Display Dashboard Preview with user greeting
  - If isAuthenticated === false → Display Hero Section with marketing content
  - User greeting displays user.userName with fallback to "Game Master"
- **Processing Steps**:
  1. Component mounts on / route
  2. useAuth hook reads authentication context
  3. Destructure isAuthenticated and user from hook result
  4. Conditional rendering based on isAuthenticated flag
  5. Render appropriate child component (Hero or Dashboard Preview)
- **Domain Coordination**: None (consumes Identity state, no domain operations)
- **Validation Logic**: None (read-only presentation)

### Output Specification
- **Output Data**: Rendered React component tree
- **Output Format**:
  - Container with responsive layout
  - Conditional content: HeroContainer OR DashboardContainer
  - CTAs with navigation handlers
- **Postconditions**:
  - User sees contextually appropriate landing content
  - CTAs are functional and navigate correctly
  - Responsive design adapts to viewport

### Error Scenarios
- **Auth Context Unavailable**: Render error boundary or fallback to visitor mode
- **User Data Missing**: Display generic greeting "Game Master" instead of user.userName
- **Navigation Failure**: Button onClick handlers log error and show user feedback
- **Component Mount Error**: React error boundary captures and displays error state

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: React functional component with no props
- **Data Access Patterns**: useAuth hook (Identity context consumption)
- **External Integration**: React Router navigation, MUI styled components
- **Performance Requirements**:
  - Component render <50ms
  - Conditional logic decision <1ms
  - No unnecessary re-renders on auth state changes

### Architecture Compliance
- **Layer Responsibilities**:
  - Presentation Layer: LandingPage component orchestration
  - Identity Layer: Authentication state provision via context
- **Dependency Direction**: Onboarding → Identity (read-only, unidirectional)
- **Interface Abstractions**: useAuth hook abstracts Identity implementation details
- **KISS Validation**: Simple conditional rendering without complex state management

### Testing Strategy
- **Unit Testing**:
  - Test conditional rendering with mocked auth context (isAuthenticated true/false)
  - Test user.userName display with various inputs
  - Test fallback to "Game Master" when userName is undefined
- **Integration Testing**:
  - Test integration with real Identity AuthContext provider
  - Test navigation to /login, /register, /dashboard routes
- **Acceptance Criteria**:
  - Visitors see Hero Section with "Start Creating" and "Explore Features" CTAs
  - Authenticated users see Dashboard Preview with personalized greeting
  - CTAs navigate to correct routes
- **BDD Scenarios**:
  ```gherkin
  Scenario: Visitor accesses landing page
    Given I am not authenticated
    When I navigate to "/"
    Then I should see the Hero Section
    And I should see "Craft Legendary Adventures" heading
    And I should see "Start Creating" button
    And I should see "Explore Features" button

  Scenario: Authenticated user accesses landing page
    Given I am authenticated as "JohnDM"
    When I navigate to "/"
    Then I should see "Welcome back, JohnDM!"
    And I should see the Dashboard Preview
    And I should see "Open Dashboard" button
  ```

---

## Acceptance Criteria

- **AC-01**: Visitor sees Hero Section on root route
  - **Given**: User is not authenticated
  - **When**: User navigates to "/"
  - **Then**: Hero Section is rendered with gradient background and CTAs

- **AC-02**: Authenticated user sees Dashboard Preview
  - **Given**: User is authenticated with userName "JohnDM"
  - **When**: User navigates to "/"
  - **Then**: Dashboard Preview is rendered with "Welcome back, JohnDM!" greeting

- **AC-03**: Missing userName falls back gracefully
  - **Given**: User is authenticated but user.userName is undefined
  - **When**: User navigates to "/"
  - **Then**: Dashboard Preview displays "Welcome back, Game Master!"

- **AC-04**: Hero CTAs navigate correctly
  - **Given**: User is not authenticated and on landing page
  - **When**: User clicks "Start Creating" button
  - **Then**: User is navigated to "/register"

- **AC-05**: Dashboard CTA navigates correctly
  - **Given**: User is authenticated and on landing page
  - **When**: User clicks "Open Dashboard" button
  - **Then**: User is navigated to "/dashboard"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React functional component with conditional JSX
- **Code Organization**:
  - LandingPage.tsx (main orchestration component)
  - HeroContainer styled component (hero section layout)
  - DashboardContainer styled component (dashboard preview layout)
- **Testing Approach**:
  - React Testing Library for component tests
  - Mock useAuth hook for unit tests
  - E2E tests with real navigation flows

### Dependencies
- **Technical Dependencies**:
  - React 18.2+
  - React Router 6.x
  - Material-UI 5.x
  - useAuth hook from Identity context
- **Area Dependencies**: Identity area (authentication context)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Onboarding only reads Identity state; no mutations or tight coupling
- **Interface Design**: useAuth hook provides clean interface to Identity internals
- **Error Handling**: Graceful degradation to visitor mode on auth context errors

---

This Render Landing Page use case provides comprehensive implementation guidance for the landing page orchestration logic within the Onboarding area while maintaining clean architectural boundaries and excellent user experience.
