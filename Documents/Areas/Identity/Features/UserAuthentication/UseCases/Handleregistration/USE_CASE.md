# Handle Registration Use Case

**Original Request**: Create new user accounts with email, display name, and password

**Handle Registration** is an account creation operation that validates user information and establishes a new account in VTT Tools. This use case operates within the Identity area and enables new users to create accounts for accessing the platform.

---

## Change Log
- *2025-10-03* — **1.1.0** — Updated field mapping: UserName = Email (automatic), added DisplayName field, fixed validation, fixed duplicate error display bug, fixed premature error display
- *2025-01-15* — **1.0.0** — Use case specification created from SimpleRegistrationForm.tsx analysis

## Implementation Notes (2025-10-03)

**Bug Fixes Applied**:
1. **Field Mapping Corrected**: Changed from Username field to Name field (DisplayName)
2. **Backend Contract Match**: Email sent as both `email` and `name` (UserName), Name field sent as `displayName`
3. **Error Display Fixed**: Error only shown after submit attempt, not on initial page load
4. **Error Clearing**: Auth errors cleared on component mount to prevent stale error display

**Database Schema**:
- UserName column = Email (ASP.NET Identity requirement)
- DisplayName column = User's friendly name (from Name form field)
- Both fields required in database (NOT NULL columns)

**Files Updated**:
- Source/WebClientApp/src/components/auth/SimpleRegistrationForm.tsx
- Source/WebClientApp/src/hooks/useAuth.ts
- Source/WebClientApp/src/types/domain.ts (RegisterRequest interface)

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: User acquisition and account creation for VTT Tools platform
- **User Benefit**: Quick, straightforward registration process to start using VTT Tools

### Scope Definition
- **Primary Actor**: Prospective User (Unauthenticated)
- **Scope**: Full registration flow from form submission to account creation
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage component, rendered for 'register' mode or /register route

- **Container Page**: LoginPage (/register route or register mode)
- **Form Location**: Centered auth card (440px max width) with professional styling
- **Submit Action**: Validates inputs, calls useAuth().register(), auto-logs in on success
- **Key UI Elements**:
  - Form Field: Email input with format validation
  - Form Field: Name input for display name (1-32 chars, maps to DisplayName)
  - Form Field: Password input with strength requirements (6+ chars)
  - Form Field: Confirm Password input with match validation
  - Button: "Create My Account" submit button with loading spinner
  - Link: "Sign in here" link to switch to login mode
  - Alert: Error message display (only shown after submit attempt)
  - Header: "Start Your Journey" title with subtitle
  - **Note**: Username is NOT a separate field - it's automatically set to Email in backend

### UI State Requirements
- **Data Dependencies**: useAuth hook (register function, isLoading, error states, clearError)
- **State Scope**: Local form state (email, name, password, confirmPassword, validationErrors, hasAttemptedSubmit)
- **API Calls**: POST /api/auth/register (via useAuth().register())
- **State Management**: React useState for form data, Auth Context for post-registration auth
- **Request Body Mapping**:
  - email → email (required)
  - name (form field) → displayName (optional, 1-32 chars)
  - email → name (backend Name field = Email, automatic)
  - password → password (required, 6+ chars)
  - confirmPassword → confirmPassword (required, must match password)

### UI Behavior & Flow
- **User Interactions**:
  1. User enters email address
  2. User enters display name (1-32 chars)
  3. User enters password
  4. User enters password confirmation
  5. User clicks "Create My Account" button
  6. Form validates all inputs client-side
  7. If valid, submits to registration API
  8. On success, user is auto-logged in and redirected to /login
  9. On error, displays specific error message
- **Validation Feedback**:
  - Real-time validation clearing when user types
  - Email format validation (RFC 5322 regex)
  - Display name length (1-32 chars, required)
  - Password strength (6+ chars minimum)
  - Password confirmation match validation
  - Inline error messages below each field with red highlighting
