# Generated: 2025-01-15
# Use Case: Request Password Reset

@use-case @authentication @password-reset
Feature: Request Password Reset
  As a VTT Tools user who forgot my password
  I want to request a password reset email
  So that I can regain access to my account

  Background:
    Given an account exists with email "gamemaster@example.com"
    And I am on the password reset request page
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
      Given I enter email "gamemaster@example.com"
      And I submit the reset request form
      Then I should receive success
      And I should see success message "If that email exists, reset instructions have been sent"

    @security
    Scenario: Show same success message for non-existent email
      Given I enter email "nonexistent@example.com"
      And I submit the reset request form
      Then I should receive success
      And I should see success message "If that email exists, reset instructions have been sent"

  Rule: Rate limiting prevents spam and abuse

    @security @error-handling @ignore
    Scenario: Block excessive reset requests from same email
      Given I have requested password reset 3 times in the 5 minutes
      When I attempt to request another reset for the same email
      Then I should receive 429 status
      And I should see error "Too many reset requests. Please try again later."
      And no email should be sent

    @security @ignore
    Scenario: Allow reset request after rate limit expires
      Given I was rate-limited 5 minutes ago
      When I request password reset now
      Then the request should be processed normally
      And a reset email should be sent

  Rule: Navigate back to login from reset request page and success screen

    @navigation @ui
    Scenario: Return to login from reset request page
      Given I click "Back to Login" link
      Then I should be returned to the login page
      And the login form should be displayed

  @loading-state @ui @ignore
  Scenario: Display loading state during request
    Given I enter email "nonexistent@example.com"
    And I submit the reset request form
    And my request is in progress
    Then the submit button shows a loading spinner
    And the submit button text should change to "Sending..."
    And all form inputs are disabled
    And I should not be able to submit again

  @error-handling @ignore
  Scenario: Handle network connection error
    Given I enter email "nonexistent@example.com"
    And I submit the reset request form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my email input should be preserved

  @error-handling @ignore
  Scenario: Handle server error
    Given I enter email "nonexistent@example.com"
    And I submit the reset request form
    And the password reset service returns 500 error
    Then I should see error "Service error. Please try again later."
    And the form is enabled again
