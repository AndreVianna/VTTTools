# Setup Two Factor Authentication Use Case

**Original Request**: Configure TOTP-based 2FA with authenticator app

**Setup Two Factor Authentication** is a security enhancement operation that generates TOTP secrets, displays QR codes, and verifies authenticator app setup. This use case operates within the Identity area and enables users to add two-factor authentication protection to their accounts.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from TwoFactorSetupForm.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Account Management
- **Owning Area**: Identity
- **Business Value**: Enhanced account security, reduced risk of unauthorized access
- **User Benefit**: Protection against credential theft, peace of mind

### Scope Definition
- **Primary Actor**: Authenticated User (without 2FA currently enabled)
- **Scope**: TOTP secret generation, QR code display, setup verification, recovery code generation
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: MODAL
- **Access Method**: Dialog triggered from SecuritySettings via "Enable 2FA" button

- **Container**: Modal dialog (maxWidth="md", fullWidth)
- **Trigger**: "Enable 2FA" button in SecuritySettings
- **Modal Type**: Multi-step setup wizard dialog
- **Key UI Elements**:
  - Step 1: Instructions and app recommendations (Google Authenticator, Authy, Microsoft Authenticator)
  - Step 2: QR Code display (generated from TOTP secret) with manual entry code option
  - Step 3: Verification - enter 6-digit code from app to confirm setup
  - TextField: Verification code input (6 digits, centered monospace)
  - Paper: Recovery codes display (8-10 codes) with download/copy options
  - Buttons: "Next", "Back", "Verify", "Complete Setup", "Cancel"
  - Alert: Instructions, warnings, success/error messages
  - Checkbox: "I have saved my recovery codes" (required before completion)

### UI State Requirements
- **Data Dependencies**: useAuth hook (enable2FA function, isLoading, error states)
- **State Scope**: Local component state (setupStep, totpSecret, qrCodeUrl, verificationCode, recoveryCodes, hasConfirmedSave)
- **API Calls**:
  - POST /api/auth/2fa/setup-initiate (generates secret, returns QR data)
  - POST /api/auth/2fa/setup-verify (verifies code, enables 2FA, returns recovery codes)
- **State Management**: React useState for wizard steps, Auth Context for 2FA status update

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks "Enable 2FA" in Security Settings
  2. Dialog opens with setup instructions
  3. User clicks "Next" to proceed
  4. API call generates TOTP secret and QR code
  5. QR code displays with manual entry code option
  6. User scans QR code with authenticator app
  7. User enters verification code from app
  8. User clicks "Verify" button
  9. API verifies code, enables 2FA, generates recovery codes
  10. Recovery codes display with save/download options
  11. User confirms they've saved codes (checkbox)
  12. User clicks "Complete Setup"
  13. Dialog closes, Security Settings updates to show 2FA enabled
- **Validation Feedback**:
  - Code must be 6 digits
  - Verification fails if code invalid or expired
  - Recovery codes save confirmation required
- **Loading States**: Loading spinners during API calls (initiate, verify)
- **Success Handling**: Recovery codes displayed, 2FA activated, dialog closes on completion
- **Error Handling**: Error alerts for verification failures, network errors

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: TwoFactorAuthenticationService.InitiateSetup(), VerifySetup()
- **Domain Entities**: User, TwoFactorSetup, RecoveryCode
- **Domain Services**: TOTPSecretGenerator, RecoveryCodeGenerator, QRCodeGenerator
- **Infrastructure Dependencies**: TwoFactorSetupRepository, RecoveryCodeRepository, TOTPLibrary, QRCodeLibrary

### Hexagonal Architecture
- **Primary Port Operation**: ITwoFactorService.InitiateSetup(userId), VerifySetup(userId, code)
- **Secondary Port Dependencies**:
  - ITOTPGenerator.GenerateSecret()
  - IQRCodeGenerator.GenerateQRCode(secret, username)
  - ITOTPValidator.ValidateCode(secret, code)
  - ITwoFactorSetupRepository.Create(setup)
  - IRecoveryCodeRepository.CreateMultiple(userId, codes)
  - IUserRepository.Update(user) [set twoFactorEnabled=true]
- **Adapter Requirements**: HTTP adapter, database adapter, TOTP library (otplib), QR code library (qrcode)

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Two-factor authentication, TOTP secret, QR code, authenticator app, recovery codes, setup verification
- **Business Invariants**:
  - TOTP secret must be securely random (20+ bytes)
  - Secret stored encrypted or hashed
  - Setup requires code verification before enabling
  - Recovery codes generated automatically upon 2FA enablement
  - User must confirm they saved recovery codes