- **Loading States**: Submit button shows CircularProgress, all inputs disabled during API call
- **Success Handling**: Success notification shown, navigation to /login page
- **Error Handling**:
  - Error cleared on component mount (prevents stale errors)
  - Error only shown after submit attempt (not on initial load)
  - Error Alert displayed above form with backend error message
  - Detailed error logging to browser console for debugging

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AuthenticationService.Register(RegisterCommand)
- **Domain Entities**: User (aggregate root with factory method), Role
- **Domain Services**: PasswordHashingService, EmailUniquenessService, UsernameUniquenessService
- **Infrastructure Dependencies**: UserRepository, RoleRepository, PasswordHasher, EmailSender

### Hexagonal Architecture
- **Primary Port Operation**: IAuthenticationService.Register(email, username, password)
- **Secondary Port Dependencies**:
  - IUserRepository.Create(user)
  - IUserRepository.FindByEmail(email)
  - IUserRepository.FindByUsername(username)
  - IPasswordHasher.HashPassword(plaintext)
  - IEmailSender.SendVerificationEmail(user)
  - IRoleRepository.GetDefaultRole()
- **Adapter Requirements**: HTTP adapter, database adapter, email adapter, cryptography adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Registration, account creation, email verification, password strength
- **Business Invariants**:
  - Email must be unique across platform
  - Username must be unique across platform
  - Password must meet minimum strength requirements
  - Username can only contain letters, numbers, underscores, hyphens
