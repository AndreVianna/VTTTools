# Generated: 2025-10-11 (Phase 2 BDD Consolidation)
# Feature: Landing Page
# UI Component: LandingPage.tsx
# Phase: EPIC-001 Phase 2

@feature @onboarding @landing-page
Feature: Landing Page
  As a VTT Tools user
  I want to see contextually appropriate landing content
  So that I can quickly understand the platform and access the right features

  Background:
    Given I navigate to the root URL "/"

  # ═══════════════════════════════════════════════════════════════
  # CONDITIONAL RENDERING (CORE BEHAVIOR)
  # ═══════════════════════════════════════════════════════════════

  Rule: Landing page shows Hero section for unauthenticated users, Dashboard preview for authenticated users

    @smoke @happy-path @critical @anonymous
    Scenario: Unauthenticated visitor sees hero section
      Given I am not authenticated
      When the page loads
      Then I should see the hero section
      And I should see heading "Craft Legendary Adventures"
      And I should see the value proposition subtitle
      And I should see "Start Creating" button
      And I should see "Explore Features" button
      And I should not see dashboard preview
      And I should not see user greeting

    @smoke @happy-path @critical
    Scenario: Authenticated user sees dashboard preview
      Given I am authenticated as "GameMaster"
      When the page loads
      Then I should see heading "Welcome back, GameMaster!"
      And I should see "Your Creative Workspace" subheading
      And I should see 4 action cards
      And I should not see hero section
      And I should not see "Start Creating" button

  # ═══════════════════════════════════════════════════════════════
  # HERO SECTION (UNAUTHENTICATED MODE)
  # ═══════════════════════════════════════════════════════════════

  @hero @navigation @anonymous
  Scenario: Navigate to registration from hero section
    Given I am not authenticated
    And the hero section is displayed
    When I click the "Start Creating" button
    Then I should be navigated to "/register"

  @hero @navigation @anonymous
  Scenario: Navigate to login from hero section
    Given I am not authenticated
    And the hero section is displayed
    When I click the "Explore Features" button
    Then I should be navigated to "/login"

  @hero @ui  @anonymous
  Scenario: Hero section displays core UI elements
    Given I am not authenticated
    Then I should see primary heading "Craft Legendary Adventures"
    And I should see subtitle describing the platform
    And the CTA buttons should be prominently displayed

  # ═══════════════════════════════════════════════════════════════
  # DASHBOARD PREVIEW (AUTHENTICATED MODE)
  # ═══════════════════════════════════════════════════════════════

  @dashboard @navigation @critical
  Scenario: Navigate to Scene Editor from dashboard preview
    Given I am authenticated as "GameMaster"
    When I click the "Open Editor" button on "Scene Editor" action card
    Then I should be navigated to "/scene-editor"

  @dashboard @navigation @critical
  Scenario: Navigate to Asset Library from dashboard preview
    Given I am authenticated as "GameMaster"
    When I click the "Browse Assets" button on "Asset Library" action card
    Then I should be navigated to "/assets"

  @dashboard @ui
  Scenario: Dashboard preview shows 4 action cards
    Given I am authenticated as "GameMaster"
    When the page loads
    Then I should see 4 action cards:
      | Card Title       | Status   | Label         | Route         |
      | Scene Editor     | Active   | Open Editor   | /scene-editor |
      | Content Library  | Disabled | Coming Soon   | N/A           |
      | Asset Library    | Active   | Browse Assets | /assets       |
      | Account Settings | Disabled | Coming Soon   | N/A           |

  @dashboard @personalization
  Scenario: Dashboard shows personalized greeting with user name
    Given I am authenticated as "Alice"
    When the page loads
    Then I should see heading "Welcome back, Alice!"
    And the greeting should be personalized

  # ═══════════════════════════════════════════════════════════════
  # DYNAMIC STATE CHANGES
  # ═══════════════════════════════════════════════════════════════

  @integration @conditional
  Scenario: Page re-renders when authentication state changes
    Given I am viewing the landing page as unauthenticated visitor
    And the hero section is displayed
    When I successfully log in
    Then the page loads
    And the dashboard preview should be displayed
    And the hero section should not be visible
    And I should see my personalized greeting

  @integration @conditional
  Scenario: Page re-renders when logging out from dashboard
    Given I am viewing the landing page as authenticated user
    And the dashboard preview is displayed
    When I log out
    Then the page loads
    And the hero section should be displayed
    And the dashboard preview should not be visible
    And I should see CTA buttons

  # ═══════════════════════════════════════════════════════════════
  # THEME SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario Outline: Landing page renders correctly in <theme> mode when not authenticated
    Given the application is in <theme> mode
    And I am not authenticated
    When the page loads
    Then the <theme> theme colors should be applied
    And text contrast should meet WCAG standards
    And the hero gradient should use <theme> color scheme
    And action cards should use <theme> styling

    Examples:
      | theme |
      | light |
      | dark  |

  @theme
  Scenario Outline: Landing page renders correctly in <theme> mode when authenticated
    Given the application is in <theme> mode
    And I am authenticated as "GameMaster"
    When the page loads
    Then the <theme> theme colors should be applied
    And text contrast should meet WCAG standards
    And the hero gradient should use <theme> color scheme
    And action cards should use <theme> styling

    Examples:
      | theme |
      | light |
      | dark  |

# ═══════════════════════════════════════════════════════════════
  # ERROR HANDLING
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Handle auth check failure gracefully
    Given a session cookie exists
    When the auth user API request fails with 500 error
    Then I should see an error notification
    And the page should default to unauthenticated state (hero section)
    And I should be able to manually navigate to login page
