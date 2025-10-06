# Generated: 2025-10-02
# Use Case: Get Scene By ID

Feature: Get Scene By ID
  As a Game Master
  I want to retrieve a scene by its ID
  So that I can view complete scene configuration with stage, grid, and assets

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve existing scene
    Given a scene exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the scene has name "Volcanic Cavern"
    When I request the scene by ID "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive the scene details
    And the scene name should be "Volcanic Cavern"

  @happy-path
  Scenario: Successfully retrieve scene with complete composition
    Given a scene exists with:
      | Component      | Status       |
      | Stage          | configured   |
      | Grid           | configured   |
      | Assets         | 12 placed    |
    When I request the scene by its ID
    Then I should receive the scene details
    And the stage configuration should be included
    And the grid configuration should be included
    And all 12 asset placements should be included

  @happy-path
  Scenario: Successfully retrieve scene with stage configuration
    Given a scene exists with stage:
      | Property   | Value              |
      | Background | image-resource-id  |
      | Width      | 1920               |
      | Height     | 1080               |
      | ViewportX  | 0                  |
      | ViewportY  | 0                  |
    When I request the scene by its ID
    Then I should receive the complete stage configuration
    And all stage properties should be correct

  @happy-path
  Scenario: Successfully retrieve scene with grid configuration
    Given a scene exists with square grid:
      | Property | Value  |
      | Type     | Square |
      | Size     | 50     |
      | OffsetX  | 0      |
      | OffsetY  | 0      |
      | Color    | Black  |
    When I request the scene by its ID
    Then I should receive the complete grid configuration
    And all grid properties should be correct

  @error-handling
  Scenario: Handle request for non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request the scene by ID "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @error-handling
  Scenario: Handle request with invalid ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to request the scene
    Then I should see error with validation error
    And I should see error "Invalid scene ID format"

  @edge-case
  Scenario: Retrieve scene with no asset placements
    Given a scene exists with stage and grid but no assets
    When I request the scene by its ID
    Then I should receive the scene details
    And the assets collection should be empty

  @data-driven
  Scenario Outline: Retrieve scenes with different grid types
    Given a scene exists with grid type "<grid_type>"
    When I request the scene by its ID
    Then I should receive the scene details
    And the grid type should be "<grid_type>"

    Examples:
      | grid_type  |
      | Square     |
      | Hexagonal  |
      | Isometric  |
      | None       |
