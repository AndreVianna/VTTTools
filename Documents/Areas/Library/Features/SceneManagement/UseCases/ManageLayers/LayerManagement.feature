# Generated: 2025-10-12 (Phase 4 BDD Creation)
# Use Case: Manage Layers
# Service: layerManager.ts
# Phase: EPIC-001 Phase 4 - Grid & Layers

@use-case @library @scene-editor @layers
Feature: Layer Management
  As a Game Master
  I want layers to render in the correct z-order
  So that scene elements appear in the right visual stacking (background behind tokens, UI on top)

  Background:
    Given I am authenticated as a Game Master
    And I have opened the scene editor
    And the Konva Stage is initialized

  # ═══════════════════════════════════════════════════════════════
  # LAYER Z-ORDER (PHASE 4: GATE 4 REQUIREMENT)
  # ═══════════════════════════════════════════════════════════════

  Rule: Layers must maintain correct z-order: Background(0) → Grid(1) → Structure(2) → Objects(3) → Agents(4) → Foreground(5) → UI(6)

    @critical @phase4-gate4
    Scenario: Default layer z-order is correct
      When the layer manager initializes
      Then the layers should have the following z-order:
        | Layer Name  | Z-Index |
        | background  | 0       |
        | grid        | 1       |
        | structure   | 2       |
        | objects     | 3       |
        | agents      | 4       |
        | foreground  | 5       |
        | ui          | 6       |
      And background should render first (bottom)
      And ui should render last (top)

    @critical @phase4-gate4
    Scenario: Enforce z-order after layer manipulation
      Given layers have been manually reordered by some operation
      When the layerManager.enforceZOrder() method is called
      Then all layers should return to correct z-order
      And background should be behind all other layers
      And ui should be above all other layers
      And the Stage should batch draw for performance

    @integration
    Scenario: Background layer renders behind grid
      Given the background layer has an image
      And the grid layer has grid lines
      When both layers render
      Then the background image should be visible
      And the grid lines should appear on top of the background
      And the z-order should be: background (0) < grid (1)

    @integration
    Scenario: Grid layer renders behind tokens
      Given the grid layer has grid lines
      And the agents layer has token images
      When both layers render
      Then grid lines should be visible
      And tokens should appear on top of grid lines
      And the z-order should be: grid (1) < agents (4)

    @integration
    Scenario: UI layer renders above all content
      Given the scene has background, grid, and tokens
      And the ui layer has controls/overlays
      When all layers render
      Then the ui layer elements should be on top
      And ui should not be obscured by any other layer

  # ═══════════════════════════════════════════════════════════════
  # LAYER VISIBILITY MANAGEMENT
  # ═══════════════════════════════════════════════════════════════

  Rule: Layers can be shown or hidden independently

    @happy-path @visibility
    Scenario: Toggle grid layer visibility
      Given the grid layer is visible
      When I toggle grid layer visibility
      Then the grid layer should become hidden
      And the grid lines should not be visible on canvas
      And other layers should remain visible

    @happy-path @visibility
    Scenario: Show hidden grid layer
      Given the grid layer is hidden
      When I toggle grid layer visibility
      Then the grid layer should become visible
      And grid lines should reappear on canvas
      And the grid configuration should be preserved

    @visibility
    Scenario: Hide multiple layers independently
      Given all layers are visible
      When I hide the grid layer
      And I hide the structure layer
      Then grid and structure should be hidden
      And background, objects, agents should remain visible
      And layer z-order should be maintained

    @visibility
    Scenario: Set layer visibility programmatically
      When I call layerManager.setLayerVisibility('grid', false)
      Then the grid layer should be hidden
      When I call layerManager.setLayerVisibility('grid', true)
      Then the grid layer should be visible

  # ═══════════════════════════════════════════════════════════════
  # LAYER STATE QUERIES
  # ═══════════════════════════════════════════════════════════════

  @query @integration
  Scenario: Get all layer states
    When I query layerManager.getLayerStates()
    Then I should receive an array of 7 layer states
    And each state should contain: name, visible, zIndex
    And states should be sorted by z-index ascending

  @query
  Scenario: Get specific layer by name
    When I query layerManager.getLayer('grid')
    Then I should receive the Konva Layer instance for grid
    And the layer should have name 'grid'

  # ═══════════════════════════════════════════════════════════════
  # LAYER INITIALIZATION
  # ═══════════════════════════════════════════════════════════════

  @initialization @critical
  Scenario: Initialize layer manager with Konva Stage
    Given the Konva Stage has been created
    When I initialize the layer manager with the Stage
    Then all 7 default layers should be initialized
    And each layer should have correct initial visibility (true)
    And each layer should have correct z-index

  @initialization
  Scenario: Reset layers to default state
    Given layers have been modified (visibility changed, reordered)
    When I call layerManager.reset()
    Then all layers should return to default visibility (all visible)
    And all layers should return to default z-order
    And the Stage should batch draw

  # ═══════════════════════════════════════════════════════════════
  # INTEGRATION WITH GRID RENDERING
  # ═══════════════════════════════════════════════════════════════

  @integration @grid @phase4-gate4
  Scenario: Grid renders on correct layer (layer 1)
    Given a Square grid is configured
    When the GridRenderer component renders
    Then grid lines should be drawn on the 'grid' layer
    And the grid layer should have z-index 1
    And grid should appear above background (0) and below structure (2)

  @integration @grid
  Scenario: Hiding grid layer hides grid lines
    Given a grid is rendered and visible
    When I hide the grid layer via layerManager
    Then the GridRenderer should not be visible
    And the grid layer should still exist (just hidden)
    And showing the layer again should restore grid visibility

  # ═══════════════════════════════════════════════════════════════
  # PERFORMANCE & RENDERING
  # ═══════════════════════════════════════════════════════════════

  @performance @phase4-gate4
  Scenario: Layer operations complete in <100ms
    Given the scene has all 7 layers with content
    When I toggle layer visibility
    Then the operation should complete in less than 100ms
    And the Stage should batch draw efficiently

  @performance
  Scenario: Enforce z-order with 100+ elements
    Given each layer has 20+ elements (140 total)
    When I call enforceZOrder()
    Then the operation should complete in less than 100ms
    And all elements should maintain correct z-order
