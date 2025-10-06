# Verify Two Factor Code Use Case

**Original Request**: Complete 2FA authentication using TOTP code from authenticator app

**Verify Two Factor Code** is a multi-factor authentication operation that validates time-based one-time passwords (TOTP) to complete the login process for users with 2FA enabled. This use case operates within the Identity area and provides enhanced security for user accounts.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from TwoFactorVerificationForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Enhanced account security through two-factor authentication
- **User Benefit**: Protection against unauthorized access even if password is compromised

### Scope Definition
- **Primary Actor**: Authenticated User (pending 2FA verification)
- **Scope**: TOTP code validation and session establishment
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage, rendered when mode='two-factor'

- **Container Page**: LoginPage (two-factor mode, triggered after successful password auth)
- **Form Location**: Centered form with Security icon header
- **Submit Action**: Validates 6-digit code, calls useAuth().verifyTwoFactor(), completes login on success
- **Key UI Elements**:
  - Icon: Security icon (48px) with primary color
  - Text: Instructions - "Enter the 6-digit code from your authenticator app"
  - Form Field: Verification code input (TextField) with centered monospace formatting
  - Checkbox: "Remember this device for 30 days" (rememberMachine option)
  - Button: "Verify Code" submit button with loading spinner
  - Link: "Use a recovery code instead" to switch to recovery mode
  - Link: "Back to Login" to return to login form
  - Alert: Error display for invalid codes

### UI State Requirements
- **Data Dependencies**: useAuth hook (verifyTwoFactor function, isLoading, error)
- **State Scope**: Local form state (verificationCode, rememberMachine, validationErrors)
- **API Calls**: POST /api/auth/verify-2fa (via useAuth().verifyTwoFactor())
- **State Management**: React useState for form, Auth Context for session completion

### UI Behavior & Flow
- **User Interactions**:
  1. User opens authenticator app (Google Authenticator, Authy, etc.)
  2. User reads 6-digit TOTP code
  3. User enters code in input field (auto-formatted as XXX XXX)
  4. User optionally checks "Remember device" checkbox
  5. User clicks "Verify Code" button
  6. On success, authentication completes and redirects to dashboard
  7. On error, shows error message for invalid/expired code
  8. User can switch to recovery code mode or return to login
- **Validation Feedback**:
  - Client-side: Code must be exactly 6 digits
  - Auto-formatting: XXX XXX with space separator for readability
  - Real-time validation error clearing
  - Inline error message for format violations
- **Loading States**: Submit button shows spinner, all inputs disabled during verification
- **Success Handling**: Complete authentication, redirect to dashboard
- **Error Handling**: Display specific errors (invalid code, expired code, rate limit exceeded)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: TwoFactorAuthenticationService.VerifyCode(VerifyCodeCommand)
- **Domain Entities**: User, TwoFactorSetup, Session
- **Domain Services**: TOTPValidationService
- **Infrastructure Dependencies**: TwoFactorSetupRepository, SessionRepository, TOTPLibrary

### Hexagonal Architecture
- **Primary Port Operation**: ITwoFactorService.VerifyCode(userId, code, rememberMachine)
- **Secondary Port Dependencies**:
  - ITwoFactorSetupRepository.FindByUserId(userId)
  - ITOTPValidator.ValidateCode(secret, code)
  - ISessionRepository.Create(session)
  - IDeviceTrustRepository.CreateTrustedDevice(userId, deviceId) [if rememberMachine]
- **Adapter Requirements**: HTTP adapter, database adapter, TOTP library adapter (e.g., otplib)

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Two-factor code, TOTP verification, device trust, authenticator app
- **Business Invariants**:
  - Code must be 6 digits
  - Code must be valid for current time window (±30 seconds tolerance)
  - User must have 2FA enabled
  - Pending authentication must exist from initial login
- **Domain Events**: TwoFactorVerified(userId, timestamp, deviceTrusted)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Verification code (string, 6 digits)
  - Remember machine flag (boolean, optional)
  - Pending authentication token (from previous login step, stored in session/state)
- **Input Validation**:
  - Code must be exactly 6 digits
  - Code must contain only numeric characters
  - Pending auth token must exist
- **Preconditions**:
  - User has completed password authentication
  - User has 2FA enabled on account
  - Pending 2FA verification state exists
  - User has authenticator app with TOTP secret configured

### Business Logic
- **Business Rules**:
  - TOTP codes are valid for 30-second time window
  - System allows ±1 time step tolerance (90 seconds total window)
  - Rate limiting: Max 5 attempts per 5 minutes to prevent brute force
  - "Remember device" creates 30-day trusted device token
  - Code can only be used once (replay prevention within time window)
  - After successful verification, pending auth state is cleared
- **Processing Steps**:
  1. Client: Validate code format (6 digits)
  2. Submit code to TwoFactorService.VerifyCode with pending auth token
  3. Server: Retrieve pending authentication (validate token)
  4. Server: Load TwoFactorSetup for user (contains TOTP secret)
  5. Server: Validate TOTP code against secret using time-based algorithm
  6. Server: Check rate limiting (max attempts)
  7. Server: If valid, create authenticated session
  8. Server: If rememberMachine, create trusted device token (30 days)
  9. Server: Publish TwoFactorVerified event
  10. Server: Return auth token
  11. Client: Store auth token
  12. Client: Update Auth Context
  13. Client: Navigate to dashboard
- **Domain Coordination**:
  - TOTPValidationService validates code against secret
  - Session entity creates authenticated session
  - TrustedDevice entity stores device trust (if requested)
