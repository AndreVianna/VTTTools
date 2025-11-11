# Generated: 2025-10-12 (Phase 4 BDD Enhancement)
# Use Case: Grid Renderer UI
# UI Component: GridRenderer.tsx, GridConfigPanel.tsx
# Phase: EPIC-001 Phase 4 - Grid & Layers

@use-case @library @encounter-editor @grid @ui
Feature: Grid Renderer UI
  As a Game Master
  I want to configure and visualize different grid types on my encounter
  So that I can provide tactical positioning guidance for players

  Background:
    Given I am authenticated as a Game Master
    And I have opened the encounter editor
    And the encounter has a configured stage

  # ═══════════════════════════════════════════════════════════════
  # GRID TYPE RENDERING (5 TYPES)
  # ═══════════════════════════════════════════════════════════════

  Rule: All 5 grid types must render visually correctly on the canvas

    @smoke @happy-path @critical @phase4-gate4
    Scenario: Render Square grid with default settings
      Given I select grid type "Square"
      And I set cell size to 50x50 pixels
      When the grid renders
      Then I should see a square grid overlay on the canvas
      And grid lines should be evenly spaced at 50 pixel intervals
      And grid should render at 60 FPS

    @happy-path @phase4-gate4
    Scenario: Render Hexagonal Horizontal (flat-top) grid
      Given I select grid type "HexH"
      And I set cell dimensions to 50x50 pixels
      When the grid renders
      Then I should see flat-top hexagons arranged horizontally
      And hexagons should have correct spacing (width × 0.75)
      And alternating rows should be offset correctly

    @happy-path @phase4-gate4
    Scenario: Render Hexagonal Vertical (pointy-top) grid
      Given I select grid type "HexV"
      And I set cell dimensions to 50x50 pixels
      When the grid renders
      Then I should see pointy-top hexagons arranged vertically
      And hexagons should have correct spacing (height × 0.75)
      And alternating columns should be offset correctly

    @happy-path @phase4-gate4
    Scenario: Render Isometric (diamond) grid
      Given I select grid type "Isometric"
      And I set tile size to 64x32 pixels
      When the grid renders
      Then I should see diamond-shaped grid cells
      And cells should be oriented at 45-degree angles
      And the isometric projection should be accurate

    @happy-path
    Scenario: Disable grid overlay (NoGrid)
      Given the encounter has a Square grid configured
      When I set grid type to "NoGrid"
      Then no grid lines should be visible on the canvas
      And the encounter should show only background and placed assets
      And the grid layer should be hidden

  # ═══════════════════════════════════════════════════════════════
  # GRID CONFIGURATION UI (GridConfigPanel)
  # ═══════════════════════════════════════════════════════════════

  Rule: Grid configuration UI enables real-time grid customization

    @ui-interaction @happy-path
    Scenario: Configure grid via GridConfigPanel form
      Given the GridConfigPanel is visible
      When I select grid type "Square" from dropdown
      And I set cell width to 64
      And I set cell height to 64
      And I choose grid color "#000000" (black)
      Then the grid should update in real-time (<100ms)
      And the canvas should show the new grid configuration

    @ui-interaction
    Scenario: Change grid color
      Given a Square grid is configured with black color
      When I open the color picker in GridConfigPanel
      And I select color "#FF0000" (red)
      Then the grid lines should change to red immediately
      And the grid should re-render smoothly

    @ui-interaction
    Scenario: Adjust grid offset
      Given a Square grid is configured
      When I set offsetX to 25
      And I set offsetY to 25
      Then the entire grid should shift 25 pixels right and down
      And grid alignment should update in real-time

    @validation @ui
    Scenario: Grid cell dimensions must be positive (INV-10)
      Given the GridConfigPanel is open
      When I attempt to set cell width to 0
      Then the input should show validation error
      And the save button should be disabled
      When I set cell width to 50 (positive)
      Then the validation error should clear
      And the save button should be enabled

    @validation @ui
    Scenario: Prevent negative grid cell dimensions
      When I attempt to set cell height to -20
      Then the input should reject the negative value
      Or show validation error "Cell dimensions must be positive"

    @ui-interaction
    Scenario: Grid config changes persist to database
      Given I configure a Hexagonal grid
      When I save the grid configuration
      Then a PATCH /api/encounters/{id} request should be sent
      And the encounter record should be updated with new grid config
      When I reload the encounter editor
      Then the Hexagonal grid should be restored

  # ═══════════════════════════════════════════════════════════════
  # GRID SCALES WITH VIEWPORT ZOOM
  # ═══════════════════════════════════════════════════════════════

  Rule: Grid rendering must scale correctly with viewport zoom

    @integration @zoom @critical
    Scenario: Grid scales with viewport zoom
      Given a Square grid with 50px cells is configured
      And the viewport is at 100% zoom (1x)
      When I zoom in to 200% (2x)
      Then grid cells should appear as 100px (50 × 2)
      And grid lines should scale proportionally
      And grid should remain crisp and clear

    @integration @zoom
    Scenario: Grid remains visible at maximum zoom (10x)
      Given a Square grid is configured
      When I zoom to maximum (10x)
      Then grid lines should still be visible
      And grid should not become pixelated
      And rendering should remain at 60 FPS

    @integration @zoom
    Scenario: Grid remains usable at minimum zoom (0.1x)
      Given a Square grid is configured
      When I zoom to minimum (0.1x)
      Then grid lines should still be distinguishable
      And the grid should not disappear or become too dense
      And rendering performance should remain smooth

  # ═══════════════════════════════════════════════════════════════
  # GRID PANS WITH CANVAS
  # ═══════════════════════════════════════════════════════════════

  Rule: Grid must pan with canvas viewport to maintain alignment

    @integration @pan @critical
    Scenario: Grid pans with right-click canvas drag
      Given a Square grid is configured
      And the canvas is at position (0, 0)
      When I right-click and pan the canvas by (200, 150)
      Then the grid should move with the canvas
      And grid alignment should be maintained
      And grid intersection should align with background features

    @integration @pan
    Scenario: Grid offset preserved during panning
      Given a grid is configured with offsetX: 25, offsetY: 25
      When I pan the canvas by (100, 100)
      Then the grid offset should remain at 25, 25
      And the grid should pan as a unit with its offset

  # ═══════════════════════════════════════════════════════════════
  # THEME SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario: Grid color adapts to theme by default
    Given I have dark mode enabled
    And no custom grid color is set
    When a grid is configured
    Then the grid should use a theme-appropriate default color
    And grid should be visible against dark background

  @theme
  Scenario: Custom grid color overrides theme
    Given I set grid color to "#FF00FF" (magenta)
    When I switch between light and dark themes
    Then the grid color should remain magenta
    And the custom color should override theme defaults
