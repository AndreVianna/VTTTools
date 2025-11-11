# Generated: 2025-10-02
# Feature: Encounter Management

Feature: Encounter Management
  As a Game Master
  I want to manage interactive tactical maps with stage, grid, and asset placement
  So that I can create complete battle encounters for game sessions

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Encounter name is required and cannot exceed 128 characters

    Scenario: Create encounter with valid name length
      Given I provide encounter name "Dragon's Lair Entrance"
      When I create the encounter
      Then the encounter is created
      And I should see the encounter in my library

    Scenario: Reject encounter with empty name
      Given I provide empty encounter name
      When I attempt to create the encounter
      Then I should see error
      And I should see error "Encounter name is required"

  Rule: Stage dimensions must be positive

    Scenario: Create encounter with valid stage dimensions
      Given I provide encounter with stage width 1920 and height 1080
      When I create the encounter
      Then the encounter is created
      And the stage dimensions should be set correctly

    Scenario: Reject encounter with zero or negative dimensions
      Given I provide encounter with stage width 0 and height 1080
      When I attempt to create the encounter
      Then I should see error
      And I should see error "Stage dimensions must be positive"

  Rule: Grid configuration must match grid type

    Scenario: Create encounter with square grid
      Given I provide encounter with grid type "Square"
      And I provide square grid size 50
      When I create the encounter
      Then the encounter is created
      And the grid should be configured as square

    Scenario: Reject encounter with invalid grid configuration
      Given I provide encounter with grid type "Hexagonal"
      And I provide incompatible grid parameters
      When I attempt to create the encounter
      Then I should see error
      And I should see error "Grid configuration must match grid type"

  Rule: Encounter cannot be deleted if referenced by active game session

    Scenario: Delete encounter not in active session
      Given my encounter is not referenced by any active game session
      When I delete the encounter
      Then the encounter is removed successfully

    Scenario: Reject deletion of encounter in active game session
      Given my encounter is referenced by an active game session
      When I attempt to delete the encounter
      Then I should see error
      And I should see error "Cannot delete encounter referenced by active game session"

  @happy-path
  Scenario: Successfully create complete encounter with stage, grid, and assets
    Given I provide valid encounter data
    And I configure stage with background image and dimensions
    And I configure grid with type "Square" and size 50
    And I place 5 assets on the encounter
    When I create the encounter
    Then the encounter is created
    And the stage should be configured correctly
    And the grid should be configured correctly
    And all 5 assets should be placed

  @happy-path
  Scenario: Successfully clone encounter with all components
    Given I have a encounter with stage, grid, and 8 placed assets
    When I clone the encounter
    Then a new encounter should be created
    And the stage configuration should be duplicated
    And the grid configuration should be duplicated
    And all 8 assets should be duplicated with new IDs

  @edge-case
  Scenario: Create encounter with different grid types
    Given I create encounters with each grid type:
      | GridType    |
      | Square      |
      | Hexagonal   |
      | Isometric   |
      | None        |
    Then all encounters is created
    And each should have the correct grid configuration
