# Manage Recovery Codes Use Case

**Original Request**: View, regenerate, and download backup recovery codes for 2FA

**Manage Recovery Codes** is a security management operation that allows users to view remaining recovery codes, regenerate new codes when needed, and download/save codes for safe keeping. This use case operates within the Identity area and provides backup authentication options for 2FA-enabled users.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from RecoveryCodesManager.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Account Management
- **Owning Area**: Identity
- **Business Value**: Prevents account lockout, reduces support burden for 2FA issues
- **User Benefit**: Backup authentication method, peace of mind about account access

### Scope Definition
- **Primary Actor**: Authenticated User (with 2FA enabled)
- **Scope**: Recovery code viewing, regeneration, and download
- **Level**: User Task

---

## UI Presentation

### Presentation Type
- **UI Type**: MODAL
- **Access Method**: Dialog triggered from SecuritySettings via "Manage Codes" button

- **Container**: Modal dialog (maxWidth="md", fullWidth)
- **Trigger**: "Manage Codes" button in SecuritySettings (only shown if 2FA enabled)
- **Modal Type**: Recovery codes management dialog
- **Key UI Elements**:
  - Alert: Warning about single-use nature and importance of safekeeping
  - Display: Current codes remaining count (e.g., "You have 7 unused recovery codes remaining")
  - Code List: Unused recovery codes displayed (masked or visible, toggle option)
  - Button: "Show Codes" / "Hide Codes" toggle
  - Button: "Download Codes" (saves as .txt file)
  - Button: "Copy to Clipboard"
  - Button: "Print Codes"
  - Alert: Warning when only 2-3 codes remain → "You're running low on recovery codes. Consider regenerating."
  - Button: "Regenerate Codes" (requires password confirmation)
  - Dialog: Password confirmation for regeneration
  - Success Display: New codes after regeneration with save instructions
  - Button: "Close"

### UI State Requirements
- **Data Dependencies**: useAuth hook or SecurityService (getRecoveryCodes, regenerateRecoveryCodes functions)
- **State Scope**: Local component state (codesVisible, showRegenerateDialog, confirmPassword, recoveryCodes array)
- **API Calls**:
  - GET /api/auth/recovery-codes/remaining (get count)
  - POST /api/auth/recovery-codes/regenerate (with password, returns new codes)
- **State Management**: React useState for component state

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks "Manage Codes" in Security Settings
  2. Dialog opens showing codes remaining count
  3. User can:
     - View codes (toggle show/hide)
     - Download codes as text file
     - Copy codes to clipboard
     - Print codes
  4. If codes remaining <3, regeneration warning shown
  5. User clicks "Regenerate Codes"
  6. Password confirmation dialog appears
  7. User enters current password
  8. New codes generated (old codes invalidated)
  9. New codes displayed with save instructions
  10. User saves new codes
  11. Dialog closes
- **Validation Feedback**:
  - Password required for regeneration
  - Warning if codes not saved before closing after regeneration
- **Loading States**: Loading spinner during API calls (fetch, regenerate)
- **Success Handling**: New codes displayed, download/copy options provided
- **Error Handling**: Invalid password, network errors, regeneration failures

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: RecoveryCodeService.GetRemainingCodes(), RegenerateRecoveryCodes()
- **Domain Entities**: RecoveryCode (aggregate root), User
- **Domain Services**: RecoveryCodeGenerator, PasswordVerificationService
- **Infrastructure Dependencies**: RecoveryCodeRepository, PasswordHasher

### Hexagonal Architecture
- **Primary Port Operation**: IRecoveryCodeService.GetRemaining(userId), Regenerate(userId, password)
- **Secondary Port Dependencies**:
  - IRecoveryCodeRepository.FindByUserId(userId)
  - IRecoveryCodeRepository.InvalidateAll(userId)
  - IRecoveryCodeRepository.CreateMultiple(userId, codes)
  - IPasswordHasher.VerifyPassword(plaintext, hash)
