# Generated: 2025-10-03
# Use Case: Display Dashboard Preview
@use-case @onboarding @dashboard-preview @ui @widget
Feature: Display Dashboard Preview Widget
  As an authenticated user
  I want to see a personalized dashboard preview on the landing page
  So that I can quickly access my workspace

  Background:
    Given I am authenticated
    And I am on the landing page

  @happy-path @ui
  Scenario: Display personalized greeting with user name
    Given my user name is "Alex Morgan"
    When the dashboard preview widget loads
    Then I should see greeting "Welcome back, Alex Morgan!"
    And I should see "Your Creative Workspace" subheading
    And I should see workspace description
    And I should see "Open Dashboard" button

  @navigation @ui
  Scenario: Navigate to dashboard when clicking button
    Given the dashboard preview widget is displayed
    When I click the "Open Dashboard" button
    Then I should be navigated to "/dashboard"

  @edge-case @ui
  Scenario: Display fallback greeting when user name is missing
    Given my user profile has no userName
    When the dashboard preview widget loads
    Then I should see greeting "Welcome back, Game Master!"
    And the workspace description should be visible
    And the "Open Dashboard" button should be present

  @responsive @ui
  Scenario: Display responsive layout on mobile devices
    Given I am viewing on a mobile device
    When the dashboard preview widget loads
    Then the widget should display in mobile-optimized layout
    And the greeting text should be readable
    And the "Open Dashboard" button should be easily tappable

  @responsive @ui
  Scenario: Display responsive layout on desktop devices
    Given I am viewing on a desktop device
    When the dashboard preview widget loads
    Then the widget should display in desktop-optimized layout
    And all text content should be properly aligned
    And the button should maintain proper spacing

  @ui @accessibility
  Scenario: Dashboard preview is keyboard accessible
    When I navigate using keyboard
    Then I should be able to Tab to the "Open Dashboard" button
    And I should be able to activate the button with Enter key
    And focus state should be clearly visible
