# Generated: 2025-01-15
# Use Case: Confirm Password Reset

@use-case @authentication @password-reset
Feature: Confirm Password Reset
  As a VTT Tools user who requested password reset
  I want to set a new password using the email reset link
  So that I can regain access to my account with a new password

  Background:
    Given I received a password reset email
    And I clicked the reset link with valid email and token parameters
    And I am on the password reset confirmation page
    And the password reset service is available

  Rule: Reset token must be valid and not expired

    @happy-path
    Scenario: Successfully reset password with valid token
      Given the reset token was created 2 hours ago
      And the token has not been used
      When I enter new password "NewSecurePass123"
      And I enter matching confirmation "NewSecurePass123"
      And I submit the password reset form
      Then the token is validated
      And my password is updated with secure hash
      And my token be marked as used
      And the PasswordResetConfirmed action is logged
      And I should see success message "Password updated successfully"
      And I should be redirected to login page after 2 seconds

    @error-handling
    Scenario: Reject expired reset token
      Given the reset token was created 25 hours ago
      When I enter valid password data
      And I submit the password reset form
      Then I should receive 401 status
      And I should see error "Reset link has expired. Please request a new one."
      And I should see a link to request new reset

    @error-handling
    Scenario: Reject already-used reset token
      Given the reset token has already been used
      When I enter valid password data
      And I submit the password reset form
      Then I should receive 401 status
      And I should see error "This reset link has already been used"
      And I should see a link to request new reset

  Rule: Email parameter must match token's associated user

    @security @error-handling
    Scenario: Reject mismatched email and token
      Given the reset link has email "user1@example.com"
      But the token belongs to "user2@example.com"
      When I submit the password reset form
      Then I should receive 400 status
      And I should see error "Invalid reset request"
      And my password should not be updated

  Rule: New password must meet strength requirements

    @validation
    Scenario: Accept password meeting minimum requirements
      Given I enter new password "SecurePass123"
      And the password is at least 8 characters
      And I enter matching confirmation
      When I submit the form
      Then my password should pass validation
      And my password is updated

    @validation @error-handling
    Scenario: Reject password below minimum length
      Given I enter new password "Short1"
      When I attempt to submit the form
      Then I should see error "Password must be at least 8 characters"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject empty password field
      Given I leave the password field empty
      When I attempt to submit the form
      Then I should see error "Password is required"
      And my form is not submitted

  Rule: Password confirmation must match new password

    @validation @error-handling
    Scenario: Reject mismatched password confirmation
      Given I enter new password "SecurePass123"
      And I enter confirmation password "DifferentPass456"
      When I attempt to submit the form
      Then I should see error "Passwords do not match"
      And my form is not submitted
      And the error appears below the confirmation field

  Rule: Missing URL parameters render form invalid

    @error-handling
    Scenario: Handle missing token parameter
      Given I navigate to reset page without token parameter
      When the page loads
      Then I should see error "Invalid reset link"
      And the form should not be displayed
      And I should see a link to request new reset

    @error-handling
    Scenario: Handle missing email parameter
      Given I navigate to reset page without email parameter
      When the page loads
      Then I should see error "Invalid reset link"
      And the form should not be displayed

  @security
  Scenario: Password is securely hashed before storage
    Given I submit valid password reset with password "NewPassword123"
    When my password is updated
    Then my password be hashed using bcrypt or argon2
    And the plain text password should never be stored
    And the hash should be irreversible

  @security
  Scenario: All user sessions terminated after password reset
    Given I have active sessions on multiple devices
    When I successfully reset my password
    Then all existing sessions should be terminated
    And all session tokens should be invalidated
    And the user must log in again on all devices

  @security
  Scenario: All other reset tokens invalidated after successful reset
    Given I have multiple active reset tokens
    When I successfully reset password using one token
    Then all other reset tokens for my account should be invalidated
    And they should not be usable

  @loading-state @ui
  Scenario: Display loading state during password update
    Given I have entered valid password data
    When I submit the password reset form
    And my request is in progress
    Then the submit button shows a loading spinner
    And all form inputs are disabled
    And I should not be able to submit again

  @ui @password-strength
  Scenario: Display password strength indicator
    Given I am on the password reset confirmation page
    When I type into the password field
    Then I should see a visual strength indicator
    And the indicator should show weak/medium/strong rating
    And the indicator should help me choose a secure password

  @ui @success-flow
  Scenario: Successful reset shows confirmation and auto-redirects
    Given I successfully reset my password
    When the update completes
    Then I should see success alert "Password updated successfully"
    And I should see message "Redirecting to login..."
    And I should be redirected to login page after 2 seconds
    And I should be able to click "Go to Login" to redirect immediately

  @error-handling
  Scenario: Handle network connection error
    Given I have entered valid password data
    When I submit the password reset form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my input data should be preserved

  @error-handling
  Scenario: Handle server error
    Given I have entered valid password data
    When I submit the password reset form
    And the password reset service returns 500 error
    Then I should see error "Password reset failed. Please try again later."
    And the form is enabled again

  @navigation @ui
  Scenario: Return to login before completing reset
    Given I am on the password reset confirmation page
    When I click "Back to Login" link
    Then I should be returned to the login page
    And my reset token should remain valid
    And I should be able to use the reset link again later

  @validation
  Scenario: Real-time password match validation
    Given I have entered new password "SecurePass123"
    And I have entered mismatched confirmation
    And I see "Passwords do not match" error
    When I correct the confirmation to "SecurePass123"
    Then the error message should disappear
    And the confirmation field should show success styling

  @integration
  Scenario: After reset user can log in with new password
    Given I successfully reset my password to "NewPassword123"
    And I am redirected to the login page
    When I enter my email and password "NewPassword123"
    And I submit the login form
    Then my authentication should succeed
    And I should be logged in to my account

  @integration
  Scenario: Old password no longer works after reset
    Given my old password was "OldPassword123"
    And I successfully reset password to "NewPassword123"
    When I attempt to log in with password "OldPassword123"
    Then I should see error "Invalid email or password"
    And my authentication should fail

  @edge-case
  Scenario: Handle concurrent password reset attempts
    Given I submit the password reset form
    And the request is in progress
    When I attempt to submit the form again
    Then the second submission is prevented
    And only one update request should be sent

  @edge-case
  Scenario: Handle token validation with invalid token format
    Given the URL token parameter is malformed "invalid@#$%"
    When the page loads and validates the token
    Then I should see error "Invalid reset link"
    And the form should not be displayed

  @performance
  Scenario: Password reset completes within acceptable time
    Given I submit valid password reset data
    When the request is processed
    Then I receive response with in less than 500ms
    And the password hashing should use appropriate cost factor

  @security @optional
  Scenario: Optionally prevent reuse of recent passwords
    Given the system enforces password history
    And my current password is "CurrentPass123"
    When I attempt to reset to my current password "CurrentPass123"
    Then I should see error "Cannot reuse your current password"
    And my password should not be updated

  @accessibility
  Scenario: Password reset form is accessible
    Given I am using a screen reader
    When I navigate the password reset form
    Then all fields should be properly labeled
    And password strength indicator should be announced
    And validation errors should be announced
    And the submit button state is communicated
