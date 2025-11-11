# Generated: 2025-11-04 (Phase 6 Step 6.10)
# Use Case: Wall Undo/Redo Management
# UI Component: WallDrawingTool.tsx, useWallTransaction.ts
# Phase: EPIC-001 Phase 6 - Wall Drawing with Undo/Redo Support

@use-case @library @encounter-editor @walls @undo-redo
Feature: Wall Undo/Redo Management
  As a Game Master
  I want to undo and redo wall operations during placement and editing
  So that I can efficiently correct mistakes and explore different wall configurations

  Background:
    Given I am authenticated as a Game Master
    And I have opened the encounter editor for a test encounter
    And the encounter canvas is fully loaded
    And the default wall height is set to 10 feet

  # ═══════════════════════════════════════════════════════════════
  # LOCAL UNDO DURING PLACEMENT (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Local undo during placement removes poles in reverse order without exiting placement mode

    @smoke @happy-path @critical @local-undo
    Scenario: Undo pole placement during wall drawing
      Given I am in wall placement mode
      When I place a pole at position (100, 100)
      And I place a pole at position (200, 100)
      And I place a pole at position (300, 100)
      Then I should see 3 poles on the canvas
      When I press Ctrl+Z
      Then I should see 2 poles on the canvas
      And the pole at (300, 100) should be removed
      When I press Ctrl+Z again
      Then I should see 1 pole on the canvas
      And the pole at (200, 100) should be removed

    @happy-path @local-undo
    Scenario: Redo pole placement during wall drawing
      Given I am in wall placement mode
      And I have placed 3 poles
      When I press Ctrl+Z to undo the last pole
      Then I should see 2 poles on the canvas
      When I press Ctrl+Y to redo
      Then I should see 3 poles on the canvas
      And the third pole should be restored

    @edge-case @local-undo
    Scenario: Undo with empty local stack does not exit placement mode
      Given I am in wall placement mode
      When I place 1 pole at position (100, 100)
      And I press Ctrl+Z
      Then I should see 0 poles on the canvas
      When I press Ctrl+Z repeatedly
      Then I should still be in wall placement mode
      And no error should be shown
      And I should be able to place new poles

    @edge-case @local-undo
    Scenario: Redo with empty redo stack has no effect
      Given I am in wall placement mode
      And I have placed 2 poles
      When I press Ctrl+Y to redo
      Then I should still see 2 poles on the canvas
      And no error should be shown

    @integration @local-undo
    Scenario: Multiple undo and redo operations during placement
      Given I am in wall placement mode
      When I place poles at positions:
        | x   | y   |
        | 100 | 100 |
        | 200 | 100 |
        | 300 | 100 |
        | 400 | 100 |
      Then I should see 4 poles on the canvas
      When I press Ctrl+Z twice
      Then I should see 2 poles on the canvas
      When I press Ctrl+Y once
      Then I should see 3 poles on the canvas
      When I press Ctrl+Z once
      Then I should see 2 poles on the canvas

  # ═══════════════════════════════════════════════════════════════
  # LOCAL UNDO DURING EDIT MODE (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Local undo during editing reverts pole movements and deletions within the transaction

    @smoke @happy-path @critical @edit-undo
    Scenario: Undo pole move during wall editing
      Given I have a wall "Wall 1" with poles:
        | x   | y   |
        | 100 | 100 |
        | 200 | 100 |
        | 300 | 100 |
        | 400 | 100 |
      And I am editing wall "Wall 1"
      When I drag pole 2 from (200, 100) to (200, 200)
      Then pole 2 should be at position (200, 200)
      When I press Ctrl+Z
      Then pole 2 should return to position (200, 100)
      And the wall should maintain its original shape

    @happy-path @edit-undo
    Scenario: Undo pole deletion during wall editing
      Given I have a wall with 4 poles
      And I am editing the wall
      When I select pole 3 and press Delete
      Then I should see 3 poles on the wall
      When I press Ctrl+Z
      Then I should see 4 poles on the wall
      And pole 3 should be restored at its original position

    @happy-path @edit-undo
    Scenario: Redo pole move during wall editing
      Given I have a wall with 4 poles
      And I am editing the wall
      When I drag pole 1 to a new position
      And I press Ctrl+Z to undo the move
      And I press Ctrl+Y to redo
      Then pole 1 should be at the new position

    @integration @edit-undo
    Scenario: Multiple edit operations with undo and redo
      Given I have a wall with 5 poles
      And I am editing the wall
      When I drag pole 2 to position (200, 200)
      And I drag pole 4 to position (400, 200)
      And I delete pole 3
      Then I should see 4 poles on the wall
      When I press Ctrl+Z
      Then pole 3 should be restored
      When I press Ctrl+Z
      Then pole 4 should return to its original position
      When I press Ctrl+Y
      Then pole 4 should be at position (400, 200)

  # ═══════════════════════════════════════════════════════════════
  # GLOBAL UNDO AFTER WALL COMMIT (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Global undo after committing wall creation removes the wall from the encounter

    @smoke @happy-path @critical @global-undo
    Scenario: Undo wall creation after commit
      Given I am in wall placement mode
      When I place poles at positions:
        | x   | y   |
        | 100 | 100 |
        | 200 | 100 |
        | 300 | 100 |
      And I press Enter to finish placement
      And I wait for the wall to be created on the server
      Then I should see wall "Wall 1" in the encounter
      And I should be in normal mode
      When I press Ctrl+Z
      Then wall "Wall 1" should be removed from the encounter
      And the encounter should not contain any walls

    @happy-path @global-undo
    Scenario: Redo wall creation after undo
      Given I created a wall "Wall 1" with 3 poles
      And I pressed Ctrl+Z to undo the creation
      Then the wall should be removed from the encounter
      When I press Ctrl+Y to redo
      Then wall "Wall 1" should be recreated
      And the wall should have 3 poles at their original positions

    @integration @global-undo
    Scenario: Undo wall creation does not affect other walls
      Given I have an existing wall "Wall 1" in the encounter
      When I create a new wall "Wall 2" with 3 poles
      And I wait for the wall to be created on the server
      And I press Ctrl+Z
      Then wall "Wall 2" should be removed from the encounter
      But wall "Wall 1" should remain in the encounter
      And wall "Wall 1" should be unchanged

  # ═══════════════════════════════════════════════════════════════
  # GLOBAL UNDO AFTER WALL EDIT COMMIT (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Global undo after committing wall edits reverts the wall to its pre-edit state

    @smoke @happy-path @critical @global-undo-edit
    Scenario: Undo wall edit after commit
      Given I have a wall "Wall 1" with poles:
        | x   | y   |
        | 100 | 100 |
        | 200 | 100 |
        | 300 | 100 |
        | 400 | 100 |
      And I am editing wall "Wall 1"
      When I move pole 2 to position (200, 200)
      And I move pole 4 to position (400, 200)
      And I delete pole 3
      And I press Enter to finish editing
      And I wait for changes to be saved to the server
      Then wall "Wall 1" should have 3 poles
      When I press Ctrl+Z
      Then wall "Wall 1" should revert to its state before editing
      And wall "Wall 1" should have 4 poles at their original positions

    @happy-path @global-undo-edit
    Scenario: Redo wall edit after undo
      Given I have a wall with 4 poles
      And I edited the wall by moving 2 poles
      And I pressed Enter to commit the changes
      And I pressed Ctrl+Z to undo the edit
      Then the wall should revert to its original state
      When I press Ctrl+Y to redo
      Then the wall edits should be reapplied
      And the 2 poles should be at their edited positions

    @integration @global-undo-edit
    Scenario: Multiple wall edits with undo and redo
      Given I have a wall "Wall 1" with 4 poles
      When I edit the wall and move pole 2
      And I press Enter to commit
      And I edit the wall again and delete pole 3
      And I press Enter to commit
      Then wall "Wall 1" should have 3 poles
      When I press Ctrl+Z
      Then wall "Wall 1" should have 4 poles
      When I press Ctrl+Z again
      Then pole 2 should return to its original position before all edits

  # ═══════════════════════════════════════════════════════════════
  # WALL BREAK UNDO AFTER COMMIT (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Global undo after breaking a wall restores the original wall and removes segments

    @smoke @critical @wall-break-undo
    Scenario: Undo wall break after commit
      Given I have a wall "Wall 1" with poles:
        | x   | y   |
        | 0   | 0   |
        | 100 | 0   |
        | 200 | 0   |
        | 300 | 0   |
        | 400 | 0   |
        | 500 | 0   |
      And I am editing wall "Wall 1"
      When I select pole 3 at position (200, 0)
      And I press Alt+Delete to break the wall at pole 3
      Then the wall should be split into 2 segments
      And I should see segment previews
      When I press Enter to finish editing
      And I wait for the wall break to be saved to the server
      Then I should see wall "Wall 1.1" with 3 poles
      And I should see wall "Wall 1.2" with 4 poles
      And the original wall "Wall 1" should be removed
      When I press Ctrl+Z
      Then the original wall "Wall 1" should be restored with 6 poles
      And wall "Wall 1.1" should be removed
      And wall "Wall 1.2" should be removed

    @happy-path @wall-break-undo
    Scenario: Redo wall break after undo
      Given I have a wall with 6 poles
      And I broke the wall at pole 3 creating 2 segments
      And I pressed Ctrl+Z to undo the break
      Then the original wall should be restored
      When I press Ctrl+Y to redo
      Then the wall should be split into 2 segments again
      And the segment names should be preserved

    @integration @wall-break-undo
    Scenario: Multiple wall breaks with undo
      Given I have a wall "Wall 1" with 8 poles
      When I edit and break the wall at pole 4
      And I press Enter to commit
      Then I should see "Wall 1.1" and "Wall 1.2"
      When I edit "Wall 1.1" and break it at pole 2
      And I press Enter to commit
      Then I should see "Wall 1.1.1", "Wall 1.1.2", and "Wall 1.2"
      When I press Ctrl+Z
      Then "Wall 1.1" should be restored
      And "Wall 1.1.1" and "Wall 1.1.2" should be removed

  # ═══════════════════════════════════════════════════════════════
  # UNDO/REDO INTERACTION WITH WALL PROPERTIES (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  Rule: Undo and redo operations preserve wall properties like visibility, color, and material

    @happy-path @properties
    Scenario: Undo wall creation preserves all wall properties
      Given I am in wall placement mode
      And I set wall visibility to "GM Only"
      And I set wall color to "#FF0000"
      And I set wall material to "Stone"
      When I place 3 poles and press Enter
      And I wait for wall creation
      And I press Ctrl+Z
      Then the wall should be removed
      When I press Ctrl+Y
      Then the wall should be recreated
      And the wall visibility should be "GM Only"
      And the wall color should be "#FF0000"
      And the wall material should be "Stone"

    @happy-path @properties
    Scenario: Undo wall edit preserves property changes
      Given I have a wall with visibility "Normal"
      And I edit the wall and change visibility to "Hidden"
      And I press Enter to commit
      When I press Ctrl+Z
      Then the wall visibility should revert to "Normal"
      When I press Ctrl+Y
      Then the wall visibility should be "Hidden" again

  # ═══════════════════════════════════════════════════════════════
  # ERROR HANDLING & EDGE CASES (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Handle undo when server operation fails
    Given I created a wall with 3 poles
    And the server is temporarily unavailable
    When I press Ctrl+Z
    Then I should see an error message about server unavailability
    And the wall should remain in the encounter
    And I should be able to retry the undo operation

  @edge-case
  Scenario: Undo after canceling wall placement
    Given I am in wall placement mode
    And I have placed 2 poles
    When I press Escape to cancel
    Then I should exit placement mode
    And the poles should not be saved
    When I press Ctrl+Z
    Then no undo operation should occur
    And I should remain in normal mode

  @edge-case
  Scenario: Redo after starting new wall placement clears redo stack
    Given I created a wall "Wall 1"
    And I pressed Ctrl+Z to undo
    When I start placing a new wall "Wall 2"
    And I press Ctrl+Y
    Then no redo operation should occur
    And "Wall 1" should remain removed
    And I should continue placing "Wall 2"

  @edge-case
  Scenario: Rapid undo operations do not corrupt wall state
    Given I have a wall with 10 poles
    And I am editing the wall
    When I make 5 pole modifications
    And I rapidly press Ctrl+Z 10 times
    Then the wall should stabilize at its original state
    And no errors should be displayed
    And the wall should be valid

  @integration
  Scenario: Undo stack survives encounter editor interactions
    Given I created a wall "Wall 1"
    When I pan the canvas
    And I zoom in on the canvas
    And I toggle grid visibility
    And I press Ctrl+Z
    Then wall "Wall 1" should be removed
    And the undo operation should work correctly

  @integration
  Scenario: Global undo stack is separate from local undo stack
    Given I am in wall placement mode
    And I have placed 2 poles
    When I press Ctrl+Z
    Then the last pole should be removed (local undo)
    And I should still be in placement mode
    When I press Enter to finish
    And I wait for wall creation
    And I press Ctrl+Z
    Then the wall should be removed from encounter (global undo)
    And I should be in normal mode

  # ═══════════════════════════════════════════════════════════════
  # ACCESSIBILITY & USER FEEDBACK (PHASE 6.10)
  # ═══════════════════════════════════════════════════════════════

  @accessibility
  Scenario: Keyboard shortcuts are documented and discoverable
    Given I am in wall placement mode
    When I press F1 or access the help menu
    Then I should see documentation for:
      | Shortcut | Action                    |
      | Ctrl+Z   | Undo last operation       |
      | Ctrl+Y   | Redo last undone operation|
      | Enter    | Finish and commit wall    |
      | Escape   | Cancel without saving     |

  @ui-feedback
  Scenario: Visual feedback for undo/redo availability
    Given I am in wall placement mode
    When I have not placed any poles
    Then the undo button should be disabled
    And the redo button should be disabled
    When I place 1 pole
    Then the undo button should be enabled
    And the redo button should remain disabled
    When I press Ctrl+Z
    Then the undo button should be disabled
    And the redo button should be enabled

  @ui-feedback
  Scenario: Toast notification for undo/redo operations
    Given I created a wall "Wall 1"
    When I press Ctrl+Z
    Then I should see a toast notification "Wall creation undone"
    When I press Ctrl+Y
    Then I should see a toast notification "Wall creation redone"
