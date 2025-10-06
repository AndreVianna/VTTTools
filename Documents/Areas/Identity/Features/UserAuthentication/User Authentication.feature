# Generated: 2025-01-15
# Feature: User Authentication

@feature @authentication @security
Feature: User Authentication
  As a VTT Tools user
  I want to securely authenticate and manage my account
  So that I can access personalized features with confidence

  Background:
    Given I am a VTT Tools user

  Rule: Users must provide valid credentials to access the platform

    @happy-path
    Scenario: Complete authentication flow with email and password
      Given I am an unregistered user
      When I register with valid email and password
      And I log in with my credentials
      Then I should be authenticated successfully
      And I should see my dashboard

    @happy-path
    Scenario: Authentication with two-factor security enabled
      Given I have an account with 2FA enabled
      When I log in with valid credentials
      And I provide a valid authenticator code
      Then I should be authenticated successfully
      And I should see confirmation of secure login

  Rule: Password must be at least 8 characters with mixed case and numbers

    @validation
    Scenario: Accept strong password during registration
      Given I am on the registration page
      When I provide password "SecurePass123"
      Then password is accepted
      And I should see my account created

    @validation @error-handling
    Scenario: Reject weak password during registration
      Given I am on the registration page
      When I provide password "weak"
      Then I should see error "Password must be at least 8 characters"
      And account creation is prevented

  Rule: Email addresses must be unique across the platform

    @validation
    Scenario: Register with unique email address
      Given no account exists with email "newuser@example.com"
      When I register with email "newuser@example.com"
      Then my account is created
      And I should receive a confirmation email

    @validation @error-handling
    Scenario: Reject duplicate email registration
      Given an account exists with email "existing@example.com"
      When I attempt to register with email "existing@example.com"
      Then I should see error "Email address already registered"
      And account creation is prevented

  Rule: Two-factor authentication codes must be 6 digits from authenticator app

    @2fa @security
    Scenario: Accept valid 6-digit authenticator code
      Given I have completed password authentication
      And I have 2FA enabled with configured authenticator
      When I provide valid 6-digit code from my authenticator app
      Then authentication is completed
      And I should have full access to my account

    @2fa @error-handling
    Scenario: Reject invalid authenticator code
      Given I have completed password authentication
      And I am on the 2FA verification page
      When I provide invalid code "999999"
      Then I should see error "Invalid verification code"
      And I should remain on the verification page

  Rule: Recovery codes are single-use backup authentication methods

    @2fa @recovery
    Scenario: Authenticate using valid recovery code
      Given I have completed password authentication
      And I have 2FA enabled but cannot access my authenticator
      When I provide a valid unused recovery code
      Then authentication is completed
      And recovery code is marked as used
      And I should see remaining codes count

    @2fa @error-handling
    Scenario: Reject already-used recovery code
      Given I have completed password authentication
      And I am using recovery code authentication
      When I provide a recovery code that has been used
      Then I should see error "This recovery code has already been used"
      And authentication is prevented

  Rule: Password reset tokens expire after 24 hours

    @password-reset
    Scenario: Reset password with valid token within 24 hours
      Given I requested a password reset 1 hour ago
      When I click the reset link in my email
      And I provide a new valid password
      Then password is updated successfully
      And I can log in with the new password

    @password-reset @error-handling
    Scenario: Reject expired password reset token
      Given I requested a password reset 25 hours ago
      When I click the reset link in my email
      Then I should see error "Reset link has expired"
      And I should be prompted to request a new reset link

  Rule: Login attempts are rate-limited to prevent brute force attacks

    @security @error-handling
    Scenario: Block excessive failed login attempts
      Given I have made 5 failed login attempts
      When I attempt to log in again
      Then I should see error "Too many attempts. Please try again in 5 minutes"
      And login is blocked temporarily

    @security
    Scenario: Allow login after rate limit period expires
      Given I was rate-limited due to failed attempts
      And 5 minutes have passed since the last attempt
      When I log in with valid credentials
      Then authentication succeeds
      And I have access to my account

  @integration @cross-area
  Scenario: Authentication state propagates across all areas
    Given I am logged in as a Game Master
    When I navigate to different areas of the application
    Then authentication status is maintained
    And I should see my user information in the header
    And I have appropriate permissions in each area

  @error-handling
  Scenario: Handle authentication service unavailability
    Given I am on the login page
    When I attempt to log in
    And the service is temporarily unavailable
    Then I should see error "Service temporarily unavailable"
    And I should be able to retry later
    And my credentials are preserved

  @security
  Scenario: Secure logout clears all session data
    Given I am authenticated and have an active session
    When I log out of my account
    Then session is terminated
    And authentication token is invalidated
    And I should be redirected to the landing page
    And protected resources are inaccessible

  @edge-case
  Scenario: Handle concurrent login from multiple devices
    Given I am logged in on my desktop browser
    When I log in on my mobile device with the same account
    Then both sessions are valid
    And I should see my authentication status on both devices
    And logging out from one device does not affect the other

  @validation @email
  Scenario: Validate email format during registration
    Given I am on the registration page
    When I provide email "not-a-valid-email"
    Then I should see error "Invalid email address"
    And form submission is prevented

  @validation @username
  Scenario: Validate username format during registration
    Given I am on the registration page
    When I provide username with special characters "user@#$%"
    Then I should see error "Username can only contain letters, numbers, underscores, and hyphens"
    And form submission is prevented
