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
      When the landing page loads
      Then I should see the hero section
      And I should see heading "Craft Legendary Adventures"
      And I should see the value proposition subtitle
      And I should see "Start Creating" button
      And I should see "Explore Features" button
      And I should not see dashboard preview
      And I should not see user greeting

    @smoke @happy-path @critical
    Scenario: Authenticated user sees dashboard preview
      Given I am authenticated with displayName "GameMaster"
      When the landing page loads
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
    Given I am authenticated
    When I click the "Open Editor" button on "Scene Editor" action card
    Then I should be navigated to "/scene-editor"

  @dashboard @navigation @critical
  Scenario: Navigate to Asset Library from dashboard preview
    Given I am authenticated
    When I click the "Browse Assets" button on "Asset Library" action card
    Then I should be navigated to "/assets"

  @dashboard @ui
  Scenario: Dashboard preview shows 4 action cards
    Given I am authenticated
    When the dashboard preview loads
    Then I should see 4 action cards:
      | Card Title       | Status   | Label         | Route         |
      | Scene Editor     | Active   | Open Editor   | /scene-editor |
      | Content Library  | Disabled | Coming Soon   | N/A           |
      | Asset Library    | Active   | Browse Assets | /assets       |
      | Account Settings | Disabled | Coming Soon   | N/A           |

  @dashboard @personalization
  Scenario: Dashboard shows personalized greeting with user name
    Given I am authenticated as user with displayName "Alice"
    When the dashboard preview loads
    Then I should see heading "Welcome back, Alice!"
    And the greeting should be personalized

  @dashboard @personalization
  Scenario: Dashboard shows fallback greeting when displayName missing
    Given I am authenticated
    But my user profile has no displayName
    When the dashboard preview loads
    Then I should see "Welcome back, Game Master!" with fallback
    And the dashboard should display normally

  # ═══════════════════════════════════════════════════════════════
  # DYNAMIC STATE CHANGES
  # ═══════════════════════════════════════════════════════════════

  @integration @conditional
  Scenario: Page re-renders when authentication state changes
    Given I am viewing the landing page as unauthenticated visitor
    And the hero section is displayed
    When I successfully log in
    Then the page should re-render automatically
    And the dashboard preview should be displayed
    And the hero section should not be visible
    And I should see my personalized greeting

  @integration @conditional
  Scenario: Page re-renders when logging out from dashboard
    Given I am viewing the landing page as authenticated user
    And the dashboard preview is displayed
    When I log out
    Then the page should re-render automatically
    And the hero section should be displayed
    And the dashboard preview should not be visible
    And I should see CTA buttons

  # ═══════════════════════════════════════════════════════════════
  # THEME SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario Outline: Landing page renders correctly in <theme> mode when <auth_state>
    Given the application is in <theme> mode
    And I am <auth_state>
    When the landing page loads
    Then the <theme> theme colors should be applied
    And text contrast should meet WCAG standards
    And the hero gradient should use <theme> color scheme
    And action cards should use <theme> styling

    Examples:
      | theme | auth_state       |
      | light | not authenticated|
      | dark  | not authenticated|
      | light | authenticated    |
      | dark  | authenticated    |

  # ═══════════════════════════════════════════════════════════════
  # ACCESSIBILITY
  # ═══════════════════════════════════════════════════════════════

  @accessibility
  Scenario: Landing page is keyboard navigable
    When I navigate using keyboard only
    Then I should be able to Tab through all interactive elements
    And I should be able to activate CTA buttons with Enter
    And I should be able to activate action cards with Enter
    And focus states should be clearly visible

  @accessibility
  Scenario: Landing page has proper ARIA labels
    When I use a screen reader
    Then all headings should have proper hierarchy
    And all buttons should have descriptive labels
    And action cards should announce their status (active/disabled)
    And the page should have appropriate landmarks

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

  @edge-case
  Scenario: Handle missing action card data gracefully
    Given I am authenticated
    And some action card data is missing or malformed
    When the dashboard preview renders
    Then available cards should display correctly
    And missing cards should be skipped or show placeholder
    And the page should not crash
