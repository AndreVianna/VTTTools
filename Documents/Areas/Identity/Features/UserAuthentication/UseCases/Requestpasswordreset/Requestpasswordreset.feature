# Generated: 2025-01-15
# Use Case: Request Password Reset

@use-case @authentication @password-reset
Feature: Request Password Reset
  As a VTT Tools user who forgot my password
  I want to request a password reset email
  So that I can regain access to my account

  Background:
    Given I am on the password reset request page
    And the password reset service is available
    And I am not currently authenticated

  Rule: Email must be in valid format

    @validation
    Scenario: Accept valid email format
      Given I enter email "user@example.com"
      When I submit the reset request form
      Then my email should pass format validation
      And the request should be processed

    @validation @error-handling
    Scenario: Reject invalid email format
      Given I enter email "not-a-valid-email"
      When I attempt to submit the reset request form
      Then I should see error "Invalid email address"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject empty email field
      Given I leave the email field empty
      When I attempt to submit the reset request form
      Then I should see error "Email is required"
      And my form is not submitted

  Rule: System never reveals whether email exists (security)

    @security @happy-path
    Scenario: Show success for existing email without revealing existence
      Given an account exists with email "existing@example.com"
      When I enter email "existing@example.com"
      And I submit the reset request form
      Then I should receive success
      And I should see success message "If that email exists, reset instructions have been sent"
      And a reset email should be sent to "existing@example.com"
      And the PasswordResetRequested action is logged

    @security
    Scenario: Show same success message for non-existent email
      Given no account exists with email "nonexistent@example.com"
      When I enter email "nonexistent@example.com"
      And I submit the reset request form
      Then I should receive success
      And I should see success message "If that email exists, reset instructions have been sent"
      And no email should actually be sent
      And no error should indicate the email doesn't exist

  Rule: Reset tokens expire after 24 hours

    @security
    Scenario: Generate token with 24-hour expiration
      Given an account exists with email "user@example.com"
      When I successfully request password reset
      Then a reset I receive an authentication token
      And my token be cryptographically secure with 32+ bytes entropy
      And my token have expiration timestamp 24 hours from now
      And my token be URL-safe

  Rule: Previous reset tokens are invalidated when new request made

    @security
    Scenario: Invalidate existing token when new request made
      Given I previously requested password reset
      And I have an active reset token
      When I request password reset again for the same email
      Then the previous token should be invalidated
      And a new I receive an authentication token
      And only the new token should be valid

  Rule: Rate limiting prevents spam and abuse

    @security @error-handling
    Scenario: Block excessive reset requests from same email
      Given I have requested password reset 3 times in the last hour
      When I attempt to request another reset for the same email
      Then I should receive 429 status
      And I should see error "Too many reset requests. Please try again later."
      And no email should be sent

    @security
    Scenario: Allow reset request after rate limit expires
      Given I was rate-limited 1 hour ago
      When I request password reset now
      Then the request should be processed normally
      And a reset email should be sent

  @happy-path @integration
  Scenario: Complete password reset request flow
    Given an account exists with email "gamemaster@example.com"
    And I enter email "gamemaster@example.com"
    When I submit the reset request form
    Then a secure reset I receive an authentication token
    And the token is saved with user association
    And an email should be sent to "gamemaster@example.com"
    And my email contain reset link "/login?email=gamemaster@example.com&token={token}"
    And my email mention 24-hour expiration
    And I should see the success screen
    And the success screen should display the email address I entered

  @ui @success-screen
  Scenario: Display success screen after submission
    Given I successfully submit reset request
    When the request completes
    Then I should see a success screen with email icon
    And I should see message "Reset instructions sent"
    And I should see my entered email address
    And I should see note about checking spam folder
    And I should see note about 24-hour link expiration
    And I should see "Back to Login" link

  @loading-state @ui
  Scenario: Display loading state during request
    Given I have entered a valid email
    When I submit the reset request form
    And my request is in progress
    Then the submit button shows a loading spinner
    And the submit button text should change to "Sending..."
    And all form inputs are disabled
    And I should not be able to submit again

  @error-handling
  Scenario: Handle email service failure gracefully
    Given an account exists with email "user@example.com"
    When I request password reset
    And the email service fails to send the email
    Then the error is logged server-side
    But the success message should still be shown to me
    And I should not be informed of the email failure
    And the failure should be tracked for monitoring

  @error-handling
  Scenario: Handle network connection error
    Given I have entered a valid email
    When I submit the reset request form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my email input should be preserved

  @error-handling
  Scenario: Handle server error
    Given I have entered a valid email
    When I submit the reset request form
    And the password reset service returns 500 error
    Then I should see error "Service error. Please try again later."
    And the form is enabled again

  @navigation @ui
  Scenario: Return to login from reset request page
    Given I am on the password reset request page
    When I click "Back to Login" link
    Then I should be returned to the login page
    And the login form should be displayed

  @navigation @ui
  Scenario: Return to login from success screen
    Given I am on the success screen after requesting reset
    When I click "Back to Login" link
    Then I should be returned to the login page

  @email-content @integration
  Scenario: Password reset email contains required information
    Given I successfully request password reset
    When the reset email is generated
    Then the email subject should be "VTT Tools Password Reset"
    And my email include greeting with username or "VTT Tools User"
    And my email explain someone requested password reset
    And my email include the reset link button
    And my email mention 24-hour expiration
    And my email include "Didn't request this?" message
    And my email include support contact information

  @security
  Scenario: Reset link uses HTTPS protocol
    Given I successfully request password reset
    When the reset link is generated
    Then the link should use HTTPS protocol
    And the link should point to the correct domain
    And my token be included as a query parameter

  @edge-case
  Scenario: Handle concurrent reset requests
    Given I submit a password reset request
    And the request is in progress
    When I attempt to submit another request
    Then the second submission is prevented
    And only one request should be processed

  @performance
  Scenario: Reset request completes quickly
    Given I submit a valid reset request
    When the request is processed
    Then I receive response with in less than 500ms
    And my email be sent asynchronously
    And the success screen should display immediately

  @accessibility
  Scenario: Reset request form is accessible
    Given I am using a screen reader
    When I navigate the reset request form
    Then the email field should be properly labeled
    And instructions should be clear and announced
    And the submit button should have descriptive text
    And the success message should be announced when displayed
