# Generated: 2025-01-15
# Use Case: Handle Registration

@use-case @authentication @account-creation
Feature: Handle Registration
  As a new VTT Tools user
  I want to create an account with email, username, and password
  So that I can start using the platform

  Background:
    Given I am on the registration page
    And the registration service is available
    And I am not currently authenticated

  Rule: Email must be in valid format and unique

    @validation
    Scenario: Accept valid unique email
      Given no account exists with email "newuser@example.com"
      And I enter email "newuser@example.com"
      And I provide other valid registration data
      When I submit the registration form
      Then my email should pass validation
      And my account should be created

    @validation @error-handling
    Scenario: Reject invalid email format
      Given I enter email "not-a-valid-email"
      When I attempt to submit the registration form
      Then I should see error "Invalid email address"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject duplicate email
      Given an account already exists with email "existing@example.com"
      And I enter email "existing@example.com"
      And I provide other valid registration data
      When I submit the registration form
      Then I should receive 409 status
      And I should see error "Email address already registered"
      And my account should not be created

  Rule: Username must be 3-50 characters with allowed characters only

    @validation
    Scenario: Accept valid username
      Given I enter username "GameMaster_2024"
      And I provide other valid registration data
      When I submit the registration form
      Then the username should pass validation
      And my account should be created

    @validation @error-handling
    Scenario: Reject username that is too short
      Given I enter username "ab"
      When I attempt to submit the registration form
      Then I should see error "Username must be at least 3 characters"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject username with invalid characters
      Given I enter username "user@#$%"
      When I attempt to submit the registration form
      Then I should see error "Username can only contain letters, numbers, underscores, and hyphens"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject duplicate username
      Given an account already exists with username "GameMaster"
      And I enter username "GameMaster"
      And I provide other valid registration data
      When I submit the registration form
      Then I should receive 409 status
      And I should see error "Username already taken"
      And my account should not be created

  Rule: Password must be at least 6 characters

    @validation
    Scenario: Accept password meeting minimum length
      Given I enter password "Pass123"
      And I enter matching confirmation password "Pass123"
      And I provide other valid registration data
      When I submit the registration form
      Then my password should pass validation
      And my account should be created with hashed password

    @validation @error-handling
    Scenario: Reject password below minimum length
      Given I enter password "abc12"
      When I attempt to submit the registration form
      Then I should see error "Password must be at least 6 characters"
      And my form is not submitted

  Rule: Password confirmation must match password

    @validation @error-handling
    Scenario: Reject mismatched passwords
      Given I enter password "SecurePass123"
      And I enter confirmation password "DifferentPass456"
      When I attempt to submit the registration form
      Then I should see error "Passwords do not match"
      And my form is not submitted
      And the error appears below the confirm password field

  @happy-path
  Scenario: Successful registration with all valid data
    Given I enter unique email "newgm@example.com"
    And I enter valid username "NewGameMaster"
    And I enter password "SecurePassword123"
    And I enter matching confirmation password "SecurePassword123"
    When I submit the registration form
    Then my account is created in the system
    And my password is securely hashed
    And the default "User" role is assigned
    And I should be automatically logged in
    And my authentication token is stored
    And I should be redirected to the dashboard

  @integration @email
  Scenario: Registration triggers verification email
    Given I successfully register with email "verify@example.com"
    When my account is created
    Then I receive a verification email at "verify@example.com"
    And my email contains a verification link
    And my account is marked as "email not confirmed"

  @error-handling
  Scenario: Handle email service failure gracefully
    Given I submit valid registration data
    When the email service fails to send verification email
    Then my account should still be created
    And I should be logged in successfully
    And the email failure should be logged server-side
    And I should see a notification about checking spam folder

  @security
  Scenario: Password is hashed before storage
    Given I register with password "MyPlainTextPassword"
    When my account is created
    Then my password is hashed using bcrypt or argon2
    And the plain text password is never stored
    And my password hash is irreversible

  @validation
  Scenario: Email addresses are normalized to lowercase
    Given I enter email "NewUser@EXAMPLE.COM"
    When I submit the registration form
    Then my email is stored as "newuser@example.com"
    And my future logins are case-insensitive

  @validation
  Scenario: Usernames are case-insensitive for uniqueness
    Given an account exists with username "GameMaster"
    And I enter username "gamemaster"
    When I submit the registration form
    Then I should see error "Username already taken"
    And my account should not be created

  @loading-state @ui
  Scenario: Display loading state during registration
    Given I have entered all valid registration data
    When I submit the registration form
    And my request is in progress
    Then the submit button shows a loading spinner
    And all form inputs are disabled
    And I should not be able to submit again

  @error-handling
  Scenario: Handle network connection error
    Given I have entered valid registration data
    When I submit the registration form
    And the network connection fails
    Then I should see error "Connection error. Please try again."
    And the form is enabled again
    And my input data should be preserved

  @error-handling
  Scenario: Handle server error
    Given I have entered valid registration data
    When I submit the registration form
    And the registration service returns 500 error
    Then I should see error "Registration failed. Please try again later."
    And the form is enabled again

  @validation
  Scenario: Real-time validation clears errors when corrected
    Given I have entered invalid email "bad-email"
    And I see error "Invalid email address"
    When I correct the email to "valid@example.com"
    Then the error message should disappear
    And the email field should no longer show error styling

  @edge-case
  Scenario: Handle concurrent registration attempts
    Given I submit the registration form
    And the request is in progress
    When I attempt to submit the form again
    Then the second submission is prevented
    And only one registration request should be sent

  @integration
  Scenario: Registration enables immediate platform access
    Given I successfully register
    When my account is created and I'm logged in
    Then I should have access to authenticated features
    And my user information should appear in the header
    And I should be able to create game sessions

  @performance
  Scenario: Registration completes within acceptable time
    Given I submit valid registration data
    When my registration request is processed
    Then I receive response in less than 1 second
    And my password hashing uses appropriate cost factor

  @accessibility
  Scenario: Registration form is accessible
    Given I am using a screen reader
    When I navigate the registration form
    Then all fields should have descriptive labels
    And password strength requirements should be announced
    And validation errors should be announced immediately
