# Generated: 2025-01-15
# Use Case: Setup Two Factor Authentication

@use-case @identity @security @2fa @setup
Feature: Setup Two Factor Authentication
  As an authenticated user without 2FA
  I want to enable two-factor authentication
  So that I can protect my account with enhanced security

  Background:
    Given I am authenticated as a registered user
    And I have not enabled two-factor authentication
    And I have access to an authenticator app

  # ========================================
  # Happy Path - Complete Setup Flow
  # ========================================

  @happy-path @critical
  Scenario: Successfully complete full 2FA setup
    Given I am on security settings page
    When I click "Enable 2FA"
    Then I should see the 2FA setup wizard dialog
    When I proceed through the instructions step
    Then I should see a QR code generated
    And I should see a manual entry code as alternative
    When I scan the QR code with Google Authenticator
    And I enter the 6-digit verification code from my app
    And I click "Verify"
    Then the code should be verified successfully
    And I should see my recovery codes displayed
    And I should see 8 to 10 recovery codes
    When I confirm I have saved my recovery codes
    And I click "Complete Setup"
    Then 2FA should be enabled on my account
    And the dialog should close
    And I should see "2FA Enabled" in security settings
    And I should see success notification

  # ========================================
  # Setup Wizard Steps
  # ========================================

  @happy-path @wizard
  Scenario: Navigate through setup wizard steps
    When I initiate 2FA setup
    Then I should see step 1 with instructions
    And I should see list of recommended authenticator apps
    And I should see "Next" button
    When I click "Next"
    Then I should proceed to step 2 with QR code
    And I should see "Back" button
    And I should see "Enter Code" or "Next" button
    When I proceed to verification step
    Then I should see step 3 with verification code input
    And I should see "Verify" button
    When verification succeeds
    Then I should see step 4 with recovery codes
    And I should see "Complete Setup" button

  @happy-path @wizard
  Scenario: Navigate backwards in setup wizard
    Given I am on step 3 of 2FA setup
    When I click "Back"
    Then I should return to step 2
    And the QR code should still be displayed
    And I should not lose my setup progress

  @happy-path @wizard
  Scenario: Cancel setup at any step
    Given I am in the middle of 2FA setup process
    When I click "Cancel" or close the dialog
    Then the setup should be aborted
    And 2FA should not be enabled
    And I should return to security settings
    And my account state should remain unchanged

  # ========================================
  # QR Code Generation and Display
  # ========================================

  Rule: QR code must encode valid TOTP URI

    @happy-path @qr-code
    Scenario: QR code generated with correct format
      When I reach the QR code step
      Then a TOTP secret is generated
      And the QR code should encode URI format: "otpauth://totp/VTTTools:{email}?secret={secret}&issuer=VTTTools"
      And the QR code should be displayed clearly
      And the QR code should be scannable by authenticator apps

    @happy-path @qr-code
    Scenario: Manual entry code displayed as alternative
      When I view the QR code step
      Then I should see the manual entry code displayed
      And the code should be formatted for easy reading
      And I should see instruction "Enter this code manually if you cannot scan the QR code"
      And the code should match the QR code secret

    @ux @qr-code
    Scenario: QR code display with clear instructions
      When I view the QR code step
      Then I should see clear instructions to scan the code
      And I should see supported authenticator app names
      And I should see what to expect after scanning
      And visual elements should be well-organized

  # ========================================
  # Verification Code Validation
  # ========================================

  Rule: Setup requires valid TOTP code verification

    @happy-path @verification
    Scenario: Accept valid 6-digit verification code
      Given I have scanned the QR code
      And my authenticator app shows code "123456"
      When I enter "123456" in the verification field
      And I click "Verify"
      Then the code passes validation
      And I should proceed to recovery codes step
      And 2FA should be marked as pending activation

    @validation @verification
    Scenario: Reject invalid verification code
      Given I have scanned the QR code
      When I enter an incorrect code "999999"
      And I click "Verify"
      Then I should see error "Invalid code. Please check your authenticator app."
      And I should remain on the verification step
      And I should be able to enter a new code
      And 2FA should not be enabled yet

    @validation @verification
    Scenario: Verify code must be exactly 6 digits
      When I enter code "12345" with only 5 digits
      Then the verify button should be disabled
      Or I should see validation error "Code must be 6 digits"
      When I enter code "123456"
      Then the verify button should be enabled

    @validation @verification
    Scenario: Handle expired verification code
      Given I have generated a QR code
      And significant time has passed (60+ seconds)
      When I enter an old TOTP code
      And I click "Verify"
      Then I should see error "Code expired. Please enter a new code."
      And I should be able to retry with current code

    @error-handling @verification
    Scenario: Allow multiple verification attempts
      Given I have entered incorrect codes twice
      When I enter the correct code on third attempt
      Then the verification should succeed
      And I should not be locked out
      And I should proceed to recovery codes

  # ========================================
  # Recovery Codes Generation
  # ========================================

  Rule: Recovery codes generated automatically upon successful verification

    @happy-path @recovery-codes
    Scenario: Display recovery codes after verification
      Given I have verified my TOTP code successfully
      Then I should automatically see recovery codes displayed
      And I should see 8 to 10 codes
      And each code should be 8 to 12 characters
      And codes should be clearly formatted and readable

    @happy-path @recovery-codes
    Scenario: Recovery codes save options provided
      Given I am viewing my recovery codes
      Then I should see "Download Codes" button
      And I should see "Copy to Clipboard" button
      And I should see "Print Codes" option
      And I should see warning about saving codes securely

    @validation @recovery-codes
    Scenario: Must confirm saving codes before completing
      Given I am viewing recovery codes
      And I have not confirmed saving them
      When I attempt to click "Complete Setup"
      Then the button should be disabled
      Or I should see error "Please confirm you have saved your recovery codes"
      When I check the confirmation checkbox
      Then the "Complete Setup" button should become enabled

    @ux @recovery-codes
    Scenario: Download recovery codes as text file
      Given I am viewing my recovery codes
      When I click "Download Codes"
      Then a text file should download
      And the file should be named "vtttools_recovery_codes_{date}.txt"
      And the file should contain all codes
      And the file should include usage instructions

    @ux @recovery-codes
    Scenario: Copy recovery codes to clipboard
      Given I am viewing my recovery codes
      When I click "Copy to Clipboard"
      Then all codes should be copied
      And I should see confirmation "Codes copied to clipboard"
      And codes should be formatted for easy pasting

  # ========================================
  # Security Warnings and Education
  # ========================================

  @ux @security-education
  Scenario: Display important security warnings
    When I view the recovery codes step
    Then I should see warning about code importance
    And I should see instruction to store codes safely
    And I should see warning that codes are shown only once
    And I should see notice about single-use nature

  @ux @security-education
  Scenario: Provide guidance on authenticator apps
    When I view the instructions step
    Then I should see recommended authenticator apps listed
    And I should see "Google Authenticator"
    And I should see "Authy"
    And I should see "Microsoft Authenticator"
    And I should see brief explanation of how TOTP works

  # ========================================
  # Error Handling and Edge Cases
  # ========================================

  @error-handling
  Scenario: Handle secret generation failure
    When I initiate 2FA setup
    And the secret generation fails on server
    Then I should see error "Failed to generate 2FA setup. Please try again."
    And the dialog should remain open or close gracefully
    And I should be able to retry the setup

  @error-handling
  Scenario: Handle network error during verification
    Given I have entered a valid code
    When I click "Verify"
    And a network error occurs
    Then I should see error "Connection error. Please try again."
    And my entered code should be preserved
    And I should be able to retry verification

  @error-handling
  Scenario: Handle QR code generation failure
    When I reach the QR code step
    And QR code generation fails
    Then I should see the manual entry code
    And I should see message "QR code unavailable. Please use manual entry."
    And I should be able to continue setup

  @edge-case
  Scenario: Close dialog without saving recovery codes
    Given I have verified successfully
    And I am viewing recovery codes
    And I have not saved them
    When I attempt to close the dialog
    Then I should see warning "Are you sure? Recovery codes won't be shown again."
    And I should have option to go back
    And I should have option to confirm close

  @edge-case
  Scenario: User already has pending 2FA setup
    Given I initiated 2FA setup previously but did not complete
    When I initiate setup again
    Then the previous pending setup should be cleaned up
    And a new setup should be initiated
    And I should see fresh QR code and secret

  @edge-case
  Scenario: Setup with 2FA already enabled (should not happen)
    Given 2FA is already enabled on my account
    When I somehow access the setup wizard
    Then I should see error "2FA is already enabled"
    And the wizard should not allow setup
    Or I should be redirected to security settings

  # ========================================
  # Integration and Side Effects
  # ========================================

  @integration
  Scenario: Successful setup publishes domain event
    When I complete 2FA setup successfully
    Then a TwoFactorAuthenticationEnabled action is logged
    And the event should include user ID and timestamp
    And other systems should be notified

  @integration
  Scenario: Setup updates Auth Context immediately
    When I complete 2FA setup
    Then my Auth Context should update to show twoFactorEnabled=true
    And the security settings page should reflect this change
    And I should not need to refresh the page

  @integration
  Scenario: Recovery codes stored securely
    When recovery codes are generated
    Then codes should be hashed before storage
    And plaintext codes should not be logged
    And codes should only be displayed once
    And stored codes should be marked as unused

  # ========================================
  # Performance and UX
  # ========================================

  @performance
  Scenario: QR code generation completes quickly
    When I reach the QR code step
    Then the QR code should generate within 500ms
    And I should see loading state during generation
    And the display should be smooth

  @ux @accessibility
  Scenario: Setup wizard keyboard navigation
    When I navigate the setup wizard using keyboard
    Then I should be able to tab through all elements
    And Enter key should submit verification code
    And Escape key should cancel setup
    And focus indicators should be visible

  @ux @responsive
  Scenario: Setup wizard responsive on mobile
    Given I am setting up 2FA on mobile device
    Then the dialog should fit viewport
    And QR code should be appropriately sized
    And buttons should be touch-friendly
    And verification code input should be large
    And keyboard should open appropriately

  # ========================================
  # Disable Two-Factor Authentication
  # ========================================

  Rule: Two-factor authentication can be disabled with password

    @happy-path @2fa @disable
    Scenario: Successfully disable two-factor authentication
      Given I have two-factor authentication enabled
      When I request to disable 2FA
      And I provide my current password
      Then 2FA should be disabled successfully
      And my recovery codes should be invalidated
      And I should see "2FA Disabled" in security settings