- **Validation Logic**:
  - Frontend: 6-digit numeric format
  - Backend: TOTP algorithm validation with time tolerance

### Output Specification
- **Output Data**:
  - Success: { user: UserDto, token: string, deviceTrusted: boolean }
  - Error: { error: string, code: string, attemptsRemaining?: number }
- **Output Format**: JSON response from API
- **Postconditions**:
  - User is fully authenticated
  - Session created and stored
  - Device may be marked as trusted
  - Pending 2FA state cleared

### Error Scenarios
- **Invalid Code Format**: Client validation → "Verification code must be 6 digits"
- **Empty Code**: Client validation → "Verification code is required"
- **Invalid Code**: Backend returns 401 → "Invalid verification code. Please try again."
- **Expired Code**: Backend returns 401 → "Code has expired. Please enter a new code from your app."
- **Rate Limit Exceeded**: Backend returns 429 → "Too many attempts. Please try again in 5 minutes."
- **No Pending Auth**: Backend returns 400 → "Session expired. Please log in again."
- **2FA Not Enabled**: Backend returns 400 → "Two-factor authentication is not enabled."
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface ITwoFactorService {
    VerifyCode(command: VerifyCodeCommand): Promise<VerifyResult>
  }

  interface VerifyCodeCommand {
    userId: string
    code: string
    rememberMachine: boolean
    pendingAuthToken: string
  }

  interface VerifyResult {
    user: UserDto
    token: string
    deviceTrusted: boolean
  }
  ```
- **Data Access Patterns**: Repository for TwoFactorSetup, Session, TrustedDevice
- **External Integration**: TOTP library (otplib, speakeasy) for code validation
- **Performance Requirements**: Verification response <300ms

### Architecture Compliance
- **Layer Responsibilities**:
  - UI: Code formatting, validation, user feedback
  - Application: Coordinate verification flow
  - Domain: TOTP validation, session creation
  - Infrastructure: TOTP library, device trust storage
- **Dependency Direction**: UI → Application → Domain ← Infrastructure
- **Interface Abstractions**: ITOTPValidator, ITwoFactorSetupRepository, IDeviceTrustRepository
- **KISS Validation**: Standard TOTP algorithm (RFC 6238), no custom crypto

### Testing Strategy
- **Unit Testing**:
  - Test code format validation (6 digits, numeric)
  - Test auto-formatting (XXX XXX pattern)
  - Test rememberMachine checkbox state
  - Test form submission logic
- **Integration Testing**:
  - Test full 2FA flow with mock TOTP codes
  - Test rate limiting enforcement
  - Test device trust creation
  - Test error scenarios
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid TOTP code, When user submits, Then authentication completes
  - Given expired code, When user submits, Then "Code expired" error shown
  - Given too many failed attempts, When user submits, Then rate limit error shown

---

## Acceptance Criteria

- **AC-01**: Successful verification with valid code
  - **Given**: User has entered correct 6-digit TOTP code from authenticator app
  - **When**: User submits verification form
  - **Then**: Code is validated, session created, TwoFactorVerified event published, user redirected to dashboard

- **AC-02**: Code format validation
  - **Given**: User enters "12345" (only 5 digits)
  - **When**: User attempts to submit
  - **Then**: Client validation error "Verification code must be 6 digits" is shown

- **AC-03**: Invalid code handling
  - **Given**: User enters incorrect 6-digit code "999999"
  - **When**: User submits form
  - **Then**: API returns 401, error "Invalid verification code. Please try again." is displayed

- **AC-04**: Remember device functionality
  - **Given**: User checks "Remember this device for 30 days" checkbox
  - **When**: User submits valid code
  - **Then**: Trusted device token is created with 30-day expiration, deviceTrusted: true returned

- **AC-05**: Rate limiting protection
  - **Given**: User has made 5 failed verification attempts
  - **When**: User attempts 6th verification
  - **Then**: API returns 429, error "Too many attempts. Please try again in 5 minutes." is shown

- **AC-06**: Auto-formatting of code input
  - **Given**: User types "123456"
  - **When**: Input value changes
  - **Then**: Display shows "123 456" with space separator for readability

- **AC-07**: Switch to recovery code mode
  - **Given**: User cannot access authenticator app
  - **When**: User clicks "Use a recovery code instead" link
  - **Then**: LoginPage mode switches to 'recovery-code', RecoveryCodeForm is displayed

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React form → useAuth hook → TwoFactorService → Domain/Infrastructure
- **Code Organization**: UI in src/components/auth/TwoFactorVerificationForm.tsx
- **Testing Approach**: RTL for UI, Jest for TOTP validation logic

### Dependencies
- **Technical Dependencies**:
  - React useState for form state
  - Material-UI components
  - useAuth hook
  - TOTP library (otplib/speakeasy) on backend
- **Area Dependencies**: None
- **External Dependencies**: Time synchronization (critical for TOTP), authenticator app (user responsibility)

### Architectural Considerations
- **Area Boundary Respect**: Identity owns 2FA verification
- **Interface Design**: Clean separation between TOTP validation and session management
- **Error Handling**: User-friendly messages that don't expose security details
- **Security Considerations**:
  - Rate limiting prevents brute force (6 digits = 1M combinations)
  - Time window tolerance (±30s) balances security and usability
  - Replay prevention within time window
  - Device trust tokens have expiration
  - Pending auth tokens expire after short period

---

This Verify Two Factor Code use case provides comprehensive implementation guidance for TOTP-based 2FA within the Identity area while maintaining security best practices.
