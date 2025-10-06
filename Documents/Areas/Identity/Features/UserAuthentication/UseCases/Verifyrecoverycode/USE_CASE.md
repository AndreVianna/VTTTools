# Verify Recovery Code Use Case

**Original Request**: Authenticate using backup recovery codes when authenticator app unavailable

**Verify Recovery Code** is a backup authentication operation that validates single-use recovery codes for users with 2FA enabled who cannot access their authenticator app. This use case operates within the Identity area and provides fallback authentication security.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from RecoveryCodeForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Prevents account lockout when authenticator app is unavailable
- **User Benefit**: Access to account even without authenticator device

### Scope Definition
- **Primary Actor**: Authenticated User (pending 2FA, without authenticator access)
- **Scope**: Recovery code validation and session establishment
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage, rendered when mode='recovery-code'

- **Container Page**: LoginPage (recovery-code mode, accessed from two-factor mode via link)
- **Form Location**: Centered form with Key icon header
- **Submit Action**: Validates recovery code, calls useAuth().verifyRecoveryCode(), completes login
- **Key UI Elements**:
  - Icon: Key icon with warning/info color
  - Text: Instructions - "Enter one of your backup recovery codes"
  - Form Field: Recovery code input (TextField) with uppercase formatting
  - Alert: Warning about single-use nature of recovery codes
  - Button: "Verify Recovery Code" submit button with loading spinner
  - Link: "Back to authenticator code" to return to 2FA mode
  - Link: "Back to Login" to return to login form
  - Display: Codes remaining indicator (after successful use)

### UI State Requirements
- **Data Dependencies**: useAuth hook (verifyRecoveryCode, isLoading, error)
- **State Scope**: Local form state (recoveryCode, validationErrors)
- **API Calls**: POST /api/auth/verify-recovery-code
- **State Management**: React useState for form, Auth Context for completion

### UI Behavior & Flow
- **User Interactions**:
  1. User accesses recovery codes from safe storage (printed/saved during setup)
  2. User enters recovery code (8-12 characters, alphanumeric)
  3. User clicks "Verify Recovery Code"
  4. On success, code is marked as used, authentication completes
  5. Warning shown about remaining codes if count is low
  6. User can return to 2FA mode or login
- **Validation Feedback**:
  - Format validation (alphanumeric, correct length)
  - Real-time validation error clearing
  - Warning if this is user's last recovery code
- **Loading States**: Submit button shows spinner, inputs disabled
- **Success Handling**: Complete auth, redirect to dashboard, show codes remaining warning if low
- **Error Handling**: Invalid/used code errors, rate limiting errors

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: TwoFactorAuthenticationService.VerifyRecoveryCode(command)
- **Domain Entities**: User, RecoveryCode, Session
- **Domain Services**: RecoveryCodeValidationService
- **Infrastructure Dependencies**: RecoveryCodeRepository, SessionRepository

### Hexagonal Architecture
- **Primary Port Operation**: ITwoFactorService.VerifyRecoveryCode(userId, code)
- **Secondary Port Dependencies**:
  - IRecoveryCodeRepository.FindByCode(hashedCode)
  - IRecoveryCodeRepository.MarkAsUsed(codeId)
  - ISessionRepository.Create(session)
  - IRecoveryCodeRepository.CountRemainingCodes(userId)
- **Adapter Requirements**: HTTP adapter, database adapter, hashing library

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Recovery code, backup code, single-use code, code exhaustion
- **Business Invariants**:
  - Each code can only be used once
  - Codes must be hashed in storage (like passwords)
  - Users should have multiple recovery codes (typically 8-10)
  - Warning when only 2 codes remain
  - Codes are case-insensitive
- **Domain Events**: RecoveryCodeUsed(userId, codesRemaining, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Recovery code (string, 8-12 alphanumeric characters)
  - Pending authentication token (from password login)
- **Input Validation**:
  - Non-empty
  - Alphanumeric characters only
  - Length matches system format (8-12 chars)
- **Preconditions**:
  - User has completed password authentication
  - User has 2FA enabled
  - User has recovery codes generated
  - Pending 2FA verification state exists

### Business Logic
- **Business Rules**:
  - Recovery codes are single-use only
  - Codes stored as hashes (SHA-256 or bcrypt)
  - Case-insensitive comparison (normalized to uppercase)
  - Rate limiting: Max 5 attempts per 5 minutes
  - When only 2 codes remain, show warning to generate new codes
  - When last code used, strongly urge immediate regeneration
  - After successful use, code is permanently invalidated
- **Processing Steps**:
  1. Client: Format code (trim, uppercase)
  2. Submit to TwoFactorService.VerifyRecoveryCode
  3. Server: Retrieve pending authentication
  4. Server: Hash submitted code
  5. Server: Query RecoveryCodeRepository for matching hash
  6. Server: Verify code belongs to user and is not used
  7. Server: Mark code as used with timestamp
  8. Server: Count remaining codes
  9. Server: Create authenticated session
  10. Server: Publish RecoveryCodeUsed event
  11. Server: Return auth token + codesRemaining
  12. Client: Store auth token
  13. Client: Show warning if codesRemaining < 3
  14. Client: Navigate to dashboard (or recovery code regeneration page)
- **Domain Coordination**:
  - RecoveryCode entity tracks usage status
  - Session entity creates authenticated session
  - RecoveryCodeValidationService coordinates validation
- **Validation Logic**:
  - Frontend: Format, length
  - Backend: Hash matching, single-use enforcement, ownership

### Output Specification
- **Output Data**:
  - Success: { user: UserDto, token: string, codesRemaining: number }
  - Error: { error: string, code: string, codesRemaining?: number }
- **Output Format**: JSON response
- **Postconditions**:
  - User authenticated
  - Recovery code marked as used
  - Remaining code count decreased
  - Warning displayed if codes are low

### Error Scenarios
- **Empty Code**: Client validation → "Recovery code is required"
- **Invalid Format**: Client validation → "Invalid recovery code format"
- **Code Not Found**: Backend 401 → "Invalid recovery code"
- **Code Already Used**: Backend 401 → "This recovery code has already been used"
- **Rate Limit**: Backend 429 → "Too many attempts. Try again in 5 minutes."
- **No Pending Auth**: Backend 400 → "Session expired. Please log in again."
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface ITwoFactorService {
    VerifyRecoveryCode(command: VerifyRecoveryCommand): Promise<VerifyResult>
  }

  interface VerifyRecoveryCommand {
    userId: string
    code: string
    pendingAuthToken: string
  }

  interface VerifyResult {
    user: UserDto
    token: string
    codesRemaining: number
  }
  ```
- **Data Access Patterns**: Repository for RecoveryCode lookup/update, Session creation
- **External Integration**: Cryptographic hashing library
- **Performance Requirements**: Verification <300ms

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Valid unused recovery code authenticates user successfully
  - AC-02: Used recovery code is rejected with appropriate error
  - AC-03: Invalid format code shows client validation error
  - AC-04: Warning displayed when only 2 codes remain
  - AC-05: Rate limiting prevents brute force attempts
  - AC-06: Case-insensitive code matching works correctly

---

## Implementation Notes

### Security Considerations
- **Code Storage**: Hashed in database (SHA-256 or bcrypt)
- **Rate Limiting**: Prevents brute force (64^10 combinations for 10-char alphanumeric)
- **Single-Use Enforcement**: Critical - prevents replay attacks
- **Code Generation**: Cryptographically secure random generation
- **User Education**: Codes should be stored securely (printed, password manager)

---

This Verify Recovery Code use case provides implementation guidance for backup authentication within the Identity area.
