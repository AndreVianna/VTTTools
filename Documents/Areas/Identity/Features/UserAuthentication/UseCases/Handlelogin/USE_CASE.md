# Handle Login Use Case

**Original Request**: Authenticate users with email and password credentials

**Handle Login** is an authentication operation that validates user credentials and establishes an authenticated session. This use case operates within the Identity area and enables users to securely access their VTT Tools accounts using email and password.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from SimpleLoginForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Secure credential-based authentication enabling access to platform features
- **User Benefit**: Quick, secure access to VTT Tools with email/password credentials

### Scope Definition
- **Primary Actor**: Unauthenticated User
- **Scope**: Full authentication flow from credential submission to session establishment
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage component, rendered for 'login' mode

- **Container Page**: LoginPage (/login route)
- **Form Location**: Centered auth card (440px max width) with professional styling
- **Submit Action**: Validates inputs, calls useAuth().login(), redirects to dashboard on success
- **Key UI Elements**:
  - Form Field: Email input (TextField) with format validation and error display
  - Form Field: Password input (TextField) with masked entry and error display
  - Button: "Sign In to VTT Tools" submit button with loading spinner
  - Link: "Create your account" link to switch to registration mode
  - Alert: Error message display for failed authentication
  - Header: "Welcome Back, Game Master" title with subtitle

### UI State Requirements
- **Data Dependencies**: useAuth hook (login function, isLoading, error states)
- **State Scope**: Local form state (email, password, validationErrors), global auth context
- **API Calls**: POST /api/auth/login (via useAuth().login())
- **State Management**: React useState for form fields, Auth Context for session state

### UI Behavior & Flow
- **User Interactions**:
  1. User enters email address
  2. User enters password
  3. User clicks "Sign In" button
  4. Form validates inputs client-side
  5. If valid, submits to login API
  6. On success, redirects to dashboard
  7. On error, displays error message
  8. Optional: Click "Create your account" to switch modes
- **Validation Feedback**:
  - Real-time email format validation (regex)
  - Inline error messages below fields
  - Helper text showing requirements
- **Loading States**: Submit button shows CircularProgress, disables all inputs during API call
- **Success Handling**: Automatic redirect to dashboard (handled by useAuth hook)
- **Error Handling**: Display error Alert above form with specific error message

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AuthenticationService.Login(LoginCommand)
- **Domain Entities**: User (aggregate root), Session
- **Domain Services**: PasswordHashingService, SessionTokenService
- **Infrastructure Dependencies**: UserRepository, SessionRepository, PasswordHasher, TokenGenerator

### Hexagonal Architecture
- **Primary Port Operation**: IAuthenticationService.Login(email, password)
- **Secondary Port Dependencies**:
  - IUserRepository.FindByEmail(email)
  - IPasswordHasher.VerifyPassword(plaintext, hash)
  - ISessionRepository.Create(session)
  - ITokenGenerator.GenerateAuthToken(userId)
- **Adapter Requirements**: HTTP adapter (REST/GraphQL), database adapter, cryptography adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Login, credentials, authentication, session establishment
- **Business Invariants**:
  - User must exist with provided email
  - Password must match stored hash
  - User account must not be locked or suspended
  - Email must be confirmed (configurable requirement)
- **Domain Events**: UserLoggedIn(userId, timestamp, ipAddress)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Email address (string, required, email format)
  - Password (string, required, minimum 8 characters)
- **Input Validation**:
  - Email: Non-empty, valid email format (RFC 5322 regex)
  - Password: Non-empty (backend validates against hash)
- **Preconditions**:
  - User has registered account
  - User is not currently authenticated
  - Account is not locked or suspended

### Business Logic
- **Business Rules**:
  - Email is case-insensitive for lookup
  - Passwords are case-sensitive
  - Failed login attempts may trigger account lockout (security policy)
  - Session tokens expire after configurable duration
  - If user has 2FA enabled, return requiresTwoFactor flag instead of completing auth
- **Processing Steps**:
  1. Client-side: Validate email format and password presence
  2. Submit credentials to AuthenticationService.Login
  3. Server: Find user by email (case-insensitive)
  4. Server: Verify password hash matches
  5. Server: Check account status (active, not locked)
  6. Server: Check if 2FA enabled
  7a. If 2FA enabled: Store pending auth state, return requiresTwoFactor: true
  7b. If no 2FA: Create session, generate token, publish UserLoggedIn event
  8. Client: Store auth token in secure storage
  9. Client: Update Auth Context with user data
  10. Client: Navigate to dashboard
- **Domain Coordination**:
  - User entity validates account status
  - Session entity generates session ID
  - PasswordHashingService verifies credentials
- **Validation Logic**:
  - Frontend: Email regex, required fields
  - Backend: User exists, password matches, account active, 2FA check

### Output Specification
- **Output Data**:
  - Success: { user: UserDto, token: string, requiresTwoFactor?: boolean }
  - Error: { error: string, code: string }
- **Output Format**: JSON response from API
- **Postconditions**:
  - On success (no 2FA): User is authenticated, session created, token stored
  - On success (2FA): Pending auth state stored, awaiting 2FA verification
  - On error: No session created, error displayed to user

