# Generated: 2025-01-15
# Use Case: Handle Registration

@use-case @authentication @account-creation
Feature: Handle Registration
  As a new VTT Tools user
  I want to create an account with email, name, and password
  So that I can start using the platform

  Background:
    Given I am on the registration page
    And the registration service is available
    And I am not currently authenticated

  Rule: Email must be in valid format and unique

    @validation
    Scenario: Accept valid unique email
      Given no account exists with email "newuser@example.com"
      And I register with email "newuser@example.com"
      And I provide other valid registration data
      When I submit the registration form
      Then my email should pass validation
      And my account should be created

    @validation @error-handling
    Scenario: Reject invalid email format
      Given I enter email "not-a-valid-email" for registration
      When I attempt to submit the registration form
      Then I should see error "Invalid email address"
      And my form is not submitted

    @validation @error-handling
    Scenario: Reject duplicate email
      Given an account already exists with email "existing@example.com"
      And I enter email "existing@example.com" for registration
      And I provide other valid registration data
      When I submit the registration form
      Then I should see error "Email address already registered"
      And my account should not be created
      And the registration should be prevented

  Rule: name must be 3-50 characters with allowed characters only

    @validation
    Scenario: Accept valid name
      Given I enter name "GameMaster_2024"
      And I provide other valid registration data
      When I submit the registration form
      Then the name should pass validation
      And my account should be created

    @validation @error-handling
    Scenario: Reject name that is too short
      Given I enter name "ab"
      When I attempt to submit the registration form
      Then I should see error "name must be at least 3 characters"
      And my form is not submitted

  Rule: Password must be at least 6 characters

    # NOTE: SimpleRegistrationForm has NO confirm password field (sends password twice to backend)
    # This scenario requires confirm password field to be added to frontend
    @validation @ignore
    Scenario: Accept password meeting minimum length
      Given I enter password "Pass123"
      And I enter matching confirmation password "Pass123"
      And I provide other valid registration data
      When I submit the registration form
      Then my password should pass validation
      And my account should be created

    @validation @error-handling
    Scenario: Reject password below minimum length
      Given I enter password "abc12"
      When I attempt to submit the registration form
      Then I should see error "Password must be at least 6 characters"
      And my form is not submitted

  Rule: Password confirmation must match password

    # NOTE: SimpleRegistrationForm has NO confirm password field (sends password twice to backend)
    # This scenario requires confirm password field to be added to frontend
    @validation @error-handling @ignore
    Scenario: Reject mismatched passwords
      Given I enter password "SecurePass123"
      And I enter confirmation password "DifferentPass456"
      When I attempt to submit the registration form
      Then I should see error "Passwords do not match"
      And my form is not submitted
      And the error appears below the confirm password field

  @happy-path @critical
  Scenario: Successful registration redirects to login page
    Given I enter unique email "newgm@example.com"
    And I enter valid display name "New Game Master"
    And I enter password "SecurePassword123"
    When I submit the registration form
    Then my account should be created
    And I should be redirected to "/login"
    And I should be able to log in with my new credentials

  @integration @email @ignore
  Scenario: Registration triggers verification email
    Given I successfully register with email "verify@example.com"
    When my account is created
    Then I receive a verification email at "verify@example.com"
    And my email contains a verification link
    And my account is marked as "email not confirmed"

  @error-handling @ignore
  Scenario: Handle email service failure gracefully
    Given I submit valid registration data
    When the email service fails to send verification email
    Then my account should still be created
    And I should be redirected to login page
    And I should see notification about email verification

  # NOTE: Password hashing, email normalization, and name uniqueness are backend concerns
  # Tested in backend unit tests (Identity.UnitTests)

  @error-handling
  Scenario: Handle network connection error
    Given I have entered valid registration data
    And the network connection fails
    When I attempt to submit the registration form
    Then I should see error "An unexpected error has occurred. Please try again in a few minutes."
    And the form is enabled again
    And my registration input data should be preserved

  @error-handling
  Scenario: Handle server error
    Given I have entered valid registration data
    And the registration service returns 500 error
    When I attempt to submit the registration form
    Then I should see error "An unexpected error has occurred. Please try again in a few minutes."
    And the form is enabled again

  @validation
  Scenario: Real-time validation clears errors when corrected
    Given I have entered invalid email "bad-email"
    And I see error "Invalid email address"
    When I correct the email to "valid@example.com"
    Then the error message for registration should disappear
    And the email field should no longer show error styling

  @edge-case @ignore
  Scenario: Handle concurrent registration attempts
    Given I submit the registration form
    And the request is in progress
    When I attempt to submit the form again
    Then the second submission is prevented
    And only one registration request should be sent

  @integration @ignore
  Scenario: Registration enables immediate platform access
    Given I successfully register
    When my account is created and I'm logged in
    Then I should have access to authenticated features
    And my user information should appear in the header
    And I should be able to create game sessions

  # NOTE: Performance testing belongs in dedicated performance test suite
  # Password hashing cost factor is backend configuration

  @accessibility @ignore
  Scenario: Registration form is accessible
    Given I am using a screen reader
    When I navigate the registration form
    Then all fields should have descriptive labels
    And password strength requirements should be announced
    And validation errors should be announced immediately