- **Domain Events**: TwoFactorAuthenticationEnabled(userId, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Verification code (string, 6 digits) in step 3
  - Recovery codes save confirmation (boolean checkbox) in step 4
- **Input Validation**:
  - Verification code: 6 digits, numeric
  - Save confirmation: Must be checked before completion
- **Preconditions**:
  - User is authenticated
  - User does not currently have 2FA enabled
  - User has authenticator app installed or can install one

### Business Logic
- **Business Rules**:
  - TOTP secret generated using cryptographically secure random
  - QR code encodes: otpauth://totp/VTTTools:{email}?secret={secret}&issuer=VTTTools
  - Verification code validated using current time window (±30s tolerance)
  - Upon successful verification, generate 8-10 recovery codes (alphanumeric, 8-10 chars each)
  - Recovery codes stored hashed in database
  - User.twoFactorEnabled set to true
  - Setup is atomic - either fully completes or fully fails (no partial states)
- **Processing Steps**:
  1. User initiates setup
  2. API: Generate TOTP secret (cryptographically secure)
  3. API: Create TwoFactorSetup entity (pending status)
  4. API: Generate QR code data URI
  5. API: Return secret and QR code to client
  6. Client: Display QR code and manual entry code
  7. User scans QR code with authenticator app
  8. User enters 6-digit code from app
  9. API: Validate code against secret
  10. API: If valid, set TwoFactorSetup status to active
  11. API: Generate recovery codes (8-10 codes)
  12. API: Hash and store recovery codes
  13. API: Update User.twoFactorEnabled = true
  14. API: Publish TwoFactorAuthenticationEnabled event
  15. API: Return recovery codes (plaintext, only time they're visible)
  16. Client: Display recovery codes with save instructions
  17. User saves codes (download/copy/print)
  18. User confirms save via checkbox
  19. Client: Complete setup, close dialog, update Auth Context
- **Domain Coordination**:
  - TwoFactorSetup entity manages secret and status
  - RecoveryCode entities created for backup authentication
  - User entity tracks 2FA enablement
- **Validation Logic**:
  - Frontend: Code format (6 digits)
  - Backend: TOTP algorithm validation with time tolerance

### Output Specification
- **Output Data**:
  - InitiateSetup: { secret: string, qrCodeDataUri: string, manualEntryCode: string }
  - VerifySetup: { success: boolean, recoveryCodes: string[] }
- **Output Format**: JSON response
- **Postconditions**:
  - User has 2FA enabled
  - TOTP secret stored securely
  - Recovery codes generated and saved by user
  - TwoFactorAuthenticationEnabled event published

### Error Scenarios
- **Secret Generation Failure**: Backend error → "Failed to generate 2FA setup. Please try again."
- **Invalid Verification Code**: Backend 401 → "Invalid code. Please check your authenticator app."
- **Code Expired**: Backend 401 → "Code expired. Please enter a new code."
- **Network Error During Setup**: "Connection error. Please try again."
- **User Closes Without Completing**: Setup aborted, pending TwoFactorSetup cleaned up
- **Recovery Codes Not Saved Confirmation**: Client prevents completion, shows warning

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface ITwoFactorService {
    InitiateSetup(userId: string): Promise<SetupInitiateResult>
    VerifySetup(userId: string, code: string): Promise<VerifySetupResult>
  }

  interface SetupInitiateResult {
    secret: string
    qrCodeDataUri: string
    manualEntryCode: string
  }

  interface VerifySetupResult {
    success: boolean
    recoveryCodes: string[]
  }
  ```
- **Data Access Patterns**: Repository for TwoFactorSetup, RecoveryCode, User updates
- **External Integration**: TOTP library (otplib), QR code library (qrcode.react)
- **Performance Requirements**: Setup initiate <500ms, verify <300ms

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: QR code generates and displays correctly
  - AC-02: Manual entry code displayed as alternative to QR scan
  - AC-03: Valid TOTP code successfully enables 2FA
  - AC-04: Invalid code shows error and allows retry
  - AC-05: Recovery codes displayed after successful verification
  - AC-06: Cannot complete setup without confirming recovery codes saved
  - AC-07: Canceling setup discards progress and doesn't enable 2FA
  - AC-08: After completion, SecuritySettings shows 2FA enabled

---

## Implementation Notes

### Security Considerations
- **Secret Security**: Store encrypted or hashed, never log in plaintext
- **QR Code Security**: Transmitted over HTTPS only, not logged
- **Recovery Codes**: Generated cryptographically secure, stored hashed
- **Setup Atomicity**: All-or-nothing operation, no partial states
- **User Education**: Clear instructions on keeping recovery codes safe

---

This Setup Two Factor Authentication use case provides implementation guidance for 2FA enrollment within the Identity area.
