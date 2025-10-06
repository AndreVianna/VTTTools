# Change Password Use Case

**Original Request**: Update account password with current password verification

**Change Password** is a security operation that allows users to update their account password by verifying their current password and setting a new one. This use case operates within the Identity area and enables users to maintain account security through regular password updates.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from SecuritySettings.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Account Management
- **Owning Area**: Identity
- **Business Value**: User autonomy in password management, security hygiene
- **User Benefit**: Control over account security, ability to update compromised passwords

### Scope Definition
- **Primary Actor**: Authenticated User
- **Scope**: Password verification, update, and hash storage
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: MODAL
- **Access Method**: Dialog triggered from SecuritySettings via "Change Password" button

- **Container**: Modal dialog (maxWidth="sm", fullWidth)
- **Trigger**: "Change Password" button in SecuritySettings
- **Modal Type**: Password change dialog with form
- **Key UI Elements**:
  - Header: "Change Password" title with close icon
  - TextField: Current password input (password type, required)
  - TextField: New password input (password type, required) with strength indicator
  - TextField: Confirm new password input (password type, required)
  - Typography: Password strength feedback (weak/medium/strong) with color coding
  - Typography: Password requirements list (8+ chars, uppercase, lowercase, number, special)
  - Alert: Error messages for validation failures
  - Button: "Cancel" (closes dialog without changes)
  - Button: "Change Password" with loading state

### UI State Requirements
- **Data Dependencies**: useAuth hook (changePassword function, isLoading, error states)
- **State Scope**: Local component state (currentPassword, newPassword, confirmPassword, validationErrors)
- **API Calls**: POST /api/auth/change-password (via useAuth().changePassword())
- **State Management**: React useState for form fields and validation

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks "Change Password" in Security Settings
  2. Dialog opens with three password fields
  3. User enters current password
  4. User enters new password (sees strength indicator update)
  5. User enters password confirmation
  6. User clicks "Change Password" button
  7. Client validates inputs
  8. API call verifies current password and updates to new one
  9. On success, dialog closes with success message
  10. Optional: All other sessions terminated for security
- **Validation Feedback**:
  - Current password required
  - New password strength indicator (visual color: red/yellow/green)
  - New password requirements list with checkmarks/x as user types
  - Confirm password must match new password
  - Inline error messages for validation failures
- **Loading States**: Submit button shows spinner, all inputs disabled during API call
- **Success Handling**: Dialog closes, success notification, return to Security Settings
- **Error Handling**: Error alert displayed in dialog (incorrect current password, weak new password)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: PasswordService.ChangePassword(ChangePasswordCommand)
- **Domain Entities**: User (aggregate root)
- **Domain Services**: PasswordHashingService, PasswordStrengthValidator
- **Infrastructure Dependencies**: UserRepository, PasswordHasher, SessionRepository (for termination)

### Hexagonal Architecture
- **Primary Port Operation**: IPasswordService.ChangePassword(userId, currentPassword, newPassword)
- **Secondary Port Dependencies**:
  - IUserRepository.FindById(userId)
  - IPasswordHasher.VerifyPassword(plaintext, hash)
  - IPasswordHasher.HashPassword(plaintext)
  - IUserRepository.Update(user)
  - ISessionRepository.DeleteAllForUser(userId) [optional - security measure]
- **Adapter Requirements**: HTTP adapter, database adapter, cryptography adapter (bcrypt/argon2)

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Password change, password verification, password strength, security update
- **Business Invariants**:
  - Current password must match stored hash
  - New password must meet strength requirements
  - New password must be different from current password (optional rule)
  - New password must match confirmation
  - Password hashed before storage (bcrypt/argon2)
