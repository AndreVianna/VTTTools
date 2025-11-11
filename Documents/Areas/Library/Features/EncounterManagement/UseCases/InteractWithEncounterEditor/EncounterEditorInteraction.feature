# Generated: 2025-10-12 (Phase 3 BDD Creation)
# Use Case: Interact with Scene Editor
# UI Component: SceneCanvas.tsx
# Phase: EPIC-001 Phase 3 - Scene Editor Panning & Zoom

@use-case @library @scene-editor @ui
Feature: Scene Editor Interaction
  As a Game Master
  I want to pan and zoom the scene canvas intuitively
  So that I can navigate and edit large tactical maps efficiently

  Background:
    Given I am authenticated as a Game Master
    And I have opened the scene editor
    And the scene canvas is fully loaded

  # ═══════════════════════════════════════════════════════════════
  # RIGHT-CLICK PANNING (PHASE 3: AC-01)
  # ═══════════════════════════════════════════════════════════════

  Rule: Right-click drag enables canvas panning without interfering with left-click asset interactions

    @smoke @happy-path @critical @phase3-ac01
    Scenario: Pan canvas with right-click drag
      Given the canvas is at default position (0, 0)
      When I right-click at position (100, 100)
      And I drag to position (300, 200)
      And I release the right mouse button
      Then the canvas should pan by 200 pixels right and 100 pixels down
      And the viewport position should update accordingly
      And panning should feel smooth at 60 FPS

    @ui-interaction
    Scenario: Right-click prevents browser context menu
      Given the scene canvas is visible
      When I right-click on the canvas
      Then the browser context menu should NOT appear
      And I should be able to drag immediately
      And the canvas should be ready for panning

    @ui-interaction
    Scenario: Left-click reserved for asset interactions (not panning)
      Given the canvas is visible
      When I left-click and drag on the canvas
      Then the canvas should NOT pan
      And left-click should be available for future asset placement
      And the viewport should not move

    @edge-case
    Scenario: Pan canvas to large negative offset
      Given the canvas is at position (0, 0)
      When I right-click and drag 500 pixels left and 500 pixels up
      Then the canvas position should be approximately (-500, -500)
      And the viewport should handle negative coordinates correctly

    @edge-case
    Scenario: Pan canvas to large positive offset
      Given the canvas is at position (0, 0)
      When I right-click and drag 2000 pixels right and 1500 pixels down
      Then the canvas should pan to approximately (2000, 1500)
      And rendering should remain smooth

    @integration
    Scenario: Panning updates viewport state
      Given an onViewportChange callback is registered
      And the canvas is at position (0, 0)
      When I pan the canvas by (150, 100)
      Then the onViewportChange callback should be invoked
      And the callback should receive viewport with x=150, y=100
      And the scale should remain unchanged

  # ═══════════════════════════════════════════════════════════════
  # MOUSE WHEEL ZOOM (PHASE 3: AC-02)
  # ═══════════════════════════════════════════════════════════════

  Rule: Mouse wheel zoom adjusts scale within 0.1x to 10x range, zooming to pointer position

    @smoke @happy-path @critical @phase3-ac02
    Scenario: Zoom in with mouse wheel
      Given the canvas is at 100% zoom (scale 1.0)
      When I scroll the mouse wheel up at center of canvas
      Then the canvas should zoom in by zoom factor (1.2x)
      And the new scale should be 1.2
      And the zoom should be centered on the mouse pointer
      And zooming should feel smooth

    @happy-path
    Scenario: Zoom out with mouse wheel
      Given the canvas is at 200% zoom (scale 2.0)
      When I scroll the mouse wheel down
      Then the canvas should zoom out by zoom factor (÷1.2)
      And the new scale should be approximately 1.67
      And the zoom should maintain pointer position

    @boundary @critical
    Scenario: Zoom respects maximum limit (10x)
      Given the canvas is at maximum zoom (10x)
      When I attempt to scroll mouse wheel up
      Then the canvas zoom should remain at 10x
      And no error should be displayed
      And further zoom in should be prevented

    @boundary @critical
    Scenario: Zoom respects minimum limit (0.1x)
      Given the canvas is at minimum zoom (0.1x)
      When I attempt to scroll mouse wheel down
      Then the canvas zoom should remain at 0.1x
      And no error should be displayed
      And further zoom out should be prevented

    @ui-interaction
    Scenario: Zoom-to-pointer maintains visual reference
      Given the canvas is at 100% zoom
      And I position my mouse over a grid intersection at (400, 300)
      When I zoom in with mouse wheel
      Then the grid intersection should remain under my mouse pointer
      And the canvas should adjust position to maintain pointer alignment
      And the zoom should feel natural and intuitive

    @edge-case
    Scenario: Zoom near maximum limit
      Given the canvas is at 9.5x zoom
      When I scroll mouse wheel up twice
      Then the first zoom should succeed (reaching 10x)
      And the second zoom should be clamped at 10x
      And the zoom should stop smoothly at the limit

    @edge-case
    Scenario: Zoom near minimum limit
      Given the canvas is at 0.12x zoom
      When I scroll mouse wheel down twice
      Then the first zoom should succeed (reaching 0.1x)
      And the second zoom should be clamped at 0.1x

    @integration
    Scenario: Zooming updates viewport state
      Given an onViewportChange callback is registered
      And the canvas is at scale 1.0
      When I zoom in with mouse wheel
      Then the onViewportChange callback should be invoked
      And the callback should receive updated scale
      And the callback should receive adjusted x/y position for zoom-to-pointer

  # ═══════════════════════════════════════════════════════════════
  # PROGRAMMATIC VIEWPORT CONTROL (IMPERATIVE API)
  # ═══════════════════════════════════════════════════════════════

  Rule: Programmatic controls enable toolbar integration and state management

    @happy-path @imperative-api
    Scenario: Zoom in programmatically via toolbar button
      Given the scene editor toolbar is visible
      And the canvas is at scale 1.0
      When I click the "Zoom In" toolbar button
      Then the SceneCanvas.zoomIn() method should be called
      And the canvas should zoom to 1.2
      And the viewport callback should be triggered

    @happy-path @imperative-api
    Scenario: Zoom out programmatically via toolbar button
      Given the canvas is at scale 2.0
      When I click the "Zoom Out" toolbar button
      Then the SceneCanvas.zoomOut() method should be called
      And the canvas should zoom to approximately 1.67

    @imperative-api
    Scenario: Reset viewport programmatically
      Given the canvas has been panned to (500, 300)
      And the canvas has been zoomed to 3x
      When I click the "Reset View" toolbar button
      Then the SceneCanvas.resetView() method should be called
      And the canvas should return to position (0, 0)
      And the zoom should return to 1.0

    @imperative-api
    Scenario: Set viewport programmatically
      Given I have a saved viewport state (x: 250, y: 180, scale: 1.5)
      When I programmatically set the viewport to that state
      Then the canvas should move to position (250, 180)
      And the zoom should be set to 1.5
      And the viewport callback should be invoked

    @imperative-api
    Scenario: Get current viewport state for persistence
      Given the canvas is at position (400, 250) with scale 2.5
      When I query the current viewport state
      Then I should receive viewport object with x: 400, y: 250, scale: 2.5
      And the state should be serializable for storage

  # ═══════════════════════════════════════════════════════════════
  # PERFORMANCE (60 FPS REQUIREMENT)
  # ═══════════════════════════════════════════════════════════════

  Rule: Canvas operations must maintain 60 FPS for smooth user experience

    @performance @critical @phase3-sc03
    Scenario: Maintain 60 FPS during continuous panning
      Given the scene has a 2048x2048 background image
      And performance monitoring is active
      When I pan the canvas continuously for 3 seconds
      Then the frame rate should remain at or above 60 FPS
      And no dropped frames should be detected
      And panning should feel responsive

    @performance @critical
    Scenario: Maintain 60 FPS during continuous zooming
      Given the scene has background and grid configured
      When I zoom in and out continuously for 3 seconds
      Then the frame rate should remain at or above 60 FPS
      And zoom should feel smooth without stuttering

    @performance
    Scenario: Performance remains stable with complex scenes
      Given the scene has a 4096x4096 background
      And the scene has hexagonal grid configured
      When I perform 20 pan and zoom operations
      Then all operations should complete smoothly
      And frame rate should not degrade below 55 FPS

  # ═══════════════════════════════════════════════════════════════
  # VIEWPORT STATE SYNCHRONIZATION
  # ═══════════════════════════════════════════════════════════════

  @integration @state
  Scenario: Viewport state persists during scene editor session
    Given I pan to position (300, 200)
    And I zoom to 2.5x
    When I place an asset on the scene
    Then the viewport position should remain at (300, 200)
    And the zoom should remain at 2.5x
    And the view should not reset unexpectedly

  @integration @state
  Scenario: Viewport callback enables external state sync
    Given a parent component tracks viewport state
    When I pan the canvas
    Then the parent component should receive viewport updates
    When I zoom the canvas
    Then the parent should receive updated scale
    And external UI (zoom percentage, coordinates) should sync

  # ═══════════════════════════════════════════════════════════════
  # ERROR HANDLING & EDGE CASES
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Handle rapid scroll wheel inputs gracefully
    When I rapidly scroll the mouse wheel up and down
    Then the canvas should handle all events smoothly
    And zoom should not flicker or jump
    And the final zoom level should be stable

  @edge-case
  Scenario: Handle pan during zoom operation
    Given I am zooming in with mouse wheel
    When I simultaneously right-click and start panning
    Then both operations should complete smoothly
    And the canvas should handle concurrent gestures

  @edge-case
  Scenario: Handle canvas interaction on different screen sizes
    Given I am on a <device> device
    When I pan and zoom the canvas
    Then interactions should work correctly
    And touch gestures should be supported on mobile

  # ═══════════════════════════════════════════════════════════════
  # ACCESSIBILITY & THEME
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario: Canvas background adapts to theme
    Given I have <theme> mode enabled
    When the scene canvas loads
    Then the canvas background color should use <theme> styling
    And the canvas should be visible and usable

  @accessibility
  Scenario: Keyboard shortcuts for zoom (future enhancement)
    Given the canvas is focused
    When I press Ctrl + Plus
    Then the canvas should zoom in
    When I press Ctrl + Minus
    Then the canvas should zoom out
    When I press Ctrl + 0
    Then the canvas should reset to 100% zoom
