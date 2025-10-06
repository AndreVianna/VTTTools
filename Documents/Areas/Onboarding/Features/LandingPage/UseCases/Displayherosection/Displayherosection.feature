# Generated: 2025-10-03
# Use Case: Display Hero Section
@use-case @onboarding @hero-section @ui @widget
Feature: Display Hero Section
  As a non-authenticated visitor
  I want to see an engaging hero section on the landing page
  So that I understand the platform's value proposition and can take action

  Background:
    Given I am a non-authenticated visitor
    And I am on the landing page

  @happy-path @ui
  Scenario: Hero section renders with marketing content
    When the landing page loads
    Then I should see the hero section
    And I should see the title "Craft Legendary Adventures"
    And I should see the subtitle with value proposition
    And I should see a gradient background
    And the section should be visually prominent

  @navigation @ui
  Scenario: Primary CTA navigates to registration
    When I view the hero section
    Then I should see a "Start Creating" button
    When I click the "Start Creating" button
    Then I should be navigated to "/register"

  @navigation @ui
  Scenario: Secondary CTA navigates to login
    When I view the hero section
    Then I should see an "Explore Features" button
    When I click the "Explore Features" button
    Then I should be navigated to "/login"

  @responsive @ui
  Scenario: Hero section displays responsively on mobile devices
    Given I am viewing on a mobile device
    When the hero section renders
    Then the hero title should be readable on small screens
    And the CTA buttons should be vertically stacked
    And both buttons should be touch-friendly
    And the gradient background should display correctly

  @responsive @ui
  Scenario: Hero section displays responsively on desktop
    Given I am viewing on a desktop device
    When the hero section renders
    Then the hero title should use desktop typography sizing
    And the CTA buttons should be horizontally aligned
    And the gradient should span the full section width

  @ui @accessibility
  Scenario: Hero section is keyboard accessible
    When I navigate using keyboard
    Then I should be able to Tab to "Start Creating" button
    And I should be able to Tab to "Explore Features" button
    And I should be able to activate buttons with Enter key
    And focus states should be clearly visible
