# Generated: 2025-01-15
# Use Case: Handle Logout

@use-case @authentication @session-management
Feature: Handle Logout
  As an authenticated VTT Tools user
  I want to securely log out of my account
  So that my session is terminated and my account is secure

  Background:
    Given I am authenticated and logged in
    And I have an active session with a valid token

  Rule: Logout always succeeds client-side regardless of server response

    @happy-path
    Scenario: Successful logout with server confirmation
      Given I click the logout button
      When the logout request completes successfully
      Then my session should be terminated on the server
      And the authentication token should be cleared from storage
      And the Auth Context should be reset
      
      And I should be redirected to the landing page

    @error-handling @resilience
    Scenario: Logout succeeds despite network error
      Given I click the logout button
      When the network connection fails during logout
      Then the authentication token should be cleared anyway
      And the Auth Context should be reset
      And I should be redirected to the landing page
      And I should see a warning notification about incomplete server logout

    @error-handling @resilience
    Scenario: Logout succeeds despite server error
      Given I click the logout button
      When the logout API returns 500 error
      Then the authentication token should be cleared anyway
      And the Auth Context should be reset
      And I should be redirected to the landing page

  Rule: Confirmation dialog prevents accidental logouts when enabled

    @confirmation @ui
    Scenario: Display confirmation dialog when configured
      Given the LogoutButton has showConfirmation=true
      When I click the logout button
      Then a confirmation dialog should appear
      And I should see "Are you sure you want to log out?" message
      And I should see "Confirm" and "Cancel" buttons

    @confirmation
    Scenario: Logout proceeds when user confirms
      Given the confirmation dialog is displayed
      When I click the "Confirm" button
      Then the logout should proceed
      And my session should be terminated

    @confirmation
    Scenario: Logout cancels when user declines
      Given the confirmation dialog is displayed
      When I click the "Cancel" button
      Then the dialog should close
      And no logout should occur
      And I should remain authenticated
      And I should stay on the current page

  Rule: Logout without confirmation executes immediately

    @happy-path
    Scenario: Immediate logout without confirmation dialog
      Given the LogoutButton has showConfirmation=false
      When I click the logout button
      Then no confirmation dialog should appear
      And the logout should execute immediately
      And I should be logged out

  @security
  Scenario: Session token is invalidated server-side
    Given I have an active session token
    When I successfully log out
    Then the session should be marked as terminated in the database
    And the session token should be added to the blacklist
    And future requests with that token should be rejected
    And I should not be able to access protected resources

  @security
  Scenario: Token is cleared from client storage
    Given my authentication token is stored in localStorage
    When I successfully log out
    Then the token is removed from localStorage
    And no authentication cookies should remain
    And sensitive data should be cleared from memory

  @integration
  Scenario: Logout updates authentication context globally
    Given I am logged in across multiple components
    When I log out
    Then the Auth Context user should be set to null
    And all components should reflect unauthenticated state
    And protected routes should become inaccessible
    And the header should show login/register options

  @loading-state @ui
  Scenario: Display loading state during logout
    Given I confirm logout
    When the logout request is in progress
    Then the logout button should show a loading spinner
    And the confirmation dialog actions should be disabled
    And I should not be able to click logout again

  @callback @integration
  Scenario: Execute onLogoutStart callback before logout
    Given the LogoutButton has onLogoutStart callback defined
    When I confirm logout
    Then the onLogoutStart callback should be executed first
    And I should see any unsaved changes warning
    And the logout should proceed after callback completes

  @callback @integration
  Scenario: Execute onLogoutComplete callback after logout
    Given the LogoutButton has onLogoutComplete callback defined
    When the logout completes successfully
    Then the onLogoutComplete callback should be executed
    And any cleanup operations should be performed
    And I should be redirected after callback completes

  @edge-case
  Scenario: Handle logout with expired token
    Given my session token has expired
    When I click the logout button
    Then the client should clear the token anyway
    And the server should return 401 error
    And I should still be logged out successfully
    And I should be redirected to the landing page

  @edge-case
  Scenario: Handle logout with already terminated session
    Given my session was terminated by another process
    When I click the logout button
    Then the server should return 404 error
    And the client should clear state anyway
    And I should be logged out successfully

  @edge-case
  Scenario: Handle concurrent logout attempts
    Given I submit the logout request
    And the request is in progress
    When I attempt to click logout again
    Then the second logout should be prevented
    And only one logout request should be sent

  @security
  Scenario: Logout clears sensitive application state
    Given I have loaded sensitive user data in the application
    When I log out
    Then all user-specific data should be cleared from state
    And cached API responses should be invalidated
    And any WebSocket connections should be closed

  @integration @multi-device
  Scenario: Logout from one device does not affect other sessions
    Given I am logged in on my desktop browser
    And I am also logged in on my mobile device
    When I log out from my desktop
    Then the desktop session should be terminated
    But my mobile session should remain active
    And I should still be authenticated on mobile

  @performance
  Scenario: Logout completes quickly
    Given I confirm logout
    When the logout request is processed
    Then I receive response with in less than 200ms
    And the client-side state should clear immediately

  @navigation
  Scenario: Redirect to landing page after logout
    Given I am on the dashboard page
    When I successfully log out
    Then I should be redirected to the landing page
    And I should see the public landing page content
    And I should see login and register options

  @accessibility
  Scenario: Logout button is accessible
    Given I am using a screen reader
    When I focus on the logout button
    Then the button should be announced as "Logout"
    And the button action should be clear
    And the confirmation dialog should be accessible if shown