- **Domain Events**: UserRegistered(userId, email, username, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Email address (string, required, email format)
  - Username (string, required, 3-50 chars, alphanumeric + underscore/hyphen)
  - Password (string, required, minimum 6 characters)
  - Confirm Password (string, required, must match password)
- **Input Validation**:
  - Email: Non-empty, valid RFC 5322 format, unique
  - Username: 3+ chars, alphanumeric/underscore/hyphen only, unique
  - Password: 6+ chars (frontend), meets strength requirements (backend)
  - Confirm Password: Matches password field exactly
- **Preconditions**:
  - User is not currently authenticated
  - Email address has not been registered previously
  - Username has not been taken

### Business Logic
- **Business Rules**:
  - Email addresses are case-insensitive and normalized (lowercase storage)
  - Usernames are case-insensitive for uniqueness checks
  - Default role "User" or "Player" assigned to new accounts
  - Email verification required before full account access (configurable)
  - Password must be hashed using bcrypt or argon2 before storage
  - Registration may trigger welcome email
- **Processing Steps**:
  1. Client: Validate email format, username requirements, password strength, password match
  2. Submit registration data to AuthenticationService.Register
  3. Server: Check email uniqueness
  4. Server: Check username uniqueness
  5. Server: Hash password using secure algorithm
  6. Server: Create User entity with factory method
  7. Server: Assign default role
  8. Server: Persist User to repository
  9. Server: Send email verification email (async)
  10. Server: Publish UserRegistered event
  11. Server: Auto-login user (create session and return token)
  12. Client: Store auth token
  13. Client: Update Auth Context
  14. Client: Navigate to dashboard or onboarding
- **Domain Coordination**:
  - User.CreateNew factory method enforces business rules
  - EmailUniquenessService queries repository for conflicts
  - UsernameUniquenessService queries repository for conflicts
  - PasswordHashingService creates secure hash
- **Validation Logic**:
  - Frontend: Format, length, character restrictions, password match
  - Backend: Uniqueness, password strength, sanitization

### Output Specification
- **Output Data**:
  - Success: { user: UserDto, token: string }
  - Error: { error: string, code: string, field?: string }
- **Output Format**: JSON response from API
- **Postconditions**:
  - On success: User account created, token stored, session established, UserRegistered event published
  - On error: No account created, error displayed to user

### Error Scenarios
- **Invalid Email Format**: Client validation error → "Invalid email address"
- **Empty Required Field**: Client validation error → "{Field} is required"
- **Username Too Short**: Client validation error → "Username must be at least 3 characters"
- **Invalid Username Characters**: Client validation error → "Username can only contain letters, numbers, underscores, and hyphens"
- **Weak Password**: Client validation error → "Password must be at least 6 characters"
- **Password Mismatch**: Client validation error → "Passwords do not match"
- **Email Already Registered**: Backend returns 409 → "Email address already registered"
- **Username Already Taken**: Backend returns 409 → "Username already taken"
- **Network Error**: "Connection error. Please try again."
- **Server Error (500)**: "Registration failed. Please try again later."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IAuthenticationService {
    Register(command: RegisterCommand): Promise<RegisterResult>
  }

  interface RegisterCommand {
    email: string
    userName: string
    password: string
    confirmPassword: string
  }

  interface RegisterResult {
    user: UserDto
    token: string
  }
  ```
- **Data Access Patterns**: Repository pattern for uniqueness checks and User creation
- **External Integration**: Email service for verification emails
- **Performance Requirements**: Registration response <1s, password hashing with appropriate cost factor

### Architecture Compliance
- **Layer Responsibilities**:
  - UI: Input validation, error display, form state
  - Application: Orchestrate registration, coordinate services
  - Domain: Enforce business rules, create User entity
  - Infrastructure: Uniqueness checks, password hashing, persistence, email sending
- **Dependency Direction**: UI → Application → Domain ← Infrastructure
- **Interface Abstractions**: IUserRepository, IPasswordHasher, IEmailSender, IEmailUniquenessService
- **KISS Validation**: Straightforward validation, no overly complex password rules

### Testing Strategy
- **Unit Testing**:
  - Test each field validation rule
  - Test password match validation
  - Test form submission logic
  - Test error display for various scenarios
- **Integration Testing**:
  - Test full registration flow with mock API
  - Test uniqueness conflict handling
  - Test auto-login after registration
  - Test navigation after success
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid registration data, When user submits, Then account is created and user is logged in
  - Given duplicate email, When user submits, Then "Email already registered" error is shown
  - Given mismatched passwords, When user submits, Then "Passwords do not match" error is shown
  - Given weak password, When user submits, Then password strength error is shown

---

## Acceptance Criteria

- **AC-01**: Successful registration with valid inputs
  - **Given**: User enters unique email, valid username, and matching passwords
  - **When**: User submits registration form
  - **Then**: Account is created, UserRegistered event published, user is auto-logged in, redirected to dashboard

- **AC-02**: Email format validation
  - **Given**: User enters invalid email "notanemail"
  - **When**: User attempts to submit
  - **Then**: "Invalid email address" error shown below email field

- **AC-03**: Username length validation
  - **Given**: User enters username "ab" (too short)
  - **When**: User attempts to submit
  - **Then**: "Username must be at least 3 characters" error shown

- **AC-04**: Username character validation
  - **Given**: User enters username with spaces "user name"
  - **When**: User attempts to submit
  - **Then**: "Username can only contain letters, numbers, underscores, and hyphens" error shown

- **AC-05**: Password confirmation match validation
  - **Given**: User enters password "Password123" and confirmation "Different123"
  - **When**: User attempts to submit
  - **Then**: "Passwords do not match" error shown below confirm password field

- **AC-06**: Duplicate email handling
  - **Given**: User enters email that already exists in system
  - **When**: User submits form
  - **Then**: API returns 409, error alert displays "Email address already registered"

- **AC-07**: Duplicate username handling
  - **Given**: User enters username that is already taken
  - **When**: User submits form
  - **Then**: API returns 409, error alert displays "Username already taken"

- **AC-08**: Loading state during registration
  - **Given**: User submits valid registration data
  - **When**: API request is in progress
  - **Then**: Submit button shows spinner, all inputs are disabled

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React form → useAuth hook → AuthenticationService → Domain/Infrastructure
- **Code Organization**: UI in src/components/auth/SimpleRegistrationForm.tsx
- **Testing Approach**: RTL for UI, Jest for services, integration tests for full flow

### Dependencies
- **Technical Dependencies**:
  - React useState for form management
  - Material-UI TextField, Button, Alert
  - useAuth custom hook
  - Validation regex for email and username
- **Area Dependencies**: None (Identity is foundational)
- **External Dependencies**: Backend registration API, email service for verification

### Architectural Considerations
- **Area Boundary Respect**: Identity owns all user account creation
- **Interface Design**: Clear separation between client validation and server business rules
- **Error Handling**: Field-specific errors for client validation, general errors for server issues
- **Security Considerations**:
  - Password never exposed in logs or error messages
  - Secure password hashing (bcrypt/argon2)
  - Email verification before full access (optional but recommended)
  - Rate limiting to prevent abuse

---

This Handle Registration use case provides comprehensive implementation guidance for user account creation within the Identity area while maintaining security and excellent user experience.
