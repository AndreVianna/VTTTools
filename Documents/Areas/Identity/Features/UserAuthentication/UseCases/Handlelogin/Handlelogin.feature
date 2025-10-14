# Generated: 2025-01-15
# Use Case: Handle Login

@use-case @authentication @security
Feature: Handle Login
  As a registered VTT Tools user
  I want to log in with my email and password
  So that I can access my account and personalized features

  Background:
    Given I am on the login page
    
    And I am not currently authenticated

  Rule: Email must be in valid format

    @validation
    Scenario: Accept valid email format
      Given I enter email "gamemaster@example.com"
      When I submit the login form
      Then my email should pass client-side validation
      And my form is submitted

    @validation @error-handling
    Scenario: Reject invalid email format
      Given I enter email "not-an-email"
      When I attempt to submit the login form
      Then I should see error "Invalid email address"
      And my form is not submitted
      And the error appears below the email field

  Rule: Password is required for login

    @validation @error-handling
    Scenario: Reject empty password field
      Given I enter valid email "user@example.com"
      And I leave the password field empty
      When I attempt to submit the login form
      Then I should see error "Password is required"
      And my form is not submitted
      And the error appears below the password field

  # NOTE: Email case-insensitivity is backend behavior - tested in backend unit tests

    @happy-path
    Scenario: Login with case-insensitive email
      Given an account exists with email "user@example.com"
      And I enter email "USER@EXAMPLE.COM"
      And I enter the correct password
      When I submit the login form
      Then I should be authenticated successfully
      And I should be redirected to the dashboard

  Rule: Password comparison is case-sensitive

    @security @error-handling
    Scenario: Reject password with incorrect case
      Given an account exists with password "SecurePass123"
      And I enter the correct email
      And I enter password "securepass123"
      When I submit the login form
      Then I should see error "Invalid email or password"
      And I should remain on the login page

  @happy-path @critical
  Scenario: Successful login with valid credentials
    Given an account exists with email "gamemaster@example.com" and password "SecurePass123"
    And I enter email "gamemaster@example.com"
    And I enter password "SecurePass123"
    When I submit the login form
    Then I should be authenticated successfully
    And a session cookie should be set by the server
    And I should be redirected to the dashboard
    And I should see my user information in the header
    And my auth state should be stored in Redux

  @2fa @integration
  Scenario: Login with 2FA enabled account triggers verification
    Given an account exists with 2FA enabled
    And I enter valid credentials
    When I submit the login form
    Then my password is validated successfully
    And I receive response with requiresTwoFactor: true
    And I do not receive a full authentication token yet
    And the LoginPage mode switches to "two-factor"
    And I should see the two-factor verification form

  @error-handling
  Scenario: Handle incorrect password
    Given an account exists with email "user@example.com"
    And I enter email "user@example.com"
    And I enter incorrect password "WrongPassword"
    When I submit the login form
    Then I should see error "Invalid email or password"
    And I should remain on the login page
    And the password field is cleared
    And login should be prevented

  @error-handling
  Scenario: Handle non-existent email
    Given no account exists with email "nonexistent@example.com"
    And I enter email "nonexistent@example.com"
    And I enter password "SomePassword123"
    When I submit the login form
    Then I should see error "Invalid email or password"
    And I should not be able to determine if the email exists
    And login should be prevented

  @security @error-handling
  Scenario: Handle account lockout after failed attempts
    Given an account exists with email "user@example.com"
    And the account is locked due to failed login attempts
    When I submit valid credentials for that account
    Then I should see error "Account locked. Please contact support."
    And I should not be authenticated
    And login should be prevented

  @error-handling
  Scenario: Handle suspended account
    Given an account exists with email "suspended@example.com"
    And my account status is "suspended"
    When I submit valid credentials for that account
    Then I should see error "Account suspended. Please contact support."
    And I should not be authenticated
    And login should be prevented

  @validation @error-handling
  Scenario: Handle unconfirmed email address
    Given an account exists with email "unconfirmed@example.com"
    And the email is not confirmed
    And email confirmation is required email confirmation for login
    When I submit valid credentials for that account
    Then I should see error "Please confirm your email address"
    And I should see a link to resend confirmation email
    And login should be prevented

  @loading-state @ui
  Scenario: Display loading state during authentication
    Given I have entered valid credentials
    When I submit the login form
    And my request is in progress
    Then the submit button shows a loading spinner
    And all form inputs are disabled
    And I should not be able to submit the form again

  @error-handling
  Scenario: Handle network connection error
    Given I have entered valid credentials
    When I submit the login form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And I should be able to retry

  @error-handling
  Scenario: Handle server error
    Given I have entered valid credentials
    When I submit the login form
    And the server returns an error
    Then I should see error "Login failed. Please try again later."
    And the form is enabled again
    And I should be able to retry

  # NOTE: Password hashing and verification is backend logic - tested in backend unit tests

  @integration @redux
  Scenario: Login updates Redux authentication state
    Given I successfully log in
    When the authentication completes
    Then Redux authSlice.isAuthenticated should be true
    And Redux authSlice.user should contain my user data
    And my authentication status should be available app-wide
    And protected routes should become accessible

  @edge-case
  Scenario: Handle concurrent login attempts
    Given I submit the login form
    And the request is in progress
    When I attempt to submit the form again
    Then the second submission is prevented
    And only one authentication request should be sent

  @accessibility
  Scenario: Login form is accessible to screen readers
    Given I am using a screen reader
    When I navigate to the login form
    Then all form fields have proper labels
    And error messages are announced
    And the submit button state is communicated
