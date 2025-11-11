# Generated: 2025-10-02
# Use Case: Configure Grid

Feature: Configure Grid
  As a Game Master
  I want to configure the grid overlay for a encounter
  So that I can set grid type, size, offset, and appearance

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    

  Rule: Grid configuration must match grid type

    Scenario: Configure valid square grid
      Given my encounter exists
      When I configure grid with type "Square" and size 50
      Then the grid is updated successfully
      And the grid type should be "Square"
      And the grid size should be 50

    Scenario: Configure valid hexagonal grid
      Given my encounter exists
      When I configure grid with type "Hexagonal" and hexagonal parameters
      Then the grid is updated successfully
      And the grid type should be "Hexagonal"

    Scenario: Reject grid configuration with invalid parameters
      Given my encounter exists
      When I attempt to configure grid with type "Square" and incompatible parameters
      Then I should see error with validation error
      And I should see error "Grid configuration must match grid type"

  @happy-path
  Scenario: Successfully configure complete grid
    Given my encounter exists
    When I configure grid with:
      | Property | Value  |
      | Type     | Square |
      | Size     | 64     |
      | OffsetX  | 32     |
      | OffsetY  | 32     |
      | Color    | Black  |
    Then the grid is updated successfully
    And all grid properties should be set correctly

  @happy-path
  Scenario: Successfully update existing grid configuration
    Given my encounter has square grid with size 50
    When I update grid size to 100
    Then the grid is updated successfully
    And the grid size should be 100

  @happy-path
  Scenario: Successfully change grid type
    Given my encounter has square grid
    When I change grid type to "Hexagonal"
    And I provide appropriate hexagonal parameters
    Then the grid is updated successfully
    And the grid type should be "Hexagonal"

  @happy-path
  Scenario: Successfully disable grid overlay
    Given my encounter has configured grid
    When I set grid type to "None"
    Then the grid is updated successfully
    And the encounter should have no grid overlay

  @error-handling
  Scenario: Handle grid configuration for non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to configure grid for encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @authorization
  Scenario: User cannot configure grid for encounter they don't own
    Given a encounter exists owned by another user
    When I attempt to configure grid for that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this encounter"

  @edge-case
  Scenario: Configure grid with zero offset
    Given my encounter exists
    When I configure grid with offsetX 0 and offsetY 0
    Then the grid is updated successfully
    And the offsets should be zero

  @edge-case
  Scenario: Configure grid with negative offset
    Given my encounter exists
    When I configure grid with offsetX -50 and offsetY -50
    Then the grid is updated successfully
    And the negative offsets should be preserved

  @integration
  Scenario: Configure grid preserves stage and asset placements
    Given my encounter has configured stage and 8 placed assets
    When I update the grid configuration
    Then the grid is updated
    And the stage configuration should remain unchanged
    And all asset placements should remain intact

  @data-driven
  Scenario Outline: Configure different grid types
    Given my encounter exists
    When I configure grid with type "<grid_type>"
    And I provide appropriate configuration for "<grid_type>"
    Then the grid is updated successfully
    And the grid type should be "<grid_type>"

    Examples:
      | grid_type  |
      | Square     |
      | Hexagonal  |
      | Isometric  |
      | None       |
