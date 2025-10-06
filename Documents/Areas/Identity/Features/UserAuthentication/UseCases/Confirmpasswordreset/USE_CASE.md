# Confirm Password Reset Use Case

**Original Request**: Complete password reset using email token and set new password

**Confirm Password Reset** is a password change operation that validates reset tokens from email links and allows users to set new passwords. This use case operates within the Identity area and completes the self-service password recovery flow.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from PasswordResetConfirmForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Complete self-service password recovery without support intervention
- **User Benefit**: Regain account access by setting new password via secure email link

### Scope Definition
- **Primary Actor**: Unauthenticated User (with valid reset token)
- **Scope**: Token validation, password update, and account recovery
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage, rendered when mode='reset-confirm' (triggered by URL params: email + token)

- **Container Page**: LoginPage (reset-confirm mode, URL: /login?email={email}&token={token})
- **Form Location**: Centered form
- **Submit Action**: Validates password inputs, calls useAuth().confirmPasswordReset(), redirects to login
- **Key UI Elements**:
  - Header: "Set New Password" or "Reset Password" title
  - Hidden Fields: Email and token from URL parameters
  - Form Field: New password input with strength indicator
  - Form Field: Confirm password input with match validation
  - Button: "Reset Password" submit button with loading state
  - Link: "Back to Login" (in case user changes mind)
  - Success Message: "Password updated successfully" with auto-redirect

### UI State Requirements
- **Data Dependencies**: useAuth hook (confirmPasswordReset, isLoading, error), URL query params (email, token)
- **State Scope**: Local form state (newPassword, confirmPassword, validationErrors)
- **API Calls**: POST /api/auth/confirm-password-reset
- **State Management**: React useState, URL searchParams for token/email

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks reset link in email
  2. Browser opens /login?email=user@example.com&token=abc123...
  3. Form pre-fills email (readonly), stores token
  4. User enters new password
  5. User enters password confirmation
  6. User clicks "Reset Password"
  7. On success, shows success message and redirects to login
  8. User can now login with new password
- **Validation Feedback**:
  - Password strength indicator (visual feedback)
  - Password minimum length (8+ chars recommended)
  - Password confirmation match validation
  - Inline error messages
- **Loading States**: Button spinner, inputs disabled during API call
- **Success Handling**: Success alert, auto-redirect to login after 2-3 seconds
- **Error Handling**: Expired/invalid token errors, password validation errors

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: PasswordResetService.ConfirmReset(ConfirmResetCommand)
- **Domain Entities**: User, PasswordResetToken
- **Domain Services**: PasswordHashingService, TokenValidationService
- **Infrastructure Dependencies**: UserRepository, PasswordResetTokenRepository, PasswordHasher

### Hexagonal Architecture
- **Primary Port Operation**: IPasswordResetService.ConfirmReset(email, token, newPassword)
- **Secondary Port Dependencies**:
  - IPasswordResetTokenRepository.FindByToken(hashedToken)
  - IUserRepository.FindByEmail(email)
  - IPasswordHasher.HashPassword(plaintext)
  - IUserRepository.Update(user)
  - IPasswordResetTokenRepository.MarkAsUsed(tokenId)
- **Adapter Requirements**: HTTP adapter, database adapter, cryptography adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Password reset confirmation, token validation, password update
- **Business Invariants**:
  - Token must be valid and not expired (24h window)
  - Token can only be used once
  - Email in URL must match token's associated user
  - New password must meet strength requirements
  - Password cannot be same as old password (optional rule)
- **Domain Events**: PasswordResetConfirmed(userId, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Email address (string, from URL query param)
  - Reset token (string, from URL query param)
  - New password (string, 8+ chars recommended)
  - Confirm password (string, must match new password)
- **Input Validation**:
  - Email format validation
  - Token presence and format
  - Password strength (8+ chars, complexity rules)
  - Password confirmation match
- **Preconditions**:
  - User clicked valid reset link
  - Token not expired (<24h old)
  - Token not already used

### Business Logic
- **Business Rules**:
  - Token valid for 24 hours from creation
  - Token can only be used once (single-use)
  - Email parameter must match user associated with token
  - New password must meet strength requirements (8+ chars, recommended mix of upper/lower/digit/special)
  - After successful reset, invalidate all other tokens for user
  - After successful reset, optionally terminate all existing sessions (security)
  - Password must be hashed before storage (bcrypt/argon2)
- **Processing Steps**:
  1. Client: Extract email and token from URL
  2. Client: Validate password inputs (length, match)
  3. Submit to PasswordResetService.ConfirmReset
  4. Server: Hash token (if stored hashed)
  5. Server: Find PasswordResetToken by token
  6. Server: Validate token not expired, not used
  7. Server: Validate email matches token's user
  8. Server: Find User entity
  9. Server: Hash new password
  10. Server: Update User.passwordHash
  11. Server: Mark token as used
  12. Server: Invalidate any other active reset tokens for user
  13. Server: Optionally terminate active sessions (security)
  14. Server: Publish PasswordResetConfirmed event
  15. Server: Return success
  16. Client: Show success message
  17. Client: Redirect to login after delay
- **Domain Coordination**:
  - PasswordResetToken entity validates expiration
  - User entity updates password
  - PasswordHashingService creates secure hash
- **Validation Logic**:
  - Frontend: Password strength, confirmation match
  - Backend: Token validity, expiration, ownership, password strength

### Output Specification
- **Output Data**:
  - Success: { success: true, message: "Password updated successfully" }
  - Error: { error: string, code: string }
- **Output Format**: JSON response
- **Postconditions**:
  - User password updated
  - Token marked as used
  - Other tokens invalidated
  - PasswordResetConfirmed event published

### Error Scenarios
- **Missing URL Parameters**: Client error → "Invalid reset link"
- **Empty Password**: Client validation → "Password is required"
- **Weak Password**: Client/backend validation → "Password must be at least 8 characters"
- **Password Mismatch**: Client validation → "Passwords do not match"
- **Invalid Token**: Backend 401 → "Invalid or expired reset link"
- **Expired Token**: Backend 401 → "Reset link has expired. Please request a new one."
- **Token Already Used**: Backend 401 → "This reset link has already been used"
- **Email Mismatch**: Backend 400 → "Invalid reset request"
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IPasswordResetService {
    ConfirmReset(command: ConfirmResetCommand): Promise<ConfirmResult>
  }

  interface ConfirmResetCommand {
    email: string
    token: string
    newPassword: string
    confirmPassword: string
  }

  interface ConfirmResult {
    success: boolean
    message: string
  }
  ```
- **Data Access Patterns**: Repository for token lookup, user update
- **External Integration**: Password hashing library (bcrypt/argon2)
- **Performance Requirements**: Response <500ms

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Valid token and password successfully resets password
  - AC-02: Expired token (>24h) is rejected with appropriate error
  - AC-03: Used token is rejected with appropriate error
  - AC-04: Password mismatch shows client validation error
  - AC-05: Weak password shows strength error
  - AC-06: Success message displayed and auto-redirects to login
  - AC-07: After reset, user can login with new password

---

## Implementation Notes

### Security Considerations
- **Token Security**: Store hashed if possible, definitely expire after 24h
- **Single-Use**: Critical - prevents replay attacks
- **Session Termination**: Consider terminating all sessions on password reset
- **Password Strength**: Enforce minimum requirements
- **HTTPS Required**: Reset must occur over HTTPS
- **Email Verification**: Optionally re-verify email after reset

---

This Confirm Password Reset use case provides implementation guidance for completing self-service password recovery within the Identity area.
