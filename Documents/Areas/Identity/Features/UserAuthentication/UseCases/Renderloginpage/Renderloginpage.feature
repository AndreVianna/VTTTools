# Generated: 2025-01-15
# Use Case: Render Login Page

@use-case @authentication @ui
Feature: Render Login Page
  As a VTT Tools user
  I want to access a unified authentication interface
  So that I can log in, register, or reset my password from a single page

  Background:
    Given the React Router context is available
    And the LoginPage component is mounted

  Rule: URL path determines which authentication form is displayed

    @happy-path
    Scenario: Display login form by default
      Given I navigate to "/login"
      When the LoginPage component loads
      Then the SimpleLoginForm should be displayed
      And I should see the "Sign In to VTT Tools" button

    @happy-path
    Scenario: Display registration form via /register route
      Given I navigate to "/register"
      When the LoginPage component loads
      Then the SimpleRegistrationForm should be displayed
      And I should see the "Create My Account" button

  Rule: Email and token URL parameters trigger password reset confirmation mode

    @password-reset @happy-path
    Scenario: Display reset confirm form with valid URL parameters
      Given I click a password reset link with email "user@test.com" and token "abc123xyz"
      When I navigate to "/login?email=user@test.com&token=abc123xyz"
      Then the PasswordResetConfirmForm should be displayed
      And the email field should be pre-filled with "user@test.com"
      And the token is saved for submission

    @password-reset @validation
    Scenario: Ignore incomplete URL parameters for password reset
      Given I navigate to "/login?email=user@test.com"
      And the token parameter is missing
      When the LoginPage component loads
      Then the SimpleLoginForm should be displayed as default
      And the email parameter should be ignored

  Rule: Successful login with 2FA enabled triggers two-factor mode

    @2fa @integration
    Scenario: Switch to two-factor mode after password authentication
      Given I am on the login form
      When I successfully log in with credentials for a 2FA-enabled account
      And the login response returns requiresTwoFactor: true
      Then the mode should change to "two-factor"
      And the TwoFactorVerificationForm should be displayed
      And I should see instructions to enter my authenticator code

  @happy-path @ui
  Scenario: Mode switching between login and registration
    Given I am on the login form
    When I click the "Create your account" link
    Then the mode should change to "register"
    And the SimpleRegistrationForm should be displayed
    And I should see the "Already have an account? Sign in here" link

  @happy-path @ui
  Scenario: Return to login from registration form
    Given I am on the registration form
    When I click the "Sign in here" link
    Then the mode should change to "login"
    And the SimpleLoginForm should be displayed

  @navigation @ui
  Scenario: Browser back button updates form mode
    Given I am on the registration form at "/register"
    When I use the browser back button
    And the URL changes to "/login"
    Then the useEffect hook should detect the pathname change
    And the mode should change to "login"
    And the SimpleLoginForm should be displayed

  @2fa @ui
  Scenario: Switch from two-factor to recovery code mode
    Given I am on the two-factor verification form
    When I click the "Use a recovery code instead" link
    Then the mode should change to "recovery-code"
    And the RecoveryCodeForm should be displayed

  @password-reset @ui
  Scenario: Switch from login to password reset request
    Given I am on the login form
    When I click the "Forgot password?" link
    Then the mode should change to "reset-request"
    And the PasswordResetRequestForm should be displayed
    And I should see instructions to enter my email

  @error-handling @edge-case
  Scenario: Handle invalid mode state gracefully
    Given the mode state is set to an invalid value "unknown-mode"
    When the LoginPage component renders
    Then the switch statement should fall back to the default case
    And the SimpleLoginForm should be displayed
    And no errors should be thrown

  @integration @responsive
  Scenario: Render page with responsive container
    Given I am viewing the page on a mobile device
    When the LoginPage component loads
    Then the Container should have maxWidth="sm"
    And the form should be centered on the screen
    And all form elements should be properly sized for mobile

  @performance
  Scenario: Fast mode switching without page reload
    Given I am on the login form
    When I switch between different modes 5 times
    Then each mode switch should occur in less than 100ms
    And no unnecessary component re-renders should occur
    And no page reloads should happen