- **Adapter Requirements**: HTTP adapter, database adapter, cryptography adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Recovery codes, backup codes, regeneration, code exhaustion
- **Business Invariants**:
  - Each code single-use only
  - User should have multiple codes (8-10)
  - Regeneration invalidates all old codes
  - Password required for regeneration (security)
  - Codes stored hashed (like passwords)
- **Domain Events**: RecoveryCodesRegenerated(userId, codesCount, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Current password (string, required for regeneration)
- **Input Validation**:
  - Password non-empty
  - User must have 2FA enabled
- **Preconditions**:
  - User is authenticated
  - User has 2FA enabled
  - Recovery codes exist (generated during 2FA setup)

### Business Logic
- **Business Rules**:
  - Recovery codes are single-use backup authentication
  - Typical count: 8-10 codes per user
  - Warning threshold: <3 codes remaining
  - Regeneration creates new set of 8-10 codes
  - Regeneration invalidates ALL old codes (used and unused)
  - Password verification required for regeneration (security)
  - New codes only displayed once (after regeneration) - stored hashed
  - Codes are 8-12 character alphanumeric strings
- **Processing Steps**:
  1. User opens recovery codes manager
  2. API: Query RecoveryCodeRepository.CountRemaining(userId)
  3. Display count and warning if low
  4. User requests regeneration
  5. Display password confirmation dialog
  6. User enters password
  7. API: Verify password against user's hash
  8. API: Invalidate all existing recovery codes for user
  9. API: Generate new set of codes (8-10, cryptographically secure)
  10. API: Hash and store new codes
  11. API: Publish RecoveryCodesRegenerated event
  12. API: Return new codes (plaintext, only time they're visible)
  13. Client: Display new codes with download/copy/print options
  14. Client: Show confirmation checkbox "I have saved my new codes"
  15. User saves codes and confirms
  16. Dialog closes
- **Domain Coordination**:
  - RecoveryCode entities manage individual codes
  - RecoveryCodeGenerator creates secure random codes
  - PasswordVerificationService validates user password
- **Validation Logic**:
  - Frontend: Password non-empty
  - Backend: Password verification, 2FA enabled check

### Output Specification
- **Output Data**:
  - GetRemaining: { remainingCount: number }
  - Regenerate: { recoveryCodes: string[], count: number }
- **Output Format**: JSON response
- **Postconditions**:
  - Old codes invalidated
  - New codes generated and saved by user
  - RecoveryCodesRegenerated event published

### Error Scenarios
- **2FA Not Enabled**: Client prevents access (button not shown)
- **Invalid Password**: Backend 401 → "Incorrect password"
- **No Existing Codes**: Backend generates initial set (edge case)
- **Network Error**: "Connection error. Please try again."
- **Generation Failure**: Backend 500 → "Failed to regenerate codes. Please try again."
- **User Closes Without Saving**: Warning prompt "Are you sure? New codes won't be shown again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IRecoveryCodeService {
    GetRemainingCount(userId: string): Promise<{ remainingCount: number }>
    RegenerateRecoveryCodes(userId: string, password: string): Promise<RegenerateResult>
  }

  interface RegenerateResult {
    recoveryCodes: string[]
    count: number
  }
  ```
- **Data Access Patterns**: Repository for RecoveryCode queries, invalidation, creation
- **External Integration**: Secure random generation library
- **Performance Requirements**: Get count <200ms, regenerate <500ms

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Codes remaining count displays correctly
  - AC-02: Warning shown when <3 codes remain
  - AC-03: Regeneration requires password confirmation
  - AC-04: Invalid password rejected with error message
  - AC-05: New codes generated and displayed after successful regeneration
  - AC-06: Old codes invalidated after regeneration
  - AC-07: Download/copy/print functionality works correctly
  - AC-08: Warning if closing without saving new codes

---

## Implementation Notes

### Security Considerations
- **Password Protection**: Regeneration requires current password (prevents unauthorized regeneration)
- **Code Storage**: Stored hashed in database (never plaintext)
- **One-Time Display**: New codes only shown once after generation
- **All-or-Nothing Invalidation**: Regeneration invalidates ALL old codes (prevents confusion)

---

This Manage Recovery Codes use case provides implementation guidance for recovery code management within the Identity area.
