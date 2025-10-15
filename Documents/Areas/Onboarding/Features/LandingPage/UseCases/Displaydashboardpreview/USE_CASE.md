# Display Dashboard Preview Use Case

**Original Request**: Onboarding area dashboard preview presentation from React implementation

**Display Dashboard Preview** is a welcome presentation use case that greets authenticated users and provides quick access to their dashboard workspace. This use case operates within the Onboarding area and enables authenticated Game Masters and Players to quickly access their creative workspace.

---

## Change Log
- *2025-10-03* — **1.1.0** — Updated to reflect actual implementation: Quick action cards instead of navigation button, no separate dashboard page, logout via header menu
- *2025-01-15* — **1.0.0** — Use case specification created from React implementation analysis

## Implementation Notes (2025-10-03)

**Design Changes**:
- **Removed**: Single "Open Dashboard" button navigation to /dashboard
- **Added**: 4-card grid layout with quick actions
- **Rationale**: Landing page IS the dashboard for authenticated users (no separate page needed)
- **Implementation**: Material-UI Grid with Card components, responsive layout (4 cols desktop, 2 cols tablet, 1 col mobile)

**Quick Action Cards**:
1. **Scene Editor**: Active, navigates to /scene-editor (Phases 3-4 complete)
2. **Content Library**: Disabled with "Coming Soon" label (blocked by backend Epic/Campaign services)
3. **Asset Library**: Disabled with "Coming Soon" label (planned for implementation)
4. **Account Settings**: Disabled with "Coming Soon" label (planned for implementation)

**Files Modified**:
- Source/WebClientApp/src/pages/LandingPage.tsx (added Grid, Card components, removed logout button)
- Deleted temporary DashboardPage.tsx (was out of scope)
- Reverted /dashboard route to redirect to / (landing page is the dashboard)

---

## Use Case Overview

### Business Context
- **Parent Feature**: Landing Page
- **Owning Area**: Onboarding
- **Business Value**: Increase user engagement and dashboard access rate by providing personalized welcome and clear access point
- **User Benefit**: Authenticated users receive personalized greeting and single-click access to their workspace

### Scope Definition
- **Primary Actor**: Authenticated user (Game Master or Player)
- **Scope**: Dashboard preview presentation and dashboard navigation
- **Level**: User goal level

---

## UI Presentation

### Presentation Type
- **UI Type**: WIDGET
- **Access Method**: Rendered within LandingPage component when isAuthenticated === true

- **Component Type**: Reusable presentation component
- **Used In**: LandingPage (root route /)
- **Props Required**: user object from Identity context (containing userName)
- **Key UI Elements**:
  - Welcome Heading: Large "Welcome back, {userName}!" personalized greeting
  - Workspace Title: "Your Creative Workspace" subtitle
  - Quick Action Grid: Material-UI Grid with 4 quick action cards (2x2 responsive layout)
  - Scene Editor Card: Icon, title, description, "Open Editor" button → navigates to /scene-editor (Phase 3-4 complete)
  - Content Library Card: Icon, title, description, disabled button showing "Coming Soon" (backend blocked)
  - Asset Library Card: Icon, title, description, disabled button showing "Coming Soon" (planned)
  - Account Settings Card: Icon, title, description, disabled button showing "Coming Soon" (planned)
  - **Note**: Landing page IS the dashboard preview - no separate /dashboard page exists
  - **Note**: Logout handled via user menu in header (not in dashboard preview)

### UI State Requirements
- **Data Dependencies**: user.userName from Identity authentication context
- **State Scope**: Global (Identity context) for user data, local for navigation
- **API Calls**: None (reads from existing auth context)
- **State Management**: useAuth hook from Identity context, useNavigate from React Router

### UI Behavior & Flow
- **User Interactions**:
  1. Dashboard preview renders with personalized greeting and "Your Creative Workspace" subtitle
  2. User sees 4 quick action cards in responsive grid layout
  3. User can click "Open Editor" on Scene Editor card → navigates to /scene-editor
  4. User sees disabled cards for upcoming features (Content Library, Asset Library, Account Settings) with phase labels
  5. User can access logout via header user menu dropdown (Profile, Settings, Sign Out)
- **Validation Feedback**: N/A (no forms)
- **Loading States**: None (user data already loaded via auth context)
- **Success Handling**: Scene Editor navigation works, disabled cards show implementation status
- **Error Handling**:
  - Missing userName → Fallback to "Game Master"
  - Navigation error → React Router error handling
  - Card buttons for incomplete features are disabled (not clickable)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: N/A (pure presentation component)
- **Domain Entities**: User (consumed from Identity context)
- **Domain Services**: None
- **Infrastructure Dependencies**: React Router for navigation, Identity AuthContext

### Hexagonal Architecture
- **Primary Port Operation**: N/A (UI presentation layer)
- **Secondary Port Dependencies**: IAuthenticationContext (Identity), INavigationService (React Router)
- **Adapter Requirements**: React component adapter consuming context and navigation

### DDD Alignment
- **Bounded Context**: Onboarding
- **Ubiquitous Language**: Dashboard Preview, Creative Workspace, Authenticated User, Game Master
- **Business Invariants**: None (presentation only)
- **Domain Events**: None (read-only presentation)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - user object from Identity context (required)
  - user.userName (optional string)
- **Input Validation**: None required (trust Identity area validation)
- **Preconditions**:
  - User is authenticated (isAuthenticated === true)
  - Identity AuthContext available
  - React Router navigation available

