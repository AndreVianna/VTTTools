# Generated: 2025-10-11 (Phase 5 BDD Rewrite)
# Feature: Asset Library Page
# UI Component: AssetLibraryPage.tsx
# Phase: EPIC-001 Phase 5

Feature: Asset Library Page
  As a Game Master
  I want to browse and manage my asset library through a visual interface
  So that I can efficiently find, create, and organize assets for my game sessions

  Background:
    Given I am authenticated as a Game Master
    And I am on the Asset Library page at "/assets"

  # ═══════════════════════════════════════════════════════════════
  # PAGE LOAD & INITIAL STATE
  # ═══════════════════════════════════════════════════════════════

  @smoke @happy-path
  Scenario: Asset Library page loads successfully
    When the "Asset Library" page loads
    Then I should see the page title "Asset Library"
    And I should see the subtitle "Manage your objects and creatures for scenes"
    And I should see the "Objects" tab selected by default
    And I should see the virtual "Add Object" card as the first card
    And I should see the search bar
    And I should see the filter panel on the left

  @happy-path
  Scenario: Page displays existing assets in grid layout
    Given 5 Object assets exist in my library
    When the "Asset Library" page loads
    Then I should see 6 cards total (1 "Add" card + 5 asset cards)
    And asset cards should be displayed in a responsive grid
    And each asset card should show the asset name
    And each asset card should show the Token image
    And each asset card should show the size in cells
    And each asset card should show Public or Private label

  @loading
  Scenario: Page shows loading skeletons while fetching assets
    Given the API is slow to respond
    When the "Asset Library" page loads
    Then I should see 12 skeleton loading cards
    And I should not see the "Add" card during loading
    When the API responds
    Then the skeleton cards should be replaced with actual asset cards

  @error-handling
  Scenario: Page shows error message when API fails
    Given the Assets API is unavailable
    When the "Asset Library" page loads
    Then I should see an error alert "Failed to load assets. Please try again."
    And I should see a "Retry" button
    When I click the "Retry" button
    Then the API should be called again

  # ═══════════════════════════════════════════════════════════════
  # KIND TABS (MAJOR FILTER)
  # ═══════════════════════════════════════════════════════════════

  @filtering @happy-path
  Scenario: Switch between Object and Creature tabs
    Given 3 Object assets and 2 Creature assets exist in my library
    And I am on the "Objects" tab
    Then I should see 4 cards (1 "Add" card + 3 Object assets)
    And the "Add" card should say "Add Object"
    When I click the "Creatures" tab
    Then I should see 3 cards (1 "Add" card + 2 Creature assets)
    And the "Add" card should say "Add Creature"
    And the page should reset to page 1

  # ═══════════════════════════════════════════════════════════════
  # VIRTUAL "ADD" CARD
  # ═══════════════════════════════════════════════════════════════

  @happy-path
  Scenario: Virtual "Add" card opens create dialog
    Given I am on the "Objects" tab
    When I click the virtual "Add Object" card
    Then the Asset Create Dialog should open
    And the dialog kind should be locked to "Object"
    And the Object tab should be selected in the dialog

  @happy-path
  Scenario: Virtual "Add" card label changes with tab
    Given I am on the "Objects" tab
    Then the virtual "Add" card should display "Add Object"
    When I switch to the "Creatures" tab
    Then the virtual "Add" card should display "Add Creature"

  @ui-feedback
  Scenario: Virtual "Add" card hover effect
    When I hover over the virtual "Add" card
    Then the card should lift up (translateY -4px)
    And the card should show elevated shadow
    And the background should brighten slightly

  # ═══════════════════════════════════════════════════════════════
  # SEARCH FUNCTIONALITY
  # ═══════════════════════════════════════════════════════════════

  @search @happy-path
  Scenario: Search assets by name
    Given assets exist with names:
      | name           |
      | Red Dragon     |
      | Blue Dragon    |
      | Green Goblin   |
      | Treasure Chest |
    When I type "dragon" in the search bar
    And I wait 300ms for debounce
    Then I should see 2 asset cards (Red Dragon, Blue Dragon)
    And I should not see "Green Goblin" or "Treasure Chest"
    And I should see "2 assets found"

  @search
  Scenario: Search assets by description
    Given an asset exists with name "Hero" and description "Brave warrior with sword"
    And an asset exists with name "Villain" and description "Evil wizard"
    When I type "warrior" in the search bar
    And I wait 300ms for debounce
    Then I should see the "Hero" asset
    And I should not see the "Villain" asset

  @search
  Scenario: Search is debounced to avoid excessive API calls
    When I type "d" in the search bar
    And I immediately type "r" (within 100ms)
    And I immediately type "a" (within 100ms)
    Then the API should not be called yet
    When I wait 300ms
    Then the API should be called once with search="dra"

  @search
  Scenario: Clear search shows all assets
    Given I have searched for "dragon" showing 2 results
    When I clear the search bar
    And I wait 300ms for debounce
    Then I should see all my assets
    And the results count should update

  @search
  Scenario: Search with no matches shows empty state
    When I type "nonexistent" in the search bar
    And I wait 300ms for debounce
    Then I should see "0 assets found"
    And I should only see the virtual "Add" card
    And I should see no asset cards

  # ═══════════════════════════════════════════════════════════════
  # FILTERING SYSTEM
  # ═══════════════════════════════════════════════════════════════

  @filtering @happy-path
  Scenario: Filter by ownership - Mine only
    Given I own 3 Object assets (private)
    And another user owns 2 public published Object assets
    And the "Mine" checkbox is checked
    And the "Others" checkbox is unchecked
    When the "Asset Library" page loads
    Then I should see 4 cards (1 "Add" + 3 my assets)
    And I should not see the other user's assets

  @filtering @happy-path
  Scenario: Filter by ownership - Others only
    Given I own 3 Object assets
    And another user owns 2 public published Object assets
    And the "Mine" checkbox is unchecked
    And the "Others" checkbox is checked
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 public assets)
    And I should not see my own assets

  @filtering @happy-path
  Scenario: Filter by ownership - Both Mine and Others
    Given I own 3 Object assets
    And another user owns 2 public published Object assets
    And both "Mine" and "Others" checkboxes are checked
    When the "Asset Library" page loads
    Then I should see 6 cards (1 "Add" + 5 total assets)

  @filtering
  Scenario: Filter by ownership - Neither checked shows no assets
    Given assets exist in the system
    And both "Mine" and "Others" checkboxes are unchecked
    When the "Asset Library" page loads
    Then I should see only the virtual "Add" card
    And I should see "0 assets found"

  @filtering @happy-path
  Scenario: Filter by visibility - Public only
    Given I own 2 public Object assets
    And I own 2 private Object assets
    And the "Mine" checkbox is checked
    And the "Public" checkbox is checked
    And the "Private" checkbox is unchecked
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 public assets)

  @filtering @happy-path
  Scenario: Filter by visibility - Private only
    Given I own 2 public Object assets
    And I own 2 private Object assets
    And the "Private" checkbox is checked
    And the "Public" checkbox is unchecked
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 private assets)

  @filtering @happy-path
  Scenario: Filter by status - Published only
    Given I own 2 published Object assets
    And I own 2 draft Object assets
    And the "Published" checkbox is checked
    And the "Draft" checkbox is unchecked
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 published assets)
    And each asset card should show a "Published" badge

  @filtering @happy-path
  Scenario: Filter by status - Draft only
    Given I own 2 published Object assets
    And I own 2 draft Object assets
    And the "Draft" checkbox is checked
    And the "Published" checkbox is unchecked
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 draft assets)
    And asset cards should not show "Published" badge

  # NOTE: Creature Category filter UI not implemented in Phase 5
  # Filter exists in backend but no UI dropdown in AssetFilterPanel
  # Scenarios removed - will be added when UI is implemented

  @filtering
  Scenario: Changing filters resets to page 1
    Given I have 25 Object assets
    And I am on page 2 of results
    When I change any filter
    Then I should be reset to page 1

  # ═══════════════════════════════════════════════════════════════
  # ASSET CARDS
  # ═══════════════════════════════════════════════════════════════

  @ui @happy-path
  Scenario: Asset card displays correct information
    Given an Object asset exists with:
      | name        | Treasure Chest         |
      | description | Golden treasure chest  |
      | size        | 2×2 cells              |
      | isPublic    | true                   |
      | isPublished | true                   |
      | Token image | /api/media/image-123   |
    When the "Asset Library" page loads
    Then the asset card should show:
      | Name           | Treasure Chest |
      | Image          | Token image    |
      | Size           | 2×2 cells      |
      | Visibility     | Public         |
      | Published badge| Yes            |

  @ui
  Scenario: Asset card shows Creature category badge
    Given a Creature asset exists with category "Monster"
    And I am on the "Creatures" tab
    When the "Asset Library" page loads
    Then the asset card should show a "Monster" badge
    And the badge color should be red

  @ui
  Scenario: Asset card shows Token image exclusively (not Display)
    Given an asset exists with:
      | Token image   | /api/media/token-123   |
      | Display image | /api/media/display-456 |
    When the "Asset Library" page loads
    Then the asset card should show the Token image "/api/media/token-123"
    And should not show the Display image

  @ui
  Scenario: Asset card shows placeholder when no Token image exists
    Given an asset exists with only Display image (no Token)
    When the "Asset Library" page loads
    Then the asset card should show a placeholder icon
    And should not show the Display image

  @ui
  Scenario: Asset card shows placeholder when no resources exist
    Given an asset exists with no resources at all
    When the "Asset Library" page loads
    Then the asset card should show a placeholder icon
    And should not show a broken image

  @ui-interaction
  Scenario: Click asset card opens preview dialog
    Given an Object asset named "Dragon" exists
    When I click the "Dragon" asset card
    Then the Asset Preview Dialog should open
    And the dialog should show the "Dragon" asset details
    And the dialog should be in view mode (not edit mode)

  @ui-feedback
  Scenario: Asset card hover effect
    Given an asset card is visible
    When I hover over the asset card
    Then the card should lift up (translateY -4px)
    And the card shadow should increase

  # ═══════════════════════════════════════════════════════════════
  # PAGINATION
  # ═══════════════════════════════════════════════════════════════

  @pagination @happy-path
  Scenario: Pagination appears when more than 12 assets exist
    Given I own 25 Object assets
    When the "Asset Library" page loads
    Then I should see 13 cards on page 1 (1 "Add" + 12 assets)
    And I should see pagination controls
    And pagination should show "page 1 of 3"
    And I should see "25 assets found"

  @pagination
  Scenario: Navigate to next page
    Given I own 25 Object assets
    And I am on page 1
    When I click page 2 in pagination
    Then I should see 13 cards (1 "Add" + 12 assets)
    And pagination should show "page 2 of 3"
    And the asset cards should show assets 13-24

  @pagination
  Scenario: Navigate to last page shows remaining assets
    Given I own 25 Object assets
    When I navigate to page 3
    Then I should see 2 cards (1 "Add" + 1 asset)
    And pagination should show "page 3 of 3"

  @pagination
  Scenario: Pagination hidden when 12 or fewer assets
    Given I own 10 Object assets
    When the "Asset Library" page loads
    Then I should see 11 cards (1 "Add" + 10 assets)
    And pagination controls should not be visible

  @pagination
  Scenario: Page count updates when filters change
    Given I own 25 Object assets
    And I am viewing page 1 with "3 pages" shown
    When I filter to show only 10 assets
    Then pagination should update to "1 page"
    And I should be on page 1

  # ═══════════════════════════════════════════════════════════════
  # EMPTY STATES
  # ═══════════════════════════════════════════════════════════════

  @edge-case
  Scenario: Empty library shows only "Add" card
    Given I own no assets
    When the "Asset Library" page loads
    Then I should see only the virtual "Add Object" card
    And I should see "0 assets found"
    And pagination should not be visible

  @edge-case
  Scenario: All assets filtered out shows only "Add" card
    Given I own 5 Object assets (all private)
    And I filter to show "Public" only
    When the "Asset Library" page loads
    Then I should see only the virtual "Add Object" card
    And I should see "0 assets found"

  # ═══════════════════════════════════════════════════════════════
  # PERFORMANCE
  # ═══════════════════════════════════════════════════════════════

  @performance
  Scenario: Page loads 100 assets within 500ms threshold
    Given 100 Object assets exist in my library
    When I navigate to the Asset Library page
    Then the initial page should load within 500ms
    And I should see 13 cards (1 "Add" + 12 assets on page 1)
    And pagination should show "page 1 of 9"

  @performance
  Scenario: Search debounce prevents excessive API calls
    When I rapidly type "dragon" (1 character every 50ms)
    Then the API should not be called during typing
    When 300ms pass after the last keystroke
    Then the API should be called exactly once with search="dragon"

  # ═══════════════════════════════════════════════════════════════
  # AUTHORIZATION
  # ═══════════════════════════════════════════════════════════════

  @authorization
  Scenario: Unauthenticated user cannot access asset library
    Given I am not authenticated
    When I navigate to "/assets"
    Then I should be redirected to "/login"

  @authorization
  Scenario: "Others" filter shows only public published assets
    Given another user owns 2 public published assets
    And another user owns 1 public draft asset
    And another user owns 1 private published asset
    And I select "Others" filter only
    When the "Asset Library" page loads
    Then I should see 3 cards (1 "Add" + 2 public published assets)
    And I should not see draft or private assets from others

  # ═══════════════════════════════════════════════════════════════
  # RESPONSIVE DESIGN
  # ═══════════════════════════════════════════════════════════════

  @responsive
  Scenario Outline: Asset cards adapt to screen size
    Given I am viewing the page on a <device> screen
    When the "Asset Library" page loads with 12 assets
    Then each row should show <cards_per_row> cards
    And cards should maintain 1:1 aspect ratio

    Examples:
      | device    | cards_per_row |
      | mobile    | 2             |
      | tablet    | 3             |
      | desktop   | 4             |
      | large     | 6             |

  # ═══════════════════════════════════════════════════════════════
  # THEME SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario: Asset Library supports dark mode
    Given I have dark mode enabled
    When the "Asset Library" page loads
    Then the page background should be dark
    And asset cards should have dark backgrounds
    And the virtual "Add" card should have dark styling
    And Monster badges should be red
    And Character badges should be blue

  @theme
  Scenario: Asset Library supports light mode
    Given I have light mode enabled
    When the "Asset Library" page loads
    Then the page background should be light
    And asset cards should have light backgrounds
    And text should be dark for readability
