# Generated: 2025-01-15
# Use Case: Verify Two Factor Code

@use-case @authentication @2fa @security
Feature: Verify Two Factor Code
  As a VTT Tools user with 2FA enabled
  I want to verify my identity using an authenticator app code
  So that I can complete login with enhanced security

  Background:
    Given I have completed password authentication successfully
    And I have 2FA enabled on my account
    And I am on the two-factor verification page
    And my authenticator app is configured with my TOTP secret

  Rule: Verification code must be exactly 6 digits

    @validation
    Scenario: Accept valid 6-digit code format
      Given I enter code "123456"
      When I submit the verification form
      Then the code should pass format validation
      And the request should be sent to the server

    @validation @error-handling
    Scenario: Reject code with fewer than 6 digits
      Given I enter code "12345"
      When I attempt to submit the verification form
      Then I should see error "Verification code must be 6 digits"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject code with non-numeric characters
      Given I enter code "12a4b6"
      When I attempt to submit the verification form
      Then I should see error "Verification code must be 6 digits"
      And my form is not submitted

  Rule: TOTP codes are valid for 30-second time windows with tolerance

    @happy-path
    Scenario: Accept valid current TOTP code
      Given the current time is 12:00:00
      And I generate a valid TOTP code for this time window
      When I submit the code within the 30-second window
      Then the code passes validation
      And my authentication should be completed
      And the TwoFactorVerified action is logged
      And I should be redirected to the dashboard

    @security
    Scenario: Accept code from previous time window (tolerance)
      Given the current time is 12:00:35
      And I generate a TOTP code from the previous 30-second window
      When I submit the code
      Then the code should be accepted due to ±30 second tolerance
      And my authentication should be completed

    @security
    Scenario: Accept code from next time window (tolerance)
      Given the current time is 12:00:25
      And I generate a TOTP code for the next 30-second window
      When I submit the code
      Then the code should be accepted due to ±30 second tolerance
      And my authentication should be completed

    @error-handling
    Scenario: Reject expired code outside tolerance window
      Given I generated a TOTP code 2 minutes ago
      When I submit that expired code
      Then I should receive 401 status
      And I should see error "Code has expired. Please enter a new code from your app."
      And I should remain on the verification page

  Rule: Invalid codes are rejected with appropriate error messages

    @error-handling
    Scenario: Reject incorrect 6-digit code
      Given I enter invalid code "999999"
      When I submit the verification form
      Then I should receive 401 status
      And I should see error "Invalid verification code. Please try again."
      And I should remain on the verification page
      And the code input should be cleared

  Rule: Rate limiting prevents brute force attacks

    @security @error-handling
    Scenario: Block verification after maximum failed attempts
      Given I have made 5 failed verification attempts
      When I attempt to verify a code again
      Then I should receive 429 status
      And I should see error "Too many attempts. Please try again in 5 minutes."
      And the submit button is disabled
      And I should see remaining time countdown

    @security
    Scenario: Allow verification after rate limit period expires
      Given I was rate-limited 5 minutes ago
      When I submit a valid code
      Then the rate limit should be reset
      And my code should be verified successfully
      And my authentication should complete

  Rule: Remember device option creates trusted device token

    @happy-path @device-trust
    Scenario: Create trusted device when remember option selected
      Given I check the "Remember this device for 30 days" checkbox
      And I enter a valid verification code
      When I submit the verification form
      Then my code should be verified
      And a trusted device token should be created
      And my token be valid for 30 days
      And the response should include deviceTrusted: true
      And I should not need 2FA on this device for 30 days

    @device-trust
    Scenario: Skip trusted device creation when option not selected
      Given I leave the "Remember this device" checkbox unchecked
      And I enter a valid verification code
      When I submit the verification form
      Then my code should be verified
      And no trusted device token should be created
      And the response should include deviceTrusted: false
      And I will need 2FA on my next login from this device

  @error-handling
  Scenario: Handle missing pending authentication state
    Given my pending authentication has expired or is missing
    When I submit a valid verification code
    Then I should receive 400 status
    And I should see error "Session expired. Please log in again."
    And I should be redirected to the login page

  @error-handling
  Scenario: Handle 2FA not enabled on account
    Given my account does not have 2FA enabled
    And I somehow reach the 2FA verification page
    When I submit a code
    Then I should receive 400 status
    And I should see error "Two-factor authentication is not enabled."
    And I should be redirected to the login page

  @ui @formatting
  Scenario: Auto-format code input for readability
    Given I am on the verification form
    When I type "123456"
    Then the input should display as "123 456"
    And the space should be for visual clarity only
    And the submitted value should be "123456"

  @loading-state @ui
  Scenario: Display loading state during verification
    Given I have entered a valid code format
    When I submit the verification form
    And my request is in progress
    Then the submit button shows a loading spinner
    And all form inputs are disabled
    And I should not be able to submit again

  @navigation @ui
  Scenario: Switch to recovery code mode
    Given I cannot access my authenticator app
    When I click "Use a recovery code instead" link
    Then the LoginPage mode should change to "recovery-code"
    And the RecoveryCodeForm should be displayed
    And my pending authentication state should be preserved

  @navigation @ui
  Scenario: Return to login from verification page
    Given I am on the two-factor verification page
    When I click "Back to Login" link
    Then I should be returned to the login page
    And my pending authentication state should be cleared
    And I should see the login form

  @error-handling
  Scenario: Handle network connection error
    Given I have entered a valid code
    When I submit the verification form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my code input should be preserved

  @integration
  Scenario: Verification completes authentication and updates context
    Given I successfully verify my code
    When the verification completes
    Then the Auth Context is updated with my user data
    And I should have a valid authentication token
    And protected routes should become accessible
    And my user information should appear in the header

  @security @replay-prevention
  Scenario: Prevent code reuse within time window
    Given I successfully verified code "123456"
    And the same time window is still active
    When I attempt to verify the same code "123456" again
    Then the code should be rejected
    And I should see error "Invalid verification code"

  @edge-case
  Scenario: Handle time synchronization issues
    Given my device clock is 5 minutes ahead of server time
    When I generate and submit a TOTP code
    Then the server should account for reasonable time drift
    And my code should still be verified if within extended tolerance

  @performance
  Scenario: Verification completes quickly
    Given I submit a valid code
    When the verification request is processed
    Then I receive response with in less than 300ms
    And the TOTP validation should be efficient

  @accessibility
  Scenario: Verification form is accessible
    Given I am using a screen reader
    When I navigate the verification form
    Then the code input should be properly labeled
    And instructions should be clear and announced
    And the "Remember device" checkbox should be accessible
    And error messages are announced
