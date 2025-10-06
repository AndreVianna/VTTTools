# Generated: 2025-10-02
# Feature: Scene Management

Feature: Scene Management
  As a Game Master
  I want to manage interactive tactical maps with stage, grid, and asset placement
  So that I can create complete battle scenes for game sessions

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Scene name is required and cannot exceed 128 characters

    Scenario: Create scene with valid name length
      Given I provide scene name "Dragon's Lair Entrance"
      When I create the scene
      Then the scene is created
      And I should see the scene in my library

    Scenario: Reject scene with empty name
      Given I provide empty scene name
      When I attempt to create the scene
      Then I should see error
      And I should see error "Scene name is required"

  Rule: Stage dimensions must be positive

    Scenario: Create scene with valid stage dimensions
      Given I provide scene with stage width 1920 and height 1080
      When I create the scene
      Then the scene is created
      And the stage dimensions should be set correctly

    Scenario: Reject scene with zero or negative dimensions
      Given I provide scene with stage width 0 and height 1080
      When I attempt to create the scene
      Then I should see error
      And I should see error "Stage dimensions must be positive"

  Rule: Grid configuration must match grid type

    Scenario: Create scene with square grid
      Given I provide scene with grid type "Square"
      And I provide square grid size 50
      When I create the scene
      Then the scene is created
      And the grid should be configured as square

    Scenario: Reject scene with invalid grid configuration
      Given I provide scene with grid type "Hexagonal"
      And I provide incompatible grid parameters
      When I attempt to create the scene
      Then I should see error
      And I should see error "Grid configuration must match grid type"

  Rule: Scene cannot be deleted if referenced by active game session

    Scenario: Delete scene not in active session
      Given my scene is not referenced by any active game session
      When I delete the scene
      Then the scene is removed successfully

    Scenario: Reject deletion of scene in active game session
      Given my scene is referenced by an active game session
      When I attempt to delete the scene
      Then I should see error
      And I should see error "Cannot delete scene referenced by active game session"

  @happy-path
  Scenario: Successfully create complete scene with stage, grid, and assets
    Given I provide valid scene data
    And I configure stage with background image and dimensions
    And I configure grid with type "Square" and size 50
    And I place 5 assets on the scene
    When I create the scene
    Then the scene is created
    And the stage should be configured correctly
    And the grid should be configured correctly
    And all 5 assets should be placed

  @happy-path
  Scenario: Successfully clone scene with all components
    Given I have a scene with stage, grid, and 8 placed assets
    When I clone the scene
    Then a new scene should be created
    And the stage configuration should be duplicated
    And the grid configuration should be duplicated
    And all 8 assets should be duplicated with new IDs

  @edge-case
  Scenario: Create scene with different grid types
    Given I create scenes with each grid type:
      | GridType    |
      | Square      |
      | Hexagonal   |
      | Isometric   |
      | None        |
    Then all scenes is created
    And each should have the correct grid configuration
