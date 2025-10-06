# Generated: 2025-01-15
# Use Case: Verify Recovery Code

@use-case @authentication @2fa @recovery @security
Feature: Verify Recovery Code
  As a VTT Tools user with 2FA enabled
  I want to authenticate using a backup recovery code
  So that I can access my account when my authenticator app is unavailable

  Background:
    Given I have completed password authentication successfully
    And I have 2FA enabled on my account
    And I have recovery codes generated for my account
    And I am on the recovery code verification page

  Rule: Recovery codes are single-use only

    @happy-path
    Scenario: Successfully verify unused recovery code
      Given I have an unused recovery code "ABC12DEF34"
      When I enter the recovery code
      And I submit the verification form
      Then the code is validated against stored hashes
      And my authentication should be completed
      And the recovery code should be marked as used
      And the RecoveryCodeUsed action is logged
      And I should be redirected to the dashboard

    @error-handling
    Scenario: Reject already-used recovery code
      Given I have a recovery code "XYZ98WVU76"
      And the code was used in a previous login
      When I enter the code
      And I submit the verification form
      Then I should receive 401 status
      And I should see error "This recovery code has already been used"
      And my authentication should not complete
      And I should remain on the verification page

  Rule: Recovery codes are case-insensitive

    @validation
    Scenario: Accept recovery code in lowercase
      Given I have recovery code "ABC12DEF34"
      When I enter the code as "abc12def34"
      And I submit the verification form
      Then the code should be normalized to uppercase for comparison
      And my authentication should be completed

    @validation
    Scenario: Accept recovery code in mixed case
      Given I have recovery code "ABC12DEF34"
      When I enter the code as "AbC12dEf34"
      And I submit the verification form
      Then the code should be normalized for comparison
      And my authentication should be completed

  Rule: Recovery codes must match expected format

    @validation @error-handling
    Scenario: Reject empty recovery code
      Given I leave the recovery code field empty
      When I attempt to submit the verification form
      Then I should see error "Recovery code is required"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject invalid recovery code format
      Given I enter code with invalid characters "ABC@#$%"
      When I attempt to submit the verification form
      Then I should see error "Invalid recovery code format"
      And my form is not submitted

  Rule: System warns when recovery codes are running low

    @warning @ux
    Scenario: Display warning when only 2 codes remain
      Given I have 3 unused recovery codes
      When I successfully verify one code
      Then I should have 2 codes remaining
      And I should see warning "Only 2 recovery codes remaining. Generate new codes soon."
      And I should be redirected to the dashboard

    @warning @ux
    Scenario: Display urgent warning when using last code
      Given I have only 1 unused recovery code
      When I successfully verify that code
      Then I should have 0 codes remaining
      And I should see urgent warning "This was your last recovery code. Generate new codes immediately."
      And I should be prompted to regenerate codes
      And I should be redirected to security settings

  Rule: Rate limiting prevents brute force attacks on recovery codes

    @security @error-handling
    Scenario: Block verification after maximum failed attempts
      Given I have made 5 failed recovery code attempts
      When I attempt to verify another code
      Then I should receive 429 status
      And I should see error "Too many attempts. Try again in 5 minutes."
      And the submit button is disabled

    @security
    Scenario: Reset rate limit after successful verification
      Given I was rate-limited for failed attempts
      And 5 minutes have passed
      When I submit a valid recovery code
      Then the rate limit should be cleared
      And my authentication should complete

  @error-handling
  Scenario: Reject invalid recovery code
    Given I enter code "INVALID999"
    And no recovery code matches that value
    When I submit the verification form
    Then I should receive 401 status
    And I should see error "Invalid recovery code"
    And I should remain on the verification page

  @error-handling
  Scenario: Handle missing pending authentication state
    Given my pending authentication has expired
    When I submit a valid recovery code
    Then I should receive 400 status
    And I should see error "Session expired. Please log in again."
    And I should be redirected to the login page

  @error-handling
  Scenario: Handle account without 2FA enabled
    Given my account does not have 2FA enabled
    And I somehow reach the recovery code page
    When I submit a recovery code
    Then I should receive 400 status
    And I should see error "Two-factor authentication is not enabled."

  @loading-state @ui
  Scenario: Display loading state during verification
    Given I have entered a valid code format
    When I submit the verification form
    And my request is in progress
    Then the submit button shows a loading spinner
    And all form inputs are disabled
    And I should not be able to submit again

  @navigation @ui
  Scenario: Return to authenticator code mode
    Given I am on the recovery code page
    When I click "Back to authenticator code" link
    Then the LoginPage mode should change to "two-factor"
    And the TwoFactorVerificationForm should be displayed
    And my pending authentication state should be preserved

  @navigation @ui
  Scenario: Return to login from recovery code page
    Given I am on the recovery code page
    When I click "Back to Login" link
    Then I should be returned to the login page
    And my pending authentication state should be cleared

  @ui @formatting
  Scenario: Auto-format recovery code input
    Given I am on the recovery code form
    When I type a recovery code
    Then the input should be automatically converted to uppercase
    And spaces should be trimmed
    And the formatted code should be submitted

  @security
  Scenario: Recovery codes stored as secure hashes
    Given recovery codes are generated for my account
    Then each code should be hashed using SHA-256 or bcrypt
    And the plain text codes should never be stored
    And only I should have access to the plain text codes

  @integration
  Scenario: Verification updates authentication context
    Given I successfully verify a recovery code
    When the verification completes
    Then the Auth Context is updated with my user data
    And I should have a valid authentication token
    And protected routes should become accessible

  @integration
  Scenario: Recovery code usage updates remaining count
    Given I have 5 unused recovery codes
    When I successfully verify one code
    Then the database should mark that code as used
    And my remaining codes count should be 4
    And the used timestamp should be recorded

  @error-handling
  Scenario: Handle network connection error
    Given I have entered a valid recovery code
    When I submit the verification form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my input should be preserved

  @performance
  Scenario: Verification completes quickly
    Given I submit a valid recovery code
    When the verification request is processed
    Then I receive response with in less than 300ms
    And the hash comparison should be efficient

  @edge-case
  Scenario: Handle concurrent recovery code usage attempts
    Given I submit a recovery code
    And the request is in progress
    When I attempt to submit the same code again
    Then the second submission is prevented
    And only one verification request should be sent

  @accessibility
  Scenario: Recovery code form is accessible
    Given I am using a screen reader
    When I navigate the recovery code form
    Then the input field should be properly labeled
    And instructions should be clear and announced
    And the warning message should be accessible
    And error messages are announced immediately
