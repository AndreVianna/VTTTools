# Generated: 2025-01-15
# Use Case: Manage Recovery Codes

@use-case @identity @security @recovery-codes @2fa
Feature: Manage Recovery Codes
  As an authenticated user with 2FA enabled
  I want to view and regenerate my recovery codes
  So that I have backup authentication methods if I lose my authenticator

  Background:
    Given I am authenticated as a registered user
    And I have two-factor authentication enabled
    And I have recovery codes generated

  # ========================================
  # Happy Path Scenarios
  # ========================================

  @happy-path
  Scenario: View remaining recovery codes count
    Given I have 7 unused recovery codes
    When I open recovery codes manager
    Then I should see "You have 7 unused recovery codes remaining"
    And I should see options to view, download, and regenerate codes
    And I should see warning about single-use nature

  @happy-path
  Scenario: Successfully regenerate recovery codes
    Given I am viewing recovery codes manager
    When I click "Regenerate Codes"
    Then I should see password confirmation dialog
    When I enter my correct password
    And I confirm regeneration
    Then new recovery codes is generated
    And I should see 8 to 10 new codes displayed
    And I should see confirmation "Recovery codes regenerated successfully"
    And all old codes should be invalidated

  # ========================================
  # Viewing Recovery Codes
  # ========================================

  @happy-path @view-codes
  Scenario: Toggle visibility of recovery codes
    Given I am viewing recovery codes manager
    And codes are initially hidden
    When I click "Show Codes"
    Then all unused recovery codes should be displayed
    And each code should be clearly formatted
    When I click "Hide Codes"
    Then codes should be masked again

  @ux @view-codes
  Scenario: Recovery codes displayed with clear formatting
    When I view my recovery codes
    Then each code should be on a separate line
    And codes should use monospace font
    And codes should be easy to read and copy
    And used codes should be marked or excluded from display

  # ========================================
  # Code Download and Copy Options
  # ========================================

  @happy-path @download
  Scenario: Download recovery codes as text file
    Given I am viewing recovery codes manager
    When I click "Download Codes"
    Then a text file should download
    And the file should be named "vtttools_recovery_codes_{date}.txt"
    And the file should contain all unused codes
    And the file should include usage instructions
    And the file should include generation date

  @happy-path @copy
  Scenario: Copy recovery codes to clipboard
    Given I am viewing recovery codes manager
    When I click "Copy to Clipboard"
    Then all unused codes should be copied
    And I should see confirmation "Codes copied to clipboard"
    And codes should be formatted with line breaks
    And I should be able to paste them elsewhere

  @happy-path @print
  Scenario: Print recovery codes
    Given I am viewing recovery codes manager
    When I click "Print Codes"
    Then a print dialog should open
    And the print format should include all codes
    And the format should include generation date
    And the format should include usage instructions

  # ========================================
  # Low Codes Warning
  # ========================================

  Rule: Warning displayed when recovery codes running low

    @validation @warning
    Scenario: Warning shown with 2 codes remaining
      Given I have only 2 unused recovery codes
      When I open recovery codes manager
      Then I should see a prominent warning
      And the warning should say "You're running low on recovery codes"
      And I should see recommendation to regenerate codes
      And the "Regenerate Codes" button should be highlighted

    @validation @warning
    Scenario: Warning shown with 1 code remaining
      Given I have only 1 unused recovery code
      When I open recovery codes manager
      Then I should see urgent warning
      And the warning should say "You have only 1 recovery code left"
      And I should see strong recommendation to regenerate
      And the regenerate option should be prominently displayed

    @validation @warning
    Scenario: No warning with sufficient codes
      Given I have 5 or more unused recovery codes
      When I open recovery codes manager
      Then I should not see low codes warning
      And the interface should show normal status
      And regenerate option should still be available

    @edge-case @warning
    Scenario: Critical warning with no codes remaining
      Given I have 0 unused recovery codes
      When I open recovery codes manager
      Then I should see critical warning
      And the warning should say "You have no recovery codes left"
      And I should see urgent message to regenerate immediately
      And I should not lose access to 2FA

  # ========================================
  # Recovery Code Regeneration
  # ========================================

  Rule: Regeneration requires password verification

    @happy-path @regeneration
    Scenario: Successful regeneration with correct password
      Given I have existing recovery codes
      When I request to regenerate codes
      And I provide my correct password
      Then password should be verified
      And all old codes should be invalidated
      And 8 to 10 new codes is generated
      And new codes should be displayed
      And I should see save options

    @validation @regeneration
    Scenario: Reject regeneration with incorrect password
      Given I am viewing recovery codes manager
      When I click "Regenerate Codes"
      And I enter incorrect password
      And I attempt to confirm
      Then I should see error "Incorrect password"
      And regeneration should not proceed
      And my existing codes should remain valid
      And I should be able to retry

    @validation @regeneration
    Scenario: Regeneration requires non-empty password
      Given I click "Regenerate Codes"
      When I leave password field empty
      Then the confirm button should be disabled
      Or I should see validation error "Password is required"

  Rule: All old recovery codes invalidated upon regeneration

    @validation @regeneration
    Scenario: Old codes cannot be used after regeneration
      Given I have memorized an old recovery code "ABC123XYZ"
      When I regenerate my recovery codes successfully
      And I try to use the old code "ABC123XYZ" for login
      Then the old code should be rejected
      And I should see error "Invalid recovery code"
      And only new codes should be valid

    @integration @regeneration
    Scenario: Regeneration publishes domain event
      When I successfully regenerate recovery codes
      Then a RecoveryCodesRegenerated action is logged
      And the event should include user ID and code count
      And the event should include timestamp

  # ========================================
  # Regeneration Flow and UX
  # ========================================

  @happy-path @regeneration-flow
  Scenario: Complete regeneration flow with save confirmation
    Given I initiate recovery code regeneration
    When I enter my password and confirm
    Then new codes should be displayed
    And I should see clear instruction to save codes
    And I should see checkbox "I have saved my new recovery codes"
    And the checkbox should be required before closing
    When I save the codes using download
    And I check the confirmation checkbox
    Then I should be able to close the dialog
    And I should return to security settings

  @ux @regeneration-flow
  Scenario: Warning before closing without saving regenerated codes
    Given I have regenerated codes and viewing them
    And I have not saved the codes
    And I have not confirmed saving
    When I attempt to close the dialog
    Then I should see warning "Are you sure? New codes won't be shown again."
    And I should have option to go back
    And I should have option to proceed with close

  @ux @regeneration-flow
  Scenario: Regeneration shows clear status messages
    When I initiate regeneration with correct password
    Then I should see "Generating new codes..." loading state
    When generation completes
    Then I should see "New recovery codes generated successfully"
    And I should see "Old codes have been invalidated"
    And messaging should be clear and reassuring

  # ========================================
  # Error Handling
  # ========================================

  @error-handling
  Scenario: Handle network error during regeneration
    Given I provide correct password for regeneration
    When a network error occurs during generation
    Then I should see error "Connection error. Please try again."
    And my existing codes should remain valid
    And I should remain on the regeneration dialog
    And I should be able to retry

  @error-handling
  Scenario: Handle server error during code generation
    Given I provide correct password
    When server fails to generate codes
    Then I should see error "Failed to generate codes. Please try again."
    And my existing codes should remain valid
    And I should not be in a broken state
    And I should be able to retry

  @error-handling
  Scenario: Handle download failure gracefully
    Given I am viewing recovery codes
    When I click "Download Codes"
    And the download fails
    Then I should see error message
    And I should still be able to copy codes
    And I should still be able to print codes
    And codes should still be visible

  # ========================================
  # Authorization and Access Control
  # ========================================

  @authorization
  Scenario: Recovery codes manager requires 2FA enabled
    Given I do not have 2FA enabled
    When I attempt to access recovery codes manager
    Then I should not see the option
    Or I should see error "2FA must be enabled to manage recovery codes"
    And I should be redirected appropriately

  @authorization
  Scenario: Expired session during regeneration
    Given I initiate recovery code regeneration
    And my session expires during the process
    When I submit my password
    Then I should see error "Session expired. Please login again."
    And I should be redirected to login
    And my existing codes should remain valid

  # ========================================
  # Edge Cases
  # ========================================

  @edge-case
  Scenario: View codes immediately after 2FA setup
    Given I just completed 2FA setup
    And I received initial recovery codes
    When I open recovery codes manager
    Then I should see all 8-10 codes are unused
    And I should not see regeneration warning
    And all functionality should work normally

  @edge-case
  Scenario: Regenerate codes multiple times in succession
    Given I regenerate recovery codes
    And I immediately regenerate again
    When I provide my password
    Then the second regeneration should succeed
    And only the most recent codes should be valid
    And all previous codes should be invalidated

  @edge-case
  Scenario: Handle concurrent regeneration attempts
    Given I initiate regeneration in one browser
    And simultaneously initiate in another browser
    When both complete successfully
    Then only the last successful regeneration should be valid
    And there should be no duplicate codes
    And system should handle race condition gracefully

  @edge-case
  Scenario: Recovery codes with special rate limiting
    Given I have regenerated codes 3 times in 10 minutes
    When I attempt to regenerate again
    Then I might see rate limit warning
    Or I should see allow but log the activity
    And this should be for security monitoring

  # ========================================
  # Integration with Login Flow
  # ========================================

  @integration @cross-feature
  Scenario: Recovery code used during login decrements count
    Given I have 5 unused recovery codes
    When I use one code to login
    And I then open recovery codes manager
    Then I should see "You have 4 unused recovery codes remaining"
    And the used code should not be displayed
    And the used code should be marked as used in database

  # ========================================
  # Security Considerations
  # ========================================

  @security
  Scenario: Recovery codes stored securely
    When recovery codes are generated
    Then codes should be hashed before storage
    And plaintext codes should never be stored
    And codes should only be displayed once at generation
    And retrieval should only show count, not actual codes

  @security @ux
  Scenario: Clear security warnings displayed
    When I view recovery codes manager
    Then I should see warning about single-use codes
    And I should see instruction to store securely
    And I should see recommendation for offline storage
    And warnings should be prominent but not alarming

  # ========================================
  # Performance and UX
  # ========================================

  @performance
  Scenario: Recovery codes manager loads quickly
    When I open recovery codes manager
    Then the dialog should open within 300ms
    And code count should display immediately
    And the interface should be responsive

  @ux @responsive
  Scenario: Recovery codes manager responsive on mobile
    Given I am managing recovery codes on mobile
    Then the dialog should fit viewport
    And codes should be readable
    And buttons should be touch-friendly
    And download/copy/print options should all work
    And password input should open keyboard appropriately
