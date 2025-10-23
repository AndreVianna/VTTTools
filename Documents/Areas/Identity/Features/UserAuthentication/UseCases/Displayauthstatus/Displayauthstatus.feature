# Generated: 2025-01-15
# Use Case: Display Auth Status

@use-case @authentication @ui @widget
Feature: Display Auth Status
  As a VTT Tools user
  I want to see my current authentication status in the header
  So that I always know if I'm logged in and can quickly access account options

  Background:
    Given the AuthStatus component is rendered in the application header
    And the Auth Context provider is available

  Rule: Unauthenticated state shows login and register options

    @ui @happy-path
    Scenario: Display login and register icons when not authenticated
      Given I am not authenticated
      And the showFullControls prop is true
      When the AuthStatus component renders
      Then I should see a "Sign In" icon button
      And I should see a "Sign Up" icon button
      And I should not see user information
      And I should not see a user menu

  Rule: Loading state indicates authentication check in progress

    @ui @loading-state
    Scenario: Display loading indicator during authentication check
      Given the authentication state is loading
      When the AuthStatus component renders
      Then I should see a placeholder avatar with Person icon
      And I should see "Loading..." text
      And I should not see any action buttons

  Rule: Authenticated state shows user information and menu

    @ui
    Scenario: Display avatar with user initials
      Given I am authenticated as "John Doe"
      When the AuthStatus component renders
      Then the avatar should display "J"
      And the avatar should be styled with primary color

    @ui
    Scenario: Display user menu when clicking avatar
      Given I am authenticated
      When I click on the avatar or user information
      Then a dropdown menu should open
      And I should see "Profile Settings" menu item
      And I should see "Security & Privacy" menu item
      And I should see a divider
      And I should see the Logout button in the menu

  @ui @menu @navigation
  Scenario: Navigate to profile settings from menu
    Given I am authenticated
    And the user menu is open
    When I click "Profile Settings" menu item
    Then the onNavigateToProfile callback should be executed
    And the menu should close
    And I should be navigated to the profile page

  @ui @menu @navigation
  Scenario: Navigate to security settings from menu
    Given I am authenticated
    And the user menu is open
    When I click "Security & Privacy" menu item
    Then the onNavigateToSecurity callback should be executed
    And the menu should close
    And I should be navigated to the security page

  @ui @menu
  Scenario: Close menu when clicking outside
    Given I am authenticated
    And the user menu is open
    When I click outside the menu
    Then the menu should close
    And I should remain on the current page

  @ui @menu
  Scenario: Close menu when pressing Escape key
    Given I am authenticated
    And the user menu is open
    When I press the Escape key
    Then the menu should close

  @ui @navigation
  Scenario: Navigate to login when clicking sign in icon
    Given I am not authenticated
    When I click the "Sign In" icon button
    Then the onNavigateToLogin callback should be executed
    And I should be navigated to the login page

  @ui @navigation
  Scenario: Navigate to registration when clicking sign up icon
    Given I am not authenticated
    When I click the "Sign Up" icon button
    Then the onNavigateToRegister callback should be executed
    And I should be navigated to the registration page

  @integration
  Scenario: Auth status updates when user logs in
    Given I am not authenticated
    And the AuthStatus component is rendered
    When I log in successfully
    And the Auth Context is updated
    Then the component should re-render
    And I should see my user information
    And I should no longer see login/register buttons

  @integration
  Scenario: Auth status updates when user logs out
    Given I am authenticated
    And the AuthStatus component is rendered
    When I log out successfully
    And the Auth Context is reset
    Then the component should re-render
    And I should see login/register buttons
    And I should not see user information

  @edge-case
  Scenario: Handle missing user data gracefully
    Given I am authenticated
    But the user object is null or incomplete
    When the AuthStatus component renders
    Then the component should not crash
    And I should see loading state or minimal fallback UI

  @edge-case
  Scenario: Handle missing navigation callbacks
    Given I am authenticated
    And no navigation callbacks are provided
    When I click menu items
    Then the menu items should be disabled or hidden
    And no navigation should occur

  @accessibility
  Scenario: Component is accessible to screen readers
    Given I am using a screen reader
    When I navigate to the AuthStatus component
    Then the authentication status should be announced
    And the avatar button should be labeled appropriately
    And menu items should be properly labeled
    And the menu should be keyboard navigable

  @accessibility
  Scenario: Keyboard navigation through user menu
    Given I am authenticated
    When I press Tab to focus on the avatar
    And I press Enter to open the menu
    Then the menu should open
    And I should be able to Tab through menu items
    And I should be able to activate items with Enter
    And I should be able to close the menu with Escape

  @performance
  Scenario: Component renders efficiently
    Given the Auth Context updates
    When the AuthStatus component re-renders
    Then only necessary components should update
    And unnecessary re-renders should be prevented
    And the render should complete instantly

  @ui @profile-picture
  Scenario: Display user profile picture if available
    Given I am authenticated
    And I have uploaded a profile picture
    When the AuthStatus component renders
    Then the avatar should display my profile picture
    And the picture should be loaded efficiently