- **Domain Events**: PasswordChanged(userId, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Current password (string, required)
  - New password (string, required, 8+ chars recommended)
  - Confirm password (string, required, must match new password)
- **Input Validation**:
  - Current password: Non-empty
  - New password: Minimum 8 chars, strength score ≥3/5
  - Confirm password: Matches new password exactly
- **Preconditions**:
  - User is authenticated
  - User has password-based authentication (not social auth only)

### Business Logic
- **Business Rules**:
  - Current password must be verified before allowing change
  - New password strength calculation:
    - Score 0: Empty
    - Score 1: Length ≥8
    - Score 2: +1 if has lowercase
    - Score 3: +1 if has uppercase
    - Score 4: +1 if has number
    - Score 5: +1 if has special character
  - Minimum required score: 3/5 (e.g., 8+ chars with 2 of: upper/lower/number/special)
  - New password must differ from current password (optional but recommended)
  - Password hashed using bcrypt or argon2 with appropriate cost factor
  - After change, optionally terminate all other sessions (security best practice)
  - Rate limiting: Max 5 attempts per 15 minutes (prevent brute force current password guessing)
- **Processing Steps**:
  1. Client: Validate input formats and strength
  2. Submit to PasswordService.ChangePassword
  3. Server: Find User entity
  4. Server: Verify current password matches stored hash
  5. Server: Validate new password strength
  6. Server: Check new password differs from current (optional)
  7. Server: Hash new password
  8. Server: Update User.passwordHash
  9. Server: Optionally terminate all other sessions
  10. Server: Publish PasswordChanged event
  11. Client: Close dialog, show success message
  12. Client: Optional - redirect to login if sessions terminated
- **Domain Coordination**:
  - User entity manages password
  - PasswordHashingService verifies and hashes
  - PasswordStrengthValidator scores password
- **Validation Logic**:
  - Frontend: Length, strength score, confirmation match
  - Backend: Current password verification, strength validation, uniqueness (vs current)

### Output Specification
- **Output Data**:
  - Success: { success: true, message: "Password updated successfully" }
  - Error: { error: string, field?: string }
- **Output Format**: JSON response
- **Postconditions**:
  - User password updated in database
  - Old password invalidated
  - PasswordChanged event published
  - Optionally, other sessions terminated

### Error Scenarios
- **Empty Current Password**: Client validation → "Current password is required"
- **Weak New Password**: Client/backend validation → "Password is too weak. Missing: {requirements}"
- **Password Mismatch**: Client validation → "Passwords do not match"
- **Incorrect Current Password**: Backend 401 → "Current password is incorrect"
- **New Password Same as Current**: Backend 400 → "New password must be different from current password"
- **Rate Limit Exceeded**: Backend 429 → "Too many attempts. Please try again later."
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IPasswordService {
    ChangePassword(command: ChangePasswordCommand): Promise<ChangeResult>
  }

  interface ChangePasswordCommand {
    userId: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }

  interface ChangeResult {
    success: boolean
    message: string
  }
  ```
- **Data Access Patterns**: Repository for User lookup and update
- **External Integration**: Password hashing library (bcrypt/argon2)
- **Performance Requirements**: Change response <800ms (bcrypt hashing is CPU-intensive)

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Valid password change succeeds
  - AC-02: Incorrect current password rejected with error
  - AC-03: Weak new password rejected with specific feedback
  - AC-04: Password mismatch shows validation error
  - AC-05: Password strength indicator updates as user types
  - AC-06: Success message and dialog close on successful change
  - AC-07: Rate limiting prevents brute force attempts
  - AC-08: After change, user can login with new password

---

## Implementation Notes

### Security Considerations
- **Verification Required**: Must verify current password before allowing change
- **Strength Enforcement**: Minimum strength requirements prevent weak passwords
- **Secure Hashing**: bcrypt or argon2 with appropriate cost factor
- **Session Handling**: Consider terminating other sessions after password change
- **Rate Limiting**: Prevent brute force guessing of current password
- **Password History**: Optional - prevent reuse of recent passwords

---

This Change Password use case provides implementation guidance for password management within the Identity area.
