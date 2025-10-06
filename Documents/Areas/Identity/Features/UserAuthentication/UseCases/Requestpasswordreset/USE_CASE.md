# Request Password Reset Use Case

**Original Request**: Initiate password reset flow by sending reset email

**Request Password Reset** is a self-service password recovery operation that generates secure reset tokens and sends email instructions to users who have forgotten their passwords. This use case operates within the Identity area and enables users to regain account access.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from PasswordResetRequestForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: User Authentication
- **Owning Area**: Identity
- **Business Value**: Self-service account recovery reduces support burden and improves user satisfaction
- **User Benefit**: Quick password reset without contacting support

### Scope Definition
- **Primary Actor**: Unauthenticated User (forgot password)
- **Scope**: Token generation and reset email delivery
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Embedded in LoginPage, rendered when mode='reset-request'

- **Container Page**: LoginPage (reset-request mode, accessed via "Forgot password?" link from login)
- **Form Location**: Centered form
- **Submit Action**: Validates email, calls useAuth().resetPassword(), shows success message
- **Key UI Elements**:
  - Header: "Reset Password" title
  - Text: Instructions - "Enter your email and we'll send reset instructions"
  - Form Field: Email input with format validation and icon
  - Button: "Send Reset Instructions" submit button with loading state
  - Link: "Back to Login" to return to login form
  - Success Screen: Email sent confirmation with icon and instructions

### UI State Requirements
- **Data Dependencies**: useAuth hook (resetPassword, isLoading, error)
- **State Scope**: Local form (email, isSubmitted, validationErrors)
- **API Calls**: POST /api/auth/request-password-reset
- **State Management**: React useState for form state

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks "Forgot password?" on login form
  2. Form displays email input
  3. User enters email address
  4. User clicks "Send Reset Instructions"
  5. On success, success screen shows with email confirmation
  6. User checks email and follows reset link
  7. User can retry if email not received
- **Validation Feedback**:
  - Email format validation
  - Inline error messages
- **Loading States**: Button spinner during API call
- **Success Handling**: Success screen with email address display, expiration notice (24h)
- **Error Handling**: Generic error (never reveal if email exists for security)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: PasswordResetService.RequestReset(RequestResetCommand)
- **Domain Entities**: User, PasswordResetToken
- **Domain Services**: TokenGenerationService, EmailService
- **Infrastructure Dependencies**: UserRepository, PasswordResetTokenRepository, EmailSender

### Hexagonal Architecture
- **Primary Port Operation**: IPasswordResetService.RequestReset(email)
- **Secondary Port Dependencies**:
  - IUserRepository.FindByEmail(email)
  - IPasswordResetTokenRepository.Create(token)
  - IEmailSender.SendPasswordResetEmail(email, token)
- **Adapter Requirements**: HTTP adapter, database adapter, email adapter (SendGrid, AWS SES)

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Password reset, reset token, reset link, token expiration
- **Business Invariants**:
  - Tokens expire after 24 hours
  - One active token per user at a time
  - Tokens are cryptographically secure (32+ bytes entropy)
  - Email must exist in system (but don't reveal to user)
- **Domain Events**: PasswordResetRequested(userId, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**: Email address (string, required, email format)
- **Input Validation**: Non-empty, valid email format
- **Preconditions**: User is not authenticated

### Business Logic
- **Business Rules**:
  - Always show success message (never reveal if email exists - security)
  - Generate cryptographically secure token (32+ bytes, URL-safe)
  - Token expires after 24 hours
  - Invalidate previous tokens for same user
  - Rate limiting: Max 3 requests per email per hour (prevent spam)
  - Email includes reset link: /login?email={email}&token={token}
  - If email doesn't exist, still show success (security - prevent email enumeration)
- **Processing Steps**:
  1. Client: Validate email format
  2. Submit to PasswordResetService.RequestReset
  3. Server: Find user by email (case-insensitive)
  4. Server: If user not found, still return success (security)
  5. Server: If user found, invalidate existing reset tokens
  6. Server: Generate secure random token
  7. Server: Create PasswordResetToken entity with 24h expiration
  8. Server: Store token with user association
  9. Server: Send email with reset link
  10. Server: Publish PasswordResetRequested event
  11. Server: Return success (no user data)
  12. Client: Show success screen with email
- **Domain Coordination**:
  - PasswordResetToken entity manages expiration
  - TokenGenerationService creates secure tokens
  - EmailService sends templated email
- **Validation Logic**:
  - Frontend: Email format
  - Backend: Rate limiting, token uniqueness

### Output Specification
- **Output Data**: { success: true } (always, for security)
- **Output Format**: JSON response
- **Postconditions**:
  - If email exists: Token created, email sent, event published
  - If email doesn't exist: No action, but success returned

### Error Scenarios
- **Empty Email**: Client validation → "Email is required"
- **Invalid Format**: Client validation → "Invalid email address"
- **Rate Limit**: Backend 429 → "Too many reset requests. Please try again later."
- **Email Send Failure**: Log error server-side, still return success to client (security)
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IPasswordResetService {
    RequestReset(email: string): Promise<ResetRequestResult>
  }

  interface ResetRequestResult {
    success: boolean
  }
  ```
- **Data Access Patterns**: Repository for user lookup, token storage
- **External Integration**: Email service (SendGrid, AWS SES, SMTP)
- **Performance Requirements**: Response <500ms, async email sending

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Valid email receives reset email with valid token
  - AC-02: Invalid email shows success but no email sent
  - AC-03: Email format validation works correctly
  - AC-04: Success screen displays correctly with email
  - AC-05: Rate limiting prevents abuse (max 3 per hour)
  - AC-06: Previous tokens invalidated when new one created

---

## Implementation Notes

### Security Considerations
- **Never Reveal Email Existence**: Always return success to prevent email enumeration
- **Secure Tokens**: 32+ bytes entropy, cryptographically random
- **Token Expiration**: 24 hours maximum
- **Rate Limiting**: Prevent spam and abuse
- **HTTPS Required**: Reset links must use HTTPS
- **Email Template**: Clear instructions, expiration notice, support contact

---

This Request Password Reset use case provides implementation guidance for secure self-service password recovery within the Identity area.