### Error Scenarios
- **Invalid Email Format**: Client-side validation error, inline field error shown
- **Empty Password**: Client-side validation error, inline field error shown
- **User Not Found**: Backend returns 401, displays "Invalid email or password"
- **Password Mismatch**: Backend returns 401, displays "Invalid email or password"
- **Account Locked**: Backend returns 403, displays "Account locked. Please contact support."
- **Account Suspended**: Backend returns 403, displays "Account suspended. Please contact support."
- **Email Not Confirmed**: Backend returns 403, displays "Please confirm your email address"
- **Network Error**: Displays "Connection error. Please try again."
- **Server Error (500)**: Displays "Login failed. Please try again later."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IAuthenticationService {
    Login(command: LoginCommand): Promise<LoginResult>
  }

  interface LoginCommand {
    email: string
    password: string
  }

  interface LoginResult {
    user: UserDto
    token: string
    requiresTwoFactor?: boolean
  }
  ```
- **Data Access Patterns**: Repository pattern for User lookup, Session creation
- **External Integration**: Secure token storage (HttpOnly cookies or secure storage)
- **Performance Requirements**: Login response <500ms, password hashing using bcrypt/argon2

### Architecture Compliance
- **Layer Responsibilities**:
  - UI: Input validation, error display, state management
  - Application: Orchestrate login flow, coordinate services
  - Domain: Validate business rules, enforce invariants
  - Infrastructure: Password verification, token generation, persistence
- **Dependency Direction**: UI → Application → Domain ← Infrastructure
- **Interface Abstractions**: IUserRepository, IPasswordHasher, ITokenGenerator
- **KISS Validation**: Direct credential validation, no complex state machines

### Testing Strategy
- **Unit Testing**:
  - Test email format validation regex
  - Test required field validation
  - Test form submission with valid/invalid inputs
  - Test error message display logic
- **Integration Testing**:
  - Test full login flow with mock API
  - Test auth context update on success
  - Test navigation redirect on success
  - Test error handling for various failure scenarios
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid credentials, When user submits login, Then user is authenticated and redirected
  - Given invalid email format, When user submits, Then validation error is shown
  - Given incorrect password, When user submits, Then "Invalid credentials" error is shown
  - Given account with 2FA, When user submits valid credentials, Then 2FA prompt is shown

---

## Acceptance Criteria

- **AC-01**: Successful login with valid credentials
  - **Given**: User has account with email "user@test.com" and password "Password123"
  - **When**: User enters credentials and submits form
  - **Then**: User is authenticated, token is stored, UserLoggedIn event published, user redirected to dashboard

- **AC-02**: Email format validation
  - **Given**: User enters invalid email "notanemail"
  - **When**: User attempts to submit form
  - **Then**: Client-side validation shows "Invalid email address" error below email field

- **AC-03**: Password required validation
  - **Given**: User enters email but leaves password empty
  - **When**: User attempts to submit form
  - **Then**: Client-side validation shows "Password is required" error below password field

- **AC-04**: Invalid credentials handling
  - **Given**: User enters valid email format but incorrect password
  - **When**: User submits form
  - **Then**: API returns 401, error alert displays "Invalid email or password"

- **AC-05**: Two-factor authentication flow trigger
  - **Given**: User has 2FA enabled on account
  - **When**: User submits valid credentials
  - **Then**: API returns requiresTwoFactor: true, LoginPage switches to two-factor mode

- **AC-06**: Loading state during authentication
  - **Given**: User submits valid credentials
  - **When**: API request is in progress
  - **Then**: Submit button shows spinner, all inputs are disabled

- **AC-07**: Account locked error handling
  - **Given**: User account is locked due to failed login attempts
  - **When**: User submits credentials
  - **Then**: API returns 403, error displays "Account locked. Please contact support."

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React form component → useAuth hook → AuthenticationService → Domain/Infrastructure
- **Code Organization**: UI component in src/components/auth/SimpleLoginForm.tsx
- **Testing Approach**: RTL for UI, Jest for business logic, Cypress for E2E

### Dependencies
- **Technical Dependencies**:
  - React Hook Form or manual validation
  - Material-UI TextField, Button, Alert components
  - useAuth custom hook
  - React Router useNavigate for redirection
- **Area Dependencies**: None (Identity is foundational)
- **External Dependencies**: Backend authentication API endpoint

### Architectural Considerations
- **Area Boundary Respect**: Identity area owns all authentication logic
- **Interface Design**: Clean separation between UI validation and backend business rules
- **Error Handling**: User-friendly error messages that don't expose security details (always "Invalid email or password" for credential mismatches)
- **Security Considerations**:
  - Passwords never logged or exposed in errors
  - Rate limiting on backend to prevent brute force
  - Account lockout after N failed attempts
  - Secure token storage (HttpOnly cookies preferred)

---

This Handle Login use case provides comprehensive implementation guidance for secure credential-based authentication within the Identity area while maintaining security best practices and excellent user experience.
