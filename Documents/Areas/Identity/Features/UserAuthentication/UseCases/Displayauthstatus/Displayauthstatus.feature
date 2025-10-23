# Generated: 2025-01-15
# Use Case: Display Auth Status

@use-case @authentication @ui @widget
Feature: Display Auth Status
  As a VTT Tools user
  I want to see my current authentication status in the header
  So that I always know if I'm logged in and can quickly access account options

  Background:
    Given I am on the landing page
    And the application header is displayed

  Rule: Unauthenticated state shows login and register options

    @ui @happy-path
    Scenario: Display Sign In and Sign Up buttons when not authenticated
      Given I am not authenticated
      When I view the application header
      Then I should see a "Sign In" button
      And I should see a "Sign Up" button
      And I should not see user account button

  Rule: Authenticated state shows user information and menu

    @ui
    Scenario: Display user name on account button when authenticated
      Given I am authenticated as "Andre Vianna"
      And I navigate to the assets page
      When I view the application header
      Then the account button should display "Andre Vianna"
      And the button should have a dropdown arrow icon
      And I should not see Sign In and Sign Up buttons

    @ui
    Scenario: Display user menu when clicking account button
      Given I am authenticated as "Andre Vianna"
      And I navigate to the assets page
      When I click on the user account button
      Then a dropdown menu should open
      And I should see "Profile" menu item
      And I should see "Settings" menu item
      And I should see "Sign Out" menu item

  Rule: Navigation from header

    @ui @navigation
    Scenario: Navigate to login when clicking Sign In button
      Given I am not authenticated
      When I click the "Sign In" button
      Then I should be navigated to the login page

    @ui @navigation
    Scenario: Navigate to registration when clicking Sign Up button
      Given I am not authenticated
      When I click the "Sign Up" button
      Then I should be navigated to the registration page

  Rule: Header updates based on authentication state

    @integration
    Scenario: Header updates when user logs in
      Given I am not authenticated
      And I am on the landing page
      When I log in successfully
      Then I should see the user account button with my name
      And I should not see Sign In and Sign Up buttons

    @integration
    Scenario: Header updates when user logs out
      Given I am authenticated
      And I am on the landing page
      When I log out successfully
      Then I should see Sign In and Sign Up buttons
      And I should not see user account button

  @ui @loading-state @ignore
  Scenario: Display loading indicator during authentication check
    Given the authentication state is loading
    When I view the header
    Then I should see a loading placeholder

  @ui @ignore
  Scenario: Display avatar with user initials
    Given I am authenticated as "John Doe"
    When I view the header
    Then the avatar should display "JD" initials

  @accessibility @ignore
  Scenario: Header is accessible to screen readers
    Given I am using a screen reader
    When I navigate to the header
    Then the authentication status should be announced
    And menu items should be properly labeled

  @ui @profile-picture @ignore
  Scenario: Display user profile picture if available
    Given I am authenticated
    And I have uploaded a profile picture
    When I view the header
    Then the account button should display my profile picture
