# Generated: 2025-10-02
# Use Case: Create Scene

Feature: Create Scene
  As a Game Master
  I want to create a new scene with tactical map configuration
  So that I can build interactive battle environments

  Background:
    Given I am authenticated as a Game Master
    And my user account exists in the Identity context
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Create scene with valid name
      Given I provide scene name "Ancient Temple Battle"
      When I create the scene
      Then the scene should be created with generated ID
      And the scene name should be "Ancient Temple Battle"

    Scenario: Reject scene with empty name
      Given I provide empty scene name
      When I attempt to create the scene
      Then I should see error with validation error
      And I should see error "Scene name is required"

  Rule: Stage dimensions must be positive

    Scenario: Create scene with valid stage dimensions
      Given I provide scene with stage:
        | Width  | Height |
        | 1920   | 1080   |
      When I create the scene
      Then the scene is created
      And the stage width should be 1920
      And the stage height should be 1080

    Scenario: Reject scene with zero width
      Given I provide scene with stage width 0 and height 1080
      When I attempt to create the scene
      Then I should see error with validation error
      And I should see error "Stage dimensions must be positive"

    Scenario: Reject scene with negative height
      Given I provide scene with stage width 1920 and height -100
      When I attempt to create the scene
      Then I should see error with validation error
      And I should see error "Stage dimensions must be positive"

  Rule: Grid configuration must match grid type

    Scenario: Create scene with square grid
      Given I provide scene with grid type "Square"
      And I provide grid size 50
      When I create the scene
      Then the scene is created
      And the grid type should be "Square"
      And the grid size should be 50

    Scenario: Create scene with hexagonal grid
      Given I provide scene with grid type "Hexagonal"
      And I provide hexagonal grid configuration
      When I create the scene
      Then the scene is created
      And the grid should be configured as hexagonal

    Scenario: Create scene with no grid
      Given I provide scene with grid type "None"
      When I create the scene
      Then the scene is created
      And the scene should have no grid overlay

  @happy-path
  Scenario: Successfully create complete scene
    Given I provide valid scene data:
      | Field        | Value                    |
      | Name         | Dragon Cave Encounter    |
      | Description  | Final boss battle scene  |
      | IsPublished  | false                    |
      | IsPublic     | false                    |
    And I configure stage with dimensions 2048x1536
    And I configure square grid with size 64
    When I create the scene
    Then the scene is saved in the database
    And a SceneCreated domain action is logged
    And I should receive the scene with generated ID

  @happy-path
  Scenario: Successfully create scene with placed assets
    Given I provide valid scene data
    And I configure stage and grid
    And I provide 3 initial asset placements
    When I create the scene
    Then the scene is created
    And all 3 assets should be placed on the scene
    And each asset should have position coordinates

  @happy-path
  Scenario: Successfully create standalone scene
    Given I provide valid scene data
    And I do not specify an adventure ID
    When I create the scene
    Then the scene is created
    And the AdventureId should be null

  @happy-path
  Scenario: Successfully create scene within adventure
    Given I own an adventure with ID "550e8400-e29b-41d4-a716-446655440000"
    And I provide valid scene data with that adventure ID
    When I create the scene
    Then the scene is created
    And the AdventureId should be "550e8400-e29b-41d4-a716-446655440000"

  @error-handling
  Scenario: Handle scene creation with non-existent adventure
    Given I provide scene with adventure ID that doesn't exist
    When I attempt to create the scene
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @error-handling
  Scenario: Handle scene creation with invalid background resource
    Given I provide scene with stage background that doesn't exist
    When I attempt to create the scene
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"

  @edge-case
  Scenario: Create scene with maximum stage dimensions
    Given I provide scene with stage width 8192 and height 8192
    When I create the scene
    Then the scene is created
    And the stage dimensions should be preserved

  @data-driven
  Scenario Outline: Create scenes with different grid types
    Given I provide scene with grid type "<grid_type>"
    And I provide appropriate grid configuration for "<grid_type>"
    When I create the scene
    Then the scene is created
    And the grid type should be "<grid_type>"

    Examples:
      | grid_type  |
      | Square     |
      | Hexagonal  |
      | Isometric  |
      | None       |
