# Generated: 2025-01-15
# Use Case: Confirm Password Reset

@use-case @authentication @password-reset
Feature: Confirm Password Reset
  As a VTT Tools user who requested password reset
  I want to set a new password using the email reset link
  So that I can regain access to my account with a new password

  Background:
    Given an account exists with email "gamemaster@example.com"
    And I navigate to password reset confirmation page with valid token
    And the password reset service is available
    And I am not currently authenticated

  Rule: New password must meet strength requirements

    @validation
    Scenario: Accept password meeting minimum requirements
      Given I enter new password "SecurePass123"
      And I enter matching confirmation "SecurePass123"
      When I submit the password reset form
      Then my password should pass validation
      And my password is updated
      And I should see success message "Password updated successfully"

    @validation @error-handling
    Scenario: Reject password below minimum length
      Given I enter new password "Short1"
      When I attempt to submit the password reset form
      Then I should see error "Password must be at least 6 characters"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject empty password field
      Given I leave the new password field empty
      When I attempt to submit the password reset form
      Then I should see error "Password is required"
      And my form is not submitted

  Rule: Password confirmation must match new password

    @validation @error-handling
    Scenario: Reject mismatched password confirmation
      Given I enter new password "SecurePass123"
      And I enter confirmation password "DifferentPass456"
      When I attempt to submit the password reset form
      Then I should see error "Passwords do not match"
      And my form is not submitted

  Rule: Missing URL parameters render form invalid

    @error-handling
    Scenario: Handle missing token parameter
      Given I navigate to reset page without token parameter
      When the page loads
      Then I should see error "Invalid reset link"
      And the form should not be displayed

    @error-handling
    Scenario: Handle missing email parameter
      Given I navigate to reset page without email parameter
      When the page loads
      Then I should see error "Invalid reset link"
      And the form should not be displayed

  Rule: Navigate back to login

    @navigation @ui
    Scenario: Return to login before completing reset
      Given I am on the password reset confirmation page
      When I click "Back to Login" link
      Then I should be returned to the login page

  Rule: Integration with login flow

    @integration @happy-path
    Scenario: After reset user can log in with new password
      Given I enter new password "NewPassword123"
      And I enter matching confirmation "NewPassword123"
      And I submit the password reset form
      And I should see success message "Password updated successfully"
      When I navigate to the login page
      And I enter my email and password "NewPassword123"
      And I submit the login form
      Then my authentication should succeed

    @integration
    Scenario: Old password no longer works after reset
      Given I enter new password "NewPassword123"
      And I enter matching confirmation "NewPassword123"
      And I submit the password reset form
      And I should see success message "Password updated successfully"
      When I navigate to the login page
      And I attempt to log in with password "OldTestPassword123!"
      Then I should see error "Invalid email or password"

  @security @error-handling @ignore
  Scenario: Reject mismatched email and token
    Given the reset link has email "user1@example.com"
    But the token belongs to "user2@example.com"
    When I submit the password reset form
    Then I should receive 400 status
    And I should see error "Invalid reset request"
    And my password should not be updated
