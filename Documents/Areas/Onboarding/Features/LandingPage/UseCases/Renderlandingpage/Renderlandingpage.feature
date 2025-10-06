# Generated: 2025-10-03
# Use Case: Render Landing Page
@use-case @onboarding @landing-page @ui @full-page
Feature: Render Landing Page
  As a VTT Tools user
  I want to see contextually appropriate landing content
  So that I can quickly understand the platform and access the right features

  Background:
    Given I navigate to the root URL "/"

  @happy-path @ui
  Scenario: Display hero section for unauthenticated visitor
    Given I am not authenticated
    When the landing page loads
    Then I should see the hero section
    And I should see heading "Craft Legendary Adventures"
    And I should see the value proposition subtitle
    And I should see "Start Creating" button
    And I should see "Explore Features" button
    And I should not see dashboard content

  @happy-path @ui
  Scenario: Display dashboard preview for authenticated user
    Given I am authenticated as "GameMaster"
    When the landing page loads
    Then I should see heading "Welcome back, GameMaster!"
    And I should see "Your Creative Workspace" subheading
    And I should see "Open Dashboard" button
    And I should not see hero section

  @navigation @ui
  Scenario: Navigate to registration from hero section
    Given I am not authenticated
    And I am viewing the hero section
    When I click the "Start Creating" button
    Then I should be navigated to "/register"

  @navigation @ui
  Scenario: Navigate to login from hero section
    Given I am not authenticated
    And I am viewing the hero section
    When I click the "Explore Features" button
    Then I should be navigated to "/login"

  @navigation @ui
  Scenario: Navigate to dashboard from authenticated view
    Given I am authenticated
    And I am viewing the dashboard preview
    When I click the "Open Dashboard" button
    Then I should be navigated to "/dashboard"

  @responsive @ui
  Scenario: Render responsively on mobile devices
    Given I am on a mobile device
    When the landing page loads
    Then the content should be displayed in mobile layout
    And all text should be readable
    And buttons should be touch-friendly

  @responsive @ui
  Scenario: Render responsively on desktop devices
    Given I am on a desktop device
    When the landing page loads
    Then the content should be displayed in desktop layout
    And the hero title should use desktop font sizing
    And the layout should utilize available screen space

  @integration
  Scenario: Re-render when authentication state changes
    Given I am viewing the landing page as an unauthenticated visitor
    And the hero section is displayed
    When I successfully log in
    Then the page should re-render
    And the dashboard preview should be displayed
    And the hero section should not be visible

  @edge-case
  Scenario: Handle missing userName with fallback
    Given I am authenticated
    But my user profile has no userName
    When the landing page loads
    Then I should see "Welcome back, Game Master!" with fallback
    And the dashboard preview should be displayed normally