### Business Logic
- **Business Rules**:
  - Dashboard preview only displays for authenticated users
  - User greeting is personalized with user.userName
  - If user.userName is undefined/null → Fallback to "Game Master"
  - Single CTA to dashboard (streamlined access)
- **Processing Steps**:
  1. Component receives user object from parent via useAuth hook
  2. Extract userName from user object
  3. Apply fallback logic: userName || "Game Master"
  4. Render personalized welcome heading
  5. Render dashboard preview container with description
  6. Render "Open Dashboard" CTA with navigation handler
- **Domain Coordination**: None (consumes User from Identity, no mutations)
- **Validation Logic**: None (read-only presentation)

### Output Specification
- **Output Data**: Rendered React component subtree
- **Output Format**:
  - Centered welcome heading with theme typography
  - Card-style container with workspace information
  - Prominent CTA button with theme styling
- **Postconditions**:
  - Personalized greeting displayed correctly
  - Dashboard CTA is functional
  - Responsive design adapts to viewport

### Error Scenarios
- **User Object Missing**: Fallback greeting to "Welcome back, Game Master!"
- **userName Undefined**: Use fallback "Game Master" in greeting
- **Navigation Failure**: React Router handles and logs navigation errors
- **Component Render Error**: React error boundary captures rendering issues

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**: React component receiving user object from context
- **Data Access Patterns**: Read user data from Identity context via useAuth hook
- **External Integration**:
  - React Router useNavigate for navigation
  - MUI styled components and theme
- **Performance Requirements**:
  - Component render <30ms
  - Button hover effects <100ms
  - No unnecessary re-renders on user state changes

### Architecture Compliance
- **Layer Responsibilities**:
  - Presentation Layer: Dashboard preview rendering and navigation
  - Identity Layer: User data provision via context
- **Dependency Direction**: Onboarding → Identity (read-only, unidirectional)
- **Interface Abstractions**: useAuth hook abstracts Identity implementation
- **KISS Validation**: Simple presentation component with fallback logic

### Testing Strategy
- **Unit Testing**:
  - Test component renders with valid userName
  - Test fallback to "Game Master" when userName is undefined
  - Test fallback to "Game Master" when userName is null
  - Test fallback to "Game Master" when user object is undefined
  - Test navigation handler calls navigate("/dashboard")
- **Integration Testing**:
  - Test integration with real Identity AuthContext
  - Test navigation to /dashboard route
  - Test responsive styling at different breakpoints
- **Acceptance Criteria**:
  - Authenticated users see personalized greeting
  - Dashboard CTA navigates correctly
  - Fallback greeting works when userName missing
- **BDD Scenarios**:
  ```gherkin
  Scenario: Authenticated user views dashboard preview
    Given I am authenticated as "JohnDM"
    And I am on the landing page
    Then I should see "Welcome back, JohnDM!" heading
    And I should see "Your Creative Workspace" title
    And I should see workspace description
    And I should see "Open Dashboard" button

  Scenario: User with no userName sees fallback greeting
    Given I am authenticated
    But my user profile has no userName
    When I view the landing page
    Then I should see "Welcome back, Game Master!" heading

  Scenario: User clicks dashboard CTA
    Given I am viewing the dashboard preview
    When I click "Open Dashboard" button
    Then I should be navigated to "/dashboard"
  ```

---

## Acceptance Criteria

- **AC-01**: Personalized greeting displays correctly
  - **Given**: User is authenticated with userName "JohnDM"
  - **When**: Dashboard preview renders
  - **Then**: Heading displays "Welcome back, JohnDM!"

- **AC-02**: Fallback greeting for missing userName
  - **Given**: User is authenticated but user.userName is undefined
  - **When**: Dashboard preview renders
  - **Then**: Heading displays "Welcome back, Game Master!"

- **AC-03**: Workspace information displayed
  - **Given**: Dashboard preview is rendered
  - **When**: Component is visible
  - **Then**: "Your Creative Workspace" title is displayed
  - **And**: Workspace description text is displayed

- **AC-04**: Dashboard CTA navigates correctly
  - **Given**: Dashboard preview is displayed
  - **When**: User clicks "Open Dashboard" button
  - **Then**: navigate("/dashboard") is called
  - **And**: User is routed to dashboard page

- **AC-05**: Responsive design adapts
  - **Given**: Dashboard preview is displayed
  - **When**: Viewport width changes
  - **Then**: Container maintains centered layout
  - **And**: Typography scales appropriately

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React functional component with conditional logic
- **Code Organization**:
  - DashboardContainer: styled(Box) with card styling
  - Welcome heading: Typography variant h2 with dynamic userName
  - Workspace title: Typography variant h4
  - Description: Typography variant body1 with maxWidth
  - Dashboard button: Material-UI Button with custom styling
- **Testing Approach**:
  - React Testing Library for component tests
  - Mock useAuth hook for user data scenarios
  - Mock useNavigate for navigation tests
  - Test userName fallback logic thoroughly

### Dependencies
- **Technical Dependencies**:
  - React 18.2+
  - React Router 6.x (useNavigate hook)
  - Material-UI 5.x (Typography, Button, Box, useTheme)
  - Identity context (useAuth hook)
- **Area Dependencies**: Identity area (User data via authentication context)
- **External Dependencies**: None

### Architectural Considerations
- **Area Boundary Respect**: Onboarding only reads Identity User data; no mutations
- **Interface Design**: useAuth hook provides clean interface to Identity User
- **Error Handling**: Graceful fallback for missing userName, rely on React Router for navigation errors

---

This Display Dashboard Preview use case provides comprehensive implementation guidance for the authenticated user welcome experience within the Onboarding area while maintaining clean architectural boundaries and excellent user experience.
